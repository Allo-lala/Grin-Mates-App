import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (use database in production)
const verificationSessions = new Map<string, {
  status: 'pending' | 'scanning' | 'verifying' | 'completed' | 'failed';
  walletAddress?: string;
  selfDID?: string;
  timestamp: number;
}>();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID required' },
        { status: 400 }
      );
    }

    // Get session status
    const session = verificationSessions.get(sessionId);

    if (!session) {
      // Session not found, return pending status
      return NextResponse.json({
        success: true,
        status: 'pending',
        message: 'Waiting for verification to start',
      });
    }

    // Check if session expired (10 minutes)
    const now = Date.now();
    if (now - session.timestamp > 600000) {
      verificationSessions.delete(sessionId);
      return NextResponse.json({
        success: false,
        status: 'failed',
        message: 'Session expired',
      });
    }

    return NextResponse.json({
      success: true,
      status: session.status,
      selfDID: session.selfDID,
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check status' },
      { status: 500 }
    );
  }
}

// Export the sessions map for use in callback
export { verificationSessions };
