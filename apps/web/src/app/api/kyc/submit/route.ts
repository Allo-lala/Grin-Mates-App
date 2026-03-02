import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const kycData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      dateOfBirth: formData.get('dateOfBirth') as string,
      nationality: formData.get('nationality') as string,
      documentType: formData.get('documentType') as string,
      documentNumber: formData.get('documentNumber') as string,
      passportNumber: formData.get('passportNumber') as string,
      driversLicenseNumber: formData.get('driversLicenseNumber') as string,
      selfDID: formData.get('selfDID') as string, // Self Protocol DID
      walletAddress: formData.get('walletAddress') as string,
      submittedAt: new Date().toISOString(),
      status: 'pending', // pending, approved, rejected
    };

    // Extract files
    const frontDocument = formData.get('frontDocument') as File;
    const backDocument = formData.get('backDocument') as File;
    const selfie = formData.get('selfie') as File;

    // Here i would typically
    // 1. Save files to cloud storage 
    // 2. Save KYC data to database with Self Protocol DID
    // 3. Verify the Self Protocol DID on-chain
    // 4. Send notification to admin for review
    
    console.log('KYC Submission with Self Protocol:', {
      ...kycData,
      files: {
        frontDocument: frontDocument?.name,
        backDocument: backDocument?.name,
        selfie: selfie?.name,
      }
    });

    // Simulate database save
    // In a real app, save to your database here
    // const savedKyc = await db.kyc.create({ data: kycData });

    // Verify Self Protocol DID on-chain (optional)
    // This would involve calling the smart contract at NEXT_PUBLIC_CONTRACT_ADDRESS
    // to verify the DID is valid and associated with the wallet address

    return NextResponse.json({
      success: true,
      message: 'KYC submission received successfully via Self Protocol',
      submissionId: `kyc_${Date.now()}`,
      status: 'pending',
      selfDID: kycData.selfDID,
    });

  } catch (error) {
    console.error('KYC submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit KYC' },
      { status: 500 }
    );
  }
}