'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { referralRegistryContract, REFERRAL_REGISTRY_ADDRESS } from '@/contracts/referralRegistry';
import { getCodeHash } from '@/lib/referralUtils';
import { useTxToasts } from '@/lib/txToasts';
import { decodeEventLog } from 'viem';

export function DashboardReferralTab() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;
  const { showTxToast } = useTxToasts();

  // State
  const [referralCode, setReferralCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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
      // Try to decode CodeCreated event to get the raw code
      // Note: The contract returns the code string, but we can also get it from events
      // For now, we'll refetch unusedCodes which should include the new code
      refetchUnusedCodes();
    }
  }, [isCreateCodeSuccess, createCodeReceipt, publicClient, refetchUnusedCodes]);

  // Show toast on useCode submitted
  useEffect(() => {
    if (useCodeHash) {
      showTxToast('submitted', { hash: useCodeHash, action: 'Utilisation code referral' });
    }
  }, [useCodeHash, showTxToast]);

  // Handle useCode success
  useEffect(() => {
    if (isUseCodeSuccess && useCodeHash) {
      showTxToast('confirmed', { hash: useCodeHash, action: 'Utilisation code referral' });
      setReferralCode('');
      refetchWhitelisted();
      refetchReferrer();
    }
  }, [isUseCodeSuccess, useCodeHash, showTxToast, refetchWhitelisted, refetchReferrer]);

  // Handle useCode error with better error decoding
  useEffect(() => {
    if (useCodeError && useCodeHash) {
      const errorObj = useCodeError as Error | { message?: string; shortMessage?: string; data?: any } | null;
      let message = 'Erreur lors de l\'utilisation du code';
      
      if (errorObj) {
        // Try to extract error name from viem error
        const errorName = (errorObj as any)?.data?.errorName || (errorObj as any)?.errorName;
        const shortMessage = (errorObj as any)?.shortMessage || errorObj?.message || String(useCodeError);
        
        // Map error names to friendly French messages
        const errorMessages: Record<string, string> = {
          'AlreadyWhitelisted': 'Vous êtes déjà whitelisté.',
          'InvalidCode': 'Code invalide ou inexistant.',
          'CodeAlreadyUsed': 'Ce code a déjà été utilisé.',
          'SelfReferral': 'Auto-parrainage interdit.',
          'CodeExpired': 'Ce code a expiré (30 jours).',
        };
        
        if (errorName && errorMessages[errorName]) {
          message = errorMessages[errorName];
        } else if (shortMessage) {
          message = shortMessage;
        }
      }
      
      showTxToast('failed', { hash: useCodeHash, error: message, action: 'Utilisation code referral' });
    }
  }, [useCodeError, useCodeHash, showTxToast]);

  // Show toast on createCode submitted
  useEffect(() => {
    if (createCodeHash) {
      showTxToast('submitted', { hash: createCodeHash, action: 'Création code referral' });
    }
  }, [createCodeHash, showTxToast]);

  // Handle createCode success
  useEffect(() => {
    if (isCreateCodeSuccess && createCodeHash) {
      showTxToast('confirmed', { hash: createCodeHash, action: 'Création code referral' });
      refetchCodesCreated();
      refetchUnusedCodes();
      refetchQuota();
    }
  }, [isCreateCodeSuccess, createCodeHash, showTxToast, refetchCodesCreated, refetchUnusedCodes, refetchQuota]);

  // Handle createCode error with better error decoding
  useEffect(() => {
    if (createCodeError && createCodeHash) {
      const errorObj = createCodeError as Error | { message?: string; shortMessage?: string; data?: any } | null;
      let message = 'Erreur lors de la création du code';
      
      if (errorObj) {
        const errorName = (errorObj as any)?.data?.errorName || (errorObj as any)?.errorName;
        const shortMessage = (errorObj as any)?.shortMessage || errorObj?.message || String(createCodeError);
        
        const errorMessages: Record<string, string> = {
          'CodeGenerationPaused': 'La génération de codes est temporairement désactivée.',
          'MaxCodesExceeded': 'Quota de codes atteint.',
          'QuotaReached': 'Quota de codes atteint.',
        };
        
        if (errorName && errorMessages[errorName]) {
          message = errorMessages[errorName];
        } else if (shortMessage) {
          message = shortMessage;
        }
      }
      
      showTxToast('failed', { hash: createCodeHash, error: message, action: 'Création code referral' });
    }
  }, [createCodeError, createCodeHash, showTxToast]);

  const normalizeCode = (code: string): string => {
    return code.trim().toUpperCase();
  };

  const handleUseCode = () => {
    if (!address || !isCorrectChain || !referralCode.trim()) {
      return;
    }

    if (!REFERRAL_REGISTRY_ADDRESS) {
      showTxToast('failed', { error: 'ReferralRegistry n\'est pas configuré', action: 'Utilisation code referral' });
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
      const errorMsg = error instanceof Error ? error.message : 'Erreur lors du hashage du code';
      showTxToast('failed', { error: errorMsg, action: 'Utilisation code referral' });
    }
  };

  const handleCreateCode = () => {
    if (!address || !isCorrectChain) {
      return;
    }

    if (!REFERRAL_REGISTRY_ADDRESS) {
      showTxToast('failed', { error: 'ReferralRegistry n\'est pas configuré', action: 'Création code referral' });
      return;
    }

    if (!isWhitelisted) {
      showTxToast('failed', { error: 'Vous devez être whitelisté pour créer des codes', action: 'Création code referral' });
      return;
    }

    // Call createCode() without arguments (returns string)
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
      showTxToast('failed', { error: 'Erreur lors de la copie du code', action: 'Copie code' });
    }
  };

  // Not connected
  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-8 max-w-md text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Connect Wallet</h3>
          <p className="text-[#5a9a9a]">
            Veuillez connecter votre wallet pour utiliser le système de referral.
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
            Veuillez basculer sur HyperEVM Testnet (Chain ID {EXPECTED_CHAIN_ID}) pour utiliser le système de referral.
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
            ReferralRegistry n'est pas configuré. Veuillez configurer NEXT_PUBLIC_REFERRAL_REGISTRY_ADDRESS.
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Section 1: Your referral status */}
      <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-white mb-4">Votre statut de referral</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <span className="text-gray-400 text-sm">Statut whitelist:</span>
            <span className={`text-sm font-semibold ${isWhitelisted ? 'text-green-400' : 'text-red-400'}`}>
              {isWhitelisted ? '✓ Whitelisté' : '✗ Non whitelisté'}
            </span>
          </div>
          {hasReferrer && (
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400 text-sm">Votre parrain:</span>
              <span className="text-white font-mono text-sm">
                {referrer.slice(0, 6)}...{referrer.slice(-4)}
              </span>
            </div>
          )}
          {isWhitelisted && !hasReferrer && (
            <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
              <p className="text-yellow-400 text-xs">
                ⚠️ Vous êtes whitelisté mais n'avez pas de parrain. Vous ne pouvez pas créer de codes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Use referral code */}
      {!isWhitelisted && (
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-white mb-4">Utiliser un code de referral</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="referral-code" className="block text-white text-sm font-semibold mb-2">
                Code de referral
              </label>
              <input
                id="referral-code"
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(normalizeCode(e.target.value))}
                placeholder="Entrez le code (ex: ERA9C3L6)"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-[#fab062] focus:outline-none uppercase"
                maxLength={20}
              />
            </div>
            <button
              onClick={handleUseCode}
              disabled={isUseCodePending || isUseCodeConfirming || !referralCode.trim()}
              className="w-full px-6 py-3 bg-[#fab062] text-black rounded-lg text-sm font-semibold hover:bg-[#e89a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUseCodePending || isUseCodeConfirming ? 'Traitement...' : 'Utiliser le code'}
            </button>
          </div>
        </div>
      )}

      {/* Section 3: Statistics */}
      {isWhitelisted && (
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-white mb-4">Statistiques</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-500 text-xs mb-2">Codes créés</p>
              <p className="text-white text-2xl font-bold">{codesCreatedNum}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-500 text-xs mb-2">Codes disponibles</p>
              <p className="text-white text-2xl font-bold">{Math.max(0, codesAvailable)}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-500 text-xs mb-2">Quota maximum</p>
              <p className="text-white text-2xl font-bold">{codesQuotaNum}</p>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Create code */}
      {isWhitelisted && hasReferrer && (
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-white mb-4">Créer un code</h3>
          <p className="text-gray-400 text-sm mb-4">
            Générez un nouveau code de parrainage à usage unique. Le code expirera après 30 jours.
          </p>
          <button
            onClick={handleCreateCode}
            disabled={isCreateCodePending || isCreateCodeConfirming || codesAvailable <= 0}
            className="w-full px-6 py-3 bg-[#fab062] text-black rounded-lg text-sm font-semibold hover:bg-[#e89a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreateCodePending || isCreateCodeConfirming
              ? 'Création...'
              : codesAvailable <= 0
              ? 'Quota atteint'
              : 'Créer un code'}
          </button>
        </div>
      )}

      {/* Section 5: Unused codes list */}
      {isWhitelisted && unusedCodesList.length > 0 && (
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-white mb-4">Codes non utilisés</h3>
          <div className="space-y-2">
            {unusedCodesList.map((code, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
              >
                <span className="text-white font-mono text-sm truncate flex-1 mr-4">{code}</span>
                <button
                  onClick={() => handleCopyCode(code)}
                  className="px-4 py-2 bg-[#5a9a9a] text-white rounded-lg text-xs font-semibold hover:bg-[#4a8a8a] transition-colors flex-shrink-0"
                >
                  {copiedCode === code ? 'Copié !' : 'Copier'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isWhitelisted && unusedCodesList.length === 0 && codesCreatedNum > 0 && (
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
          <p className="text-[#5a9a9a] text-center">Aucun code non utilisé disponible</p>
        </div>
      )}
    </div>
  );
}
