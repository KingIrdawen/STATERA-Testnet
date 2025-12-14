// ABI for RewardsHub contract (MasterChef-like staking)
export const rewardsHubAbi = [
  // Read functions
  {
    name: 'poolLength',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'poolInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'pid', type: 'uint256' }],
    outputs: [
      { name: 'stakeToken', type: 'address' },
      { name: 'allocPoint', type: 'uint128' },
      { name: 'lastRewardTime', type: 'uint64' },
      { name: 'accRewardPerShare', type: 'uint256' },
      { name: 'totalStaked', type: 'uint256' },
    ],
  },
  {
    name: 'totalAllocPoint',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'rewardToken',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'pendingReward',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'pid', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    outputs: [{ name: 'pending', type: 'uint256' }],
  },
  {
    name: 'userInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'pid', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    outputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'rewardDebt', type: 'int256' },
    ],
  },
  // Write functions
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'pid', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'pid', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'harvest',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'pid', type: 'uint256' },
      { name: 'to', type: 'address' },
    ],
    outputs: [],
  },
  {
    name: 'emergencyWithdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'pid', type: 'uint256' }],
    outputs: [],
  },
] as const;


