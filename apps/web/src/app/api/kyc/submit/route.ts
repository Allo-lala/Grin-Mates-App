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
      submittedAt: new Date().toISOString(),
      status: 'pending', // pending, approved, rejected
    };

    // Extract files
    const frontDocument = formData.get('frontDocument') as File;
    const backDocument = formData.get('backDocument') as File;
    const selfie = formData.get('selfie') as File;

    // Here you would typically:
    // 1. Save files to cloud storage (AWS S3, Cloudinary, etc.)
    // 2. Save KYC data to database
    // 3. Send notification to admin for review
    
    console.log('KYC Submission:', {
      ...kycData,
      files: {
        frontDocument: frontDocument?.name,
        backDocument: backDocument?.name,
        selfie: selfie?.name,
      }
    });

    // Simulate database save
    // In a real app, you'd save to your database here
    // const savedKyc = await db.kyc.create({ data: kycData });

    return NextResponse.json({
      success: true,
      message: 'KYC submission received successfully',
      submissionId: `kyc_${Date.now()}`,
      status: 'pending'
    });

  } catch (error) {
    console.error('KYC submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit KYC' },
      { status: 500 }
    );
  }
}