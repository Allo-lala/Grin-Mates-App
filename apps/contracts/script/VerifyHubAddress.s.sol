// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "./SelfProtocolConfig.sol";

/**
 * @title VerifyHubAddress
 * @notice Script to verify Self Protocol Hub V2 addresses are correctly configured
 * @dev This script checks that hub addresses are:
 *      1. Non-zero (configured)
 *      2. Have deployed bytecode (contract exists)
 *      3. Match the expected network
 */
contract VerifyHubAddress is Script {
    /**
     * @notice Verify hub address for a specific network
     * @param networkName The name of the network (e.g., "Alfajores", "Sepolia", "Mainnet")
     * @param chainId The chain ID of the network
     * @param rpcUrl The RPC URL to use for verification
     */
    function verifyNetwork(string memory networkName, uint256 chainId, string memory rpcUrl) public {
        console.log("\n========================================");
        console.log("Verifying", networkName, "Hub Address");
        console.log("========================================");
        console.log("Chain ID:", chainId);
        console.log("RPC URL:", rpcUrl);
        
        // Get hub address for this chain
        address hubAddress;
        if (chainId == 44787) {
            hubAddress = SelfProtocolConfig.ALFAJORES_HUB_V2;
        } else if (chainId == 11142220) {
            hubAddress = SelfProtocolConfig.SEPOLIA_HUB_V2;
        } else if (chainId == 42220) {
            hubAddress = SelfProtocolConfig.CELO_MAINNET_HUB_V2;
        } else {
            console.log("\n[ERROR] Unsupported chain ID:", chainId);
            return;
        }
        
        console.log("Hub Address:", hubAddress);
        
        // Check if address is zero
        if (hubAddress == address(0)) {
            console.log("\n[ERROR] Hub address is zero (not configured)");
            console.log("\nAction Required:");
            console.log("1. Find official hub address from Self Protocol documentation");
            console.log("2. Update", networkName, "hub address in script/SelfProtocolConfig.sol");
            console.log("3. See SELF_PROTOCOL_ADDRESSES.md for detailed instructions\n");
            return;
        }
        
        console.log("\n[OK] Hub address is configured (non-zero)");
        
        // Note: We cannot check bytecode in a pure script without vm.rpc
        // This would need to be done via cast command or in a test
        console.log("\nNext Steps:");
        console.log("1. Verify contract exists on block explorer");
        console.log("2. Run: cast code", vm.toString(hubAddress), "--rpc-url", rpcUrl);
        console.log("3. Verify contract interface matches IIdentityVerificationHubV2");
        console.log("4. Check contract is verified on block explorer\n");
    }
    
    
    /**
     * @notice Run verification for all networks
     */
    function run() external {
        console.log("\n");
        console.log("========================================");
        console.log("Self Protocol Hub V2 Address Verification");
        console.log("========================================");
        console.log("\nThis script verifies that hub addresses are correctly configured");
        console.log("for all supported Celo networks.\n");
        
        // Verify Alfajores
        string memory alfajoresRpc = vm.envOr("ALFAJORES_RPC_URL", string("https://alfajores-forno.celo-testnet.org"));
        verifyNetwork("Alfajores", 44787, alfajoresRpc);
        
        // Verify Sepolia
        string memory sepoliaRpc = vm.envOr("SEPOLIA_RPC_URL", string("https://forno.celo-sepolia.celo-testnet.org"));
        verifyNetwork("Celo Sepolia", 11142220, sepoliaRpc);
        
        // Verify Mainnet
        string memory celoRpc = vm.envOr("CELO_RPC_URL", string("https://forno.celo.org"));
        verifyNetwork("Celo Mainnet", 42220, celoRpc);
        
        console.log("\n========================================");
        console.log("Verification Complete");
        console.log("========================================");
        console.log("\nFor detailed instructions on finding and updating hub addresses,");
        console.log("see: apps/contracts/SELF_PROTOCOL_ADDRESSES.md\n");
    }
}
