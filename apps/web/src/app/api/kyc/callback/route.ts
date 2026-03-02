import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (use database in production)
const verificationSessions = new Map<string, {
  status: 'pending' | 'scanning' | 'verifying' | 'completed' | 'failed';
  walletAddress?: string;
  selfDID?: string;
  timestamp: number;
}>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session, status, selfDID, walletAddress, verificationData } = body;

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session ID required' },
        { status: 400 }
      );
    }

    // Update session status
    verificationSessions.set(session, {
      status: status || 'scanning',
      walletAddress,
      selfDID,
      timestamp: Date.now(),
    });

    // If verification is complete, store in database
    if (status === 'completed' && selfDID) {
      // Here you would save to your database
      console.log('KYC Verification Complete:', {
        session,
        selfDID,
        walletAddress,
        verificationData,
      });

      // You can also verify the DID on-chain here
      // const isValid = await verifyDIDOnChain(selfDID, walletAddress);
    }

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
    });

  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process callback' },
      { status: 500 }
    );
  }
}

// Export the sessions map
export { verificationSessions };
