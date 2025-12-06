// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import { ProofOfHuman } from "../src/ProofOfHuman.sol";
import { MockHub } from "../src/MockHub.sol";
import "./VerificationConfigHelper.sol";
import { EnvValidator } from "./EnvValidator.sol";
import { SelfUtils } from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";

/**
 * @title DeploySepoliaWithMock
 * @notice Deployment script for ProofOfHuman contract on Celo Sepolia with a mock hub
 * @dev This script first deploys a MockHub contract, then deploys ProofOfHuman using that hub.
 *      This is useful for testing the deployment process when the real Self Protocol hub
 *      address is not yet available.
 */
contract DeploySepoliaWithMock is Script {
    function run() external returns (ProofOfHuman proofOfHuman, MockHub mockHub) {
        console.log("========================================");
        console.log("ProofOfHuman Deployment with Mock Hub");
        console.log("========================================");
        console.log("Network: Celo Sepolia Testnet (Chain ID: 11142220)");
        console.log("========================================\n");

        console.log("Step 1: Validating environment variables...");
        EnvValidator.validateRequiredEnvVars(vm);
        console.log("  [OK] All required environment variables are set\n");

        console.log("Step 2: Loading deployment parameters...");
        uint256 deployerPrivateKey = EnvValidator.validateAndGetPrivateKey(vm);
        string memory scopeSeed = vm.envString("SCOPE_SEED");
        
        console.log("  Scope Seed:", scopeSeed);
        console.log("  [OK] Parameters loaded\n");

        console.log("Step 3: Creating verification configuration...");
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            VerificationConfigHelper.createStandardConfig();
        console.log("  [OK] Configuration created and validated\n");

        console.log("Step 4: Starting deployment...");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy MockHub first
        console.log("  Deploying MockHub contract...");
        mockHub = new MockHub();
        console.log("  MockHub deployed at:", address(mockHub));

        // Deploy ProofOfHuman with MockHub address
        console.log("  Deploying ProofOfHuman contract...");
        proofOfHuman = new ProofOfHuman(
            address(mockHub),
            scopeSeed,
            config
        );
        console.log("  ProofOfHuman deployed at:", address(proofOfHuman));

        vm.stopBroadcast();

        console.log("  [OK] Deployment completed\n");

        // Log deployment summary
        console.log("========================================");
        console.log("Deployment Successful!");
        console.log("========================================");
        console.log("Network: Celo Sepolia Testnet (Chain ID: 11142220)");
        console.log("MockHub Address:", address(mockHub));
        console.log("ProofOfHuman Address:", address(proofOfHuman));
        console.log("Configuration ID:", vm.toString(proofOfHuman.verificationConfigId()));
        console.log("\nNext Steps:");
        console.log("1. Verify contracts on block explorer");
        console.log("2. Test contract interaction");
        console.log("3. Replace MockHub with real Self Protocol hub when available");
        console.log("========================================");

        return (proofOfHuman, mockHub);
    }
}