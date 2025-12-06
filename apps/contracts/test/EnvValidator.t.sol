// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../script/EnvValidator.sol";

/**
 * @title EnvValidatorTest
 * @notice Tests for the EnvValidator library
 * @dev These tests verify that the environment variable validation works correctly
 */
contract EnvValidatorTest is Test {
    using EnvValidator for VmSafe;

    /**
     * @notice Test that validateAndGetPrivateKey rejects zero private key
     */
    function test_RevertWhen_PrivateKeyIsZero() public {
        // Set PRIVATE_KEY to 0
        vm.setEnv("PRIVATE_KEY", "0");
        
        // Should revert with invalid private key error
        // We use a try-catch pattern since vm.expectRevert doesn't work well with view functions
        try this.externalValidateAndGetPrivateKey() {
            fail("Expected revert but call succeeded");
        } catch {
            // Expected to revert
        }
    }
    
    // External wrapper for testing
    function externalValidateAndGetPrivateKey() external view returns (uint256) {
        return EnvValidator.validateAndGetPrivateKey(vm);
    }

    /**
     * @notice Test that validateAndGetPrivateKey accepts valid private key
     */
    function test_ValidateAndGetPrivateKey_Success() public {
        // Set a valid test private key
        vm.setEnv("PRIVATE_KEY", "1234567890123456789012345678901234567890123456789012345678901234");
        
        // Should successfully return the private key
        uint256 privateKey = EnvValidator.validateAndGetPrivateKey(vm);
        assertGt(privateKey, 0, "Private key should be greater than zero");
    }

    /**
     * @notice Test that validateRequiredEnvVars succeeds when all vars are set
     */
    function test_ValidateRequiredEnvVars_Success() public {
        // Set all required environment variables
        vm.setEnv("PRIVATE_KEY", "1234567890123456789012345678901234567890123456789012345678901234");
        vm.setEnv("CELOSCAN_API_KEY", "test_api_key");
        vm.setEnv("SCOPE_SEED", "test_scope_seed");
        
        // Should not revert
        EnvValidator.validateRequiredEnvVars(vm);
    }

    /**
     * @notice Test that validateRequiredEnvVars reverts when PRIVATE_KEY is missing
     */
    function test_RevertWhen_PrivateKeyMissing() public {
        // Set only some required variables
        vm.setEnv("CELOSCAN_API_KEY", "test_api_key");
        vm.setEnv("SCOPE_SEED", "test_scope_seed");
        
        // Unset PRIVATE_KEY
        vm.setEnv("PRIVATE_KEY", "");
        
        // Should revert
        try this.externalValidateRequiredEnvVars() {
            fail("Expected revert but call succeeded");
        } catch {
            // Expected to revert
        }
    }

    /**
     * @notice Test that validateRequiredEnvVars reverts when CELOSCAN_API_KEY is missing
     */
    function test_RevertWhen_CeloscanApiKeyMissing() public {
        // Set only some required variables
        vm.setEnv("PRIVATE_KEY", "1234567890123456789012345678901234567890123456789012345678901234");
        vm.setEnv("SCOPE_SEED", "test_scope_seed");
        
        // Unset CELOSCAN_API_KEY
        vm.setEnv("CELOSCAN_API_KEY", "");
        
        // Should revert
        try this.externalValidateRequiredEnvVars() {
            fail("Expected revert but call succeeded");
        } catch {
            // Expected to revert
        }
    }

    /**
     * @notice Test that validateRequiredEnvVars reverts when SCOPE_SEED is missing
     */
    function test_RevertWhen_ScopeSeedMissing() public {
        // Set only some required variables
        vm.setEnv("PRIVATE_KEY", "1234567890123456789012345678901234567890123456789012345678901234");
        vm.setEnv("CELOSCAN_API_KEY", "test_api_key");
        
        // Unset SCOPE_SEED
        vm.setEnv("SCOPE_SEED", "");
        
        // Should revert
        try this.externalValidateRequiredEnvVars() {
            fail("Expected revert but call succeeded");
        } catch {
            // Expected to revert
        }
    }
    
    // External wrapper for testing
    function externalValidateRequiredEnvVars() external view {
        EnvValidator.validateRequiredEnvVars(vm);
    }

    /**
     * @notice Test that validateNetworkEnvVars succeeds when all vars including RPC URL are set
     */
    function test_ValidateNetworkEnvVars_Success() public {
        // Set all required environment variables
        vm.setEnv("PRIVATE_KEY", "1234567890123456789012345678901234567890123456789012345678901234");
        vm.setEnv("CELOSCAN_API_KEY", "test_api_key");
        vm.setEnv("SCOPE_SEED", "test_scope_seed");
        vm.setEnv("ALFAJORES_RPC_URL", "https://alfajores-forno.celo-testnet.org");
        
        // Should not revert
        EnvValidator.validateNetworkEnvVars(vm, "ALFAJORES_RPC_URL");
    }

    /**
     * @notice Test that validateNetworkEnvVars reverts when RPC URL is missing
     */
    function test_RevertWhen_RpcUrlMissing() public {
        // Set all required base variables
        vm.setEnv("PRIVATE_KEY", "1234567890123456789012345678901234567890123456789012345678901234");
        vm.setEnv("CELOSCAN_API_KEY", "test_api_key");
        vm.setEnv("SCOPE_SEED", "test_scope_seed");
        
        // Unset RPC URL
        vm.setEnv("ALFAJORES_RPC_URL", "");
        
        // Should revert
        try this.externalValidateNetworkEnvVars() {
            fail("Expected revert but call succeeded");
        } catch {
            // Expected to revert
        }
    }
    
    // External wrapper for testing
    function externalValidateNetworkEnvVars() external view {
        EnvValidator.validateNetworkEnvVars(vm, "ALFAJORES_RPC_URL");
    }

    /**
     * @notice Test that printEnvSummary doesn't revert and can be called
     */
    function test_PrintEnvSummary_Success() public {
        // Set required environment variables
        vm.setEnv("PRIVATE_KEY", "1234567890123456789012345678901234567890123456789012345678901234");
        vm.setEnv("CELOSCAN_API_KEY", "test_api_key");
        vm.setEnv("SCOPE_SEED", "test_scope_seed");
        
        // Should not revert
        EnvValidator.printEnvSummary(vm, "Alfajores");
    }
}
