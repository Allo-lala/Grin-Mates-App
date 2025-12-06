// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ISelfVerificationRoot
 * @notice Interface for Self Protocol verification root contract
 */
interface ISelfVerificationRoot {
    struct GenericDiscloseOutputV2 {
        bytes32 userIdentifier;
        bytes32 sessionId;
        uint256 timestamp;
        bytes issuingState;
        bytes nationality;
        bytes dateOfBirth;
    }

    function onVerificationSuccess(
        GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) external;
}
