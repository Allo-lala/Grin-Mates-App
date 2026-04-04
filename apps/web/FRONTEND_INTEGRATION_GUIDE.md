# Frontend-Backend Integration Guide

## Overview

This guide explains how to integrate the frontend components with the backend API to enable real wallet functionality, including:
- Real wallet address generation per network
- Actual balance fetching from database
- Transaction history from database
- Deposit/withdrawal with real API calls

---

##  What's Been Created

### 1. API Client (`src/lib/api-client.ts`)
Centralized API client with methods for all backend endpoints:
- User management
- Wallet operations
- Transactions
- Green points
- Services
- Events

### 2. User Context (`src/contexts/user-context.tsx`)
React context for managing user state across the app:
- User profile
- KYC status
- Green points balance
- Portfolio summary

### 3. Updated Components

**Dashboard V2** (`src/components/screens/dashboard-screen-v2.tsx`)
- Fetches real balances from API
- Displays actual transactions
- Auto-registers new users
- Refresh functionality

**Deposit Dialog V2** (`src/components/deposit-receive-dialog-v2.tsx`)
- Generates real wallet addresses via API
- Supports all networks (Celo, Base, Solana, Stellar)
- Real withdrawal integration
- Loading states

---

## 🚀 How It Works

### User Registration Flow

1. **User logs in with Privy** (email/wallet)
2. **Frontend checks if user exists** in database
3. **If not exists**: Auto-register with 100 green points welcome bonus
4. **If exists**: Load user profile, balances, and transactions

### Deposit Address Generation

1. **User selects token** (USDT, USDC, cUSD)
2. **User selects network** (Celo, Base, Solana, Stellar)
3. **API generates/retrieves address** for that user + network combination
4. **Address is stored** in `user_wallet_addresses` table
5. **Same address returned** on subsequent requests

### Balance Fetching

1. **Dashboard loads** user balances from database
2. **Calculates USD value** using token prices
3. **Displays all tokens** across all networks
4. **Shows total portfolio** value

### Withdrawal Flow

1. **User selects method** (MTN, Airtel, Airtime)
2. **Checks KYC status** (required for mobile money)
3. **Submits withdrawal** via API
4. **Balance is locked** until confirmed
5. **Admin/system confirms** withdrawal
6. **Balance is deducted** and transaction completed


## 🎨 UI Features

### Dashboard Features

 **Real-time balance display**
- Fetches from database
- Shows USD values
- Displays all tokens across networks

 **Transaction history**
- Last 10 transactions
- Status indicators (confirmed, pending, failed)
- Type indicators (deposit, withdraw, etc.)

 **Refresh button**
- Manual refresh of balances
- Loading state indicator

 **Empty states**
- "No assets yet" when balance is zero
- "No transactions yet" when no history

### Deposit Features

**Token selection**
- USDT, USDC, cUSD
- Token icons displayed

**Network selection**
- Shows supported networks per token
- Network icons displayed

**Address generation**
- Real API call to generate address
- Loading state while generating
- QR code for easy scanning
- Copy address button

**Warnings**
- Network-specific warnings
- Loss of funds warning

### Withdrawal Features

**Method selection**
- MTN Mobile Money
- Airtel Money
- Buy Airtime

**KYC check**
- Verifies KYC status
- Redirects to KYC if needed

**Form validation**
- Amount validation
- Phone number format
- Minimum amount check

**Contact picker**
- Native contact picker on supported devices
- Fallback for unsupported devices

---

## Data Flow

### Deposit Flow

```
User → Select Token → Select Network
  ↓
API: Generate Address (POST /api/wallet/deposit)
  ↓
Database: Save to user_wallet_addresses
  ↓
Return Address → Display QR Code
  ↓
User Sends Crypto → Blockchain Monitoring (webhook)
  ↓
API: Confirm Deposit (PUT /api/wallet/deposit)
  ↓
Database: Update balances, Create transaction
  ↓
Dashboard: Refresh → Show New Balance
```

### Withdrawal Flow

```
User → Select Method → Enter Amount & Phone
  ↓
API: Check KYC Status
  ↓
API: Initiate Withdrawal (POST /api/wallet/withdraw)
  ↓
Database: Lock balance, Create transaction
  ↓
Payment Gateway: Process withdrawal
  ↓
API: Confirm Withdrawal (PUT /api/wallet/withdraw)
  ↓
Database: Deduct balance, Update transaction
  ↓
Dashboard: Refresh → Show Updated Balance
```

---


### Issue: Deposit address not generating

##  Next Steps

1. **Blockchain Integration**
   - Connect to actual blockchain networks
   - Implement real address generation
   - Set up transaction monitoring webhooks

2. **Mobile Money Integration**
   - Integrate MTN MoMo API
   - Integrate Airtel Money API
   - Set up payment webhooks

3. **Real-time Updates**
   - Implement WebSocket for live balance updates
   - Add transaction notifications
   - Real-time transaction status

4. **Enhanced Features**
   - Transaction filtering
   - Export transaction history
   - Portfolio analytics
   - Price charts
