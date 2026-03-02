// Self Protocol QR Code Integration
// Based on: https://docs.self.xyz/frontend-integration/qrcode-sdk

export const selfConfig = {
  appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || 'Grin Mates',
  scopeSeed: process.env.NEXT_PUBLIC_SELF_SCOPE_SEED || 'grin-mates',
  endpoint: process.env.NEXT_PUBLIC_SELF_ENDPOINT || '',
  endpointType: process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE || 'staging_celo',
  logoUrl: process.env.NEXT_PUBLIC_SELF_LOGO_URL || '',
  network: process.env.NEXT_PUBLIC_CELO_NETWORK || 'celo_sepolia',
};

// Initialize Self Protocol QR Code
export const initializeSelfQRCode = (containerId: string, onSuccess: (data: any) => void, onError: (error: any) => void) => {
  // Load Self Protocol SDK from CDN
  const script = document.createElement('script');
  script.src = 'https://cdn.self.xyz/qrcode-sdk/latest/self-qrcode.js';
  script.async = true;
  
  script.onload = () => {
    // @ts-ignore - Self Protocol SDK loaded from CDN
    if (window.SelfQRCode) {
      // @ts-ignore
      const qrcode = new window.SelfQRCode({
        container: containerId,
        endpoint: selfConfig.endpoint,
        endpointType: selfConfig.endpointType,
        appName: selfConfig.appName,
        scopeSeed: selfConfig.scopeSeed,
        logoUrl: selfConfig.logoUrl,
        onSuccess: (verificationData: any) => {
          console.log('Self Protocol verification successful:', verificationData);
          onSuccess(verificationData);
        },
        onError: (error: any) => {
          console.error('Self Protocol verification failed:', error);
          onError(error);
        },
      });
      
      qrcode.render();
    }
  };
  
  script.onerror = () => {
    console.error('Failed to load Self Protocol SDK');
    onError(new Error('Failed to load Self Protocol SDK'));
  };
  
  document.head.appendChild(script);
};

// Verify Proof of Human on-chain
export const verifyProofOfHuman = async (walletAddress: string, verificationData: any) => {
  try {
    // This would call your smart contract to verify the proof
    // The contract address is at NEXT_PUBLIC_CONTRACT_ADDRESS
    
    console.log('Verifying Proof of Human for:', walletAddress);
    console.log('Verification data:', verificationData);
    
    // In production, you would:
    // 1. Call the smart contract's verify function
    // 2. Pass the verification data and wallet address
    // 3. Get on-chain confirmation
    
    return {
      success: true,
      verified: true,
      timestamp: new Date().toISOString(),
      did: verificationData.did,
    };
  } catch (error) {
    console.error('Failed to verify Proof of Human:', error);
    throw error;
  }
};

// Get KYC status from Self Protocol
export const getKYCStatus = async (walletAddress: string) => {
  try {
    // This would query the smart contract for verification status
    // For now, we'll return a mock status
    
    return {
      status: 'none' as const,
      verified: false,
    };
  } catch (error) {
    console.error('Failed to get KYC status:', error);
    return { status: 'none' as const, verified: false };
  }
};
