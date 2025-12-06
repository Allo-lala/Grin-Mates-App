// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { SelfStructs } from "../libraries/SelfStructs.sol";

/**
 * @title IIdentityVerificationHubV2
 * @notice Interface for Self Protocol Identity Verification Hub V2
 */
interface IIdentityVerificationHubV2 {
    function setVerificationConfigV2(
        SelfStructs.VerificationConfigV2 memory config
    ) external returns (bytes32);

    function getVerificationConfig(bytes32 configId)
        external
        view
        returns (SelfStructs.VerificationConfigV2 memory);
}
