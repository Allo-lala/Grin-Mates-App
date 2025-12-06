// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { SelfUtils } from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";

/**
 * @title VerificationConfigHelper
 * @notice Helper library for creating Self Protocol verification configurations
 * @dev This library provides reusable functions to build UnformattedVerificationConfigV2 structs
 *      with standardized settings for age requirements, country restrictions, and identity disclosures.
 *      
 *      Requirements Addressed:
 *      - 6.1: Set minimum age to 18 years
 *      - 6.2: Define excluded countries list (sanctioned/restricted countries)
 *      - 6.3: Enable OFAC sanctions screening
 *      - 6.4: Specify required identity disclosures
 *      - 6.5: Allow configuration of custom disclosure requirements
 *      - 4.3: Accept verification configuration as constructor parameter
 *      - 4.4: Format configuration using SelfUtils.formatVerificationConfigV2
 */
library VerificationConfigHelper {
    /**
     * @notice Minimum age requirement for verification (18 years)
     * @dev Requirement 6.1: WHEN configuring verification THEN the system SHALL set minimum age to 18 years
     */
    uint8 public constant MINIMUM_AGE = 18;

    /**
     * @notice OFAC screening enabled by default
     * @dev Requirement 6.3: WHEN configuring verification THEN the system SHALL enable OFAC sanctions screening
     */
    bool public constant OFAC_SCREENING_ENABLED = true;

    /**
     * @notice Creates a standard verification configuration with default settings
     * @dev This function creates a configuration with:
     *      - Minimum age: 18 years (Requirement 6.1)
     *      - Excluded countries: Sanctioned/restricted countries (Requirement 6.2)
     *      - OFAC screening: Enabled (Requirement 6.3)
     *      - Disclosures: Standard identity disclosures (Requirement 6.4)
     * @return config The unformatted verification configuration ready to be formatted and registered
     */
    function createStandardConfig() 
        internal 
        pure 
        returns (SelfUtils.UnformattedVerificationConfigV2 memory config) 
    {
        config = SelfUtils.UnformattedVerificationConfigV2({
            minimumAge: MINIMUM_AGE,
            excludedCountries: getExcludedCountries(),
            ofacScreening: OFAC_SCREENING_ENABLED,
            disclosures: getStandardDisclosures()
        });
    }

    /**
     * @notice Creates a custom verification configuration with specified disclosures
     * @dev Requirement 6.5: WHERE additional verification criteria are needed 
     *      THEN the system SHALL allow configuration of custom disclosure requirements
     * @param customDisclosures Array of custom disclosure field names
     * @return config The unformatted verification configuration with custom disclosures
     */
    function createCustomConfig(string[] memory customDisclosures)
        internal
        pure
        returns (SelfUtils.UnformattedVerificationConfigV2 memory config)
    {
        config = SelfUtils.UnformattedVerificationConfigV2({
            minimumAge: MINIMUM_AGE,
            excludedCountries: getExcludedCountries(),
            ofacScreening: OFAC_SCREENING_ENABLED,
            disclosures: customDisclosures
        });
    }

    /**
     * @notice Returns the list of excluded countries (sanctioned/restricted)
     * @dev Requirement 6.2: WHEN configuring verification THEN the system SHALL define a list of excluded countries
     *      
     *      This list includes countries subject to:
     *      - U.S. sanctions (OFAC)
     *      - International sanctions
     *      - Regulatory restrictions
     *      
     *      Country codes follow ISO 3166-1 alpha-2 standard
     *      
     *      Current list includes:
     *      - CU: Cuba
     *      - IR: Iran
     *      - KP: North Korea (Democratic People's Republic of Korea)
     *      - SY: Syria
     *      - RU: Russia (due to ongoing sanctions)
     *      - BY: Belarus (due to sanctions)
     *      
     *      Note: This list should be reviewed and updated regularly based on:
     *      - Current OFAC sanctions list
     *      - International sanctions regimes
     *      - Regulatory compliance requirements
     *      - Legal counsel recommendations
     * 
     * @return excludedCountries Array of ISO 3166-1 alpha-2 country codes
     */
    function getExcludedCountries() internal pure returns (string[] memory excludedCountries) {
        excludedCountries = new string[](6);
        excludedCountries[0] = "CU"; // Cuba
        excludedCountries[1] = "IR"; // Iran
        excludedCountries[2] = "KP"; // North Korea
        excludedCountries[3] = "SY"; // Syria
        excludedCountries[4] = "RU"; // Russia
        excludedCountries[5] = "BY"; // Belarus
    }

    /**
     * @notice Returns the standard set of required identity disclosures
     * @dev Requirement 6.4: WHEN configuring verification THEN the system SHALL specify required identity disclosures
     *      
     *      Standard disclosures include:
     *      - dateOfBirth: Required for age verification (minimum age 18)
     *      - nationality: Required for country exclusion checks
     *      - issuingState: Optional additional verification data
     *      
     *      These disclosures enable the contract to:
     *      1. Verify user meets minimum age requirement
     *      2. Verify user is not from an excluded country
     *      3. Comply with OFAC screening requirements
     * 
     * @return disclosures Array of disclosure field names
     */
    function getStandardDisclosures() internal pure returns (string[] memory disclosures) {
        disclosures = new string[](3);
        disclosures[0] = "dateOfBirth";    // Required for age verification
        disclosures[1] = "nationality";    // Required for country exclusion
        disclosures[2] = "issuingState";   // Additional verification data
    }

    /**
     * @notice Returns a minimal set of disclosures for basic verification
     * @dev Useful for testing or scenarios where only age verification is needed
     * @return disclosures Array containing only dateOfBirth disclosure
     */
    function getMinimalDisclosures() internal pure returns (string[] memory disclosures) {
        disclosures = new string[](1);
        disclosures[0] = "dateOfBirth";
    }

    /**
     * @notice Returns an extended set of disclosures for comprehensive verification
     * @dev Includes additional identity attributes beyond standard disclosures
     * @return disclosures Array of extended disclosure field names
     */
    function getExtendedDisclosures() internal pure returns (string[] memory disclosures) {
        disclosures = new string[](5);
        disclosures[0] = "dateOfBirth";
        disclosures[1] = "nationality";
        disclosures[2] = "issuingState";
        disclosures[3] = "documentNumber";  // Government ID number
        disclosures[4] = "expirationDate";  // Document expiration
    }

    /**
     * @notice Validates that a verification configuration meets requirements
     * @dev Checks that the configuration satisfies all mandatory requirements:
     *      - Minimum age is set to 18 (Requirement 6.1)
     *      - Excluded countries list is not empty (Requirement 6.2)
     *      - OFAC screening is enabled (Requirement 6.3)
     *      - At least one disclosure is required (Requirement 6.4)
     * @param config The configuration to validate
     * @return isValid True if configuration meets all requirements
     * @return errorMessage Description of validation failure (empty if valid)
     */
    function validateConfig(SelfUtils.UnformattedVerificationConfigV2 memory config)
        internal
        pure
        returns (bool isValid, string memory errorMessage)
    {
        // Check minimum age requirement (6.1)
        if (config.minimumAge != MINIMUM_AGE) {
            return (false, "Minimum age must be 18");
        }

        // Check excluded countries list (6.2)
        if (config.excludedCountries.length == 0) {
            return (false, "Excluded countries list cannot be empty");
        }

        // Check OFAC screening (6.3)
        if (!config.ofacScreening) {
            return (false, "OFAC screening must be enabled");
        }

        // Check disclosures (6.4)
        if (config.disclosures.length == 0) {
            return (false, "At least one disclosure is required");
        }

        return (true, "");
    }
}
