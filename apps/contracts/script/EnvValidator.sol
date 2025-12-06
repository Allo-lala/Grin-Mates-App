// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "forge-std/Vm.sol";

/**
 * @title EnvValidator
 * @notice Helper library for validating required environment variables in Foundry deployment scripts
 * @dev This library provides utilities to check for required environment variables and fail fast
 *      with clear error messages if any are missing. This prevents deployment attempts with
 *      incomplete configuration.
 */
library EnvValidator {
    /**
     * @notice Validates that all required environment variables are set
     * @dev Checks for PRIVATE_KEY, CELOSCAN_API_KEY, and SCOPE_SEED
     *      Fails with a descriptive error message if any variable is missing
     * @param vm The Vm instance from forge-std for accessing environment variables
     */
    function validateRequiredEnvVars(VmSafe vm) internal view {
        bool allValid = true;
        string memory missingVars = "";

        // Check PRIVATE_KEY
        try vm.envString("PRIVATE_KEY") returns (string memory privateKey) {
            if (bytes(privateKey).length == 0) {
                allValid = false;
                missingVars = string.concat(missingVars, "\n  - PRIVATE_KEY (empty)");
            }
        } catch {
            allValid = false;
            missingVars = string.concat(missingVars, "\n  - PRIVATE_KEY (not set)");
        }

        // Check CELOSCAN_API_KEY
        try vm.envString("CELOSCAN_API_KEY") returns (string memory apiKey) {
            if (bytes(apiKey).length == 0) {
                allValid = false;
                missingVars = string.concat(missingVars, "\n  - CELOSCAN_API_KEY (empty)");
            }
        } catch {
            allValid = false;
            missingVars = string.concat(missingVars, "\n  - CELOSCAN_API_KEY (not set)");
        }

        // Check SCOPE_SEED
        try vm.envString("SCOPE_SEED") returns (string memory scopeSeed) {
            if (bytes(scopeSeed).length == 0) {
                allValid = false;
                missingVars = string.concat(missingVars, "\n  - SCOPE_SEED (empty)");
            }
        } catch {
            allValid = false;
            missingVars = string.concat(missingVars, "\n  - SCOPE_SEED (not set)");
        }

        if (!allValid) {
            console.log("\n========================================");
            console.log("ERROR: Missing Required Environment Variables");
            console.log("========================================");
            console.log("\nThe following environment variables are required but not set:");
            console.log(missingVars);
            console.log("\nPlease set these variables in your .env file.");
            console.log("See .env.example for reference.");
            console.log("========================================\n");
            revert("Missing required environment variables");
        }
    }

    /**
     * @notice Validates required environment variables for a specific network deployment
     * @dev Checks base required vars plus network-specific RPC URL
     * @param vm The Vm instance from forge-std
     * @param rpcUrlEnvVar The name of the RPC URL environment variable (e.g., "ALFAJORES_RPC_URL")
     */
    function validateNetworkEnvVars(VmSafe vm, string memory rpcUrlEnvVar) internal view {
        // First validate base required vars
        validateRequiredEnvVars(vm);

        // Then check network-specific RPC URL
        try vm.envString(rpcUrlEnvVar) returns (string memory rpcUrl) {
            if (bytes(rpcUrl).length == 0) {
                console.log("\n========================================");
                console.log("ERROR: Missing Network RPC URL");
                console.log("========================================");
                console.log("\nThe RPC URL environment variable is empty:");
                console.log(string.concat("  - ", rpcUrlEnvVar));
                console.log("\nPlease set this variable in your .env file.");
                console.log("========================================\n");
                revert(string.concat("Missing RPC URL: ", rpcUrlEnvVar));
            }
        } catch {
            console.log("\n========================================");
            console.log("ERROR: Missing Network RPC URL");
            console.log("========================================");
            console.log("\nThe RPC URL environment variable is not set:");
            console.log(string.concat("  - ", rpcUrlEnvVar));
            console.log("\nPlease set this variable in your .env file.");
            console.log("========================================\n");
            revert(string.concat("Missing RPC URL: ", rpcUrlEnvVar));
        }
    }

    /**
     * @notice Validates that a private key is in the correct format
     * @dev Checks that the private key is a valid hex string of appropriate length
     * @param vm The Vm instance from forge-std
     * @return privateKey The validated private key as a uint256
     */
    function validateAndGetPrivateKey(VmSafe vm) internal view returns (uint256 privateKey) {
        try vm.envUint("PRIVATE_KEY") returns (uint256 key) {
            if (key == 0) {
                console.log("\n========================================");
                console.log("ERROR: Invalid Private Key");
                console.log("========================================");
                console.log("\nThe PRIVATE_KEY is set to zero or invalid.");
                console.log("Please provide a valid private key in your .env file.");
                console.log("========================================\n");
                revert("Invalid private key: cannot be zero");
            }
            return key;
        } catch {
            console.log("\n========================================");
            console.log("ERROR: Invalid Private Key Format");
            console.log("========================================");
            console.log("\nThe PRIVATE_KEY must be a valid hex number.");
            console.log("Format: 64-character hex string (without 0x prefix)");
            console.log("Please check your .env file.");
            console.log("========================================\n");
            revert("Invalid private key format");
        }
    }

    /**
     * @notice Prints a summary of loaded environment variables (without exposing sensitive data)
     * @dev Useful for debugging deployment configuration
     * @param vm The Vm instance from forge-std
     * @param network The network name being deployed to
     */
    function printEnvSummary(VmSafe vm, string memory network) internal view {
        console.log("\n========================================");
        console.log("Deployment Configuration Summary");
        console.log("========================================");
        console.log(string.concat("Network: ", network));
        
        try vm.envString("SCOPE_SEED") returns (string memory scopeSeed) {
            console.log(string.concat("Scope Seed: ", scopeSeed));
        } catch {}

        console.log("Private Key: [REDACTED]");
        console.log("Celoscan API Key: [REDACTED]");
        console.log("========================================\n");
    }
}
