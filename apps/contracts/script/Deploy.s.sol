// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "./VerificationConfigHelper.sol";
import "./SelfProtocolConfig.sol";
import "./EnvValidator.sol";
import { SelfUtils } from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import { ProofOfHuman } from "../src/ProofOfHuman.sol";

/**
 * @title Deploy
 * @notice Base deployment script for ProofOfHuman contract
 * @dev This script provides reusable deployment logic that can be extended by network-specific scripts.
 *      It handles:
 *      - Environment variable loading and validation (Requirement 7.4)
 *      - Verification configuration creation (Requirement 4.3)
 *      - Contract deployment with proper error handling
 *      - Deployment logging and verification
 *      
 *      Requirements Addressed:
 *      - 5.1: Use Foundry's Script contract as the base
 *      - 7.4: Display clear error messages when environment variables are missing
 *      - 4.3: Accept verification configuration as constructor parameter
 *      - 4.4: Format configuration using SelfUtils.formatVerificationConfigV2
 */
abstract contract Deploy is Script {
    /**
     * @notice Get the Identity Verification Hub V2 address for the target network
     * @dev Must be implemented by network-specific deployment scripts
     * @return hubAddress The hub address for the target network
     */
    function getHubAddress() internal virtual returns (address hubAddress);
    
    /**
     * @notice Get the network name for logging purposes
     * @dev Must be implemented by network-specific deployment scripts
     * @return networkName The human-readable network name
     */
    function getNetworkName() internal virtual returns (string memory networkName);
    
    /**
     * @notice Main deployment function
     * @dev Orchestrates the complete deployment process:
     *      1. Validates environment variables
     *      2. Loads deployment parameters
     *      3. Creates verification configuration
     *      4. Deploys the contract
     *      5. Logs deployment information
     *      6. Saves deployment artifacts
     * @return proofOfHuman The deployed ProofOfHuman contract instance
     */
    function run() external returns (ProofOfHuman proofOfHuman) {
        string memory network = getNetworkName();
        
        console.log("========================================");
        console.log("ProofOfHuman Deployment");
        console.log("========================================");
        console.log(string.concat("Network: ", network));
        console.log("========================================\n");
        
        // Step 1: Validate environment variables (Requirement 7.4)
        console.log("Step 1: Validating environment variables...");
        EnvValidator.validateRequiredEnvVars(vm);
        console.log("  [OK] All required environment variables are set\n");
        
        // Step 2: Load environment variables
        console.log("Step 2: Loading deployment parameters...");
        uint256 deployerPrivateKey = loadPrivateKey();
        string memory scopeSeed = loadScopeSeed();
        address hubAddress = getHubAddress();
        console.log(string.concat("  Hub Address: ", vm.toString(hubAddress)));
        console.log(string.concat("  Scope Seed: ", scopeSeed));
        console.log("  [OK] Parameters loaded\n");
        
        // Step 3: Create verification configuration (Requirement 4.3)
        console.log("Step 3: Creating verification configuration...");
        SelfUtils.UnformattedVerificationConfigV2 memory config = createVerificationConfig();
        validateVerificationConfig(config);
        console.log("  [OK] Configuration created and validated\n");
        
        // Step 4: Deploy contract (Requirement 5.5: Broadcasting transactions)
        console.log("Step 4: Deploying ProofOfHuman contract...");
        proofOfHuman = deployContract(deployerPrivateKey, hubAddress, scopeSeed, config);
        console.log(string.concat("  [OK] Contract deployed at: ", vm.toString(address(proofOfHuman))));
        console.log(string.concat("  Configuration ID: ", vm.toString(proofOfHuman.verificationConfigId())));
        console.log("");
        
        // Step 5: Save deployment artifacts (Requirement 5.5: Save deployed addresses)
        console.log("Step 5: Saving deployment artifacts...");
        saveDeploymentArtifact(address(proofOfHuman), proofOfHuman.verificationConfigId(), network);
        console.log("  [OK] Deployment artifacts saved\n");
        
        // Step 6: Log deployment summary
        logDeploymentSummary(address(proofOfHuman), network);
        
        return proofOfHuman;
    }
    
    /**
     * @notice Load and validate private key from environment
     * @dev Requirement 7.1: Read PRIVATE_KEY from environment variables
     *      Requirement 7.4: Display clear error messages when environment variables are missing
     * @return privateKey The deployer's private key
     */
    function loadPrivateKey() internal view returns (uint256 privateKey) {
        privateKey = EnvValidator.validateAndGetPrivateKey(vm);
    }
    
    /**
     * @notice Load scope seed from environment
     * @dev Requirement 7.3: Read SCOPE_SEED from environment variables
     *      Requirement 7.4: Display clear error messages when environment variables are missing
     * @return scopeSeed The scope seed for the contract
     */
    function loadScopeSeed() internal view returns (string memory scopeSeed) {
        scopeSeed = vm.envString("SCOPE_SEED");
        require(bytes(scopeSeed).length > 0, "SCOPE_SEED cannot be empty");
    }
    
    /**
     * @notice Create verification configuration with standard settings
     * @dev Creates configuration using VerificationConfigHelper
     *      Requirements addressed:
     *      - 6.1: Set minimum age to 18 years
     *      - 6.2: Define excluded countries list
     *      - 6.3: Enable OFAC screening
     *      - 6.4: Specify required identity disclosures
     * @return config The unformatted verification configuration
     */
    function createVerificationConfig() 
        internal 
        pure 
        returns (SelfUtils.UnformattedVerificationConfigV2 memory config) 
    {
        config = VerificationConfigHelper.createStandardConfig();
    }
    
    /**
     * @notice Validate verification configuration meets requirements
     * @dev Ensures configuration complies with all requirements before deployment
     * @param config The configuration to validate
     */
    function validateVerificationConfig(
        SelfUtils.UnformattedVerificationConfigV2 memory config
    ) internal pure {
        (bool isValid, string memory errorMessage) = VerificationConfigHelper.validateConfig(config);
        require(isValid, string(abi.encodePacked("Configuration validation failed: ", errorMessage)));
    }
    
    /**
     * @notice Deploy the ProofOfHuman contract
     * @dev Handles the actual contract deployment with proper broadcasting
     * @param deployerPrivateKey The private key for signing the deployment transaction
     * @param hubAddress The Identity Verification Hub V2 address
     * @param scopeSeed The scope seed for the contract
     * @param config The verification configuration
     * @return proofOfHuman The deployed contract instance
     */
    function deployContract(
        uint256 deployerPrivateKey,
        address hubAddress,
        string memory scopeSeed,
        SelfUtils.UnformattedVerificationConfigV2 memory config
    ) internal returns (ProofOfHuman proofOfHuman) {
        // Validate hub address before deployment
        require(hubAddress != address(0), "Hub address cannot be zero");
        
        // Start broadcasting transactions (Requirement 5.5)
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy contract (Requirements 4.1, 4.2, 4.3)
        proofOfHuman = new ProofOfHuman(
            hubAddress,
            scopeSeed,
            config
        );
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        // Verify deployment succeeded
        require(address(proofOfHuman) != address(0), "Contract deployment failed");
        require(proofOfHuman.verificationConfigId() != bytes32(0), "Configuration ID not set");
    }
    
    /**
     * @notice Save deployment artifacts to file
     * @dev Saves deployment information to a JSON file for later reference
     *      Requirement 5.5: Save deployed addresses to deployment artifacts
     *      
     *      The artifact includes:
     *      - Contract address
     *      - Configuration ID
     *      - Network name
     *      - Deployment timestamp
     *      - Deployer address
     *      
     *      Artifacts are saved to: deployments/<network>-latest.json
     * @param contractAddress The deployed contract address
     * @param configId The verification configuration ID
     * @param network The network name
     */
    function saveDeploymentArtifact(
        address contractAddress,
        bytes32 configId,
        string memory network
    ) internal {
        // Create deployments directory if it doesn't exist
        string memory deploymentsDir = "deployments";
        
        // Get deployer address
        address deployer = vm.addr(loadPrivateKey());
        
        // Create JSON artifact
        string memory json = "deployment";
        vm.serializeAddress(json, "contractAddress", contractAddress);
        vm.serializeBytes32(json, "configurationId", configId);
        vm.serializeString(json, "network", network);
        vm.serializeUint(json, "timestamp", block.timestamp);
        vm.serializeUint(json, "blockNumber", block.number);
        string memory finalJson = vm.serializeAddress(json, "deployer", deployer);
        
        // Sanitize network name for filename (remove spaces and special chars)
        string memory sanitizedNetwork = sanitizeFilename(network);
        
        // Write to file: deployments/<network>-latest.json
        string memory filename = string.concat(deploymentsDir, "/", sanitizedNetwork, "-latest.json");
        vm.writeJson(finalJson, filename);
        
        console.log(string.concat("  Artifact saved to: ", filename));
    }
    
    /**
     * @notice Sanitize network name for use in filename
     * @dev Removes spaces and special characters, converts to lowercase
     * @param input The network name to sanitize
     * @return sanitized The sanitized filename-safe string
     */
    function sanitizeFilename(string memory input) internal pure returns (string memory sanitized) {
        bytes memory inputBytes = bytes(input);
        bytes memory result = new bytes(inputBytes.length);
        uint256 resultIndex = 0;
        
        for (uint256 i = 0; i < inputBytes.length; i++) {
            bytes1 char = inputBytes[i];
            
            // Convert uppercase to lowercase (A-Z -> a-z)
            if (char >= 0x41 && char <= 0x5A) {
                result[resultIndex] = bytes1(uint8(char) + 32);
                resultIndex++;
            }
            // Keep lowercase letters (a-z)
            else if (char >= 0x61 && char <= 0x7A) {
                result[resultIndex] = char;
                resultIndex++;
            }
            // Keep numbers (0-9)
            else if (char >= 0x30 && char <= 0x39) {
                result[resultIndex] = char;
                resultIndex++;
            }
            // Convert spaces and special chars to hyphen
            else if (char == 0x20 || char == 0x28 || char == 0x29 || char == 0x3A) {
                // Only add hyphen if previous char wasn't a hyphen
                if (resultIndex > 0 && result[resultIndex - 1] != 0x2D) {
                    result[resultIndex] = 0x2D; // hyphen
                    resultIndex++;
                }
            }
        }
        
        // Remove trailing hyphen if present
        if (resultIndex > 0 && result[resultIndex - 1] == 0x2D) {
            resultIndex--;
        }
        
        // Create final bytes array with correct length
        bytes memory finalResult = new bytes(resultIndex);
        for (uint256 i = 0; i < resultIndex; i++) {
            finalResult[i] = result[i];
        }
        
        return string(finalResult);
    }
    
    /**
     * @notice Log deployment summary with important information
     * @dev Provides clear output for deployment verification and documentation
     * @param contractAddress The deployed contract address
     * @param network The network name
     */
    function logDeploymentSummary(address contractAddress, string memory network) internal view {
        console.log("========================================");
        console.log("Deployment Successful!");
        console.log("========================================");
        console.log(string.concat("Network: ", network));
        console.log(string.concat("Contract Address: ", vm.toString(contractAddress)));
        console.log("");
        console.log("Next Steps:");
        console.log("1. Verify the contract on block explorer");
        console.log("2. Test contract interaction");
        console.log("3. Update frontend configuration with contract address");
        console.log("========================================\n");
    }
}
