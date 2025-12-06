// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../script/Deploy.s.sol";
import { ProofOfHuman } from "../src/ProofOfHuman.sol";

/**
 * @title DeployTest
 * @notice Tests for the base Deploy script
 * @dev Tests the reusable deployment logic and helper functions
 */
contract DeployTest is Test {
    // Mock deployment script for testing
    MockDeploy mockDeploy;
    
    // Test constants
    address constant TEST_HUB_ADDRESS = address(0x1234567890123456789012345678901234567890);
    string constant TEST_NETWORK_NAME = "Test Network";
    
    function setUp() public {
        mockDeploy = new MockDeploy();
        
        // Set up test environment variables
        vm.setEnv("PRIVATE_KEY", "1234567890123456789012345678901234567890123456789012345678901234");
        vm.setEnv("CELOSCAN_API_KEY", "test_api_key");
        vm.setEnv("SCOPE_SEED", "test_scope_seed");
    }
    
    /**
     * @notice Test that loadPrivateKey correctly loads from environment
     */
    function test_LoadPrivateKey() public {
        uint256 privateKey = mockDeploy.exposed_loadPrivateKey();
        assertGt(privateKey, 0, "Private key should be loaded");
    }
    
    /**
     * @notice Test that loadScopeSeed correctly loads from environment
     */
    function test_LoadScopeSeed() public {
        string memory scopeSeed = mockDeploy.exposed_loadScopeSeed();
        assertEq(scopeSeed, "test_scope_seed", "Scope seed should match environment variable");
    }
    
    /**
     * @notice Test that loadScopeSeed reverts with empty scope seed
     */
    function test_LoadScopeSeed_RevertsOnEmpty() public {
        vm.setEnv("SCOPE_SEED", "");
        
        vm.expectRevert("SCOPE_SEED cannot be empty");
        mockDeploy.exposed_loadScopeSeed();
    }
    
    /**
     * @notice Test that createVerificationConfig returns valid configuration
     */
    function test_CreateVerificationConfig() public {
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            mockDeploy.exposed_createVerificationConfig();
        
        assertEq(config.minimumAge, 18, "Minimum age should be 18");
        assertTrue(config.ofacScreening, "OFAC screening should be enabled");
        assertGt(config.excludedCountries.length, 0, "Should have excluded countries");
        assertGt(config.disclosures.length, 0, "Should have disclosures");
    }
    
    /**
     * @notice Test that validateVerificationConfig accepts valid config
     */
    function test_ValidateVerificationConfig_ValidConfig() public {
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            mockDeploy.exposed_createVerificationConfig();
        
        // Should not revert
        mockDeploy.exposed_validateVerificationConfig(config);
    }
    
    /**
     * @notice Test that validateVerificationConfig rejects invalid age
     */
    function test_ValidateVerificationConfig_InvalidAge() public {
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            mockDeploy.exposed_createVerificationConfig();
        
        config.minimumAge = 21; // Invalid age
        
        vm.expectRevert();
        mockDeploy.exposed_validateVerificationConfig(config);
    }
    
    /**
     * @notice Test that validateVerificationConfig rejects disabled OFAC screening
     */
    function test_ValidateVerificationConfig_DisabledOFAC() public {
        SelfUtils.UnformattedVerificationConfigV2 memory config = 
            mockDeploy.exposed_createVerificationConfig();
        
        config.ofacScreening = false; // Invalid
        
        vm.expectRevert();
        mockDeploy.exposed_validateVerificationConfig(config);
    }
    
    /**
     * @notice Test that getHubAddress is called by subclass
     */
    function test_GetHubAddress() public {
        address hubAddress = mockDeploy.exposed_getHubAddress();
        assertEq(hubAddress, TEST_HUB_ADDRESS, "Hub address should match mock value");
    }
    
    /**
     * @notice Test that getNetworkName is called by subclass
     */
    function test_GetNetworkName() public {
        string memory networkName = mockDeploy.exposed_getNetworkName();
        assertEq(networkName, TEST_NETWORK_NAME, "Network name should match mock value");
    }
    
    /**
     * @notice Test that sanitizeFilename correctly sanitizes network names
     */
    function test_SanitizeFilename() public {
        // Test with spaces and special characters
        string memory result1 = mockDeploy.exposed_sanitizeFilename("Alfajores Testnet (Chain ID: 44787)");
        assertEq(result1, "alfajores-testnet-chain-id-44787", "Should sanitize network name with spaces and special chars");
        
        // Test with uppercase
        string memory result2 = mockDeploy.exposed_sanitizeFilename("Celo Mainnet");
        assertEq(result2, "celo-mainnet", "Should convert to lowercase and replace spaces");
        
        // Test with already clean name
        string memory result3 = mockDeploy.exposed_sanitizeFilename("alfajores");
        assertEq(result3, "alfajores", "Should keep clean names unchanged");
    }
    
    /**
     * @notice Test that saveDeploymentArtifact creates valid JSON
     * @dev This test verifies the artifact saving functionality
     */
    function test_SaveDeploymentArtifact() public {
        address testAddress = address(0x1234567890123456789012345678901234567890);
        bytes32 testConfigId = bytes32(uint256(0x9876543210987654321098765432109876543210987654321098765432109876));
        string memory testNetwork = "Test Network";
        
        // Call the function (it will write to deployments/test-network-latest.json)
        mockDeploy.exposed_saveDeploymentArtifact(testAddress, testConfigId, testNetwork);
        
        // Verify the file was created by reading it back
        string memory artifactPath = "deployments/test-network-latest.json";
        string memory artifactJson = vm.readFile(artifactPath);
        
        // Verify the JSON contains expected values
        assertTrue(bytes(artifactJson).length > 0, "Artifact file should not be empty");
        
        // Parse and verify specific fields
        address savedAddress = vm.parseJsonAddress(artifactJson, ".contractAddress");
        assertEq(savedAddress, testAddress, "Contract address should match");
        
        bytes32 savedConfigId = vm.parseJsonBytes32(artifactJson, ".configurationId");
        assertEq(savedConfigId, testConfigId, "Configuration ID should match");
        
        string memory savedNetwork = vm.parseJsonString(artifactJson, ".network");
        assertEq(savedNetwork, testNetwork, "Network name should match");
    }
}

/**
 * @title MockDeploy
 * @notice Mock implementation of Deploy for testing
 * @dev Implements abstract functions and exposes internal functions for testing
 */
contract MockDeploy is Deploy {
    function getHubAddress() internal pure override returns (address) {
        return address(0x1234567890123456789012345678901234567890);
    }
    
    function getNetworkName() internal pure override returns (string memory) {
        return "Test Network";
    }
    
    // Expose internal functions for testing
    function exposed_loadPrivateKey() external view returns (uint256) {
        return loadPrivateKey();
    }
    
    function exposed_loadScopeSeed() external view returns (string memory) {
        return loadScopeSeed();
    }
    
    function exposed_createVerificationConfig() 
        external 
        pure 
        returns (SelfUtils.UnformattedVerificationConfigV2 memory) 
    {
        return createVerificationConfig();
    }
    
    function exposed_validateVerificationConfig(
        SelfUtils.UnformattedVerificationConfigV2 memory config
    ) external pure {
        validateVerificationConfig(config);
    }
    
    function exposed_getHubAddress() external returns (address) {
        return getHubAddress();
    }
    
    function exposed_getNetworkName() external returns (string memory) {
        return getNetworkName();
    }
    
    function exposed_sanitizeFilename(string memory input) external pure returns (string memory) {
        return sanitizeFilename(input);
    }
    
    function exposed_saveDeploymentArtifact(
        address contractAddress,
        bytes32 configId,
        string memory network
    ) external {
        saveDeploymentArtifact(contractAddress, configId, network);
    }
}
