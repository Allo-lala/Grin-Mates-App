# Grin Mates Database Documentation

## Overview

This database schema is designed for the Grin Mates Fintech DApp, a comprehensive platform that combines cryptocurrency wallet functionality with green initiatives and environmental services.

## Database Structure

### Core Tables

#### Users Management
- **users**: Core user profiles with email authentication
- **admin_users**: Admin roles and permissions
- **kyc_submissions**: Identity verification data (Self Protocol integration)

#### Crypto Wallet & Assets
- **networks**: Supported blockchain networks (Celo, Base, Solana, Stellar)
- **tokens**: Supported tokens per network (USDT, USDC, cUSD)
- **user_wallet_addresses**: User addresses for different networks
- **balances**: User token balances across all networks
- **transactions**: All blockchain and off-chain transactions
- **mobile_money_transactions**: Mobile money specific data (MTN, Airtel)

#### Services & Green Initiatives
- **service_categories**: Categories of environmental services
- **services**: Available services (gas refill, solar, recycling, etc.)
- **gas_stations**: Gas station locations and details
- **solar_connections**: Solar panel installation requests
- **animal_rescues**: Animal rescue reports and tracking
- **recycling_activities**: Smart recycling submissions
- **wildlife_reports**: Wildlife observation reports

#### Green Points System
- **green_points_transactions**: All green points movements
- **green_points_balances**: User green points balances
- **green_points_leaderboard**: View for rankings

#### Events Management
- **events**: Environmental events and activities
- **event_participants**: User event registrations and attendance

#### System & Admin
- **admin_transaction_actions**: Admin actions (reversals, swaps)
- **system_settings**: Application configuration
- **audit_logs**: System activity logging
- **token_prices**: Real-time token price tracking
- **exchange_rates**: Currency conversion rates

## Key Features

### 1. Multi-Network Crypto Support
```sql
-- Supported networks and tokens
SELECT n.name as network, t.symbol, t.name as token_name
FROM networks n
JOIN tokens t ON n.id = t.network_id
WHERE n.is_active = true AND t.is_active = true;
```

### 2. Comprehensive Transaction Tracking
- Blockchain transaction hashes
- Block numbers and confirmations
- Gas fees and network costs
- Mobile money integration
- Admin controls for reversals

### 3. Green Points Ecosystem
- Earn points for environmental activities
- Spend points on services
- Leaderboard and gamification
- Audit trail for all point movements

### 4. KYC Integration with Self Protocol
- QR code verification
- On-chain identity verification
- Document type support (ID, Passport, License)
- Status tracking (pending, approved, rejected)

### 5. Admin Dashboard Capabilities
- User management
- Transaction monitoring and control
- KYC approval workflow
- Service management
- Event creation and management
- System settings configuration

## Database Views

### user_portfolio
Aggregated view of user's total balance across all tokens and networks.

### recent_transactions
Formatted transaction history with user and token details.

### green_points_leaderboard
Ranked list of users by green points earned.

## Setup Instructions

### 1. Prerequisites
- PostgreSQL 12+ installed
- Node.js environment
- Environment variables configured

### 2. Database Setup
```bash
# Install dependencies
npm install pg dotenv

# Run setup script
node scripts/setup-database.js
```

### 3. Environment Variables
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=grinmates_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
```

### 4. Migrations
Migrations are located in `migrations/` directory and run automatically during setup.

## Usage Examples

### User Registration
```typescript
import { userQueries } from '@/lib/database';

const user = await userQueries.createUser(
  'user@example.com',
  '0x1234...5678',
  'John Doe'
);
```

### Transaction Creation
```typescript
import { transactionQueries } from '@/lib/database';

const transaction = await transactionQueries.createTransaction({
  userId: user.id,
  type: 'deposit',
  amount: '100.00',
  tokenId: usdcTokenId,
  networkId: celoNetworkId,
  transactionHash: '0xabc...def'
});
```

### Green Points Management
```typescript
import { greenPointsQueries } from '@/lib/database';

// Award points for recycling
await greenPointsQueries.addPoints(
  userId,
  50,
  'recycling_activity',
  recyclingActivityId,
  'Recycled 5kg of plastic'
);
```

### KYC Verification
```typescript
import { kycQueries } from '@/lib/database';

const kycSubmission = await kycQueries.submitKyc({
  userId,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  dateOfBirth: '1990-01-01',
  documentType: 'passport',
  documentNumber: 'P123456789',
  // ... other fields
});
```

## Admin Functions

### Transaction Reversal
```typescript
import { adminQueries } from '@/lib/database';

const reversedTx = await adminQueries.reverseTransaction(
  adminUserId,
  originalTransactionId,
  'User reported unauthorized transaction'
);
```

### User Management
```typescript
// Get all users with KYC status
const users = await adminQueries.getAllUsers(50, 0);

// Get transaction history
const transactions = await adminQueries.getAllTransactions(100, 0);
```

## Security Considerations

1. **Data Encryption**: Sensitive data is encrypted at rest
2. **Audit Logging**: All admin actions are logged
3. **Role-based Access**: Different admin permission levels
4. **Transaction Integrity**: Database transactions ensure consistency
5. **Input Validation**: All inputs are validated and sanitized

## Performance Optimizations

1. **Indexes**: Strategic indexes on frequently queried columns
2. **Views**: Pre-computed views for complex queries
3. **Connection Pooling**: Efficient database connection management
4. **Partitioning**: Large tables can be partitioned by date

## Backup and Recovery

1. **Regular Backups**: Automated daily backups recommended
2. **Point-in-time Recovery**: Transaction log backup for recovery
3. **Replication**: Master-slave setup for high availability
4. **Monitoring**: Database performance and health monitoring

## API Integration

The database integrates with:
- **Self Protocol**: For KYC verification
- **Blockchain Networks**: For transaction verification
- **Mobile Money APIs**: For MTN/Airtel integration
- **Price Feeds**: For real-time token pricing
- **Geolocation APIs**: For location-based services

## Future Enhancements

1. **Multi-currency Support**: Additional fiat currencies
2. **DeFi Integration**: Yield farming and staking
3. **NFT Support**: Environmental impact NFTs
4. **Carbon Credits**: Carbon offset tracking
5. **Social Features**: User interactions and sharing