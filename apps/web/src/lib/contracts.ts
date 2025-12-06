/**
 * Contract Integration Utilities
 * 
 * This module provides utilities for interacting with the ProofOfHuman smart contract
 * across different Celo networks.
 */

import { CONTRACT_ADDRESSES, NETWORK_CONFIG, type NetworkName } from './constants';

/**
 * Get the current network from environment variables
 */
export function getCurrentNetwork(): NetworkName {
  const network = process.env.NEXT_PUBLIC_CELO_NETWORK as NetworkName;
  
  if (!network || !CONTRACT_ADDRESSES[network]) {
    console.warn(`Invalid or missing NEXT_PUBLIC_CELO_NETWORK: ${network}. Defaulting to alfajores.`);
    return 'alfajores';
  }
  
  return network;
}

/**
 * Get the ProofOfHuman contract address for the current network
 */
export function getProofOfHumanAddress(): string {
  const network = getCurrentNetwork();
  const address = CONTRACT_ADDRESSES[network].proofOfHuman;
  
  if (!address || address === 'TBD') {
    throw new Error(`ProofOfHuman contract not deployed on ${network} network`);
  }
  
  return address;
}

/**
 * Get the hub contract address for the current network
 */
export function getHubAddress(): string {
  const network = getCurrentNetwork();
  const address = CONTRACT_ADDRESSES[network].hub;
  
  if (!address || address === 'TBD') {
    throw new Error(`Hub contract not available on ${network} network`);
  }
  
  return address;
}

/**
 * Get network configuration for the current network
 */
export function getNetworkConfig() {
  const network = getCurrentNetwork();
  return NETWORK_CONFIG[network];
}

/**
 * Get block explorer URL for a transaction or address
 */
export function getBlockExplorerUrl(hashOrAddress: string, type: 'tx' | 'address' = 'address'): string {
  const config = getNetworkConfig();
  const path = type === 'tx' ? 'tx' : 'address';
  return `${config.blockExplorer}/${path}/${hashOrAddress}`;
}

/**
 * Check if the current network has contracts deployed
 */
export function isNetworkSupported(): boolean {
  try {
    const network = getCurrentNetwork();
    const address = CONTRACT_ADDRESSES[network].proofOfHuman;
    return address !== 'TBD' && address !== undefined;
  } catch {
    return false;
  }
}

/**
 * Get contract deployment info for display
 */
export function getContractInfo() {
  const network = getCurrentNetwork();
  const networkConfig = getNetworkConfig();
  
  try {
    const proofOfHumanAddress = getProofOfHumanAddress();
    const hubAddress = getHubAddress();
    
    return {
      network: networkConfig.name,
      chainId: networkConfig.chainId,
      proofOfHuman: {
        address: proofOfHumanAddress,
        explorerUrl: getBlockExplorerUrl(proofOfHumanAddress)
      },
      hub: {
        address: hubAddress,
        explorerUrl: getBlockExplorerUrl(hubAddress)
      }
    };
  } catch (error) {
    return {
      network: networkConfig.name,
      chainId: networkConfig.chainId,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}