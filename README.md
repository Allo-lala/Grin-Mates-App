# Grin-Mates

The first Eco-friendly dApp

A modern Celo blockchain application built with Next.js, TypeScript, and Turborepo.

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Configure environment variables:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```
   
   Edit `apps/web/.env.local` and fill in the required values. See [Environment Variables](#environment-variables) section below.

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

This is a monorepo managed by Turborepo with the following structure:

- `apps/web` - Next.js application with embedded UI components and utilities
- `apps/contracts` - Smart contract development environment using Foundry

## Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all packages and apps
- `pnpm type-check` - Run TypeScript type checking

### Smart Contract Scripts

Navigate to `apps/contracts` directory for smart contract operations:

```bash
cd apps/contracts
```

- `npm run build` or `forge build` - Compile smart contracts
- `npm run test` or `forge test` - Run smart contract tests
- `npm run test:verbose` or `forge test -vvv` - Run tests with verbose output
- `npm run deploy:alfajores` - Deploy to Celo Alfajores testnet
- `npm run deploy:sepolia` - Deploy to Celo Sepolia testnet
- `npm run deploy:celo` - Deploy to Celo mainnet

For detailed deployment instructions, see [Smart Contract Deployment Guide](./apps/contracts/README.md).

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Smart Contracts**: Foundry with Solidity 0.8.28
- **Monorepo**: Turborepo
- **Package Manager**: PNPM

## Environment Variables

### Required Variables

#### Self Protocol Configuration

The application uses Self Protocol for privacy-preserving KYC verification. The following environment variables are required:

- `NEXT_PUBLIC_SELF_APP_NAME` - Application name displayed in Self Protocol mobile app (e.g., "Grin Mates")
- `NEXT_PUBLIC_SELF_SCOPE_SEED` - Unique scope seed identifier for your app (e.g., "grin-mates")
- `NEXT_PUBLIC_SELF_ENDPOINT` - Your API verification endpoint URL
  - Local development: `http://localhost:3000/api/kyc/verify`
  - Production: Use ngrok or your deployed URL (e.g., `https://yourdomain.com/api/kyc/verify`)
- `NEXT_PUBLIC_SELF_LOGO_URL` - Logo URL displayed in Self Protocol mobile app during verification

#### Database Configuration

- `DATABASE_URL` - PostgreSQL connection string
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password

#### Blockchain Configuration

- `CELO_RPC_URL` - Celo RPC endpoint URL
- `CELO_NETWORK` - Celo network (mainnet, alfajores, or sepolia)

#### Security

- `JWT_SECRET` - Secret key for JWT token generation
- `ENCRYPTION_KEY` - Encryption key for sensitive data

### Optional Variables

#### Self Protocol

- `NEXT_PUBLIC_SELF_ENDPOINT_TYPE` - Blockchain endpoint type for verification storage
  - If not set, automatically determined based on environment:
    - **Production** (`NODE_ENV=production` && `VERCEL_ENV=production`): uses `celo` (mainnet)
    - **Development/Preview/Staging**: uses `staging_celo` (testnet)
  - Valid values: `celo`, `staging_celo`, `https`, `staging_https`
  - Override this for testing mainnet behavior in non-production environments

#### Vercel Deployment

- `NEXT_PUBLIC_VERCEL_ENV` - Automatically set by Vercel (production, preview, or development)
  - Used for automatic endpoint type detection
  - No need to set manually

### Environment-Specific Configuration

The application automatically configures the Self Protocol blockchain endpoint based on the deployment environment. This ensures that:
- **Development and testing** use the Celo testnet (Alfajores) to avoid affecting production data
- **Production deployments** use the Celo mainnet for real KYC verifications

#### Automatic Environment Detection

| Environment | NODE_ENV | VERCEL_ENV | Endpoint Type | Blockchain | Use Case |
|-------------|----------|------------|---------------|------------|----------|
| Local Development | development | - | staging_celo | Celo Testnet (Alfajores) | Local testing |
| Vercel Preview | production | preview | staging_celo | Celo Testnet (Alfajores) | PR previews, staging |
| Vercel Production | production | production | celo | Celo Mainnet | Live production |

#### How It Works

The `getEndpointTypeFromEnvironment()` function in `apps/web/src/lib/self-config.ts` automatically determines the correct endpoint:

1. **Checks for explicit override**: If `NEXT_PUBLIC_SELF_ENDPOINT_TYPE` is set, uses that value
2. **Detects production**: If `NODE_ENV=production` AND `VERCEL_ENV=production`, uses `celo` (mainnet)
3. **Defaults to testnet**: All other cases use `staging_celo` (testnet)

#### Manual Override

To override the automatic detection (e.g., for testing mainnet behavior in staging):

```bash
# In your .env.local or Vercel environment variables
NEXT_PUBLIC_SELF_ENDPOINT_TYPE=celo  # Force mainnet
# or
NEXT_PUBLIC_SELF_ENDPOINT_TYPE=staging_celo  # Force testnet
```

Valid values: `celo`, `staging_celo`, `https`, `staging_https`

#### Testing the Configuration

In development mode, the configuration is logged to the console:

```javascript
[Self Protocol] Configuration loaded: {
  endpointType: 'staging_celo',
  nodeEnv: 'development',
  vercelEnv: undefined,
  explicitType: undefined
}
```

### Example Configuration Files

See `apps/web/.env.example` for a complete example of all environment variables with descriptions.

## Smart Contract Deployment

The ProofOfHuman smart contract integrates with Self Protocol's identity verification system. For complete deployment instructions, see the [Smart Contract README](./apps/contracts/README.md).

### Quick Start

1. **Setup Environment**:
   ```bash
   cd apps/contracts
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Deploy to Testnet**:
   ```bash
   npm run deploy:alfajores
   ```

3. **Deploy to Mainnet** (after testnet validation):
   ```bash
   npm run deploy:celo
   ```

### Deployed Contract Addresses

#### Testnet Deployments

| Network | Contract Address | Block Explorer | Status |
|---------|------------------|----------------|---------|
| Alfajores | `TBD` | [View on Celoscan](https://alfajores.celoscan.io/) | ⏳ Pending |
| Celo Sepolia | `TBD` | [View on BlockScout](https://celo-sepolia.blockscout.com/) | ⏳ Pending |

#### Mainnet Deployments

| Network | Contract Address | Block Explorer | Status |
|---------|------------------|----------------|---------|
| Celo Mainnet | `TBD` | [View on Celoscan](https://celoscan.io/) | ⏳ Pending |

*Note: Contract addresses will be updated after deployment*

### Contract Integration

After deployment, update the frontend configuration with the deployed contract addresses:

```javascript
// In your frontend configuration
const PROOF_OF_HUMAN_ADDRESSES = {
  alfajores: "0x...", // Testnet address
  celo: "0x..."       // Mainnet address
};
```

For detailed deployment documentation, troubleshooting, and security considerations, see:
- [Smart Contract README](./apps/contracts/README.md)
- [Deployment Guide](./apps/contracts/DEPLOYMENT.md)
- [Network Deployment Guide](./apps/contracts/script/NETWORK_DEPLOYMENT_GUIDE.md)

## Web Application Deployment

### Vercel Deployment

The application is configured for deployment on Vercel with automatic environment detection:

1. **Production Deployment**
   - Automatically uses Celo mainnet (`celo`) for KYC verification storage
   - Ensure production Self Protocol credentials are configured
   - Set all required environment variables in Vercel project settings

2. **Preview Deployments**
   - Automatically uses Celo testnet (`staging_celo`) for KYC verification storage
   - Safe for testing without affecting mainnet data
   - Uses the same environment variables as production

3. **Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add all required variables from `.env.example`
   - Set appropriate values for each environment (Production, Preview, Development)

### Manual Deployment

For manual deployments to other platforms:

1. Set `NODE_ENV=production` for production builds
2. Set `NEXT_PUBLIC_VERCEL_ENV=production` to use mainnet, or leave unset for testnet
3. Alternatively, explicitly set `NEXT_PUBLIC_SELF_ENDPOINT_TYPE=celo` for mainnet or `staging_celo` for testnet

## Troubleshooting

### Self Protocol Configuration Issues

**Problem**: "Self Protocol configuration is incomplete" error

**Solution**: Ensure all required environment variables are set:
```bash
NEXT_PUBLIC_SELF_APP_NAME=Grin Mates
NEXT_PUBLIC_SELF_SCOPE_SEED=grin-mates
NEXT_PUBLIC_SELF_ENDPOINT=http://localhost:3000/api/kyc/verify
NEXT_PUBLIC_SELF_LOGO_URL=https://i.postimg.cc/mrmVf9hm/self.png
```

Note: The `NEXT_PUBLIC_SELF_ENDPOINT` must be a publicly accessible URL. For local development, you can use ngrok to create a public tunnel to your localhost.

**Problem**: KYC verification writes to wrong blockchain (testnet vs mainnet)

**Solution**: Check your environment configuration:
- For production: Ensure `VERCEL_ENV=production` is set (automatic on Vercel)
- For testing: Leave `NEXT_PUBLIC_SELF_ENDPOINT_TYPE` unset or set to `staging_celo`
- Check console logs in development mode to see detected configuration

**Problem**: Invalid endpoint type error

**Solution**: If setting `NEXT_PUBLIC_SELF_ENDPOINT_TYPE` manually, use only these values:
- `celo` - Mainnet onchain verification
- `staging_celo` - Testnet onchain verification  
- `https` - Mainnet offchain verification
- `staging_https` - Testnet offchain verification

### Database Connection Issues

**Problem**: Cannot connect to database

**Solution**: Verify your `DATABASE_URL` is correctly formatted:
```
postgresql://user:password@host:port/database
```

### Deployment Issues

**Problem**: Environment variables not available in production

**Solution**: 
1. Go to Vercel Project Settings → Environment Variables
2. Add all required variables for Production, Preview, and Development environments
3. Redeploy the application

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Celo Documentation](https://docs.celo.org/)
- [Self Protocol Documentation](https://docs.selfprotocol.com/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)


` cd ~/Downloads/Grin\ Mates/apps/web `