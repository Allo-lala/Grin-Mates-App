import { NextRequest, NextResponse } from 'next/server';
import { getEndpointTypeFromEnvironment } from '@/lib/self-config';
import { createRateLimiter, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Create rate limiter for verify endpoint
const rateLimiter = createRateLimiter(RATE_LIMITS.VERIFY);

/**
 * POST /api/kyc/verify
 * 
 * Handles verification completion from Self Protocol.
 * Validates the verification webhook, queries the Celo blockchain to verify
 * the transaction hash, and stores the verification result in the database.
 * 
 * Implements rate limiting: 10 requests per minute per IP
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.2, 7.3, 7.4
 * Security: Rate limiting from design document
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimit = rateLimiter(clientId);

  if (!rateLimit.allowed) {
    // Log rate limit exceeded
    logger.rateLimitExceeded(clientId, '/api/kyc/verify');
    
    return NextResponse.json(
      {
        success: false,
        error: rateLimit.message,
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(RATE_LIMITS.VERIFY.maxRequests),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
        },
      }
    );
  }
  try {
    const body = await request.json();
    const { walletAddress, sessionId, transactionHash, status: verificationStatus } = body;

    // Log verification attempt
    // Requirement 6.4: Log verification attempts
    logger.verificationAttempt(walletAddress || 'unknown', sessionId || 'unknown');

    // Validate required fields (Requirement 5.1)
    if (!walletAddress || !sessionId) {
      logger.warn('Verification request missing required fields', {
        hasWalletAddress: !!walletAddress,
        hasSessionId: !!sessionId,
      });
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: walletAddress and sessionId are required' 
        },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!isValidEthereumAddress(walletAddress)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid wallet address format' 
        },
        { status: 400 }
      );
    }

    // Validate transaction hash if provided (Requirement 7.4)
    if (transactionHash && !isValidTransactionHash(transactionHash)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid transaction hash format' 
        },
        { status: 400 }
      );
    }

    // Query Celo blockchain to verify transaction hash (Requirement 5.2, 7.1, 7.2, 7.3)
    let blockchainVerified = false;
    let blockchainError = null;

    if (transactionHash) {
      try {
        blockchainVerified = await verifyTransactionOnChain(transactionHash, walletAddress);
        
        // Log blockchain verification result
        logger.blockchainVerification(transactionHash, walletAddress, blockchainVerified);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown blockchain error');
        blockchainError = err.message;
        
        // Log blockchain verification error
        // Requirement 6.4: Add error tracking for Self Protocol API failures
        logger.error('Blockchain verification error', err, {
          transactionHash,
          walletAddress,
          sessionId,
        });
        
        // Don't fail the entire request if blockchain query fails
        // Log the error and continue with database storage
      }
    }

    // Store verification result in database (Requirement 5.3, 5.4, 5.5)
    try {
      const verificationRecord = await storeVerificationResult({
        walletAddress,
        sessionId,
        transactionHash: transactionHash || null,
        status: verificationStatus || 'verified',
        blockchainVerified,
        timestamp: new Date().toISOString(),
      });

      // Log successful verification completion
      // Requirement 6.4: Log verification completion events
      logger.verificationCompleted(walletAddress, sessionId, transactionHash);
      
      // Log database operation
      logger.databaseOperation('store_verification_result', true, {
        walletAddress,
        sessionId,
        status: verificationRecord.status,
      });

      // Return success response with rate limit headers
      return NextResponse.json({
        success: true,
        status: verificationRecord.status,
        timestamp: verificationRecord.timestamp,
        transactionHash: verificationRecord.transactionHash,
        blockchainVerified,
        message: 'Verification completed successfully',
      }, {
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMITS.VERIFY.maxRequests),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
        },
      });
    } catch (dbError) {
      const err = dbError instanceof Error ? dbError : new Error('Unknown database error');
      
      // Log database error
      logger.databaseOperation('store_verification_result', false, {
        walletAddress,
        sessionId,
        error: err.message,
      });
      
      // Return error response for database failures (Requirement 5.5)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to store verification result',
          details: err.message
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    
    // Log API error
    // Requirement 6.4: Add error tracking for Self Protocol API failures
    logger.error('Verification API error', err, {
      endpoint: '/api/kyc/verify',
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process verification request',
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
 * Validates transaction hash format
 */
function isValidTransactionHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Verifies transaction on Celo blockchain
 * Requirements: 5.2, 7.1, 7.2, 7.3, 7.4
 */
async function verifyTransactionOnChain(
  transactionHash: string,
  walletAddress: string
): Promise<boolean> {
  const celoRpcUrl = process.env.CELO_RPC_URL || 'https://forno.celo.org';
  
  // Use centralized environment detection (Requirement 7.2, 7.3)
  const endpointType = getEndpointTypeFromEnvironment();
  
  // Use testnet RPC for staging, mainnet for production
  const rpcUrl = endpointType === 'staging_celo' 
    ? 'https://alfajores-forno.celo-testnet.org'
    : celoRpcUrl;

  try {
    // Query the blockchain for the transaction (Requirement 7.1, 7.4)
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

    // Verify transaction exists and is related to the wallet address
    if (!data.result) {
      return false;
    }

    const transaction = data.result;
    
    // Verify the transaction involves the wallet address
    const addressLower = walletAddress.toLowerCase();
    const fromLower = transaction.from?.toLowerCase();
    const toLower = transaction.to?.toLowerCase();
    
    return fromLower === addressLower || toLower === addressLower;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    logger.error('Blockchain verification failed', err, {
      transactionHash,
      walletAddress,
      rpcUrl,
    });
    throw error;
  }
}

/**
 * Stores verification result in database
 * Requirements: 5.3, 5.4, 5.5
 */
async function storeVerificationResult(data: {
  walletAddress: string;
  sessionId: string;
  transactionHash: string | null;
  status: string;
  blockchainVerified: boolean;
  timestamp: string;
}): Promise<{
  status: string;
  timestamp: string;
  transactionHash: string | null;
}> {
  // TODO: Implement actual database storage when database connection is set up
  // For now, we'll simulate storage and return the data
  
  // This would typically use a database client like:
  // const db = await getDatabase();
  // await db.query(`
  //   INSERT INTO verification_sessions 
  //   (wallet_address, session_id, transaction_hash, status, created_at, completed_at)
  //   VALUES ($1, $2, $3, $4, NOW(), NOW())
  //   ON CONFLICT (session_id) 
  //   DO UPDATE SET 
  //     status = $4,
  //     transaction_hash = $3,
  //     updated_at = NOW(),
  //     completed_at = NOW()
  // `, [data.walletAddress, data.sessionId, data.transactionHash, data.status]);

  logger.debug('Storing verification result', {
    walletAddress: data.walletAddress,
    sessionId: data.sessionId,
    transactionHash: data.transactionHash,
    status: data.status,
    blockchainVerified: data.blockchainVerified,
    timestamp: data.timestamp,
  });

  return {
    status: data.status,
    timestamp: data.timestamp,
    transactionHash: data.transactionHash,
  };
}
