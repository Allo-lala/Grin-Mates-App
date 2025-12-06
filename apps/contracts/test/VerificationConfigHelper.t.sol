// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../script/VerificationConfigHelper.sol";
import { SelfUtils } from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";

/**
 * @title VerificationConfigHelperTest
 * @notice Tests for the VerificationConfigHelper library
 * @dev Validates that the helper creates correct verification configurations
 */
contract VerificationConfigHelperTest is Test {
    /**
     * @notice Test that standard config has correct minimum age
     * @dev Requirement 6.1: Minimum age must be 18
     */
    function test_StandardConfig_HasCorrectMinimumAge() public pure {
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            VerificationConfigHelper.createStandardConfig();
        
        assertEq(config.minimumAge, 18, "Minimum age should be 18");
    }

    /**
     * @notice Test that standard config has OFAC screening enabled
     * @dev Requirement 6.3: OFAC screening must be enabled
     */
    function test_StandardConfig_HasOFACScreeningEnabled() public pure {
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            VerificationConfigHelper.createStandardConfig();
        
        assertTrue(config.ofacScreening, "OFAC screening should be enabled");
    }

    /**
     * @notice Test that standard config has excluded countries
     * @dev Requirement 6.2: Must define excluded countries list
     */
    function test_StandardConfig_HasExcludedCountries() public pure {
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            VerificationConfigHelper.createStandardConfig();
        
        assertTrue(config.excludedCountries.length > 0, "Should have excluded countries");
        assertEq(config.excludedCountries.length, 6, "Should have 6 excluded countries");
    }

    /**
     * @notice Test that excluded countries list contains expected countries
     * @dev Requirement 6.2: Verify sanctioned countries are included
     */
    function test_ExcludedCountries_ContainsSanctionedCountries() public pure {
        string[] memory excludedCountries = VerificationConfigHelper.getExcludedCountries();
        
        assertEq(excludedCountries[0], "CU", "Should include Cuba");
        assertEq(excludedCountries[1], "IR", "Should include Iran");
        assertEq(excludedCountries[2], "KP", "Should include North Korea");
        assertEq(excludedCountries[3], "SY", "Should include Syria");
        assertEq(excludedCountries[4], "RU", "Should include Russia");
        assertEq(excludedCountries[5], "BY", "Should include Belarus");
    }

    /**
     * @notice Test that standard config has required disclosures
     * @dev Requirement 6.4: Must specify required identity disclosures
     */
    function test_StandardConfig_HasRequiredDisclosures() public pure {
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            VerificationConfigHelper.createStandardConfig();
        
        assertTrue(config.disclosures.length > 0, "Should have disclosures");
        assertEq(config.disclosures.length, 3, "Should have 3 standard disclosures");
    }

    /**
     * @notice Test that standard disclosures include required fields
     * @dev Requirement 6.4: Verify required disclosure fields
     */
    function test_StandardDisclosures_IncludeRequiredFields() public pure {
        string[] memory disclosures = VerificationConfigHelper.getStandardDisclosures();
        
        assertEq(disclosures[0], "dateOfBirth", "Should include dateOfBirth");
        assertEq(disclosures[1], "nationality", "Should include nationality");
        assertEq(disclosures[2], "issuingState", "Should include issuingState");
    }

    /**
     * @notice Test custom config with custom disclosures
     * @dev Requirement 6.5: Allow custom disclosure requirements
     */
    function test_CustomConfig_AcceptsCustomDisclosures() public pure {
        string[] memory customDisclosures = new string[](2);
        customDisclosures[0] = "customField1";
        customDisclosures[1] = "customField2";
        
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            VerificationConfigHelper.createCustomConfig(customDisclosures);
        
        assertEq(config.disclosures.length, 2, "Should have 2 custom disclosures");
        assertEq(config.disclosures[0], "customField1", "Should have custom field 1");
        assertEq(config.disclosures[1], "customField2", "Should have custom field 2");
    }

    /**
     * @notice Test that custom config maintains standard settings
     * @dev Custom config should still enforce age, countries, and OFAC
     */
    function test_CustomConfig_MaintainsStandardSettings() public pure {
        string[] memory customDisclosures = new string[](1);
        customDisclosures[0] = "customField";
        
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            VerificationConfigHelper.createCustomConfig(customDisclosures);
        
        assertEq(config.minimumAge, 18, "Should maintain minimum age 18");
        assertTrue(config.ofacScreening, "Should maintain OFAC screening");
        assertEq(config.excludedCountries.length, 6, "Should maintain excluded countries");
    }

    /**
     * @notice Test minimal disclosures
     * @dev Verify minimal disclosure set contains only dateOfBirth
     */
    function test_MinimalDisclosures_ContainsOnlyDateOfBirth() public pure {
        string[] memory disclosures = VerificationConfigHelper.getMinimalDisclosures();
        
        assertEq(disclosures.length, 1, "Should have 1 disclosure");
        assertEq(disclosures[0], "dateOfBirth", "Should only include dateOfBirth");
    }

    /**
     * @notice Test extended disclosures
     * @dev Verify extended disclosure set includes additional fields
     */
    function test_ExtendedDisclosures_IncludesAdditionalFields() public pure {
        string[] memory disclosures = VerificationConfigHelper.getExtendedDisclosures();
        
        assertEq(disclosures.length, 5, "Should have 5 disclosures");
        assertEq(disclosures[3], "documentNumber", "Should include documentNumber");
        assertEq(disclosures[4], "expirationDate", "Should include expirationDate");
    }

    /**
     * @notice Test config validation with valid config
     * @dev Valid config should pass validation
     */
    function test_ValidateConfig_PassesForValidConfig() public pure {
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            VerificationConfigHelper.createStandardConfig();
        
        (bool isValid, string memory errorMessage) = 
            VerificationConfigHelper.validateConfig(config);
        
        assertTrue(isValid, "Valid config should pass validation");
        assertEq(bytes(errorMessage).length, 0, "Should have no error message");
    }

    /**
     * @notice Test config validation with wrong minimum age
     * @dev Config with age != 18 should fail validation
     */
    function test_ValidateConfig_FailsForWrongMinimumAge() public pure {
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            VerificationConfigHelper.createStandardConfig();
        config.minimumAge = 21; // Wrong age
        
        (bool isValid, string memory errorMessage) = 
            VerificationConfigHelper.validateConfig(config);
        
        assertFalse(isValid, "Config with wrong age should fail");
        assertEq(errorMessage, "Minimum age must be 18", "Should have correct error message");
    }

    /**
     * @notice Test config validation with empty excluded countries
     * @dev Config without excluded countries should fail validation
     */
    function test_ValidateConfig_FailsForEmptyExcludedCountries() public pure {
        string[] memory emptyCountries = new string[](0);
        string[] memory disclosures = VerificationConfigHelper.getStandardDisclosures();
        
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            SelfUtils.UnformattedVerificationConfigV2({
                minimumAge: 18,
                excludedCountries: emptyCountries,
                ofacScreening: true,
                disclosures: disclosures
            });
        
        (bool isValid, string memory errorMessage) = 
            VerificationConfigHelper.validateConfig(config);
        
        assertFalse(isValid, "Config without excluded countries should fail");
        assertEq(errorMessage, "Excluded countries list cannot be empty", "Should have correct error message");
    }

    /**
     * @notice Test config validation with OFAC screening disabled
     * @dev Config with OFAC disabled should fail validation
     */
    function test_ValidateConfig_FailsForDisabledOFAC() public pure {
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            VerificationConfigHelper.createStandardConfig();
        config.ofacScreening = false; // Disable OFAC
        
        (bool isValid, string memory errorMessage) = 
            VerificationConfigHelper.validateConfig(config);
        
        assertFalse(isValid, "Config with OFAC disabled should fail");
        assertEq(errorMessage, "OFAC screening must be enabled", "Should have correct error message");
    }

    /**
     * @notice Test config validation with no disclosures
     * @dev Config without disclosures should fail validation
     */
    function test_ValidateConfig_FailsForNoDisclosures() public pure {
        string[] memory emptyDisclosures = new string[](0);
        string[] memory countries = VerificationConfigHelper.getExcludedCountries();
        
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            SelfUtils.UnformattedVerificationConfigV2({
                minimumAge: 18,
                excludedCountries: countries,
                ofacScreening: true,
                disclosures: emptyDisclosures
            });
        
        (bool isValid, string memory errorMessage) = 
            VerificationConfigHelper.validateConfig(config);
        
        assertFalse(isValid, "Config without disclosures should fail");
        assertEq(errorMessage, "At least one disclosure is required", "Should have correct error message");
    }
}
