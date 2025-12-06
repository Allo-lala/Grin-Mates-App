// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "./VerificationConfigHelper.sol";
import "./SelfProtocolConfig.sol";
import { SelfUtils } from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import { ProofOfHuman } from "../src/ProofOfHuman.sol";

/**
 * @title DeployWithConfigHelper
 * @notice Example deployment script demonstrating VerificationConfigHelper usage
 * @dev This script shows how to use VerificationConfigHelper to create and deploy
 *      a ProofOfHuman contract with standardized verification configuration.
 *      
 *      This example demonstrates:
 *      - Creating a standard verification config using the helper
 *      - Validating the config before deployment
 *      - Deploying the ProofOfHuman contract with the config
 *      
 *      Requirements Addressed:
 *      - 4.3: Accept verification configuration as constructor parameter
 *      - 4.4: Format configuration using SelfUtils.formatVerificationConfigV2
 *      - 6.1-6.5: All verification configuration requirements
 */
contract DeployWithConfigHelper is Script {
    /**
     * @notice Main deployment function
     * @dev This is an example script - actual deployment scripts should:
     *      1. Load environment variables (PRIVATE_KEY, SCOPE_SEED)
     *      2. Get the correct hub address for the target network
     *      3. Create and validate the verification config
     *      4. Deploy the contract
     *      5. Verify the deployment
     */
    function run() external {
        console.log("=== ProofOfHuman Deployment Example ===\n");
        
        // Step 1: Create verification configuration using helper
        console.log("Step 1: Creating verification configuration...");
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            VerificationConfigHelper.createStandardConfig();
        
        // Step 2: Validate configuration
        console.log("Step 2: Validating configuration...");
        (bool isValid, string memory errorMessage) = 
            VerificationConfigHelper.validateConfig(config);
        
        require(isValid, string(abi.encodePacked("Config validation failed: ", errorMessage)));
        console.log("  [OK] Configuration is valid");
        
        // Step 3: Display configuration summary
        console.log("\nConfiguration Summary:");
        console.log("  - Minimum Age:", config.minimumAge);
        console.log("  - OFAC Screening:", config.ofacScreening ? "Enabled" : "Disabled");
        console.log("  - Excluded Countries:", config.excludedCountries.length);
        console.log("  - Required Disclosures:", config.disclosures.length);
        
        console.log("\nExcluded Countries:");
        for (uint256 i = 0; i < config.excludedCountries.length; i++) {
            console.log("  -", config.excludedCountries[i]);
        }
        
        console.log("\nRequired Disclosures:");
        for (uint256 i = 0; i < config.disclosures.length; i++) {
            console.log("  -", config.disclosures[i]);
        }
        
        console.log("\n=== Configuration Ready for Deployment ===");
        console.log("\nTo deploy, uncomment the deployment code below and:");
        console.log("1. Set PRIVATE_KEY environment variable");
        console.log("2. Set SCOPE_SEED environment variable");
        console.log("3. Update hub address for your target network");
        console.log("4. Run: forge script script/DeployWithConfigHelper.s.sol --broadcast");
        
        // Deployment code (commented out for example)
        /*
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        string memory scopeSeed = vm.envString("SCOPE_SEED");
        
        // Get hub address for target network (example: Alfajores)
        address hubAddress = SelfProtocolConfig.ALFAJORES_HUB_V2;
        require(hubAddress != address(0), "Hub address not configured");
        
        // Deploy contract
        vm.startBroadcast(deployerPrivateKey);
        ProofOfHuman proofOfHuman = new ProofOfHuman(
            hubAddress,
            scopeSeed,
            config
        );
        vm.stopBroadcast();
        
        console.log("\n=== Deployment Successful ===");
        console.log("ProofOfHuman deployed at:", address(proofOfHuman));
        console.log("Configuration ID:", vm.toString(proofOfHuman.verificationConfigId()));
        */
    }
    
    /**
     * @notice Example: Deploy with custom disclosures
     * @dev Shows how to create a custom configuration with specific disclosure requirements
     */
    function runWithCustomDisclosures() external view {
        console.log("=== Custom Configuration Example ===\n");
        
        // Create custom disclosures array
        string[] memory customDisclosures = new string[](4);
        customDisclosures[0] = "dateOfBirth";
        customDisclosures[1] = "nationality";
        customDisclosures[2] = "documentNumber";
        customDisclosures[3] = "expirationDate";
        
        // Create custom config
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            VerificationConfigHelper.createCustomConfig(customDisclosures);
        
        // Validate
        (bool isValid, string memory errorMessage) = 
            VerificationConfigHelper.validateConfig(config);
        
        require(isValid, string(abi.encodePacked("Config validation failed: ", errorMessage)));
        
        console.log("Custom configuration created with", config.disclosures.length, "disclosures:");
        for (uint256 i = 0; i < config.disclosures.length; i++) {
            console.log("  -", config.disclosures[i]);
        }
    }
    
    /**
     * @notice Example: Deploy with minimal disclosures
     * @dev Shows how to create a minimal configuration (useful for testing)
     */
    function runWithMinimalDisclosures() external view {
        console.log("=== Minimal Configuration Example ===\n");
        
        // Get minimal disclosures
        string[] memory minimalDisclosures = VerificationConfigHelper.getMinimalDisclosures();
        
        // Create config with minimal disclosures
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            VerificationConfigHelper.createCustomConfig(minimalDisclosures);
        
        console.log("Minimal configuration created with", config.disclosures.length, "disclosure:");
        console.log("  -", config.disclosures[0]);
    }
}
