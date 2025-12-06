// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { SelfStructs } from "./SelfStructs.sol";

/**
 * @title SelfUtils
 * @notice Utility library for Self Protocol operations
 */
library SelfUtils {
    struct UnformattedVerificationConfigV2 {
        uint8 minimumAge;
        string[] excludedCountries;
        bool ofacScreening;
        string[] disclosures;
    }

    /**
     * @notice Formats an unformatted verification config into the proper format
     * @param unformatted The unformatted configuration
     * @return The formatted verification configuration
     */
    function formatVerificationConfigV2(
        UnformattedVerificationConfigV2 memory unformatted
    ) internal pure returns (SelfStructs.VerificationConfigV2 memory) {
        // Convert excluded countries from strings to bytes32
        bytes32[] memory excludedCountries = new bytes32[](unformatted.excludedCountries.length);
        for (uint256 i = 0; i < unformatted.excludedCountries.length; i++) {
            excludedCountries[i] = stringToBytes32(unformatted.excludedCountries[i]);
        }

        // Convert disclosures from strings to DisclosureRequirement structs
        SelfStructs.DisclosureRequirement[] memory disclosures = 
            new SelfStructs.DisclosureRequirement[](unformatted.disclosures.length);
        for (uint256 i = 0; i < unformatted.disclosures.length; i++) {
            disclosures[i] = SelfStructs.DisclosureRequirement({
                field: unformatted.disclosures[i],
                required: true
            });
        }

        return SelfStructs.VerificationConfigV2({
            minimumAge: unformatted.minimumAge,
            excludedCountries: excludedCountries,
            ofacScreening: unformatted.ofacScreening,
            disclosures: disclosures
        });
    }

    /**
     * @notice Converts a string to bytes32
     * @param source The source string
     * @return result The bytes32 representation
     */
    function stringToBytes32(string memory source) internal pure returns (bytes32 result) {
        bytes memory tempBytes = bytes(source);
        if (tempBytes.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }
}
