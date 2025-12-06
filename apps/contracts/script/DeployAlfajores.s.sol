// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Deploy.s.sol";
import "./SelfProtocolConfig.sol";

/**
 * @title DeployAlfajores
 * @notice Deployment script for ProofOfHuman contract on Alfajores testnet
 * @dev Extends the base Deploy script with Alfajores-specific configuration
 *      
 *      Network Details:
 *      - Network: Alfajores (Celo Testnet)
 *      - Chain ID: 44787
 *      - RPC URL: https://alfajores-forno.celo-testnet.org
 *      - Block Explorer: https://alfajores.celoscan.io/
 *      
 *      Requirements Addressed:
 *      - 5.2: Use Alfajores Identity Verification Hub V2 address
 *      - 13.1: Use Alfajores-specific hub address
 *      
 *      Usage:
 *      forge script script/DeployAlfajores.s.sol:DeployAlfajores \
 *          --rpc-url $ALFAJORES_RPC_URL \
 *          --broadcast \
 *          --verify
 */
contract DeployAlfajores is Deploy {
    /**
     * @notice Get the Identity Verification Hub V2 address for Alfajores testnet
     * @dev Returns the hub address from SelfProtocolConfig
     *      Requirement 5.2: Use Alfajores Identity Verification Hub V2 address
     *      Requirement 13.1: Use Alfajores-specific hub address
     * @return hubAddress The Identity Verification Hub V2 address for Alfajores (Chain ID: 44787)
     */
    function getHubAddress() internal override returns (address hubAddress) {
        hubAddress = SelfProtocolConfig.ALFAJORES_HUB_V2;
        
        // Validate that the hub address is configured (Requirement 13.4)
        SelfProtocolConfig.validateHubAddress(hubAddress, "Alfajores");
        
        return hubAddress;
    }
    
    /**
     * @notice Get the network name for logging purposes
     * @dev Returns "Alfajores" for this deployment script
     * @return networkName The human-readable network name
     */
    function getNetworkName() internal pure override returns (string memory networkName) {
        return "Alfajores Testnet (Chain ID: 44787)";
    }
}
