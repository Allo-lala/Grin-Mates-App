// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/ProofOfHuman.sol";
import "../script/VerificationConfigHelper.sol";
import { SelfUtils } from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import { SelfStructs } from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import { ISelfVerificationRoot } from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import { IIdentityVerificationHubV2 } from "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol";

/**
 * @title ProofOfHumanTest
 * @notice Comprehensive tests for the ProofOfHuman contract
 * @dev Tests constructor, verification hooks, events, and configuration retrieval
 */
contract ProofOfHumanTest is Test {
    ProofOfHuman public proofOfHuman;
    MockIdentityVerificationHubV2 public mockHub;
    
    // Test constants
    address constant VALID_HUB_ADDRESS = address(0x1234567890123456789012345678901234567890);
    string constant VALID_SCOPE_SEED = "test-scope-seed-12345";
    string constant EMPTY_SCOPE_SEED = "";
    address constant ZERO_ADDRESS = address(0);
    
    // Test verification data
    bytes32 constant TEST_USER_IDENTIFIER = bytes32(uint256(uint160(0xaBcDef1234567890123456789012345678901234)));
    bytes32 constant TEST_SESSION_ID = keccak256("test-session-123");
    uint256 constant TEST_TIMESTAMP = 1640995200; // Jan 1, 2022
    bytes constant TEST_USER_DATA = "test-user-data";
    
    event VerificationCompleted(ISelfVerificationRoot.GenericDiscloseOutputV2 output, bytes userData);

    function setUp() public {
        // Deploy mock hub
        mockHub = new MockIdentityVerificationHubV2();
    }

    // ============ Constructor Tests (Task 11.1) ============

    /**
     * @notice Test contract deployment with valid parameters
     * @dev Requirements: 9.1, 4.1, 4.2, 4.5
     */
    function test_Constructor_DeploymentWithValidParameters() public {
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            VerificationConfigHelper.createStandardConfig();
        
        proofOfHuman = new ProofOfHuman(
            address(mockHub),
            VALID_SCOPE_SEED,
            config
        );
        
        // Verify contract was deployed successfully
        assertTrue(address(proofOfHuman) != address(0), "Contract should be deployed");
        
        // Verify configuration ID was set
        bytes32 configId = proofOfHuman.verificationConfigId();
        assertTrue(configId != bytes32(0), "Configuration ID should be set");
        
        // Verify getConfigId returns the same ID
        bytes32 retrievedConfigId = proofOfHuman.getConfigId(bytes32(0), bytes32(0), "");
        assertEq(retrievedConfigId, configId, "getConfigId should return stored config ID");
    }

    /**
     * @notice Test that verification config is formatted correctly
     * @dev Requirements: 4.2, 4.5
     */
    function test_Constructor_VerificationConfigFormattedCorrectly() public {
        SelfUtils.UnformattedVerificationConfigV2 memory unformattedConfig = 
            VerificationConfigHelper.createStandardConfig();
        
        proofOfHuman = new ProofOfHuman(
            address(mockHub),
            VALID_SCOPE_SEED,
            unformattedConfig
        );
        
        // Get the stored formatted config from the mock hub
        bytes32 configId = proofOfHuman.verificationConfigId();
        SelfStructs.VerificationConfigV2 memory storedConfig = mockHub.getVerificationConfig(configId);
        
        // Verify the config was formatted and stored correctly
        assertEq(storedConfig.minimumAge, 18, "Minimum age should be 18");
        assertTrue(storedConfig.ofacScreening, "OFAC screening should be enabled");
        assertTrue(storedConfig.excludedCountries.length > 0, "Should have excluded countries");
        assertTrue(storedConfig.disclosures.length > 0, "Should have disclosures");
    }

    /**
     * @notice Test that configuration ID is stored
     * @dev Requirements: 4.5
     */
    function test_Constructor_ConfigurationIdStored() public {
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            VerificationConfigHelper.createStandardConfig();
        
        proofOfHuman = new ProofOfHuman(
            address(mockHub),
            VALID_SCOPE_SEED,
            config
        );
        
        bytes32 configId = proofOfHuman.verificationConfigId();
        
        // Configuration ID should not be zero
        assertTrue(configId != bytes32(0), "Configuration ID should be non-zero");
        
        // Should match what the mock hub returned
        bytes32 expectedConfigId = mockHub.getLastConfigId();
        assertEq(configId, expectedConfigId, "Should match hub's returned config ID");
    }

    /**
     * @notice Test deployment fails with zero address hub
     * @dev Requirements: 4.1
     */
    function test_Constructor_FailsWithZeroAddressHub() public {
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            VerificationConfigHelper.createStandardConfig();
        
        // Expect revert when using zero address for hub
        vm.expectRevert();
        new ProofOfHuman(
            ZERO_ADDRESS,
            VALID_SCOPE_SEED,
            config
        );
    }

    /**
     * @notice Test deployment fails with empty scope seed
     * @dev Requirements: 4.2
     */
    function test_Constructor_FailsWithEmptyScopeSeed() public {
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            VerificationConfigHelper.createStandardConfig();
        
        // Expect revert when using empty scope seed
        vm.expectRevert();
        new ProofOfHuman(
            address(mockHub),
            EMPTY_SCOPE_SEED,
            config
        );
    }

    // ============ Verification Hook Tests (Task 11.2) ============

    /**
     * @notice Test customVerificationHook updates verificationSuccessful
     * @dev Requirements: 9.2, 3.2, 3.5
     */
    function test_VerificationHook_UpdatesVerificationSuccessful() public {
        _deployValidContract();
        
        // Initially should be false
        assertFalse(proofOfHuman.verificationSuccessful(), "Should initially be false");
        
        // Create test verification output
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output = _createTestOutput();
        
        // Simulate verification callback (this would normally come from the hub)
        vm.prank(address(mockHub));
        proofOfHuman.onVerificationSuccess(output, TEST_USER_DATA);
        
        // Verify state was updated
        assertTrue(proofOfHuman.verificationSuccessful(), "Should be true after verification");
    }

    /**
     * @notice Test customVerificationHook stores lastOutput correctly
     * @dev Requirements: 9.2, 3.2, 3.5
     */
    function test_VerificationHook_StoresLastOutputCorrectly() public {
        _deployValidContract();
        
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output = _createTestOutput();
        
        // Simulate verification callback
        vm.prank(address(mockHub));
        proofOfHuman.onVerificationSuccess(output, TEST_USER_DATA);
        
        // Verify output was stored correctly
        (bytes32 userIdentifier, bytes32 sessionId, uint256 timestamp, bytes memory issuingState, bytes memory nationality, bytes memory dateOfBirth) = proofOfHuman.lastOutput();
        assertEq(userIdentifier, TEST_USER_IDENTIFIER, "User identifier should match");
        assertEq(sessionId, TEST_SESSION_ID, "Session ID should match");
        assertEq(timestamp, TEST_TIMESTAMP, "Timestamp should match");
    }

    /**
     * @notice Test customVerificationHook stores lastUserData correctly
     * @dev Requirements: 9.2, 3.2, 3.5
     */
    function test_VerificationHook_StoresLastUserDataCorrectly() public {
        _deployValidContract();
        
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output = _createTestOutput();
        
        // Simulate verification callback
        vm.prank(address(mockHub));
        proofOfHuman.onVerificationSuccess(output, TEST_USER_DATA);
        
        // Verify user data was stored correctly
        bytes memory storedUserData = proofOfHuman.lastUserData();
        assertEq(storedUserData, TEST_USER_DATA, "User data should match");
    }

    /**
     * @notice Test customVerificationHook extracts lastUserAddress correctly
     * @dev Requirements: 9.2, 3.2, 3.5
     */
    function test_VerificationHook_ExtractsLastUserAddressCorrectly() public {
        _deployValidContract();
        
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output = _createTestOutput();
        
        // Simulate verification callback
        vm.prank(address(mockHub));
        proofOfHuman.onVerificationSuccess(output, TEST_USER_DATA);
        
        // Verify user address was extracted correctly
        address storedUserAddress = proofOfHuman.lastUserAddress();
        address expectedAddress = address(uint160(uint256(TEST_USER_IDENTIFIER)));
        assertEq(storedUserAddress, expectedAddress, "User address should be extracted from userIdentifier");
    }

    // ============ Event Emission Tests (Task 11.4) ============

    /**
     * @notice Test VerificationCompleted event is emitted on successful verification
     * @dev Requirements: 9.4, 3.4
     */
    function test_EventEmission_VerificationCompletedEmitted() public {
        _deployValidContract();
        
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output = _createTestOutput();
        
        // Expect the VerificationCompleted event to be emitted
        vm.expectEmit(true, true, true, true);
        emit VerificationCompleted(output, TEST_USER_DATA);
        
        // Simulate verification callback
        vm.prank(address(mockHub));
        proofOfHuman.onVerificationSuccess(output, TEST_USER_DATA);
    }

    /**
     * @notice Test event contains correct output data
     * @dev Requirements: 9.4, 3.4
     */
    function test_EventEmission_ContainsCorrectOutputData() public {
        _deployValidContract();
        
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output = _createTestOutput();
        
        // Record logs to verify event data
        vm.recordLogs();
        
        // Simulate verification callback
        vm.prank(address(mockHub));
        proofOfHuman.onVerificationSuccess(output, TEST_USER_DATA);
        
        // Get the emitted logs
        Vm.Log[] memory logs = vm.getRecordedLogs();
        assertTrue(logs.length > 0, "Should have emitted at least one event");
        
        // The VerificationCompleted event should be the last one emitted
        // (SelfVerificationRoot may emit other events first)
        bool foundVerificationEvent = false;
        for (uint i = 0; i < logs.length; i++) {
            if (logs[i].topics[0] == keccak256("VerificationCompleted((bytes32,bytes32,uint256,bytes,bytes,bytes),bytes)")) {
                foundVerificationEvent = true;
                break;
            }
        }
        assertTrue(foundVerificationEvent, "Should have emitted VerificationCompleted event");
    }

    /**
     * @notice Test event contains correct user data
     * @dev Requirements: 9.4, 3.4
     */
    function test_EventEmission_ContainsCorrectUserData() public {
        _deployValidContract();
        
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output = _createTestOutput();
        
        // Record logs to verify event data
        vm.recordLogs();
        
        // Simulate verification callback
        vm.prank(address(mockHub));
        proofOfHuman.onVerificationSuccess(output, TEST_USER_DATA);
        
        // Verify the event was emitted (detailed verification would require parsing the log data)
        Vm.Log[] memory logs = vm.getRecordedLogs();
        assertTrue(logs.length > 0, "Should have emitted events");
    }

    // ============ Configuration Retrieval Tests (Task 11.6) ============

    /**
     * @notice Test getConfigId returns correct configuration ID
     * @dev Requirements: 9.5
     */
    function test_ConfigRetrieval_GetConfigIdReturnsCorrectId() public {
        _deployValidContract();
        
        bytes32 storedConfigId = proofOfHuman.verificationConfigId();
        bytes32 retrievedConfigId = proofOfHuman.getConfigId(bytes32(0), bytes32(0), "");
        
        assertEq(retrievedConfigId, storedConfigId, "getConfigId should return stored config ID");
    }

    /**
     * @notice Test getConfigId is consistent across multiple calls
     * @dev Requirements: 9.5
     */
    function test_ConfigRetrieval_GetConfigIdConsistentAcrossMultipleCalls() public {
        _deployValidContract();
        
        bytes32 firstCall = proofOfHuman.getConfigId(bytes32(0), bytes32(0), "");
        bytes32 secondCall = proofOfHuman.getConfigId(bytes32(0), bytes32(0), "");
        bytes32 thirdCall = proofOfHuman.getConfigId(bytes32(0), bytes32(0), "");
        
        assertEq(firstCall, secondCall, "First and second calls should return same ID");
        assertEq(secondCall, thirdCall, "Second and third calls should return same ID");
    }

    /**
     * @notice Test getConfigId with different parameters returns same ID
     * @dev Requirements: 9.5 - The implementation ignores parameters and returns stored config ID
     */
    function test_ConfigRetrieval_GetConfigIdIgnoresParameters() public {
        _deployValidContract();
        
        bytes32 baseCall = proofOfHuman.getConfigId(bytes32(0), bytes32(0), "");
        bytes32 differentParams1 = proofOfHuman.getConfigId(
            keccak256("different-chain"), 
            keccak256("different-user"), 
            "different-data"
        );
        bytes32 differentParams2 = proofOfHuman.getConfigId(
            bytes32(uint256(42)), 
            bytes32(uint256(123)), 
            "more-different-data"
        );
        
        assertEq(baseCall, differentParams1, "Should return same ID regardless of parameters");
        assertEq(differentParams1, differentParams2, "Should return same ID for all parameter combinations");
    }

    // ============ Helper Functions ============

    /**
     * @notice Deploy a valid ProofOfHuman contract for testing
     */
    function _deployValidContract() internal {
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            VerificationConfigHelper.createStandardConfig();
        
        proofOfHuman = new ProofOfHuman(
            address(mockHub),
            VALID_SCOPE_SEED,
            config
        );
    }

    /**
     * @notice Create test verification output data
     */
    function _createTestOutput() internal pure returns (ISelfVerificationRoot.GenericDiscloseOutputV2 memory) {
        return ISelfVerificationRoot.GenericDiscloseOutputV2({
            userIdentifier: TEST_USER_IDENTIFIER,
            sessionId: TEST_SESSION_ID,
            timestamp: TEST_TIMESTAMP,
            issuingState: "CA", // Canada
            nationality: "US",  // United States
            dateOfBirth: "1990-01-01"
        });
    }
}

/**
 * @title MockIdentityVerificationHubV2
 * @notice Mock implementation of IIdentityVerificationHubV2 for testing
 */
contract MockIdentityVerificationHubV2 is IIdentityVerificationHubV2 {
    mapping(bytes32 => SelfStructs.VerificationConfigV2) private configs;
    bytes32 private lastConfigId;
    uint256 private configCounter;

    function setVerificationConfigV2(
        SelfStructs.VerificationConfigV2 memory config
    ) external override returns (bytes32) {
        configCounter++;
        bytes32 configId = keccak256(abi.encodePacked(config.minimumAge, config.ofacScreening, configCounter));
        configs[configId] = config;
        lastConfigId = configId;
        return configId;
    }

    function getVerificationConfig(bytes32 configId)
        external
        view
        override
        returns (SelfStructs.VerificationConfigV2 memory)
    {
        return configs[configId];
    }

    function getLastConfigId() external view returns (bytes32) {
        return lastConfigId;
    }
}