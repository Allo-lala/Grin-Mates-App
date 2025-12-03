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

    // TODO: Query PostgreSQL database for user profile
    // For now, we'll return a mock response
    return NextResponse.json({
      walletAddress,
      kycStatus: 'verified',
      createdAt: new Date().toISOString(),
      balance: '2450.50',
      assets: [
        { symbol: 'CELO', amount: '1250' },
        { symbol: 'cUSD', amount: '950.50' },
        { symbol: 'GP', amount: '5420' },
      ],
    });
  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
