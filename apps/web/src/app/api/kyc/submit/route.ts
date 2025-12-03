import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      dateOfBirth,
      street,
      city,
      state,
      zipCode,
      country,
      walletAddress,
    } = body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !dateOfBirth ||
      !street ||
      !city ||
      !state ||
      !zipCode ||
      !country ||
      !walletAddress
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Connect to PostgreSQL database and save KYC data
    // For now, we'll return a success response
    console.log('KYC submission received:', {
      firstName,
      lastName,
      email,
      walletAddress,
    });

    return NextResponse.json({
      success: true,
      message: 'KYC submission received and pending verification',
      submissionId: `kyc_${Date.now()}`,
    });
  } catch (error) {
    console.error('KYC submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process KYC submission' },
      { status: 500 }
    );
  }
}
