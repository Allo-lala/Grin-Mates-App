// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "./EnvValidator.sol";

/**
 * @title DeployExample
 * @notice Example deployment script showing how to use EnvValidator
 * @dev This script demonstrates the proper way to validate environment variables
 *      before attempting deployment. This pattern should be used in all deployment scripts.
 */
contract DeployExample is Script {
    using EnvValidator for VmSafe;

    function run() external {
        // Step 1: Validate all required environment variables
        // This will fail fast with clear error messages if any are missing
        console.log("Validating environment variables...");
        EnvValidator.validateRequiredEnvVars(vm);
        
        // Step 2: Validate network-specific variables (e.g., RPC URL)
        EnvValidator.validateNetworkEnvVars(vm, "ALFAJORES_RPC_URL");
        
        // Step 3: Print configuration summary (without exposing sensitive data)
        EnvValidator.printEnvSummary(vm, "Alfajores");
        
        // Step 4: Get validated private key
        uint256 deployerPrivateKey = EnvValidator.validateAndGetPrivateKey(vm);
        
        // Step 5: Load other environment variables
        string memory scopeSeed = vm.envString("SCOPE_SEED");
        
        console.log("\nEnvironment validation successful!");
        console.log("Ready to deploy...\n");
        
        // Step 6: Proceed with deployment
        // vm.startBroadcast(deployerPrivateKey);
        // ... deployment logic here ...
        // vm.stopBroadcast();
    }
}
