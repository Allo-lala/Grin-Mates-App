// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Deploy.s.sol";
import "./SelfProtocolConfig.sol";

/**
 * @title DeploySepolia
 * @notice Deployment script for ProofOfHuman contract on Celo Sepolia testnet
 * @dev Extends the base Deploy script with Celo Sepolia-specific configuration
 *      
 *      Network Details:
 *      - Network: Celo Sepolia (Testnet)
 *      - Chain ID: 11142220
 *      - RPC URL: https://forno.celo-sepolia.celo-testnet.org
 *      - Block Explorer: https://celo-sepolia.blockscout.com/
 *      
 *      Requirements Addressed:
 *      - 5.3: Use Celo Sepolia Identity Verification Hub V2 address
 *      - 13.2: Use Sepolia-specific hub address
 *      
 *      Usage:
 *      forge script script/DeploySepolia.s.sol:DeploySepolia \
 *          --rpc-url $SEPOLIA_RPC_URL \
 *          --broadcast \
 *          --verify
 */
contract DeploySepolia is Deploy {
    /**
     * @notice Get the Identity Verification Hub V2 address for Celo Sepolia testnet
     * @dev Returns the hub address from SelfProtocolConfig
     *      Requirement 5.3: Use Celo Sepolia Identity Verification Hub V2 address
     *      Requirement 13.2: Use Sepolia-specific hub address
     * @return hubAddress The Identity Verification Hub V2 address for Celo Sepolia (Chain ID: 11142220)
     */
    function getHubAddress() internal override returns (address hubAddress) {
        hubAddress = SelfProtocolConfig.SEPOLIA_HUB_V2;
        
        // Validate that the hub address is configured (Requirement 13.4)
        SelfProtocolConfig.validateHubAddress(hubAddress, "Celo Sepolia");
        
        return hubAddress;
    }
    
    /**
     * @notice Get the network name for logging purposes
     * @dev Returns "Celo Sepolia" for this deployment script
     * @return networkName The human-readable network name
     */
    function getNetworkName() internal pure override returns (string memory networkName) {
        return "Celo Sepolia Testnet (Chain ID: 11142220)";
    }
}
