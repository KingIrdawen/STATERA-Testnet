# Test Plan: ERA Generic Strategy System

## Overview

This test plan validates the generic ERA strategy system that works with any strategy following the ERA contract pattern (Vault + Handler + Views).

## Prerequisites

1. Wallet connected to HyperEVM Testnet (Chain ID: 998)
2. Some HYPE test tokens for deposits
3. At least one strategy created via the admin page

## Test Cases

### 1. Admin: Create Strategy

**Steps:**
1. Navigate to `/admin`
2. Fill in the form:
   - Name: "Test ERA Strategy"
   - Description: "Test strategy"
   - Risk Level: "medium"
   - Status: "open"
   - Chain ID: 998
   - Vault Address: (valid ERA vault address)
   - Handler Address: (valid CoreInteractionHandler address)
   - CoreViews Address: (valid CoreInteractionViews address)
   - L1Read Address: (valid L1Read address)
   - CoreWriter Address: (default: 0x3333...3333)
   - Tokens:
     - TOKEN1: 60%
     - HYPE: 40%
3. Click "Créer"

**Expected:**
- Strategy is saved successfully
- Strategy appears in the "Strategies existantes" list
- No token IDs or spot IDs are required (they are managed on-chain)

**Validation:**
- Verify strategy appears in storage (check API `/api/strategies`)
- Verify strategy has correct `contracts` structure
- Verify tokens only have `symbol` and `allocation` (no `tokenId`)

---

### 2. Dashboard > Stratégies Tab (All Strategies)

**Steps:**
1. Navigate to `/dashboard`
2. Click on "Strategies" tab (if exists) or verify all strategies are shown
3. Verify the new strategy appears

**Expected:**
- All strategies are displayed
- Each strategy card shows:
  - Name, risk level, status
  - Token allocation (symbol + %)
  - Total value in contract (TVL)
  - User deposit (0 if not deposited)
  - PPS (Price per Share)
  - User shares (0 if not deposited)
  - Oracle prices (HYPE, TOKEN1)
- Deposit controls are available

**Validation:**
- Verify `useStrategyDataEra` hook is called for each strategy
- Verify data is fetched from Vault and Views contracts
- Verify no errors in console

---

### 3. Deposit

**Steps:**
1. Navigate to `/dashboard`
2. Find a strategy card
3. Enter deposit amount (e.g., "0.01" HYPE)
4. Click "Deposit"
5. Approve transaction in wallet
6. Wait for confirmation

**Expected:**
- Transaction is sent to `vault.deposit()` with native HYPE value
- Transaction is confirmed
- User shares increase
- User value increases
- Strategy appears in "Strategy" tab (user strategies)

**Validation:**
- Check `useStrategyDeposit` hook is working
- Verify transaction hash is returned
- Verify `isPending` → `isConfirmed` flow
- Verify user shares > 0 after deposit
- Verify user value > 0 after deposit

---

### 4. Withdraw

**Steps:**
1. Navigate to `/dashboard`
2. Go to "Strategy" tab (shows only strategies with deposits)
3. Find a strategy where you have deposited
4. Enter withdraw amount (shares, e.g., "0.005")
5. Click "Withdraw"
6. Approve transaction in wallet
7. Wait for confirmation

**Expected:**
- Transaction is sent to `vault.withdraw(shares)`
- Transaction is confirmed
- User shares decrease
- User value decreases
- If shares reach 0, strategy disappears from "Strategy" tab

**Validation:**
- Check `useStrategyWithdraw` hook is working
- Verify transaction hash is returned
- Verify `isPending` → `isConfirmed` flow
- Verify user shares decrease after withdraw

---

### 5. Multiple Strategies

**Steps:**
1. Create a second strategy via admin
2. Navigate to `/dashboard`
3. Verify both strategies appear in "Stratégies" tab
4. Deposit in both strategies
5. Verify both appear in "Strategy" tab

**Expected:**
- Both strategies are displayed
- Each strategy works independently
- Data is fetched correctly for each strategy
- No cross-contamination between strategies

**Validation:**
- Verify each strategy uses its own contract addresses
- Verify data is isolated per strategy
- Verify deposit/withdraw work independently

---

### 6. Network Switching

**Steps:**
1. Connect wallet to wrong network (e.g., Ethereum Mainnet)
2. Navigate to `/dashboard`
3. Try to deposit in a strategy

**Expected:**
- Warning message appears: "Wrong network. Please switch to Chain ID 998"
- "Switch Network" button is available
- Deposit/Withdraw buttons are disabled
- Clicking "Switch Network" prompts wallet to switch

**Validation:**
- Verify `chainId` check is working
- Verify UI correctly disables actions on wrong network
- Verify network switching works

---

### 7. Error Handling

**Steps:**
1. Create a strategy with invalid contract addresses
2. Navigate to `/dashboard`
3. View the strategy card

**Expected:**
- Error message is displayed in the card
- Error is user-friendly
- UI doesn't crash
- Other strategies still work

**Validation:**
- Verify error handling in `useStrategyDataEra`
- Verify error messages are clear
- Verify errors don't break the UI

---

## Edge Cases

### Empty Strategies List
- Verify empty state is displayed correctly
- Verify "No strategies" message appears

### Strategy with Zero TVL
- Verify strategy still displays correctly
- Verify PPS is 0 or undefined
- Verify deposit still works

### Strategy with Zero User Shares
- Verify user value is 0
- Verify strategy doesn't appear in "Strategy" tab
- Verify deposit button is still available

### Very Large Numbers
- Verify formatting handles large TVL values
- Verify formatting handles large share amounts
- Verify no overflow errors

---

## Performance

### Load Time
- Verify strategies load within 3 seconds
- Verify no blocking operations
- Verify parallel data fetching works

### Data Refresh
- Verify data refreshes appropriately
- Verify stale data is handled
- Verify cache is working

---

## Notes

- All token IDs and spot IDs are managed on-chain by the handler
- The front-end never needs to know these IDs
- The system is fully generic and works with any ERA strategy
- Migration from old strategies (with tokenId) may require manual update

