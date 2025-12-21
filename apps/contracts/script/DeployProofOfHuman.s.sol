// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { ProofOfHuman } from "../src/ProofOfHuman.sol";
import { BaseScript } from "./Base.s.sol";

import { console } from "forge-std/console.sol";
import { SelfUtils } from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";

/// @title DeployProofOfHuman
/// @notice Deployment script for ProofOfHuman contract using standard deployment
contract DeployProofOfHuman is BaseScript {
    // Custom errors for deployment verification
    error DeploymentFailed();

    /// @notice Main deployment function using standard deployment
    /// @return proofOfHuman The deployed ProofOfHuman contract instance
    /// @dev Requires the following environment variables:
    ///      - IDENTITY_VERIFICATION_HUB_ADDRESS: Address of the Self Protocol verification hub
    ///      - SCOPE_SEED: Scope seed value (defaults to "grin-mates")
    ///      - VERIFICATION_CONFIG: Verification configuration that will be used to process the proof in the VerificationHub
    function run() public broadcast returns (ProofOfHuman proofOfHuman) {
        address hubAddress = vm.envAddress("IDENTITY_VERIFICATION_HUB_ADDRESS");
        string memory scopeSeed = vm.envString("SCOPE_SEED");

        // Use empty forbidden countries for mainnet - keep it simple
        string[] memory forbiddenCountries = new string[](0);
        string[] memory disclosures = new string[](0);

        SelfUtils.UnformattedVerificationConfigV2 memory verificationConfig = SelfUtils
            .UnformattedVerificationConfigV2({
                minimumAge: 18,
                excludedCountries: forbiddenCountries,
                ofacScreening: false,
                disclosures: disclosures
            });

        // Deploy the contract using SCOPE_SEED from environment
        proofOfHuman = new ProofOfHuman(hubAddress, scopeSeed, verificationConfig);

        // Log deployment information
        console.log("ProofOfHuman deployed to:", address(proofOfHuman));
        console.log("Identity Verification Hub:", hubAddress);

        // Verify deployment was successful
        if (address(proofOfHuman) == address(0)) revert DeploymentFailed();

        console.log("Deployment verification completed successfully!");
        console.log("Scope automatically generated from SCOPE_SEED:", scopeSeed);
    }
}