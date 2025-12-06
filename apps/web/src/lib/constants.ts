export const COLORS = {
  primary: '#1db584',
  primaryDark: '#16a370',
  primaryLight: '#4ecb9e',
  accent: '#22c55e',
  background: '#ffffff',
  foreground: '#0f0f0f',
  muted: '#f0f0f0',
  mutedForeground: '#666666',
};

/**
 * Smart Contract Addresses
 * ProofOfHuman contract addresses for different Celo networks
 */
export const CONTRACT_ADDRESSES = {
  // Testnet deployments
  alfajores: {
    proofOfHuman: 'TBD', // To be deployed
    hub: 'TBD' // Mock hub for testing
  },
  celo_sepolia: {
    proofOfHuman: '0x0a81e30572F209aFC2664FcBD0BB9c403057d9a8',
    hub: '0x5E74631E9870B62e70ee4F39BBFC4EE0C69a551a' // Mock hub for testing
  },
  // Mainnet deployment
  celo: {
    proofOfHuman: 'TBD', // To be deployed to mainnet
    hub: 'TBD' // Real Self Protocol hub address
  }
} as const;

/**
 * Network configuration mapping
 */
export const NETWORK_CONFIG = {
  alfajores: {
    chainId: 44787,
    name: 'Celo Alfajores Testnet',
    rpcUrl: 'https://alfajores-forno.celo-testnet.org',
    blockExplorer: 'https://alfajores.celoscan.io'
  },
  celo_sepolia: {
    chainId: 11142220,
    name: 'Celo Sepolia Testnet', 
    rpcUrl: 'https://forno.celo-sepolia.celo-testnet.org',
    blockExplorer: 'https://sepolia.celoscan.io'
  },
  celo: {
    chainId: 42220,
    name: 'Celo Mainnet',
    rpcUrl: 'https://forno.celo.org',
    blockExplorer: 'https://celoscan.io'
  }
} as const;

export type NetworkName = keyof typeof CONTRACT_ADDRESSES;
