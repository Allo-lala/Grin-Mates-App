import { NextRequest, NextResponse } from 'next/server';
import { getEndpointTypeFromEnvironment } from '@/lib/self-config';
import { createRateLimiter, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Create rate limiter for status endpoint
const rateLimiter = createRateLimiter(RATE_LIMITS.STATUS);

/**
 * In-memory cache for verification status
 * Key: wallet address, Value: { status, timestamp, cachedAt }
 */
const statusCache = new Map<string, {
  status: string;
  timestamp: string;
  transactionHash?: string;
  sessionId?: string;
  failureReason?: string;
  cachedAt: number;
}>();

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes (Requirement: 5 minute TTL)

/**
 * GET /api/kyc/status
 * 
 * Queries verification status for a wallet address.
 * Returns current verification status with timestamp and transaction hash.
 * Implements caching with 5 minute TTL.
 * Implements rate limiting: 20 requests per minute per IP
 * 
 * Requirements: 4.1, 5.3, 7.5, 9.2
 * Security: Rate limiting from design document
 */
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimit = rateLimiter(clientId);

  if (!rateLimit.allowed) {
    // Log rate limit exceeded
    logger.rateLimitExceeded(clientId, '/api/kyc/status');
    
    return NextResponse.json(
      {
        status: 'error',
        error: rateLimit.message,
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(RATE_LIMITS.STATUS.maxRequests),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
        },
      }
    );
  }
  try {
    const walletAddress = request.nextUrl.searchParams.get('walletAddress');

    // Validate wallet address parameter (Requirement 4.1)
    if (!walletAddress) {
      return NextResponse.json(
        { 
          status: 'not_found',
          error: 'Wallet address is required' 
        },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!isValidEthereumAddress(walletAddress)) {
      return NextResponse.json(
        { 
          status: 'not_found',
          error: 'Invalid wallet address format' 
        },
        { status: 400 }
      );
    }

    // Check cache first (Requirement: 5 minute TTL caching)
    const cached = statusCache.get(walletAddress.toLowerCase());
    const now = Date.now();
    
    if (cached && (now - cached.cachedAt) < CACHE_TTL_MS) {
      logger.debug('Returning cached status', {
        walletAddress,
        status: cached.status,
        cacheAge: now - cached.cachedAt,
      });
      
      return NextResponse.json({
        status: cached.status,
        timestamp: cached.timestamp,
        transactionHash: cached.transactionHash,
        sessionId: cached.sessionId,
        failureReason: cached.failureReason,
        cached: true,
      }, {
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMITS.STATUS.maxRequests),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
        },
      });
    }

    // Query database for verification status (Requirement 5.3, 9.2)
    const verificationRecord = await queryVerificationStatus(walletAddress);

    // Handle not found case (Requirement: Handle not found case)
    if (!verificationRecord) {
      return NextResponse.json({
        status: 'not_found',
        message: 'No verification record found for this wallet address',
      }, {
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMITS.STATUS.maxRequests),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
        },
      });
    }

    // Check if session has expired based on timestamp (Requirements: 6.2, 9.4)
    if (verificationRecord.status === 'pending' && verificationRecord.createdAt) {
      const sessionAge = Date.now() - new Date(verificationRecord.createdAt).getTime();
      const expirationMs = 15 * 60 * 1000; // 15 minutes
      
      if (sessionAge >= expirationMs) {
        // Mark as expired if not already
        verificationRecord.status = 'expired';
        verificationRecord.failureReason = 'Session expired after timeout';
        
        // Update database to reflect expiration
        try {
          await markSessionExpired(walletAddress, verificationRecord.sessionId);
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Unknown error');
          logger.error('Failed to mark session as expired', error, {
            walletAddress,
            sessionId: verificationRecord.sessionId,
          });
        }
      }
    }

    // Query Celo blockchain for onchain verification data if needed (Requirement 7.5)
    let blockchainData = null;
    if (verificationRecord.transactionHash) {
      try {
        blockchainData = await queryBlockchainVerification(
          verificationRecord.transactionHash,
          walletAddress
        );
        
        if (blockchainData) {
          logger.blockchainVerification(
            verificationRecord.transactionHash,
            walletAddress,
            blockchainData.verified
          );
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        logger.error('Blockchain query error', err, {
          transactionHash: verificationRecord.transactionHash,
          walletAddress,
        });
        // Continue without blockchain data if query fails
      }
    }

    // Prepare response with current verification status (Requirement 4.1, 9.2)
    const response = {
      status: verificationRecord.status,
      timestamp: verificationRecord.timestamp,
      transactionHash: verificationRecord.transactionHash,
      sessionId: verificationRecord.sessionId,
      failureReason: verificationRecord.failureReason,
      blockchainVerified: blockchainData?.verified || false,
    };

    // Update cache (Requirement: 5 minute TTL caching)
    statusCache.set(walletAddress.toLowerCase(), {
      status: response.status,
      timestamp: response.timestamp,
      transactionHash: response.transactionHash,
      sessionId: response.sessionId,
      failureReason: response.failureReason,
      cachedAt: now,
    });

    return NextResponse.json(response, {
      headers: {
        'X-RateLimit-Limit': String(RATE_LIMITS.STATUS.maxRequests),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
      },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    
    // Log API error
    logger.error('KYC status error', err, {
      endpoint: '/api/kyc/status',
    });
    
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Failed to fetch KYC status',
        details: err.message
      },
      { status: 500 }
    );
  }
}

/**
 * Validates Ethereum address format
 */
function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Queries database for verification status by wallet address
 * Requirements: 5.3, 9.2
 */
async function queryVerificationStatus(
  walletAddress: string
): Promise<{
  status: string;
  timestamp: string;
  transactionHash?: string;
  sessionId?: string;
  failureReason?: string;
  createdAt?: string;
} | null> {
  // TODO: Implement actual database query when database connection is set up
  // This would typically use a database client like:
  // const db = await getDatabase();
  // const result = await db.query(`
  //   SELECT status, created_at as timestamp, transaction_hash, session_id, failure_reason
  //   FROM verification_sessions
  //   WHERE wallet_address = $1
  //   ORDER BY created_at DESC
  //   LIMIT 1
  // `, [walletAddress]);
  // 
  // if (result.rows.length === 0) {
  //   return null;
  // }
  // 
  // return {
  //   status: result.rows[0].status,
  //   timestamp: result.rows[0].timestamp,
  //   transactionHash: result.rows[0].transaction_hash,
  //   sessionId: result.rows[0].session_id,
  //   failureReason: result.rows[0].failure_reason,
  // };

  logger.debug('Querying verification status', {
    walletAddress,
  });

  // For now, simulate database query
  // In production, this would query the verification_sessions table
  // Return null to indicate no record found (will be replaced with actual DB query)
  return null;
}

/**
 * Marks a session as expired in the database
 * Requirements: 6.2, 9.4
 */
async function markSessionExpired(
  walletAddress: string,
  sessionId?: string
): Promise<void> {
  // TODO: Implement actual database update when database connection is set up
  // This would typically use a database client like:
  // const db = await getDatabase();
  // await db.query(`
  //   UPDATE verification_sessions
  //   SET status = 'expired',
  //       updated_at = NOW(),
  //       failure_reason = 'Session expired after timeout'
  //   WHERE wallet_address = $1 
  //     AND session_id = $2
  //     AND status = 'pending'
  // `, [walletAddress, sessionId]);

  logger.debug('Marking session as expired in status check', {
    walletAddress,
    sessionId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Queries Celo blockchain for onchain verification data
 * Requirements: 7.5
 */
async function queryBlockchainVerification(
  transactionHash: string,
  walletAddress: string
): Promise<{ verified: boolean; blockNumber?: number } | null> {
  const celoRpcUrl = process.env.CELO_RPC_URL || 'https://forno.celo.org';
  
  // Use centralized environment detection
  const endpointType = getEndpointTypeFromEnvironment();
  
  // Use testnet RPC for staging, mainnet for production
  const rpcUrl = endpointType === 'staging_celo' 
    ? 'https://alfajores-forno.celo-testnet.org'
    : celoRpcUrl;

  try {
    // Query the blockchain for the transaction
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionByHash',
        params: [transactionHash],
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Blockchain RPC request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Blockchain RPC error: ${data.error.message}`);
    }

    // Verify transaction exists
    if (!data.result) {
      return null;
    }

    const transaction = data.result;
    
    // Verify the transaction involves the wallet address
    const addressLower = walletAddress.toLowerCase();
    const fromLower = transaction.from?.toLowerCase();
    const toLower = transaction.to?.toLowerCase();
    
    const verified = fromLower === addressLower || toLower === addressLower;

    return {
      verified,
      blockNumber: transaction.blockNumber ? parseInt(transaction.blockNumber, 16) : undefined,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    logger.error('Blockchain query failed', err, {
      transactionHash,
      walletAddress,
      rpcUrl,
    });
    throw error;
  }
}
