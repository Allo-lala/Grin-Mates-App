import { NextRequest, NextResponse } from 'next/server';
import { userQueries, kycQueries, greenPointsQueries } from '@/lib/database';

// Get user profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');

    if (!email && !userId) {
      return NextResponse.json(
        { error: 'Email or userId is required' },
        { status: 400 }
      );
    }

    // Get user
    const user = email 
      ? await userQueries.getUserByEmail(email)
      : await userQueries.getUserByWallet(userId!);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get KYC status
    const kycStatus = await kycQueries.getKycStatus(user.id);

    // Get green points balance
    const greenPoints = await greenPointsQueries.getBalance(user.id);

    // Get portfolio
    const portfolio = await userQueries.getUserPortfolio(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        walletAddress: user.wallet_address,
        profileImage: user.profile_image_url,
        phoneNumber: user.phone_number,
        emailVerified: user.email_verified,
        phoneVerified: user.phone_verified,
        isActive: user.is_active,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at
      },
      kyc: kycStatus ? {
        status: kycStatus.status,
        submittedAt: kycStatus.submitted_at,
        verifiedAt: kycStatus.verified_at
      } : null,
      greenPoints: greenPoints ? {
        total: greenPoints.total_points,
        available: greenPoints.available_points,
        lifetimeEarned: greenPoints.lifetime_earned,
        lifetimeSpent: greenPoints.lifetime_spent
      } : null,
      portfolio: portfolio ? {
        totalBalanceUsd: portfolio.total_balance_usd,
        tokenCount: portfolio.token_count
      } : null
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to get user profile' },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    const { userId, displayName, phoneNumber, profileImage } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (displayName) updates.display_name = displayName;
    if (phoneNumber) updates.phone_number = phoneNumber;
    if (profileImage) updates.profile_image_url = profileImage;

    const updatedUser = await userQueries.updateUser(userId, updates);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.display_name,
        phoneNumber: updatedUser.phone_number,
        profileImage: updatedUser.profile_image_url
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}