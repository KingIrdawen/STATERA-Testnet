'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBlockNumber } from 'wagmi';
import { referralRegistryContract, REFERRAL_REGISTRY_ADDRESS } from '@/contracts/referralRegistry';
import { getCodeHash } from '@/lib/referralUtils';
import { useToast } from '@/components/Toast';
import { DEMO_REFERRAL } from '@/lib/placeholders';

export function DashboardReferralTab() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;
  const { showToast } = useToast();

  const [referralCode, setReferralCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // ─── Lecture des données on-chain ────────────────────────────────────────
  const { data: isWhitelisted, refetch: refetchWhitelisted } = useReadContract({
    ...referralRegistryContract(),
    functionName: 'isWhitelisted',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!REFERRAL_REGISTRY_ADDRESS && isCorrectChain },
  });

  const { data: referrer, refetch: refetchReferrer } = useReadContract({
    ...referralRegistryContract(),
    functionName: 'referrerOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!REFERRAL_REGISTRY_ADDRESS && isCorrectChain },
  });

  const { data: codesCreated, refetch: refetchCodesCreated } = useReadContract({
    ...referralRegistryContract(),
    functionName: 'codesCreated',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!REFERRAL_REGISTRY_ADDRESS && isCorrectChain },
  });

  const { data: codesQuota, refetch: refetchQuota } = useReadContract({
    ...referralRegistryContract(),
    functionName: 'codesQuota',
    query: { enabled: !!REFERRAL_REGISTRY_ADDRESS && isCorrectChain },
  });

  const { data: unusedCodes, refetch: refetchUnusedCodes, isLoading: isLoadingUnusedCodes, isError: isErrorUnusedCodes } = useReadContract({
    ...referralRegistryContract(),
    functionName: 'getUnusedCodes',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!REFERRAL_REGISTRY_ADDRESS && isCorrectChain },
  });

  const { data: currentBlock } = useBlockNumber({
    watch: true,
    query: { enabled: !!address && isCorrectChain },
  });

  // ─── Write contracts ──────────────────────────────────────────────────────
  const { writeContract: writeUseCode, data: useCodeHash, isPending: isUseCodePending, error: useCodeError } = useWriteContract();
  const { isLoading: isUseCodeConfirming, isSuccess: isUseCodeSuccess } = useWaitForTransactionReceipt({ hash: useCodeHash });

  const { writeContract: writeCreateCode, data: createCodeHash, isPending: isCreateCodePending, error: createCodeError } = useWriteContract();
  const { isLoading: isCreateCodeConfirming, isSuccess: isCreateCodeSuccess, data: createCodeReceipt } = useWaitForTransactionReceipt({ hash: createCodeHash });

  useEffect(() => {
    if (isCreateCodeSuccess && createCodeReceipt) refetchUnusedCodes();
  }, [isCreateCodeSuccess, createCodeReceipt, refetchUnusedCodes]);

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
        message = (errorName && errorMessages[errorName]) ? errorMessages[errorName] : (shortMessage || message);
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
        message = (errorName && errorMessages[errorName]) ? errorMessages[errorName] : (shortMessage || message);
      }
      showToast('error', `Failed to create code: ${message}`, createCodeHash);
    }
  }, [createCodeError, createCodeHash, showToast]);

  const normalizeCode = (code: string): string => code.trim().toUpperCase();

  const handleUseCode = () => {
    if (!address || !isCorrectChain || !referralCode.trim()) return;
    if (!REFERRAL_REGISTRY_ADDRESS) { showToast('error', 'ReferralRegistry n\'est pas configuré'); return; }
    try {
      writeUseCode({ ...referralRegistryContract(), functionName: 'useCode', args: [getCodeHash(normalizeCode(referralCode))] });
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Error hashing code');
    }
  };

  const handleCreateCode = () => {
    if (!address || !isCorrectChain) return;
    if (!REFERRAL_REGISTRY_ADDRESS) { showToast('error', 'ReferralRegistry is not configured'); return; }
    if (!isWhitelisted) { showToast('error', 'You must be whitelisted to create codes'); return; }
    writeCreateCode({ ...referralRegistryContract(), functionName: 'createCode', args: [] });
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      showToast('error', 'Error copying code');
    }
  };

  // Valeurs dérivées
  const codesCreatedNum = codesCreated ? Number(codesCreated) : 0;
  const codesQuotaNum = codesQuota ? Number(codesQuota) : 0;
  const codesAvailable = codesQuotaNum - codesCreatedNum;
  const unusedCodesList = (unusedCodes as string[] | undefined) || [];
  const hasReferrer = referrer && referrer !== '0x0000000000000000000000000000000000000000';

  // ─── Mode démo ──────────────────────────────────────────────────────────────
  // ⚠️  PLACEHOLDER — Affiché quand le contrat ReferralRegistry n'est pas déployé
  const isDemoMode = !REFERRAL_REGISTRY_ADDRESS || !isCorrectChain || !address;

  // CodeCard
  function CodeCard({ code }: { code: string }) {
    const codeHash = getCodeHash(code);
    const { data: codeData } = useReadContract({
      ...referralRegistryContract(),
      functionName: 'codes',
      args: [codeHash],
      query: { enabled: !!REFERRAL_REGISTRY_ADDRESS && !!currentBlock },
    }) as { data: [string, boolean, bigint] | undefined };

    const expiresAtBlock = codeData?.[2];
    const BLOCKS_PER_DAY = 7200n;
    const daysRemaining = expiresAtBlock && currentBlock
      ? Number((expiresAtBlock - currentBlock) / BLOCKS_PER_DAY)
      : null;

    return (
      <div className="p-4 bg-white/5 border border-[#C9A36A]/15 rounded-lg">
        <div className="flex items-center justify-between gap-4 mb-2">
          <span className="font-mono bg-[#121212] border border-[#C9A36A]/10 px-3 py-1.5 rounded text-[#E6E6E6] flex-1 min-w-0 text-sm">
            {code}
          </span>
          <button
            onClick={() => handleCopyCode(code)}
            className="text-sm bg-[#C9A36A]/10 hover:bg-[#C9A36A]/20 border border-[#C9A36A]/20 px-3 py-1.5 rounded-lg transition-colors text-[#C9A36A] flex-shrink-0 font-semibold"
          >
            {copiedCode === code ? 'Copied!' : 'Copy'}
          </button>
        </div>
        {daysRemaining !== null && daysRemaining > 0 && (
          <p className="text-[rgba(230,230,230,0.4)] text-xs mt-1">
            Expires in ~{daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
          </p>
        )}
        {daysRemaining !== null && daysRemaining <= 0 && (
          <p className="text-red-400 text-xs mt-1">Expired</p>
        )}
      </div>
    );
  }

  // ─── Affichage mode démo quand contrats pas encore déployés ──────────────
  if (isDemoMode) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Banner démo */}
        <div className="bg-[#C9A36A]/8 border border-[#C9A36A]/20 rounded-xl p-4 text-center">
          <p className="text-[#C9A36A]/80 text-xs tracking-[0.1em] uppercase font-semibold mb-1">Demo Mode</p>
          <p className="text-[rgba(230,230,230,0.5)] text-sm">
            {/* ⚠️  PLACEHOLDER — Données référral fictives. À remplacer par les données on-chain */}
            Showing placeholder data — Connect wallet on HyperEVM Testnet to use the live referral system.
          </p>
        </div>

        {/* Section 1: Statut (démo) */}
        <div className="bg-white/5 border border-[#C9A36A]/15 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#C9A36A] tracking-[0.04em] mb-4">Your Referral Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/3 border border-[#C9A36A]/10 rounded-lg">
              <span className="text-[rgba(230,230,230,0.5)] text-sm">Whitelist status</span>
              <span className="text-sm font-semibold text-green-400">✓ Whitelisted</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/3 border border-[#C9A36A]/10 rounded-lg">
              <span className="text-[rgba(230,230,230,0.5)] text-sm">Your referrer</span>
              {/* ⚠️  PLACEHOLDER adresse référrant */}
              <span className="text-[#E6E6E6] font-mono text-sm">{DEMO_REFERRAL.referrer}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Statistiques (démo) */}
        <div className="bg-white/5 border border-[#C9A36A]/15 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#C9A36A] tracking-[0.04em] mb-4">Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Codes Created', value: DEMO_REFERRAL.codesCreated },
              { label: 'Codes Available', value: DEMO_REFERRAL.codesAvailable },
              { label: 'Max Quota', value: DEMO_REFERRAL.codesQuota },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/3 border border-[#C9A36A]/10 rounded-lg p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.12em] text-[rgba(230,230,230,0.4)] mb-2">{label}</p>
                {/* ⚠️  PLACEHOLDER — valeurs de DEMO_REFERRAL */}
                <p className="text-[#C9A36A] text-2xl font-bold font-mono">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Codes créés (démo) */}
        <div className="bg-white/5 border border-[#C9A36A]/15 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#C9A36A] tracking-[0.04em] mb-4">Your Referral Codes</h3>
          <div className="grid gap-4">
            {/* ⚠️  PLACEHOLDER — codes de DEMO_REFERRAL.unusedCodes */}
            {DEMO_REFERRAL.unusedCodes.map((code) => (
              <div key={code} className="p-4 bg-white/3 border border-[#C9A36A]/10 rounded-lg">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono bg-[#121212] border border-[#C9A36A]/10 px-3 py-1.5 rounded text-[#E6E6E6] flex-1 text-sm">
                    {code}
                  </span>
                  <button
                    onClick={() => handleCopyCode(code)}
                    className="text-sm bg-[#C9A36A]/10 hover:bg-[#C9A36A]/20 border border-[#C9A36A]/20 px-3 py-1.5 rounded-lg transition-colors text-[#C9A36A] font-semibold flex-shrink-0"
                  >
                    {copiedCode === code ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-[rgba(230,230,230,0.3)] text-xs mt-2">⚠️ Demo code — not valid on-chain</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Wrong network ────────────────────────────────────────────────────────
  if (!isCorrectChain) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-white/5 border border-[#C9A36A]/15 rounded-xl p-8 max-w-md text-center">
          <h3 className="text-2xl font-bold text-[#C9A36A] mb-4 tracking-[0.04em]">Wrong Network</h3>
          <p className="text-[rgba(230,230,230,0.5)] mb-6">
            Please switch to HyperEVM Testnet (Chain ID {EXPECTED_CHAIN_ID}) to use the referral system.
          </p>
          <button
            onClick={() => switchChain({ chainId: EXPECTED_CHAIN_ID })}
            className="w-full px-6 py-3 bg-[#C9A36A] text-[#121212] rounded-lg text-sm font-semibold hover:bg-[#b8935f] transition-colors"
          >
            Switch to HyperEVM Testnet
          </button>
        </div>
      </div>
    );
  }

  // ─── Affichage live ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Section 1: Statut */}
      <div className="bg-white/5 border border-[#C9A36A]/15 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[#C9A36A] tracking-[0.04em] mb-4">Your Referral Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/3 border border-[#C9A36A]/10 rounded-lg">
            <span className="text-[rgba(230,230,230,0.5)] text-sm">Whitelist status</span>
            <span className={`text-sm font-semibold ${isWhitelisted ? 'text-green-400' : 'text-red-400'}`}>
              {isWhitelisted ? '✓ Whitelisted' : '✗ Not whitelisted'}
            </span>
          </div>
          {hasReferrer && (
            <div className="flex items-center justify-between p-3 bg-white/3 border border-[#C9A36A]/10 rounded-lg">
              <span className="text-[rgba(230,230,230,0.5)] text-sm">Your referrer</span>
              <span className="text-[#E6E6E6] font-mono text-sm">
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

      {/* Section 2: Utiliser un code */}
      {!isWhitelisted && (
        <div className="bg-white/5 border border-[#C9A36A]/15 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#C9A36A] tracking-[0.04em] mb-4">Use a Referral Code</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="referral-code" className="block text-[#E6E6E6] text-sm font-semibold mb-2">
                Referral Code
              </label>
              <input
                id="referral-code"
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(normalizeCode(e.target.value))}
                placeholder="Enter code (e.g., ERA9C3L6)"
                className="w-full px-4 py-2 bg-white/5 border border-[#C9A36A]/20 rounded-lg text-[#E6E6E6] text-sm focus:border-[#C9A36A]/60 focus:outline-none uppercase"
                maxLength={20}
              />
            </div>
            <button
              onClick={handleUseCode}
              disabled={isUseCodePending || isUseCodeConfirming || !referralCode.trim()}
              className="w-full px-6 py-3 bg-[#C9A36A] text-[#121212] rounded-lg text-sm font-semibold hover:bg-[#b8935f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUseCodePending || isUseCodeConfirming ? 'Processing...' : 'Use Code'}
            </button>
          </div>
        </div>
      )}

      {/* Section 3: Statistiques */}
      {isWhitelisted && (
        <div className="bg-white/5 border border-[#C9A36A]/15 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#C9A36A] tracking-[0.04em] mb-4">Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Codes Created', value: codesCreatedNum },
              { label: 'Codes Available', value: Math.max(0, codesAvailable) },
              { label: 'Max Quota', value: codesQuotaNum },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/3 border border-[#C9A36A]/10 rounded-lg p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.12em] text-[rgba(230,230,230,0.4)] mb-2">{label}</p>
                <p className="text-[#C9A36A] text-2xl font-bold font-mono">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Créer un code */}
      {isWhitelisted && hasReferrer && (
        <div className="bg-white/5 border border-[#C9A36A]/15 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#C9A36A] tracking-[0.04em] mb-2">Create Code</h3>
          <p className="text-[rgba(230,230,230,0.5)] text-sm mb-4">
            Generate a new one-time use referral code. The code will expire after 30 days.
          </p>
          <button
            onClick={handleCreateCode}
            disabled={isCreateCodePending || isCreateCodeConfirming || codesAvailable <= 0}
            className="w-full px-6 py-3 bg-[#C9A36A] text-[#121212] rounded-lg text-sm font-semibold hover:bg-[#b8935f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreateCodePending || isCreateCodeConfirming
              ? 'Creating...'
              : codesAvailable <= 0
              ? 'Quota Reached'
              : 'Create Code'}
          </button>
        </div>
      )}

      {/* Section 5: Tous les codes */}
      {isWhitelisted && (
        <div className="bg-white/5 border border-[#C9A36A]/15 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#C9A36A] tracking-[0.04em] mb-4">All Created Codes</h3>
          {isLoadingUnusedCodes ? (
            <div className="text-center py-8">
              <p className="text-[rgba(230,230,230,0.4)] text-sm">Loading codes...</p>
            </div>
          ) : isErrorUnusedCodes ? (
            <div className="text-center py-8">
              <p className="text-red-400 text-sm mb-4">Failed to load codes</p>
              <button
                onClick={() => refetchUnusedCodes()}
                className="px-4 py-2 bg-[#C9A36A] text-[#121212] rounded-lg text-sm font-semibold hover:bg-[#b8935f] transition-colors"
              >
                Retry
              </button>
            </div>
          ) : Array.isArray(unusedCodesList) && unusedCodesList.length === 0 ? (
            <p className="text-[rgba(230,230,230,0.4)] text-center text-sm py-4">No unused codes available</p>
          ) : (
            <div className="grid gap-4">
              {unusedCodesList.map((code, i) => (
                <CodeCard key={i} code={code} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
