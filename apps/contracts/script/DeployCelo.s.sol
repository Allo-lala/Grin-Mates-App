// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Deploy.s.sol";
import "./SelfProtocolConfig.sol";

/**
 * @title DeployCelo
 * @notice Deployment script for ProofOfHuman contract on Celo mainnet
 * @dev Extends the base Deploy script with Celo mainnet-specific configuration
 *      
 *      Network Details:
 *      - Network: Celo Mainnet
 *      - Chain ID: 42220
 *      - RPC URL: https://forno.celo.org
 *      - Block Explorer: https://celoscan.io/
 *      
 *      Requirements Addressed:
 *      - 5.4: Use Celo mainnet Identity Verification Hub V2 address
 *      - 13.3: Use mainnet-specific hub address
 *      
 *      ⚠️ WARNING: This script deploys to MAINNET. Ensure:
 *      - All testing is complete on testnet
 *      - Hub address is verified from official Self Protocol documentation
 *      - Deployer account has sufficient CELO for gas
 *      - All configuration parameters are correct
 *      - Private key is from a secure source (hardware wallet recommended)
 *      
 *      Usage:
 *      forge script script/DeployCelo.s.sol:DeployCelo \
 *          --rpc-url $CELO_RPC_URL \
 *          --broadcast \
 *          --verify
 */
contract DeployCelo is Deploy {
    /**
     * @notice Get the Identity Verification Hub V2 address for Celo mainnet
     * @dev Returns the hub address from SelfProtocolConfig
     *      Requirement 5.4: Use Celo mainnet Identity Verification Hub V2 address
     *      Requirement 13.3: Use mainnet-specific hub address
     *      
     *      ⚠️ CRITICAL: This address must be triple-checked before deployment
     * @return hubAddress The Identity Verification Hub V2 address for Celo mainnet (Chain ID: 42220)
     */
    function getHubAddress() internal override returns (address hubAddress) {
        hubAddress = SelfProtocolConfig.CELO_MAINNET_HUB_V2;
        
        // Validate that the hub address is configured (Requirement 13.4)
        SelfProtocolConfig.validateHubAddress(hubAddress, "Celo Mainnet");
        
        return hubAddress;
    }
    
    /**
     * @notice Get the network name for logging purposes
     * @dev Returns "Celo Mainnet" for this deployment script
     * @return networkName The human-readable network name
     */
    function getNetworkName() internal pure override returns (string memory networkName) {
        return "Celo Mainnet (Chain ID: 42220)";
    }
}
