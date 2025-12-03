import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const walletAddress = request.nextUrl.searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // TODO: Query PostgreSQL database for KYC status
    // For now, we'll return a mock response
    return NextResponse.json({
      walletAddress,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      message: 'Your KYC is under review',
    });
  } catch (error) {
    console.error('KYC status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KYC status' },
      { status: 500 }
    );
  }
}
