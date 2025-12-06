// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ISelfVerificationRoot } from "../interfaces/ISelfVerificationRoot.sol";
import { IIdentityVerificationHubV2 } from "../interfaces/IIdentityVerificationHubV2.sol";

/**
 * @title SelfVerificationRoot
 * @notice Abstract contract for Self Protocol verification integration
 * @dev Contracts extending this must implement customVerificationHook and getConfigId
 */
abstract contract SelfVerificationRoot is ISelfVerificationRoot {
    address public immutable identityVerificationHubV2;
    string public scopeSeed;

    /**
     * @notice Constructor for SelfVerificationRoot
     * @param _identityVerificationHubV2 Address of the Identity Verification Hub V2
     * @param _scopeSeed Unique scope seed for this verification contract
     */
    constructor(address _identityVerificationHubV2, string memory _scopeSeed) {
        require(_identityVerificationHubV2 != address(0), "Hub address cannot be zero");
        require(bytes(_scopeSeed).length > 0, "Scope seed cannot be empty");
        
        identityVerificationHubV2 = _identityVerificationHubV2;
        scopeSeed = _scopeSeed;
    }

    /**
     * @notice Called by the Identity Verification Hub when verification succeeds
     * @param output The verification output data
     * @param userData Additional user data from the verification
     */
    function onVerificationSuccess(
        GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) external override {
        require(msg.sender == identityVerificationHubV2, "Only hub can call this function");
        customVerificationHook(output, userData);
    }

    /**
     * @notice Custom verification hook to be implemented by derived contracts
     * @param output The verification output data
     * @param userData Additional user data from the verification
     */
    function customVerificationHook(
        GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal virtual;

    /**
     * @notice Get the configuration ID for this verification contract
     * @param destinationChainId The destination chain ID
     * @param userIdentifier The user identifier
     * @param userDefinedData User-defined data
     * @return The configuration ID
     */
    function getConfigId(
        bytes32 destinationChainId,
        bytes32 userIdentifier,
        bytes memory userDefinedData
    ) public view virtual returns (bytes32);
}
