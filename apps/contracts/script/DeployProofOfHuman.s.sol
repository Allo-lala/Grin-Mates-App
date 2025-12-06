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
    ///      - SCOPE_SEED: Scope seed value (defaults to "self-workshop")
    ///      - VERIFICATION_CONFIG: Verification configuration that will be used to process the proof in the VerificationHub

    function run() public broadcast returns (ProofOfHuman proofOfHuman) {
        address hubAddress = vm.envAddress("IDENTITY_VERIFICATION_HUB_ADDRESS");
        string memory scopeSeed = vm.envString("SCOPE_SEED");
        string[] memory forbiddenCountries = new string[](6);
        string[] memory disclosures = new string[](3);
        
        // Make sure this is the same as frontend config (matching grin-mates requirements)
        forbiddenCountries[0] = "CU"; // Cuba
        forbiddenCountries[1] = "IR"; // Iran
        forbiddenCountries[2] = "KP"; // North Korea
        forbiddenCountries[3] = "SY"; // Syria
        forbiddenCountries[4] = "RU"; // Russia
        forbiddenCountries[5] = "BY"; // Belarus
        
        // Required disclosures
        disclosures[0] = "dateOfBirth";
        disclosures[1] = "nationality";
        disclosures[2] = "issuingState";
        
        SelfUtils.UnformattedVerificationConfigV2 memory verificationConfig = SelfUtils.UnformattedVerificationConfigV2({
            minimumAge: 18,
            excludedCountries: forbiddenCountries,
            ofacScreening: true,
            disclosures: disclosures
        });

        // Deploy the contract using SCOPE_SEED from environment
        proofOfHuman = new ProofOfHuman(hubAddress, scopeSeed, verificationConfig);

        // Log deployment information
        console.log("ProofOfHuman deployed to:", address(proofOfHuman));
        console.log("Identity Verification Hub:", hubAddress);
        console.log("Scope Seed:", scopeSeed);

        // Verify deployment was successful
        if (address(proofOfHuman) == address(0)) revert DeploymentFailed();

        console.log("Deployment verification completed successfully!");
        console.log("Scope automatically generated from SCOPE_SEED:", scopeSeed);
    }
}
