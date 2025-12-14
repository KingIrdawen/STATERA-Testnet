'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { referralRegistryContract, REFERRAL_REGISTRY_ADDRESS } from '@/contracts/referralRegistry';
import { getCodeHash } from '@/lib/referralUtils';
import { useTxToasts } from '@/lib/txToasts';

export function DashboardReferralTab() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;
  const { showTxToast } = useTxToasts();

  // State
  const [referralCode, setReferralCode] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  // Read whitelist status
  const { data: isWhitelisted, refetch: refetchWhitelisted } = useReadContract({
    ...referralRegistryContract(),
    functionName: 'isWhitelisted',
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
  const { isLoading: isUseCodeConfirming, isSuccess: isUseCodeSuccess } = useWaitForTransactionReceipt({
    hash: useCodeHash,
  });

  // Write contract for createCode
  const { writeContract: writeCreateCode, data: createCodeHash, isPending: isCreateCodePending, error: createCodeError } = useWriteContract();
  const { isLoading: isCreateCodeConfirming, isSuccess: isCreateCodeSuccess } = useWaitForTransactionReceipt({
    hash: createCodeHash,
  });

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
    }
  }, [isUseCodeSuccess, useCodeHash, showTxToast, refetchWhitelisted]);

  // Handle useCode error
  useEffect(() => {
    if (useCodeError && useCodeHash) {
      const errorObj = useCodeError as Error | { message?: string } | null;
      const message = (errorObj && 'message' in errorObj ? errorObj.message : String(useCodeError)) || 'Erreur lors de l\'utilisation du code';
      showTxToast('failed', { hash: useCodeHash, error: message, action: 'Utilisation code referral' });
    }
  }, [useCodeError, useCodeHash, showTxToast]);

  // Show toast on createCode submitted
  useEffect(() => {
    if (createCodeHash) {
      showTxToast('submitted', { hash: createCodeHash, action: 'Création code referral' });
    }
  }, [createCodeHash, showTxToast]);

  // Handle createCode success - need to read the return value
  useEffect(() => {
    if (isCreateCodeSuccess && createCodeHash) {
      // The contract returns the raw code string, but we need to read it from events or contract state
      // For now, we'll just show success and refetch unused codes
      showTxToast('confirmed', { hash: createCodeHash, action: 'Création code referral' });
      refetchCodesCreated();
      refetchUnusedCodes();
      // Note: In a real implementation, you'd listen to CodeCreated event to get the raw code
      // For now, we'll rely on getUnusedCodes to show it
    }
  }, [isCreateCodeSuccess, createCodeHash, showTxToast, refetchCodesCreated, refetchUnusedCodes]);

  // Handle createCode error
  useEffect(() => {
    if (createCodeError && createCodeHash) {
      const errorObj = createCodeError as Error | { message?: string } | null;
      const message = (errorObj && 'message' in errorObj ? errorObj.message : String(createCodeError)) || 'Erreur lors de la création du code';
      showTxToast('failed', { hash: createCodeHash, error: message, action: 'Création code referral' });
    }
  }, [createCodeError, createCodeHash, showTxToast]);

  const handleUseCode = () => {
    if (!address || !isCorrectChain || !referralCode.trim()) {
      return;
    }

    if (!REFERRAL_REGISTRY_ADDRESS) {
      showTxToast('failed', { error: 'ReferralRegistry n\'est pas configuré', action: 'Utilisation code referral' });
      return;
    }

    try {
      const codeHash = getCodeHash(referralCode.trim());
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
      showTxToast('failed', { error: 'ReferralRegistry n\'est pas configuré', action: 'Utilisation code referral' });
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
      showTxToast('confirmed', { action: 'Code copié dans le presse-papiers' });
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Section 1: Enter referral code */}
      <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-white mb-4">Utiliser un code de referral</h3>
        
        {isWhitelisted ? (
          <div className="p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
            <p className="text-green-400 text-sm font-semibold">✓ Vous êtes whitelisté</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="referral-code" className="block text-white text-sm font-semibold mb-2">
                Code de referral
              </label>
              <input
                id="referral-code"
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Entrez le code (ex: ERA9C3L6)"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-[#fab062] focus:outline-none"
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
        )}
      </div>

      {/* Section 2: Statistics */}
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

      {/* Section 3: Create code */}
      {isWhitelisted && (
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-white mb-4">Créer un code</h3>
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
          {createdCode && (
            <div className="mt-4 p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
              <p className="text-green-400 text-sm font-semibold mb-2">Code créé:</p>
              <p className="text-white font-mono text-lg">{createdCode}</p>
            </div>
          )}
        </div>
      )}

      {/* Section 4: Unused codes list */}
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
                  Copier
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

