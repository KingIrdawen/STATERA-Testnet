'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccount, useChainId, useSwitchChain, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { referralRegistryContract, REFERRAL_REGISTRY_ADDRESS } from '@/contracts/referralRegistry';
import { getCodeHash } from '@/lib/referralUtils';
import { useToast } from '@/components/Toast';
import { decodeEventLog, parseAbiItem, type Address } from 'viem';

export function DashboardReferralTab() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;
  const { showToast } = useToast();

  // State
  const [referralCode, setReferralCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [allCodes, setAllCodes] = useState<Array<{ codeHash: `0x${string}`; rawCode?: string; used: boolean }>>([]);
  const [loadingCodes, setLoadingCodes] = useState(false);

  // Read whitelist status
  const { data: isWhitelisted, refetch: refetchWhitelisted } = useReadContract({
    ...referralRegistryContract(),
    functionName: 'isWhitelisted',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!REFERRAL_REGISTRY_ADDRESS && isCorrectChain,
    },
  });

  // Read referrer
  const { data: referrer, refetch: refetchReferrer } = useReadContract({
    ...referralRegistryContract(),
    functionName: 'referrerOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!REFERRAL_REGISTRY_ADDRESS && isCorrectChain,
    },
  });

  // Read stats
  const { data: codesCreated, refetch: refetchCodesCreated } = useReadContract({
    ...referralRegistryContract(),
    functionName: 'codesCreated',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!REFERRAL_REGISTRY_ADDRESS && isCorrectChain,
    },
  });

  const { data: codesQuota, refetch: refetchQuota } = useReadContract({
    ...referralRegistryContract(),
    functionName: 'codesQuota',
    query: {
      enabled: !!REFERRAL_REGISTRY_ADDRESS && isCorrectChain,
    },
  });

  // Read unused codes
  const { data: unusedCodes, refetch: refetchUnusedCodes } = useReadContract({
    ...referralRegistryContract(),
    functionName: 'getUnusedCodes',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!REFERRAL_REGISTRY_ADDRESS && isCorrectChain,
    },
  });

  // Write contract for useCode
  const { writeContract: writeUseCode, data: useCodeHash, isPending: isUseCodePending, error: useCodeError } = useWriteContract();
  const { isLoading: isUseCodeConfirming, isSuccess: isUseCodeSuccess, data: useCodeReceipt } = useWaitForTransactionReceipt({
    hash: useCodeHash,
  });

  // Write contract for createCode
  const { writeContract: writeCreateCode, data: createCodeHash, isPending: isCreateCodePending, error: createCodeError } = useWriteContract();
  const { isLoading: isCreateCodeConfirming, isSuccess: isCreateCodeSuccess, data: createCodeReceipt } = useWaitForTransactionReceipt({
    hash: createCodeHash,
  });

  // Extract created code from receipt events
  useEffect(() => {
    if (isCreateCodeSuccess && createCodeReceipt && publicClient) {
      refetchUnusedCodes();
    }
  }, [isCreateCodeSuccess, createCodeReceipt, publicClient, refetchUnusedCodes]);

  // Show single toast on final outcome only
  useEffect(() => {
    if (isUseCodeSuccess && useCodeHash) {
      showToast('success', 'Referral code used successfully', useCodeHash);
      setReferralCode('');
      refetchWhitelisted();
      refetchReferrer();
    }
  }, [isUseCodeSuccess, useCodeHash, showToast, refetchWhitelisted, refetchReferrer]);

  useEffect(() => {
    if (useCodeError && useCodeHash) {
      const errorObj = useCodeError as Error | { message?: string; shortMessage?: string; data?: any } | null;
      let message = 'Error using code';
      
      if (errorObj) {
        const errorName = (errorObj as any)?.data?.errorName || (errorObj as any)?.errorName;
        const shortMessage = (errorObj as any)?.shortMessage || errorObj?.message || String(useCodeError);
        
        const errorMessages: Record<string, string> = {
          'AlreadyWhitelisted': 'You are already whitelisted.',
          'InvalidCode': 'Invalid or non-existent code.',
          'CodeAlreadyUsed': 'This code has already been used.',
          'SelfReferral': 'Self-referral is not allowed.',
          'CodeExpired': 'This code has expired (30 days).',
        };
        
        if (errorName && errorMessages[errorName]) {
          message = errorMessages[errorName];
        } else if (shortMessage) {
          message = shortMessage;
        }
      }
      
      showToast('error', `Failed to use code: ${message}`, useCodeHash);
    }
  }, [useCodeError, useCodeHash, showToast]);

  useEffect(() => {
    if (isCreateCodeSuccess && createCodeHash) {
      showToast('success', 'Referral code created successfully', createCodeHash);
      refetchCodesCreated();
      refetchUnusedCodes();
      refetchQuota();
    }
  }, [isCreateCodeSuccess, createCodeHash, showToast, refetchCodesCreated, refetchUnusedCodes, refetchQuota]);

  useEffect(() => {
    if (createCodeError && createCodeHash) {
      const errorObj = createCodeError as Error | { message?: string; shortMessage?: string; data?: any } | null;
      let message = 'Error creating code';
      
      if (errorObj) {
        const errorName = (errorObj as any)?.data?.errorName || (errorObj as any)?.errorName;
        const shortMessage = (errorObj as any)?.shortMessage || errorObj?.message || String(createCodeError);
        
        const errorMessages: Record<string, string> = {
          'CodeGenerationPaused': 'Code generation is temporarily disabled.',
          'MaxCodesExceeded': 'Code quota reached.',
          'QuotaReached': 'Code quota reached.',
        };
        
        if (errorName && errorMessages[errorName]) {
          message = errorMessages[errorName];
        } else if (shortMessage) {
          message = shortMessage;
        }
      }
      
      showToast('error', `Failed to create code: ${message}`, createCodeHash);
    }
  }, [createCodeError, createCodeHash, showToast]);

  const normalizeCode = (code: string): string => {
    return code.trim().toUpperCase();
  };

  const handleUseCode = () => {
    if (!address || !isCorrectChain || !referralCode.trim()) {
      return;
    }

    if (!REFERRAL_REGISTRY_ADDRESS) {
      showToast('error', 'ReferralRegistry n\'est pas configuré');
      return;
    }

    try {
      const normalizedCode = normalizeCode(referralCode);
      const codeHash = getCodeHash(normalizedCode);
      writeUseCode({
        ...referralRegistryContract(),
        functionName: 'useCode',
        args: [codeHash],
      });
    } catch (error) {
      console.error('[DashboardReferralTab] Error hashing code:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error hashing code';
      showToast('error', errorMsg);
    }
  };

  const handleCreateCode = () => {
    if (!address || !isCorrectChain) {
      return;
    }

    if (!REFERRAL_REGISTRY_ADDRESS) {
      showToast('error', 'ReferralRegistry is not configured');
      return;
    }

    if (!isWhitelisted) {
      showToast('error', 'You must be whitelisted to create codes');
      return;
    }

    writeCreateCode({
      ...referralRegistryContract(),
      functionName: 'createCode',
      args: [],
    });
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('[DashboardReferralTab] Error copying code:', error);
      showToast('error', 'Error copying code');
    }
  };

  // Not connected
  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-8 max-w-md text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Connect Wallet</h3>
          <p className="text-[#5a9a9a]">
            Please connect your wallet to use the referral system.
          </p>
        </div>
      </div>
    );
  }

  // Wrong network
  if (!isCorrectChain) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-8 max-w-md text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Wrong Network</h3>
          <p className="text-[#5a9a9a] mb-6">
            Please switch to HyperEVM Testnet (Chain ID {EXPECTED_CHAIN_ID}) to use the referral system.
          </p>
          <button
            onClick={() => switchChain({ chainId: EXPECTED_CHAIN_ID })}
            className="w-full px-6 py-3 bg-[#fab062] text-black rounded-lg text-sm font-semibold hover:bg-[#e89a4a] transition-colors"
          >
            Switch to HyperEVM Testnet
          </button>
        </div>
      </div>
    );
  }

  // Not configured
  if (!REFERRAL_REGISTRY_ADDRESS) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-8 max-w-md text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Not Configured</h3>
          <p className="text-[#5a9a9a]">
            ReferralRegistry is not configured. Please configure NEXT_PUBLIC_REFERRAL_REGISTRY_ADDRESS.
          </p>
        </div>
      </div>
    );
  }

  const codesCreatedNum = codesCreated ? Number(codesCreated) : 0;
  const codesQuotaNum = codesQuota ? Number(codesQuota) : 0;
  const codesAvailable = codesQuotaNum - codesCreatedNum;
  const unusedCodesList = unusedCodes as string[] | undefined || [];
  const hasReferrer = referrer && referrer !== '0x0000000000000000000000000000000000000000';

  // Fetch all created codes from on-chain events
  useEffect(() => {
    if (!address || !isCorrectChain || !REFERRAL_REGISTRY_ADDRESS || !publicClient) {
      setAllCodes([]);
      return;
    }

    let cancelled = false;

    async function fetchAllCodes() {
      setLoadingCodes(true);
      try {
        // Define CodeCreated event
        const CodeCreatedEvent = parseAbiItem(
          'event CodeCreated(bytes32 indexed codeHash, address indexed creator, uint256 creatorCount, uint256 quota)'
        );

        // Use the same fromBlock as landing stats
        const FROM_BLOCK = 420000000n;
        if (!publicClient) return;
        
        const latestBlock = await publicClient.getBlockNumber();

        // Scan CodeCreated events for this creator
        const logs = await publicClient.getLogs({
          address: REFERRAL_REGISTRY_ADDRESS,
          event: CodeCreatedEvent,
          args: {
            creator: address,
          },
          fromBlock: FROM_BLOCK,
          toBlock: latestBlock,
        });

        if (cancelled) return;

        // Create a map of codeHash -> rawCode from unused codes
        const unusedCodesMap = new Map<string, string>();
        for (const rawCode of unusedCodesList) {
          const hash = getCodeHash(rawCode);
          unusedCodesMap.set(hash.toLowerCase(), rawCode);
        }

        // For each codeHash from logs, check if it's used
        const codePromises = logs.map(async (log) => {
          const decoded = decodeEventLog({
            abi: [CodeCreatedEvent],
            data: log.data,
            topics: log.topics,
          });

          const codeHash = (decoded.args as { codeHash: `0x${string}`; creator: Address; creatorCount: bigint; quota: bigint }).codeHash;

          // Check if code is used
          if (!REFERRAL_REGISTRY_ADDRESS) return null;
          
          const codeData = await publicClient.readContract({
            address: REFERRAL_REGISTRY_ADDRESS,
            abi: referralRegistryContract().abi,
            functionName: 'codes',
            args: [codeHash],
          }) as [Address, boolean, bigint];

          const used = codeData[1];

          // Find raw code from unused codes map
          const rawCode = unusedCodesMap.get(codeHash.toLowerCase());

          return {
            codeHash,
            rawCode,
            used,
          };
        });

        const codesResults = await Promise.all(codePromises);
        const codes = codesResults.filter((c) => c !== null) as Array<{ codeHash: `0x${string}`; rawCode?: string; used: boolean }>;
        if (!cancelled) {
          setAllCodes(codes);
        }
      } catch (error) {
        console.error('[DashboardReferralTab] Error fetching codes:', error);
        if (!cancelled) {
          setAllCodes([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingCodes(false);
        }
      }
    }

    fetchAllCodes();

    return () => {
      cancelled = true;
    };
  }, [address, isCorrectChain, REFERRAL_REGISTRY_ADDRESS, publicClient, unusedCodesList.join(',')]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Section 1: Your referral status */}
      <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-white mb-4">Your Referral Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <span className="text-gray-400 text-sm">Whitelist status:</span>
            <span className={`text-sm font-semibold ${isWhitelisted ? 'text-green-400' : 'text-red-400'}`}>
              {isWhitelisted ? '✓ Whitelisted' : '✗ Not whitelisted'}
            </span>
          </div>
          {hasReferrer && (
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400 text-sm">Your referrer:</span>
              <span className="text-white font-mono text-sm">
                {referrer.slice(0, 6)}...{referrer.slice(-4)}
              </span>
            </div>
          )}
          {isWhitelisted && !hasReferrer && (
            <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
              <p className="text-yellow-400 text-xs">
                ⚠️ You are whitelisted but do not have a referrer. You cannot create codes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Use referral code */}
      {!isWhitelisted && (
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-white mb-4">Use a Referral Code</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="referral-code" className="block text-white text-sm font-semibold mb-2">
                Referral Code
              </label>
              <input
                id="referral-code"
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(normalizeCode(e.target.value))}
                placeholder="Enter code (e.g., ERA9C3L6)"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-[#fab062] focus:outline-none uppercase"
                maxLength={20}
              />
            </div>
            <button
              onClick={handleUseCode}
              disabled={isUseCodePending || isUseCodeConfirming || !referralCode.trim()}
              className="w-full px-6 py-3 bg-[#fab062] text-black rounded-lg text-sm font-semibold hover:bg-[#e89a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUseCodePending || isUseCodeConfirming ? 'Processing...' : 'Use Code'}
            </button>
          </div>
        </div>
      )}

      {/* Section 3: Statistics */}
      {isWhitelisted && (
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-white mb-4">Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-500 text-xs mb-2">Codes Created</p>
              <p className="text-white text-2xl font-bold">{codesCreatedNum}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-500 text-xs mb-2">Codes Available</p>
              <p className="text-white text-2xl font-bold">{Math.max(0, codesAvailable)}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-500 text-xs mb-2">Max Quota</p>
              <p className="text-white text-2xl font-bold">{codesQuotaNum}</p>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Create code */}
      {isWhitelisted && hasReferrer && (
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-white mb-4">Create Code</h3>
          <p className="text-gray-400 text-sm mb-4">
            Generate a new one-time use referral code. The code will expire after 30 days.
          </p>
          <button
            onClick={handleCreateCode}
            disabled={isCreateCodePending || isCreateCodeConfirming || codesAvailable <= 0}
            className="w-full px-6 py-3 bg-[#fab062] text-black rounded-lg text-sm font-semibold hover:bg-[#e89a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreateCodePending || isCreateCodeConfirming
              ? 'Creating...'
              : codesAvailable <= 0
              ? 'Quota Reached'
              : 'Create Code'}
          </button>
        </div>
      )}

      {/* Section 5: All codes list with status */}
      {isWhitelisted && (
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-white mb-4">All Created Codes</h3>
          {loadingCodes ? (
            <div className="text-center py-8">
              <p className="text-[#5a9a9a] text-sm">Loading codes...</p>
            </div>
          ) : allCodes.length === 0 && codesCreatedNum === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#5a9a9a] text-center">No codes created yet.</p>
            </div>
          ) : allCodes.length === 0 && codesCreatedNum > 0 ? (
            <div className="text-center py-8">
              <p className="text-[#5a9a9a] text-center">Loading codes...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allCodes.map((codeItem, index) => (
                <div
                  key={codeItem.codeHash}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-white font-mono text-sm truncate">
                      {codeItem.rawCode || `${codeItem.codeHash.slice(0, 6)}...${codeItem.codeHash.slice(-4)}`}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${
                        codeItem.used
                          ? 'bg-red-400/20 text-red-400 border border-red-400/30'
                          : 'bg-green-400/20 text-green-400 border border-green-400/30'
                      }`}
                    >
                      {codeItem.used ? 'Used' : 'Unused'}
                    </span>
                  </div>
                  {codeItem.rawCode && (
                    <button
                      onClick={() => handleCopyCode(codeItem.rawCode!)}
                      className="px-4 py-2 bg-[#5a9a9a] text-white rounded-lg text-xs font-semibold hover:bg-[#4a8a8a] transition-colors flex-shrink-0 ml-2"
                    >
                      {copiedCode === codeItem.rawCode ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
