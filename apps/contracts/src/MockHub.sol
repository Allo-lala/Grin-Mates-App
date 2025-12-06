// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { SelfStructs } from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";

/**
 * @title MockHub
 * @notice A mock Identity Verification Hub V2 for testing deployment
 * @dev This is a simple mock that implements the setVerificationConfigV2 function
 *      for testing purposes. In production, use the real Self Protocol hub address.
 */
contract MockHub {
    mapping(bytes32 => SelfStructs.VerificationConfigV2) public configs;
    
    event VerificationConfigSet(bytes32 indexed configId, SelfStructs.VerificationConfigV2 config);
    
    /**
     * @notice Mock implementation of setVerificationConfigV2
     * @param config The verification configuration to set
     * @return configId The generated configuration ID
     */
    function setVerificationConfigV2(
        SelfStructs.VerificationConfigV2 memory config
    ) external returns (bytes32 configId) {
        // Generate a simple config ID based on the config hash
        configId = keccak256(abi.encode(config, msg.sender, block.timestamp));
        
        // Store the config
        configs[configId] = config;
        
        // Emit event
        emit VerificationConfigSet(configId, config);
        
        return configId;
    }
    
    /**
     * @notice Get a stored verification configuration
     * @param configId The configuration ID to retrieve
     * @return config The stored verification configuration
     */
    function getVerificationConfig(bytes32 configId) 
        external 
        view 
        returns (SelfStructs.VerificationConfigV2 memory config) 
    {
        return configs[configId];
    }
}