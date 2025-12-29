# Risks

Statera is a decentralized, non-custodial protocol built on open-source smart contracts. It is designed to empower users with automated portfolio management, intelligent rebalancing, and community-driven value redistribution — all without intermediaries.

However, using Statera involves significant risks. This page outlines the key legal, financial, technical, and operational risks you should understand before interacting with the protocol.

## 1. Legal & Regulatory Risks

Statera does not operate as a financial institution, custodian, or investment advisor. It is a permissionless protocol governed entirely by smart contracts. However, regulatory authorities in various jurisdictions may interpret certain aspects of the protocol differently.

### 1.1. Potential Classification as a Security

The distribution of STA tokens via staking (e.g., Strategy Staking Vault) and the receipt of fee rewards in HYPE could be interpreted by regulators (e.g., the U.S. SEC) as participation in an investment contract under the Howey Test.

If STA is deemed a security, future access to the protocol or trading of STA on certain platforms could be restricted in regulated jurisdictions.

Our Position:

Statera is a tool, not an investment scheme.

No team and no legal entity controls funds or profits.

The protocol will be deployed via a non-upgradeable, permissionless launch. No entity will retain administrative control, special privileges, or early access to tokens. All supply will be distributed algorithmically to users based on participation

All logic is automated and immutable.

Rewards are algorithmic, not promised.

We believe Statera falls outside traditional securities frameworks — but this is not legal advice.

### 1.2. No KYC / AML Compliance

Statera does not collect personal data, perform KYC checks, or implement AML filters.

This aligns with core DeFi principles but may result in: - Restrictions on CEX listings of STA - Regulatory scrutiny of the token - Potential blocking of access from certain regions

You are responsible for ensuring your use of Statera complies with local laws, including tax reporting and crypto regulations.

## 2. Financial Risks

### 2.1. Loss of Principal

There is no capital guarantee. The value of your investment, denominated in HYPE, can decrease due to: - Market volatility of underlying assets (e.g., BTC, ETH, etc.) - Imperfect rebalancing during extreme price moves - Fees (entry, exit, management)

You may lose some or all of your deposited HYPE, even if you earn STA rewards.

### 2.2. Performance ≠ Profit

Past performance is not indicative of future results.

High volatility, black swan events, or prolonged bear markets can lead to significant drawdowns.

### 2.3. Impermanent Loss (IL)

Users holding STAlp (liquidity tokens) are exposed to impermanent loss due to price divergence between STA and HYPE in the LP

### 2.4. Inflation and Token Value

STA has a 10% annual inflation, fully distributed to users who stake ERA tokens.

While this rewards engagement, it also increases supply.

The net effect on price depends on whether buyback & burn (50% of fees) offsets inflation.

## 🔗 3. Technical & Infrastructure Risks

### 3.1. Reliance on Hyperliquid

Statera depends on Hyperliquid for critical infrastructure:

If Hyperliquid goes offline or suffers an exploit, Statera cannot function normally until resolution.

We monitor Hyperliquid’s uptime and security posture closely. Users should assess this dependency before participation.

### 3.2. Smart Contract Risk

Statera’s smart contracts are complex, involving: - Dynamic NAV calculation - Fee distribution logic - Vesting (STAlp) - Inflation scheduling - Buyback & burn automation

#### Pre-TGE Status:

The protocol is unaudited at launch.

First fees collected (entry/exit/management) will fund a third-party audit by a reputable firm (to be announced).

Audit results will be published before TGE and available to all users.

The protocol is unaudited at launch because Statera is a fully decentralized, community-funded project with no venture capital or team treasury. The first fees collected will be used to commission a third-party audit, ensuring the protocol is secured by the ecosystem itself.

Until the audit is complete, all interactions are at high risk.We strongly advise users to:

Deposit small amounts initially

Monitor official channels for updates

Withdraw if uncomfortable with risk level

### 3.3. Oracle Risk

The Net Asset Value (NAV) of each strategy is calculated using on-chain price feeds from Hyperliquid.

If these oracles: - Are delayed - Provide stale prices - Are manipulated (e.g., flash loan attack) → The NAV becomes inaccurate.

Consequences:

Users may deposit/withdraw at incorrect values

Rebalancing triggers at wrong times

Staking rewards miscalculated

Mitigation:

We rely on Hyperliquid’s robust oracle design, but no system is immune to manipulation.

### 3.4. Upgradeability & Immutability

The protocol includes a governance owner (managed by a multi-signature wallet) capable of adjusting key parameters such as fees, rebalancing frequency, and staking logic.

However, all revenue generated by the protocol is automatically routed to a dedicated vault, where:

50% funds STA buyback & burn

50% is distributed to STA stakers in HYPE

This design prevents direct profit capture by the owner — even if fees are increased, the revenue flows back to the community.

That said, the owner could still:

Disrupt operations (e.g., pause functions, set inefficient parameters)

Damage user experience or protocol performance

To mitigate this:

All parameter changes are subject to a 48-hour timelock

The owner cannot withdraw user funds or alter redistribution logic

A clear path to on-chain governance by STA holders will be implemented within 12 months

While this introduces a temporary trust assumption, the economic design ensures that malicious actions would be self-destructive for any rational actor

This ensures trustless operation and protects against governance attacks.

Future versions may introduce governance, allowing STA holders to vote on upgrades — but only via transparent, on-chain proposals.

## 4. User Risks & Responsibilities

### 4.1. No Recovery Mechanism

There is no customer support.

There is no way to recover funds if: - You lose your wallet seed phrase- You send funds to the wrong address - You approve a malicious contract

### 4.2. Phishing & Scams

Fake websites, social media impersonators, and scam tokens are common.

Always verify: - The official domain: https://statera.example (TBD) - Contract addresses (published in docs and verified on-chain) - Social media accounts (blue check + pinned post)

Never click links from DMs.Never enter your seed phrase anywhere.

### 4.3. Wallet & Transaction Risks

Ensure your wallet (e.g., MetaMask) is up to date.

Double-check: - Token amounts - Gas fees - Contract interactions (approve, deposit, withdraw)

A single mistake can result in permanent loss.

## 5. Economic Model Risks

### Fee Distribution Relies on Activity

100% of fees go back to users: - 50% → Buyback & burn - 50% → STA stakers (in HYPE)

Low activity could create a negative feedback loop:

Fewer fees → smaller buybacks → less downward pressure on supply

Lower STA staking rewards → reduced user engagement

Weaker liquidity → wider spreads → worse execution

This highlights the importance of sustainable demand for Statera’s strategies, not just short-term incentives.


---


**Table 1**

| Function | Risk if Failed |

| --- | --- |

| On-chain order execution | Rebalancing fails → portfolio drifts from target allocation |

| Price Oracles | Incorrect NAV → wrong staking rewards, unfair deposits/withdrawals |

| Settlement on the Hyperliquid network | Funds stuck, delayed, or misrouted |


