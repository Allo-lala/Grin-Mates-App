# ProofOfHuman Smart Contract Deployment

This repository contains the ProofOfHuman smart contract that integrates with Self Protocol's identity verification system on Celo networks. The contract extends Self Protocol's SelfVerificationRoot to enable on-chain identity verification for the Grin Mates application.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Quick Start](#quick-start)
- [Deployment Guide](#deployment-guide)
- [Contract Verification](#contract-verification)
- [Testing](#testing)
- [Deployed Contracts](#deployed-contracts)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## Overview

The ProofOfHuman contract provides:

- **Identity Verification**: Integrates with Self Protocol's verification system
- **Age Verification**: Enforces minimum age requirement (18 years)
- **Compliance**: Includes OFAC screening and country restrictions
- **Event Logging**: Emits verification events for off-chain indexing
- **Multi-Network Support**: Deployable to Celo mainnet and testnets

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Development Environment                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Foundry    │  │  ProofOfHuman│  │  Deployment  │     │
│  │   Toolchain  │─▶│   Contract   │─▶│   Scripts    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Celo Blockchain                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Identity Verification Hub V2                  │  │
│  │  (Self Protocol's on-chain verification registry)    │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ▲                                   │
│  ┌──────────────────────┴───────────────────────────────┐  │
│  │              ProofOfHuman Contract                    │  │
│  │  - Stores verification results                        │  │
│  │  - Manages verification configuration                 │  │
│  │  - Emits verification events                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

### 1. Install Foundry

Install Foundry version 0.3.0:

```bash
# Install foundryup
curl -L https://foundry.paradigm.xyz | bash

# Install Foundry
foundryup --version nightly-de33b6af53005037b463318d2628b5cfcaf39916

# Verify installation
forge --version
cast --version
anvil --version
```

### 2. Install Dependencies

```bash
# Install contract dependencies
forge install

# Verify all imports resolve
forge build
```

### 3. Get Required Accounts and Keys

- **Deployer Account**: Ethereum account with CELO for gas fees
- **Celoscan API Key**: Get from [https://celoscan.io/myapikey](https://celoscan.io/myapikey)
- **Scope Seed**: Unique identifier for your application (e.g., "grin-mates-v1")

### 4. Fund Deployer Account

#### Testnet Funding (Alfajores)
- Visit [Celo Alfajores Faucet](https://faucet.celo.org/alfajores)
- Enter your deployer address
- Request testnet CELO

#### Mainnet Funding
- Purchase CELO from an exchange
- Transfer to your deployer account
- Ensure sufficient balance for deployment gas costs (~0.01 CELO)

## Environment Setup

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` with your actual values:

```bash
# ============================================================================
# REQUIRED ENVIRONMENT VARIABLES
# ============================================================================

# Deployer's private key (64-character hex string, no 0x prefix)
PRIVATE_KEY=your_private_key_here

# Celoscan API key for contract verification
CELOSCAN_API_KEY=your_celoscan_api_key_here

# Unique scope seed for your application
SCOPE_SEED=grin-mates-production

# RPC endpoints for Celo networks
ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org
SEPOLIA_RPC_URL=https://forno.celo-sepolia.celo-testnet.org
CELO_RPC_URL=https://forno.celo.org
```

### 3. Validate Environment

Test your environment setup:

```bash
# Validate all required variables are set
forge script script/EnvValidator.sol:EnvValidator

# Test RPC connections
cast block-number --rpc-url $ALFAJORES_RPC_URL
cast block-number --rpc-url $CELO_RPC_URL
```

## Quick Start

### 1. Build and Test

```bash
# Compile contracts
npm run build
# or
forge build

# Run all tests
npm run test
# or
forge test

# Run tests with verbose output
npm run test:verbose
# or
forge test -vvv
```

### 2. Deploy to Testnet (Alfajores)

```bash
# Deploy to Alfajores testnet
npm run deploy:alfajores
# or
forge script script/DeployAlfajores.s.sol:DeployAlfajores \
    --rpc-url alfajores \
    --broadcast \
    --verify
```

### 3. Verify Deployment

```bash
# Check contract on block explorer
# Visit: https://alfajores.celoscan.io/address/<CONTRACT_ADDRESS>

# Test contract interaction
cast call <CONTRACT_ADDRESS> "verificationConfigId()" --rpc-url alfajores
```

## Deployment Guide

### Step-by-Step Deployment Process

#### Step 1: Pre-Deployment Checklist

- [ ] All tests passing (`forge test`)
- [ ] Environment variables configured (`.env` file)
- [ ] Deployer account funded with sufficient CELO
- [ ] Hub addresses verified for target network
- [ ] Scope seed generated and stored securely

#### Step 2: Choose Target Network

**For Development/Testing:**
- **Alfajores Testnet** (Recommended for initial testing)
- **Celo Sepolia Testnet** (Alternative testnet)

**For Production:**
- **Celo Mainnet** (Only after thorough testnet validation)

#### Step 3: Verify Hub Addresses

Before deployment, ensure Self Protocol hub addresses are configured:

```bash
# Check configured hub addresses
forge script script/VerifyHubAddress.s.sol:VerifyHubAddress

# If addresses are not configured, update them in:
# script/SelfProtocolConfig.sol
```

See [SELF_PROTOCOL_ADDRESSES.md](./SELF_PROTOCOL_ADDRESSES.md) for instructions on finding official hub addresses.

#### Step 4: Dry Run (Simulation)

Test deployment without broadcasting transactions:

```bash
# Simulate Alfajores deployment
forge script script/DeployAlfajores.s.sol:DeployAlfajores \
    --rpc-url alfajores

# Simulate mainnet deployment (when ready)
forge script script/DeployCelo.s.sol:DeployCelo \
    --rpc-url celo
```

#### Step 5: Deploy to Testnet

Deploy to Alfajores testnet first:

```bash
# Method 1: Using npm script
npm run deploy:alfajores

# Method 2: Using forge directly
forge script script/DeployAlfajores.s.sol:DeployAlfajores \
    --rpc-url alfajores \
    --broadcast \
    --verify
```

#### Step 6: Validate Testnet Deployment

```bash
# Get contract address from deployment output
CONTRACT_ADDRESS=0x... # Replace with actual address

# Verify contract is deployed
cast code $CONTRACT_ADDRESS --rpc-url alfajores

# Check configuration ID
cast call $CONTRACT_ADDRESS "verificationConfigId()" --rpc-url alfajores

# Check hub address
cast call $CONTRACT_ADDRESS "identityVerificationHubV2()" --rpc-url alfajores
```

#### Step 7: Deploy to Mainnet (After Testnet Validation)

⚠️ **WARNING**: Only deploy to mainnet after thorough testnet testing!

```bash
# Deploy to Celo mainnet
npm run deploy:celo
# or
forge script script/DeployCelo.s.sol:DeployCelo \
    --rpc-url celo \
    --broadcast \
    --verify
```

### Network-Specific Commands

#### Alfajores Testnet (Chain ID: 44787)

```bash
# Deploy
npm run deploy:alfajores

# Manual verification (if needed)
npm run verify:alfajores -- <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# Block Explorer
# https://alfajores.celoscan.io/
```

#### Celo Sepolia Testnet (Chain ID: 11142220)

```bash
# Deploy
npm run deploy:sepolia

# Manual verification (if needed)
npm run verify:sepolia -- <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# Block Explorer
# https://celo-sepolia.blockscout.com/
```

#### Celo Mainnet (Chain ID: 42220)

```bash
# Deploy
npm run deploy:celo

# Manual verification (if needed)
npm run verify:celo -- <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# Block Explorer
# https://celoscan.io/
```

## Contract Verification

### Automatic Verification

Contracts are automatically verified when using the `--verify` flag:

```bash
forge script script/DeployAlfajores.s.sol:DeployAlfajores \
    --rpc-url alfajores \
    --broadcast \
    --verify
```

### Manual Verification

If automatic verification fails, verify manually:

```bash
# For Alfajores
forge verify-contract \
    --chain-id 44787 \
    --compiler-version v0.8.28 \
    --constructor-args $(cast abi-encode "constructor(address,string,(uint8,bytes32[],bool,bytes[]))" <HUB_ADDRESS> <SCOPE_SEED> <CONFIG_TUPLE>) \
    <CONTRACT_ADDRESS> \
    src/ProofOfHuman.sol:ProofOfHuman \
    --etherscan-api-key $CELOSCAN_API_KEY

# For Celo Mainnet
forge verify-contract \
    --chain-id 42220 \
    --compiler-version v0.8.28 \
    --constructor-args $(cast abi-encode "constructor(address,string,(uint8,bytes32[],bool,bytes[]))" <HUB_ADDRESS> <SCOPE_SEED> <CONFIG_TUPLE>) \
    <CONTRACT_ADDRESS> \
    src/ProofOfHuman.sol:ProofOfHuman \
    --etherscan-api-key $CELOSCAN_API_KEY
```

### Verification URLs

After successful verification, contracts will be available at:

- **Alfajores**: `https://alfajores.celoscan.io/address/<CONTRACT_ADDRESS>`
- **Celo Sepolia**: `https://celo-sepolia.blockscout.com/address/<CONTRACT_ADDRESS>`
- **Celo Mainnet**: `https://celoscan.io/address/<CONTRACT_ADDRESS>`

## Testing

### Unit Tests

Run comprehensive unit tests:

```bash
# Run all tests
forge test

# Run with verbose output
forge test -vvv

# Run specific test contract
forge test --match-contract ProofOfHumanTest

# Run specific test function
forge test --match-test testConstructor
```

### Property-Based Tests

Run property-based (fuzz) tests:

```bash
# Run fuzz tests
forge test --match-test testFuzz_

# Run with more iterations
forge test --fuzz-runs 1000
```

### Integration Tests

Test complete deployment flow:

```bash
# Test deployment scripts
forge test --match-contract DeployTest

# Test on local Anvil node
anvil &
forge script script/DeployAlfajores.s.sol:DeployAlfajores \
    --rpc-url http://localhost:8545 \
    --broadcast
```

### Gas Analysis

Analyze gas usage:

```bash
# Generate gas report
forge test --gas-report

# Create gas snapshots
forge snapshot
```

## Deployed Contracts

### Testnet Deployments

#### Alfajores Testnet (Chain ID: 44787)

| Contract | Address | Transaction Hash | Deployment Date | Status |
|----------|---------|------------------|-----------------|---------|
| ProofOfHuman | `TBD` | `TBD` | `TBD` | ⏳ Pending |

**Block Explorer**: [View on Alfajores Celoscan](https://alfajores.celoscan.io/)

#### Celo Sepolia Testnet (Chain ID: 11142220)

| Contract | Address | Transaction Hash | Deployment Date | Status |
|----------|---------|------------------|-----------------|---------|
| ProofOfHuman | `0x0a81e30572F209aFC2664FcBD0BB9c403057d9a8` | `0x1c2df0727b3fa312d7ee3eb8057d674a7c6860fc951c9a8bdfa6354299e183ca` | December 5, 2025 | ✅ Deployed & Verified |
| MockHub | `0x5E74631E9870B62e70ee4F39BBFC4EE0C69a551a` | `0x5e0a531edc1d9d3cd0335c49f4727871f9bb152ec5beeee57cf1d39fe593a755` | December 5, 2025 | ✅ Deployed & Verified |

**Block Explorer**: [View ProofOfHuman](https://sepolia.celoscan.io/address/0x0a81e30572f209afc2664fcbd0bb9c403057d9a8) | [View MockHub](https://sepolia.celoscan.io/address/0x5e74631e9870b62e70ee4f39bbfc4ee0c69a551a)

### Mainnet Deployments

#### Celo Mainnet (Chain ID: 42220)

| Contract | Address | Transaction Hash | Deployment Date | Status |
|----------|---------|------------------|-----------------|---------|
| ProofOfHuman | `TBD` | `TBD` | `TBD` | ⏳ Pending |

**Block Explorer**: [View on Celoscan](https://celoscan.io/)

### Contract Interaction

After deployment, interact with contracts using cast:

```bash
# Get verification configuration ID
cast call <CONTRACT_ADDRESS> "verificationConfigId()" --rpc-url <RPC_URL>

# Get hub address
cast call <CONTRACT_ADDRESS> "identityVerificationHubV2()" --rpc-url <RPC_URL>

# Check if verification was successful (after verification)
cast call <CONTRACT_ADDRESS> "verificationSuccessful()" --rpc-url <RPC_URL>

# Get last verification output (after verification)
cast call <CONTRACT_ADDRESS> "lastOutput()" --rpc-url <RPC_URL>
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Environment Variable Issues

**Problem**: `EnvValidator: Missing required environment variable: PRIVATE_KEY`

**Solution**:
```bash
# Check if .env file exists
ls -la .env

# Verify environment variables are set
echo $PRIVATE_KEY
echo $CELOSCAN_API_KEY
echo $SCOPE_SEED

# Source the .env file if needed
source .env
```

#### 2. Compilation Errors

**Problem**: `Error: Failed to resolve import`

**Solution**:
```bash
# Clean and rebuild
forge clean
forge install
forge build

# Check remappings
cat remappings.txt

# Verify Solidity version
grep solc_version foundry.toml
```

#### 3. Deployment Failures

**Problem**: `Error: insufficient funds for gas * price + value`

**Solution**:
```bash
# Check deployer balance
cast balance <DEPLOYER_ADDRESS> --rpc-url <RPC_URL>

# Fund account (testnet)
# Visit faucet: https://faucet.celo.org/alfajores

# Check gas price
cast gas-price --rpc-url <RPC_URL>
```

**Problem**: `SelfProtocolConfig: Hub address not configured for <network>`

**Solution**:
```bash
# Update hub address in SelfProtocolConfig.sol
# See SELF_PROTOCOL_ADDRESSES.md for instructions

# Verify hub address is set
forge script script/VerifyHubAddress.s.sol:VerifyHubAddress
```

#### 4. RPC Connection Issues

**Problem**: `Error: Failed to connect to RPC`

**Solution**:
```bash
# Test RPC connection
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $ALFAJORES_RPC_URL

# Try alternative RPC endpoints
export ALFAJORES_RPC_URL="https://alfajores-forno.celo-testnet.org"
export CELO_RPC_URL="https://forno.celo.org"
```

#### 5. Contract Verification Failures

**Problem**: `Error: Failed to verify contract`

**Solution**:
```bash
# Check API key
echo $CELOSCAN_API_KEY

# Try manual verification
forge verify-contract \
    --chain-id <CHAIN_ID> \
    --compiler-version v0.8.28 \
    <CONTRACT_ADDRESS> \
    src/ProofOfHuman.sol:ProofOfHuman \
    --etherscan-api-key $CELOSCAN_API_KEY

# Check if contract is already verified
cast interface <CONTRACT_ADDRESS> --rpc-url <RPC_URL>
```

#### 6. Hub Address Issues

**Problem**: `Hub address cannot be zero`

**Solution**:
1. Check `script/SelfProtocolConfig.sol` for hub addresses
2. Update with official Self Protocol addresses
3. See [SELF_PROTOCOL_ADDRESSES.md](./SELF_PROTOCOL_ADDRESSES.md)

#### 7. Test Failures

**Problem**: Tests failing after changes

**Solution**:
```bash
# Run tests with verbose output
forge test -vvv

# Run specific failing test
forge test --match-test <TEST_NAME> -vvv

# Check for compilation issues
forge build

# Clean and rebuild if needed
forge clean && forge build
```

### Getting Help

If you encounter issues not covered here:

1. **Check Foundry Documentation**: [https://book.getfoundry.sh/](https://book.getfoundry.sh/)
2. **Celo Documentation**: [https://docs.celo.org/](https://docs.celo.org/)
3. **Self Protocol Documentation**: [https://docs.selfprotocol.com/](https://docs.selfprotocol.com/)
4. **GitHub Issues**: Create an issue in this repository
5. **Community Support**: Join Celo Discord or Self Protocol community

### Debug Commands

Useful commands for debugging:

```bash
# Check Foundry version
forge --version

# Verify contract compilation
forge build --sizes

# Check gas usage
forge test --gas-report

# Trace transaction
cast run <TX_HASH> --rpc-url <RPC_URL>

# Decode transaction data
cast 4byte-decode <CALLDATA>

# Check contract storage
cast storage <CONTRACT_ADDRESS> <SLOT> --rpc-url <RPC_URL>
```

## Additional Resources

### Documentation

- **Foundry Book**: [https://book.getfoundry.sh/](https://book.getfoundry.sh/)
- **Celo Developer Docs**: [https://docs.celo.org/](https://docs.celo.org/)
- **Self Protocol Docs**: [https://docs.selfprotocol.com/](https://docs.selfprotocol.com/)

### Tools and Utilities

- **Celoscan (Mainnet)**: [https://celoscan.io/](https://celoscan.io/)
- **Alfajores Celoscan**: [https://alfajores.celoscan.io/](https://alfajores.celoscan.io/)
- **Celo Faucet**: [https://faucet.celo.org/](https://faucet.celo.org/)
- **Foundry Toolchain**: [https://github.com/foundry-rs/foundry](https://github.com/foundry-rs/foundry)

### Project-Specific Documentation

- **[Quick Reference Guide](./QUICK_REFERENCE.md)** - Common commands and workflows
- **[Comprehensive Deployment Guide](./DEPLOYMENT.md)** - Detailed deployment process
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Common issues and solutions
- [Base Deployment Script Usage](./script/DEPLOY_BASE_USAGE.md)
- [Network Deployment Guide](./script/NETWORK_DEPLOYMENT_GUIDE.md)
- [Self Protocol Addresses](./SELF_PROTOCOL_ADDRESSES.md)
- [Verification Config Helper](./script/VERIFICATION_CONFIG_HELPER.md)

### Community and Support

- **Celo Discord**: [https://discord.gg/celo](https://discord.gg/celo)
- **Foundry Telegram**: [https://t.me/foundry_rs](https://t.me/foundry_rs)
- **Self Protocol Community**: Check official Self Protocol channels

---

## Development Workflow

### For Contributors

1. **Fork and Clone**: Fork the repository and clone locally
2. **Install Dependencies**: Run `forge install` to install dependencies
3. **Create Branch**: Create a feature branch for your changes
4. **Write Tests**: Add tests for any new functionality
5. **Test Thoroughly**: Run all tests and ensure they pass
6. **Deploy to Testnet**: Test deployment on Alfajores
7. **Create PR**: Submit a pull request with clear description

### Best Practices

- **Always test on testnet first** before mainnet deployment
- **Verify hub addresses** from official Self Protocol documentation
- **Use hardware wallets** for mainnet deployments
- **Keep deployment records** of all contract addresses and transaction hashes
- **Verify contracts immediately** after deployment
- **Monitor gas usage** and optimize if necessary
- **Document all changes** and update relevant documentation

---

**Last Updated**: December 5, 2025
**Foundry Version**: 0.3.0
**Solidity Version**: 0.8.28
