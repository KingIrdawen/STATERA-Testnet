// ABI for ReferralRegistry contract
export const referralRegistryAbi = [
  {
    inputs: [{ internalType: 'address', name: 'initialOwner', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'AlreadyWhitelisted',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CodeAlreadyUsed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CodeExpired',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CodeGenerationPaused',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CodeNotFound',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidCode',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MaxCodesExceeded',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SelfReferral',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UnauthorizedOverwrite',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroAddress',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'codeHash', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'creatorCount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'quota', type: 'uint256' },
    ],
    name: 'CodeCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'codeHash', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'revoker', type: 'address' },
    ],
    name: 'CodeRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'codeHash', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: true, internalType: 'address', name: 'referrer', type: 'address' },
    ],
    name: 'CodeUsed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: true, internalType: 'bytes32', name: 'codeHash', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'referrer', type: 'address' },
    ],
    name: 'Whitelisted',
    type: 'event',
  },
  {
    inputs: [],
    name: 'codeGenerationPaused',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'codes',
    outputs: [
      { internalType: 'address', name: 'creator', type: 'address' },
      { internalType: 'bool', name: 'used', type: 'bool' },
      { internalType: 'uint256', name: 'expiresAt', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'codesCreated',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'codesQuota',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'codeHash', type: 'bytes32' }],
    name: 'createCode',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'createCode',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'creator', type: 'address' }],
    name: 'getUnusedCodes',
    outputs: [{ internalType: 'string[]', name: '', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'isWhitelisted',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'referrerOf',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'codeHash', type: 'bytes32' }],
    name: 'useCode',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

