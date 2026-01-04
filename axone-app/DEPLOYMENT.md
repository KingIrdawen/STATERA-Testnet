# Deployment Guide

## Vercel Configuration

### Root Directory
**IMPORTANT**: In Vercel Project → Settings → General → Build & Development Settings, set:
- **Root Directory**: `axone-app`

This is required to eliminate Vercel 404 NOT_FOUND errors. The Next.js app lives in the `axone-app/` subdirectory.

### Install Command
Vercel uses `npm ci` instead of `pnpm install` due to `ERR_INVALID_THIS` errors with pnpm's fetch layer in the Vercel environment.

This is configured in:
- Root `vercel.json`: Sets `installCommand: "npm ci"` and `buildCommand: "npm run build"`
- `axone-app/vercel.json`: Contains cron jobs and region settings

### Node Version
- Required: Node.js >=20 <21
- Configured in `axone-app/package.json` via `engines.node`
- `.nvmrc` file also specifies Node 20

## Required Environment Variables

### Upstash Redis (for points system and strategy storage)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### Vercel KV (for strategy storage)
- `strategies_KV_REST_API_URL`
- `strategies_KV_REST_API_TOKEN`

### Cron Secret
- `CRON_SECRET` - Used to secure the `/api/points/calculate` cron endpoint

### Blockchain RPC
- `NEXT_PUBLIC_HYPEREVM_RPC_URL` - HyperEVM Testnet RPC endpoint (defaults to Chainstack if not set)

### Contract Addresses
- `NEXT_PUBLIC_REWARDS_HUB_ADDRESS` - RewardsHub contract for staking
- `NEXT_PUBLIC_REFERRAL_REGISTRY_ADDRESS` - ReferralRegistry contract
- `NEXT_PUBLIC_SWAP_POOL_FACTORY_ADDRESS` - SwapPoolFactory contract

### WalletConnect
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect Cloud Project ID

## Local Development

You can use either `npm` or `pnpm` locally:
- `npm install` / `npm ci` - Works with package-lock.json
- `pnpm install` - Works with pnpm-lock.yaml (if present)

Both package managers are supported locally, but Vercel uses npm for deployment.

## Build Validation

Before deploying, validate locally:
```bash
cd axone-app
npm ci
npm run build
```

