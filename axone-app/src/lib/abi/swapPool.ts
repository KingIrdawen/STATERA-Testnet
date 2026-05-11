// ABI for SwapPool contract (v2 — fees 0.5 %, addLiquidity à 2 args)
export const swapPoolAbi = [
  // ─── Lectures ────────────────────────────────────────────────────────────
  {
    type: 'function',
    name: 'getReserves',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'hypeReserve', type: 'uint256' },
      { name: 'vaultTokenReserve', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'getAmountOut',
    stateMutability: 'view',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'hypeIn', type: 'bool' },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'lpToken',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  // ─── Liquidité ───────────────────────────────────────────────────────────
  {
    type: 'function',
    name: 'addLiquidity',
    stateMutability: 'payable',
    inputs: [
      { name: 'hypeAmount', type: 'uint256' },
      { name: 'vaultTokenAmount', type: 'uint256' },
    ],
    outputs: [{ name: 'liquidity', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'removeLiquidity',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'lpAmount', type: 'uint256' },
      { name: 'recipient', type: 'address' },
    ],
    outputs: [
      { name: 'hypeOut', type: 'uint256' },
      { name: 'vaultTokenOut', type: 'uint256' },
    ],
  },
  // ─── Swaps ───────────────────────────────────────────────────────────────
  {
    type: 'function',
    name: 'swapHypeForVaultToken',
    stateMutability: 'payable',
    inputs: [
      { name: 'hypeIn', type: 'uint256' },
      { name: 'to', type: 'address' },
    ],
    outputs: [{ name: 'vaultTokenOut', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'swapVaultTokenForHype',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'vaultTokenIn', type: 'uint256' },
      { name: 'to', type: 'address' },
    ],
    outputs: [{ name: 'hypeOut', type: 'uint256' }],
  },
  // ─── Maintenance ─────────────────────────────────────────────────────────
  {
    type: 'function',
    name: 'sync',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  // ─── Events ──────────────────────────────────────────────────────────────
  {
    type: 'event',
    name: 'Swap',
    inputs: [
      { indexed: true,  name: 'sender',          type: 'address' },
      { indexed: false, name: 'amount0In',        type: 'uint256' },
      { indexed: false, name: 'amount1In',        type: 'uint256' },
      { indexed: false, name: 'amount0Out',       type: 'uint256' },
      { indexed: false, name: 'amount1Out',       type: 'uint256' },
      { indexed: false, name: 'protocolFeeHype',  type: 'uint256' },
      { indexed: false, name: 'lpFeeHype',        type: 'uint256' },
      { indexed: true,  name: 'to',               type: 'address' },
    ],
  },
  {
    type: 'event',
    name: 'Mint',
    inputs: [
      { indexed: true,  name: 'sender',    type: 'address' },
      { indexed: false, name: 'amount0',   type: 'uint256' },
      { indexed: false, name: 'amount1',   type: 'uint256' },
      { indexed: false, name: 'liquidity', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'Burn',
    inputs: [
      { indexed: true,  name: 'sender',  type: 'address' },
      { indexed: false, name: 'amount0', type: 'uint256' },
      { indexed: false, name: 'amount1', type: 'uint256' },
      { indexed: true,  name: 'to',      type: 'address' },
    ],
  },
  {
    type: 'event',
    name: 'Sync',
    inputs: [
      { indexed: false, name: 'reserve0', type: 'uint256' },
      { indexed: false, name: 'reserve1', type: 'uint256' },
    ],
  },
] as const;
