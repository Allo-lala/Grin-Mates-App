import { NextRequest, NextResponse } from 'next/server';
import { userQueries, greenPointsQueries } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email, walletAddress, displayName } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await userQueries.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = await userQueries.createUser(email, walletAddress, displayName);

    // Initialize green points balance
    await greenPointsQueries.addPoints(
      user.id,
      100, // Welcome bonus
      'registration',
      user.id,
      'Welcome bonus for new user'
    );

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        walletAddress: user.wallet_address,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('User registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}