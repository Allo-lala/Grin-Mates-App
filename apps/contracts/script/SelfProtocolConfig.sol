// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title SelfProtocolConfig
 * @notice Configuration constants for Self Protocol Identity Verification Hub V2 addresses
 * @dev These addresses are sourced from official Self Protocol documentation
 *      Documentation: https://docs.selfprotocol.com/
 *      
 *      IMPORTANT: These addresses must be verified before mainnet deployment
 *      
 *      Hub V2 Contract Addresses by Network:
 *      - Alfajores (Celo Testnet): Chain ID 44787
 *      - Celo Sepolia (Testnet): Chain ID 11142220  
 *      - Celo Mainnet: Chain ID 42220
 */
library SelfProtocolConfig {
    /**
     * @notice Identity Verification Hub V2 address for Alfajores testnet
     * @dev Chain ID: 44787
     * @dev Source: Self Protocol official documentation
     * @dev Last verified: [TO BE VERIFIED]
     * 
     * TODO: Verify this address from official Self Protocol documentation
     * Documentation: https://docs.selfprotocol.com/contracts/deployments
     */
    address public constant ALFAJORES_HUB_V2 = address(0); // PLACEHOLDER - MUST BE UPDATED
    
    /**
     * @notice Identity Verification Hub V2 address for Celo Sepolia testnet
     * @dev Chain ID: 11142220
     * @dev Source: Self Protocol official documentation
     * @dev Last verified: [TO BE VERIFIED]
     * 
     * TODO: Verify this address from official Self Protocol documentation
     * Documentation: https://docs.selfprotocol.com/contracts/deployments
     * 
     * TEMPORARY: Using a test address for deployment testing
     * This needs to be replaced with the actual Self Protocol hub address
     */
    address public constant SEPOLIA_HUB_V2 = 0x1234567890123456789012345678901234567890; // TEMPORARY TEST ADDRESS
    
    /**
     * @notice Identity Verification Hub V2 address for Celo mainnet
     * @dev Chain ID: 42220
     * @dev Source: Self Protocol official documentation
     * @dev Last verified: [TO BE VERIFIED]
     * 
     * WARNING: This is a mainnet address. Verify carefully before use.
     * TODO: Verify this address from official Self Protocol documentation
     * Documentation: https://docs.selfprotocol.com/contracts/deployments
     */
    address public constant CELO_MAINNET_HUB_V2 = address(0); // PLACEHOLDER - MUST BE UPDATED
    
    /**
     * @notice Get the Identity Verification Hub V2 address for a specific chain ID
     * @param chainId The chain ID to get the hub address for
     * @return hubAddress The Identity Verification Hub V2 address for the specified chain
     * @dev Reverts if the chain ID is not supported
     */
    function getHubAddressForChain(uint256 chainId) internal pure returns (address hubAddress) {
        if (chainId == 44787) {
            // Alfajores testnet
            hubAddress = ALFAJORES_HUB_V2;
        } else if (chainId == 11142220) {
            // Celo Sepolia testnet
            hubAddress = SEPOLIA_HUB_V2;
        } else if (chainId == 42220) {
            // Celo mainnet
            hubAddress = CELO_MAINNET_HUB_V2;
        } else {
            revert("SelfProtocolConfig: Unsupported chain ID");
        }
        
        require(hubAddress != address(0), "SelfProtocolConfig: Hub address not configured");
    }
    
    /**
     * @notice Validate that a hub address is configured (non-zero)
     * @param hubAddress The hub address to validate
     * @param networkName The network name for error messaging
     * @dev Reverts if the hub address is zero (not configured)
     */
    function validateHubAddress(address hubAddress, string memory networkName) internal pure {
        require(
            hubAddress != address(0),
            string(abi.encodePacked("SelfProtocolConfig: Hub address not configured for ", networkName))
        );
    }
    
    /**
     * @notice Get network name for a chain ID
     * @param chainId The chain ID
     * @return networkName The human-readable network name
     */
    function getNetworkName(uint256 chainId) internal pure returns (string memory networkName) {
        if (chainId == 44787) {
            return "Alfajores";
        } else if (chainId == 11142220) {
            return "Celo Sepolia";
        } else if (chainId == 42220) {
            return "Celo Mainnet";
        } else {
            return "Unknown Network";
        }
    }
}
