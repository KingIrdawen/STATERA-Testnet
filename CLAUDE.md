# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Statera** is a DeFi vault management platform built on **HyperEVM Testnet (Chain ID: 998)**. Users deposit native HYPE into strategy vaults, receive shares (PPS-based), and can swap/stake/arbitrage. The main application lives in `axone-app/`.

---

## Commands (run from `axone-app/`)

```bash
npm run dev        # Start dev server on http://localhost:3000
npm run build      # Production build
npm run lint       # ESLint (eslint.config.mjs)
npm start          # Start production server
```

> ESLint is **disabled during builds** (`next.config.js`). Run `npm run lint` explicitly.

---

## Environment Variables (`axone-app/.env.local`)

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=   # Required — get from cloud.walletconnect.com
NEXT_PUBLIC_HYPEREVM_RPC_URL=           # Optional — defaults to Chainstack Hyperliquid RPC
NEXT_PUBLIC_REFERRAL_REGISTRY_ADDRESS=  # 0x... referral contract
NEXT_PUBLIC_REWARDS_HUB_ADDRESS=        # 0x... rewards contract
KV_URL=                                 # Vercel KV — required for strategy persistence
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

---

## Architecture

### Stack
- **Next.js 15 App Router** — all pages under `axone-app/src/app/`
- **Wagmi v2 + Viem v2** — all blockchain reads/writes
- **RainbowKit v2** — wallet connection
- **React Query v5** — async data caching (configured in `src/components/Providers.tsx`)
- **Tailwind CSS 4** (PostCSS, no `tailwind.config.js` file)
- **Vercel KV** — server-side strategy persistence (`src/lib/strategyRepo.ts`)

### Route Structure
```
/                          → Landing page
/dashboard/strategy        → Strategy list + tabs hub
/dashboard/strategy/[id]   → Individual strategy stats + deposit/withdraw
/dashboard/staking         → Staking
/dashboard/swap            → Swap
/dashboard/arbitrage       → Arbitrage opportunities
/dashboard/referral        → Referral
/dashboard/points          → Leaderboard + points
/admin                     → Strategy creation/management (admin only)
/docs                      → Documentation pages
```

### Data Flow: Strategies
```
/admin form  →  POST /api/strategies  →  strategyRepo.ts  →  Vercel KV
                                                                  ↓
useStrategies() (client hook)  ←  GET /api/strategies  ←  Vercel KV
       ↓
Dashboard pages  →  useStrategyDataEra()  →  Wagmi readContracts → Smart contracts
```

### Type System (two coexisting types)
- **`Strategy`** (`src/types/strategy.ts`) — current type; contracts are nested under `strategy.contracts`
- **`Index`** (`src/types/index.ts`) — legacy type; contracts are flat fields
- `strategyRepo.ts` auto-migrates legacy format to `Strategy` on read

### Key Abstractions
- **`src/lib/wagmi.ts`** — Wagmi config + HyperEVM chain definition
- **`src/lib/publicClient.ts`** — Server-side Viem public client (singleton on client, fresh on server)
- **`src/lib/strategyRepo.ts`** — All KV read/write for strategies; includes legacy migration logic
- **`src/lib/strategyContracts.ts`** — Derives typed contract descriptors from a `Strategy` object
- **`src/lib/placeholders.ts`** — Demo/placeholder data used when contracts aren't deployed yet
- **`src/contracts/`** — ABIs: `vault.ts`, `erc20.ts`, `l1read.ts`, `coreInteractionHandler.ts`, `coreInteractionViews.ts`

### Hook Conventions
- Hooks that read on-chain data use `useReadContracts` (batch) or `useReadContract` with these shared query options to avoid RPC 429 errors:
  ```ts
  const QUERY_OPTIONS = {
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 8000),
  }
  ```
- `useStrategyDataEra` is the **current** hook for strategy on-chain data (replaces legacy `useStrategyData`)
- Demo data is shown when live hooks return empty results — look for `isDemoMode` pattern in pages

### RPC Rate Limiting
The HyperEVM testnet RPC has strict rate limits. Always use `QUERY_OPTIONS` above on contract reads. Batch calls with `useReadContracts` where possible.

### Wagmi Chain
```ts
// Chain ID: 998 — HyperEVM Testnet
// Native currency: HYPE (18 decimals)
// Expected chain enforced in every page via: chainId === EXPECTED_CHAIN_ID (998)
```

### Wrong Network Pattern
Every dashboard page checks `chainId === 998` and either shows a banner (DashboardHeader) or returns an early full-page error with a "Switch Network" button. The header banner is global; individual tabs may add their own check.

### Placeholder / Demo Pattern
When contracts are not yet deployed, pages fall back to `DEMO_*` constants from `src/lib/placeholders.ts`. These are clearly marked with `// ⚠️ PLACEHOLDER` comments throughout the codebase.
