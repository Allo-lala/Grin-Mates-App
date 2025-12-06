// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SelfStructs
 * @notice Library containing Self Protocol data structures
 */
library SelfStructs {
    struct DisclosureRequirement {
        string field;
        bool required;
    }

    struct VerificationConfigV2 {
        uint8 minimumAge;
        bytes32[] excludedCountries;
        bool ofacScreening;
        DisclosureRequirement[] disclosures;
    }
}
