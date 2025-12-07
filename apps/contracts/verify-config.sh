#!/bin/bash

# Verification Config Checker
# This script helps verify that your deployed contract configuration matches the frontend

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# Check if contract address is provided
if [ -z "$1" ]; then
    print_error "Usage: ./verify-config.sh <CONTRACT_ADDRESS>"
    echo "Example: ./verify-config.sh 0x0a81e30572F209aFC2664FcBD0BB9c403057d9a8"
    exit 1
fi

CONTRACT_ADDRESS=$1
RPC_URL="https://forno.celo-sepolia.celo-testnet.org"

print_info "Checking contract at: $CONTRACT_ADDRESS"
echo

# Check if contract exists
print_info "Verifying contract exists..."
CODE=$(cast code $CONTRACT_ADDRESS --rpc-url $RPC_URL)
if [ "$CODE" = "0x" ]; then
    print_error "No contract found at address $CONTRACT_ADDRESS"
    exit 1
fi
print_success "Contract exists"
echo

# Get verification config ID
print_info "Fetching verification config ID..."
CONFIG_ID=$(cast call $CONTRACT_ADDRESS "verificationConfigId()(bytes32)" --rpc-url $RPC_URL)
print_success "Config ID: $CONFIG_ID"
echo

# Check if it's a zero config (indicates deployment issue)
if [ "$CONFIG_ID" = "0x0000000000000000000000000000000000000000000000000000000000000000" ]; then
    print_error "Config ID is zero - contract was not deployed correctly"
    exit 1
fi

# Try to get the last verification address
print_info "Checking if any verifications have been recorded..."
LAST_ADDRESS=$(cast call $CONTRACT_ADDRESS "lastUserAddress()(address)" --rpc-url $RPC_URL 2>/dev/null || echo "0x0000000000000000000000000000000000000000")

if [ "$LAST_ADDRESS" = "0x0000000000000000000000000000000000000000" ]; then
    print_warning "No verifications recorded yet (this is normal for a new deployment)"
else
    print_success "Last verified address: $LAST_ADDRESS"
fi
echo

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_success "Contract Verification Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo
echo "Contract Address: $CONTRACT_ADDRESS"
echo "Network: Celo Sepolia"
echo "Config ID: $CONFIG_ID"
echo "Block Explorer: https://celo-sepolia.blockscout.com/address/$CONTRACT_ADDRESS"
echo
print_info "Next steps:"
echo "1. Update apps/web/.env.local with:"
echo "   NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS"
echo "   NEXT_PUBLIC_SELF_ENDPOINT=$CONTRACT_ADDRESS"
echo "   NEXT_PUBLIC_SELF_ENDPOINT_TYPE=staging_celo"
echo "   NEXT_PUBLIC_SELF_SCOPE_SEED=grin-mates"
echo
echo "2. Restart your Next.js development server"
echo "3. Test the QR code verification flow"
