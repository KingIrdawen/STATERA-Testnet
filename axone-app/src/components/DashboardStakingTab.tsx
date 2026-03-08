'use client';

import { useState } from 'react';
import { useAccount, useChainId, useSwitchChain, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { useStakingPools } from '@/hooks/useStakingPools';
import { useStakingData } from '@/hooks/useStakingData';
import { useStakingActions } from '@/hooks/useStakingActions';
import { useStakingTokenApproval } from '@/hooks/useStakingTokenApproval';
import { formatUsd } from '@/lib/format';
import { DEMO_STAKING_POOLS, DEMO_STAKING_TOTAL_STAKED_USD, DEMO_STAKING_PENDING_REWARDS } from '@/lib/placeholders';

type ViewMode = 'list' | 'card';

interface DashboardStakingTabProps {
  variant?: 'ERA' | 'STA';
}

// ─── Toggle icons ─────────────────────────────────────────────────────────────
function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="3" y1="4" x2="13" y2="4" />
      <line x1="3" y1="8" x2="13" y2="8" />
      <line x1="3" y1="12" x2="13" y2="12" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="2" y="2" width="5" height="5" />
      <rect x="9" y="2" width="5" height="5" />
      <rect x="2" y="9" width="5" height="5" />
      <rect x="9" y="9" width="5" height="5" />
    </svg>
  );
}

// ─── Controls bar (Claim All + toggle) ────────────────────────────────────────
function ControlsBar({
  viewMode,
  onViewChange,
  onClaimAll,
  claimAllDisabled,
}: {
  viewMode: ViewMode;
  onViewChange: (v: ViewMode) => void;
  onClaimAll: () => void;
  claimAllDisabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={onClaimAll}
        disabled={claimAllDisabled}
        className="px-4 py-2 bg-[#C9A36A] text-[#0A0A0A] text-xs font-semibold rounded-lg hover:bg-[#b8935f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Claim All
      </button>
      <div className="flex gap-1 bg-white/5 border border-[#C9A36A]/15 rounded-lg p-1">
        <button
          onClick={() => onViewChange('list')}
          className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-[#C9A36A] text-black' : 'text-[rgba(230,230,230,0.5)] hover:text-white'}`}
          title="List view"
        >
          <ListIcon />
        </button>
        <button
          onClick={() => onViewChange('card')}
          className={`p-1.5 rounded transition-colors ${viewMode === 'card' ? 'bg-[#C9A36A] text-black' : 'text-[rgba(230,230,230,0.5)] hover:text-white'}`}
          title="Card view"
        >
          <GridIcon />
        </button>
      </div>
    </div>
  );
}

// ─── Demo list row ─────────────────────────────────────────────────────────────
function DemoListRow({ pool }: { pool: typeof DEMO_STAKING_POOLS[0] }) {
  return (
    <div className="landing-card flex flex-wrap items-center gap-3 p-4 rounded-lg hover:border-[#C9A36A]/30 transition-colors">
      <div className="flex-1 min-w-[140px]">
        <p className="text-[#C9A36A] font-semibold text-sm">Pool #{pool.pid} — {pool.symbol}</p>
        <p className="text-[rgba(230,230,230,0.35)] text-[0.6rem] tracking-wide">Weight: {pool.weight}%</p>
      </div>
      <div className="flex gap-4 text-xs text-[rgba(230,230,230,0.5)] flex-wrap">
        <span>APR: <span className="text-green-400 font-mono font-semibold">{pool.aprPercent}%</span></span>
        <span>TVL: <span className="text-[#E6E6E6] font-mono">${pool.totalStakedUsd.toLocaleString()}</span></span>
        <span>Reward: <span className="text-[#E6E6E6] font-mono">{pool.rewardToken}</span></span>
        <span>Staked: <span className="text-[#E6E6E6] font-mono">—</span></span>
        <span>Rewards: <span className="text-[#E6E6E6] font-mono">—</span></span>
      </div>
      <div className="flex gap-2 shrink-0">
        <button disabled className="px-3 py-1.5 text-[0.6rem] tracking-[0.10em] uppercase bg-[#C9A36A]/30 text-[#C9A36A]/50 rounded cursor-not-allowed font-semibold">Stake</button>
        <button disabled className="px-3 py-1.5 text-[0.6rem] tracking-[0.10em] uppercase bg-white/5 border border-[#C9A36A]/20 text-[rgba(230,230,230,0.35)] rounded cursor-not-allowed font-semibold">Claim</button>
        <button disabled className="px-3 py-1.5 text-[0.6rem] tracking-[0.10em] uppercase bg-white/5 border border-[#C9A36A]/20 text-[rgba(230,230,230,0.35)] rounded cursor-not-allowed font-semibold">Claim & Stake</button>
      </div>
    </div>
  );
}

// ─── Demo card (existing style) ───────────────────────────────────────────────
function DemoCard({ pool }: { pool: typeof DEMO_STAKING_POOLS[0] }) {
  return (
    <div className="landing-card rounded-xl p-6 transition-colors duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-xl font-bold text-[#C9A36A] tracking-[0.03em]">Pool #{pool.pid} — {pool.symbol}</h4>
          <p className="text-[rgba(230,230,230,0.4)] text-xs mt-1">Weight: {pool.weight}%</p>
        </div>
        <span className="px-2 py-0.5 rounded text-[0.6rem] font-semibold tracking-[0.1em] uppercase bg-[#C9A36A]/10 text-[#C9A36A]/60 border border-[#C9A36A]/15">Demo</span>
      </div>
      <div className="space-y-2 mb-5">
        <div className="flex justify-between items-center">
          <span className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)]">Total Staked</span>
          <span className="text-[#E6E6E6] text-sm font-mono">${pool.totalStakedUsd.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)]">APR</span>
          <span className="text-green-400 text-sm font-semibold font-mono">+{pool.aprPercent}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)]">Reward Token</span>
          <span className="text-[#E6E6E6] text-sm font-mono">{pool.rewardToken}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button disabled className="flex-1 px-3 py-2 bg-[#C9A36A]/30 text-[#C9A36A]/50 text-xs font-semibold rounded-lg cursor-not-allowed">Stake</button>
        <button disabled className="flex-1 px-3 py-2 bg-white/5 border border-[#C9A36A]/20 text-[rgba(230,230,230,0.35)] text-xs font-semibold rounded-lg cursor-not-allowed">Claim</button>
        <button disabled className="flex-1 px-3 py-2 bg-white/5 border border-[#C9A36A]/20 text-[rgba(230,230,230,0.35)] text-xs font-semibold rounded-lg cursor-not-allowed">Claim & Stake</button>
      </div>
    </div>
  );
}

// ─── Live list row ────────────────────────────────────────────────────────────
interface LiveListRowProps {
  pool: { pid: number; stakeToken: `0x${string}`; stakeTokenSymbol?: string; stakeTokenDecimals?: number; totalStaked: bigint; weight?: number };
  stakedAmount: bigint;
  pendingReward: bigint;
  onStake: () => void;
  onHarvest: () => void;
  onClaimAndStake: () => void;
  isPending: boolean;
  isConfirming: boolean;
}
function LiveListRow({ pool, stakedAmount, pendingReward, onStake, onHarvest, onClaimAndStake, isPending, isConfirming }: LiveListRowProps) {
  const decimals = pool.stakeTokenDecimals ?? 18;
  const symbol = pool.stakeTokenSymbol || 'TOKEN';
  const formattedStaked = stakedAmount > 0n ? Number(formatUnits(stakedAmount, decimals)).toFixed(4) : '—';
  const formattedPending = pendingReward > 0n ? Number(formatUnits(pendingReward, 18)).toFixed(4) : '—';
  const formattedTvl = pool.totalStaked > 0n ? Number(formatUnits(pool.totalStaked, decimals)).toFixed(2) : '0';

  return (
    <div className="landing-card flex flex-wrap items-center gap-3 p-4 rounded-lg hover:border-[#C9A36A]/30 transition-colors">
      <div className="flex-1 min-w-[140px]">
        <p className="text-[#C9A36A] font-semibold text-sm">Pool #{pool.pid} — {symbol}</p>
        {pool.weight !== undefined && <p className="text-[rgba(230,230,230,0.35)] text-[0.6rem]">Weight: {(pool.weight * 100).toFixed(2)}%</p>}
      </div>
      <div className="flex gap-4 text-xs text-[rgba(230,230,230,0.5)] flex-wrap">
        <span>TVL: <span className="text-[#E6E6E6] font-mono">{formattedTvl} {symbol}</span></span>
        <span>Your Stake: <span className="text-[#E6E6E6] font-mono">{formattedStaked}</span></span>
        <span>Rewards: <span className="text-green-400 font-mono">{formattedPending}</span></span>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={onStake}
          disabled={isPending || isConfirming}
          className="px-3 py-1.5 text-[0.6rem] tracking-[0.10em] uppercase bg-[#C9A36A] text-[#0A0A0A] rounded font-semibold hover:bg-[#b8935f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending || isConfirming ? '...' : 'Stake'}
        </button>
        <button
          onClick={onHarvest}
          disabled={isPending || isConfirming || pendingReward === 0n}
          className="px-3 py-1.5 text-[0.6rem] tracking-[0.10em] uppercase bg-white/5 border border-[#C9A36A]/30 text-[#C9A36A] rounded font-semibold hover:bg-[#C9A36A]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Claim
        </button>
        <button
          onClick={onClaimAndStake}
          disabled={isPending || isConfirming || pendingReward === 0n}
          className="px-3 py-1.5 text-[0.6rem] tracking-[0.10em] uppercase bg-white/5 border border-[#C9A36A]/20 text-[rgba(230,230,230,0.6)] rounded font-semibold hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Claim & Stake
        </button>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function DashboardStakingTab({ variant = 'ERA' }: DashboardStakingTabProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const { pools, isLoading: poolsLoading, error: poolsError } = useStakingPools();
  const { pools: userPools, totalPendingReward, totalStaked, isLoading: userDataLoading } = useStakingData();
  const { deposit, unstake, harvest, emergencyWithdraw, isPending, isConfirming, error: actionsError } = useStakingActions();

  const [stakeAmounts, setStakeAmounts] = useState<Record<number, string>>({});

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="landing-card rounded-lg p-8 max-w-md text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Connect Wallet</h3>
          <p className="text-[rgba(230,230,230,0.5)]">Please connect your wallet to view staking pools.</p>
        </div>
      </div>
    );
  }

  if (!isCorrectChain) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="landing-card rounded-lg p-8 max-w-md text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Wrong Network</h3>
          <p className="text-[rgba(230,230,230,0.5)] mb-6">Switch to HyperEVM Testnet (Chain ID {EXPECTED_CHAIN_ID}).</p>
          <button onClick={() => switchChain({ chainId: EXPECTED_CHAIN_ID })} className="w-full px-6 py-3 bg-[#C9A36A] text-[#121212] rounded-lg text-sm font-semibold hover:bg-[#b8935f] transition-colors">
            Switch to HyperEVM Testnet
          </button>
        </div>
      </div>
    );
  }

  if (poolsLoading || userDataLoading) {
    return <div className="text-center py-12"><p className="text-[rgba(230,230,230,0.5)] text-lg">Loading staking data...</p></div>;
  }

  if (poolsError) {
    return <div className="text-center py-12"><p className="text-red-400 text-lg">Error: {poolsError.message}</p></div>;
  }

  const getUserPoolData = (pid: number) => userPools.find(up => up.pid === pid);

  const handleClaimAll = () => {
    if (!pools || pools.length === 0) return;
    userPools.filter(up => up.pendingReward > 0n).forEach(up => harvest(up.pid));
  };

  // ── DEMO MODE ──────────────────────────────────────────────────────────────
  if (!pools || pools.length === 0) {
    // Adjust demo pool names for STA variant
    const demoPools = DEMO_STAKING_POOLS.map(p => ({
      ...p,
      symbol: variant === 'STA' ? 'STA' : p.symbol,
      rewardToken: variant === 'STA' ? 'HYPE' : p.rewardToken,
    }));

    return (
      <div className="space-y-6">
        <div className="bg-[#C9A36A]/8 border border-[#C9A36A]/20 rounded-xl p-4 text-center">
          <p className="text-[#C9A36A]/80 text-xs tracking-[0.1em] uppercase font-semibold mb-1">Demo Mode</p>
          <p className="text-[rgba(230,230,230,0.5)] text-sm">
            Showing placeholder {variant} staking pools — live data available after contract deployment.
          </p>
        </div>

        <div className="landing-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#C9A36A] tracking-[0.04em] mb-4">{variant} Staking Overview</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/3 border border-[#C9A36A]/10 rounded-lg p-4 flex flex-col items-center justify-center text-center">
              <p className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)] mb-2">Total Pools</p>
              <p className="text-[#C9A36A] text-xl font-bold font-mono">{demoPools.length}</p>
            </div>
            <div className="bg-white/3 border border-[#C9A36A]/10 rounded-lg p-4 flex flex-col items-center justify-center text-center">
              <p className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)] mb-2">Total Staked (USD)</p>
              <p className="text-[#C9A36A] text-xl font-bold font-mono">${DEMO_STAKING_TOTAL_STAKED_USD.toLocaleString()}</p>
            </div>
            <div className="bg-white/3 border border-[#C9A36A]/10 rounded-lg p-4 flex flex-col items-center justify-center text-center">
              <p className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)] mb-2">Your Staking</p>
              <p className="text-[#C9A36A] text-xl font-bold font-mono">—</p>
            </div>
            <div className="bg-white/3 border border-[#C9A36A]/10 rounded-lg p-4 flex flex-col items-center justify-center text-center">
              <p className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)] mb-2">Pending Rewards</p>
              <p className="text-[#C9A36A] text-xl font-bold font-mono mb-2">{DEMO_STAKING_PENDING_REWARDS} {variant === 'STA' ? 'HYPE' : 'STA'}</p>
            </div>
          </div>
        </div>

        <ControlsBar
          viewMode={viewMode}
          onViewChange={setViewMode}
          onClaimAll={() => {}}
          claimAllDisabled={true}
        />

        {viewMode === 'list' ? (
          <div className="space-y-3">
            {demoPools.map(pool => <DemoListRow key={pool.pid} pool={pool} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {demoPools.map(pool => <DemoCard key={pool.pid} pool={pool} />)}
          </div>
        )}
      </div>
    );
  }

  // ── LIVE MODE ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="landing-card rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#C9A36A] tracking-[0.04em] mb-4">{variant} Staking Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/3 border border-[#C9A36A]/10 rounded-lg p-4 flex flex-col items-center justify-center text-center">
            <p className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)] mb-2">Total Pools</p>
            <p className="text-[#C9A36A] text-2xl font-bold font-mono">{pools.length}</p>
          </div>
          <div className="bg-white/3 border border-[#C9A36A]/10 rounded-lg p-4 flex flex-col items-center justify-center text-center">
            <p className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)] mb-2">Your Staking</p>
            <p className="text-[#C9A36A] text-2xl font-bold font-mono">{totalStaked > 0n ? formatUnits(totalStaked, 18) : '0'}</p>
          </div>
          <div className="bg-white/3 border border-[#C9A36A]/10 rounded-lg p-4 flex flex-col items-center justify-center text-center">
            <p className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)] mb-2">Pending Rewards</p>
            <p className="text-[#C9A36A] text-2xl font-bold font-mono">{totalPendingReward > 0n ? formatUnits(totalPendingReward, 18) : '0'}</p>
          </div>
        </div>
      </div>

      <ControlsBar
        viewMode={viewMode}
        onViewChange={setViewMode}
        onClaimAll={handleClaimAll}
        claimAllDisabled={isPending || isConfirming || totalPendingReward === 0n}
      />

      {viewMode === 'list' ? (
        <div className="space-y-3">
          {pools.map(pool => {
            const userData = getUserPoolData(pool.pid);
            const stakedAmount = userData?.stakedAmount ?? 0n;
            const pendingReward = userData?.pendingReward ?? 0n;
            const stakeAmount = stakeAmounts[pool.pid] || '';
            return (
              <LiveListRow
                key={pool.pid}
                pool={pool}
                stakedAmount={stakedAmount}
                pendingReward={pendingReward}
                onStake={() => deposit(pool.pid, stakeAmount, pool.stakeToken, pool.stakeTokenDecimals ?? 18)}
                onHarvest={() => harvest(pool.pid)}
                onClaimAndStake={() => harvest(pool.pid)}
                isPending={isPending}
                isConfirming={isConfirming}
              />
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pools.map(pool => {
            const userData = getUserPoolData(pool.pid);
            const stakedAmount = userData?.stakedAmount ?? 0n;
            const pendingReward = userData?.pendingReward ?? 0n;
            const stakeAmount = stakeAmounts[pool.pid] || '';
            const withdrawAmount = '';
            return (
              <PoolCard
                key={pool.pid}
                pool={pool}
                stakedAmount={stakedAmount}
                pendingReward={pendingReward}
                stakeAmount={stakeAmount}
                withdrawAmount={withdrawAmount}
                onStakeAmountChange={(val) => setStakeAmounts({ ...stakeAmounts, [pool.pid]: val })}
                onWithdrawAmountChange={() => {}}
                onStake={() => deposit(pool.pid, stakeAmount, pool.stakeToken, pool.stakeTokenDecimals ?? 18)}
                onUnstake={() => {}}
                onHarvest={() => harvest(pool.pid)}
                onEmergencyWithdraw={() => emergencyWithdraw(pool.pid)}
                isPending={isPending}
                isConfirming={isConfirming}
                address={address}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

interface PoolCardProps {
  pool: { pid: number; stakeToken: `0x${string}`; allocPoint: bigint; totalStaked: bigint; stakeTokenSymbol?: string; stakeTokenDecimals?: number; weight?: number };
  stakedAmount: bigint;
  pendingReward: bigint;
  stakeAmount: string;
  withdrawAmount: string;
  onStakeAmountChange: (val: string) => void;
  onWithdrawAmountChange: (val: string) => void;
  onStake: () => void;
  onUnstake: () => void;
  onHarvest: () => void;
  onEmergencyWithdraw: () => void;
  isPending: boolean;
  isConfirming: boolean;
  address: `0x${string}`;
}

function PoolCard({ pool, stakedAmount, pendingReward, stakeAmount, withdrawAmount, onStakeAmountChange, onWithdrawAmountChange, onStake, onUnstake, onHarvest, onEmergencyWithdraw, isPending, isConfirming, address }: PoolCardProps) {
  const decimals = pool.stakeTokenDecimals ?? 18;
  const symbol = pool.stakeTokenSymbol || 'TOKEN';
  const { data: balance } = useBalance({ address, token: pool.stakeToken, query: { enabled: !!address } });
  const maxStake = balance ? Number(formatUnits(balance.value, decimals)) : 0;
  const maxWithdraw = stakedAmount > 0n ? Number(formatUnits(stakedAmount, decimals)) : 0;
  const { needsApproval, approve, isApproving } = useStakingTokenApproval(pool.stakeToken, stakeAmount, decimals);
  const formattedTotalStaked = pool.totalStaked > 0n ? formatUnits(pool.totalStaked, decimals) : '0';
  const formattedStaked = stakedAmount > 0n ? formatUnits(stakedAmount, decimals) : '0';
  const formattedPending = pendingReward > 0n ? formatUnits(pendingReward, 18) : '0';

  return (
    <div className="landing-card rounded-lg p-6 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-xl font-bold text-[#C9A36A] tracking-[0.03em]">Pool #{pool.pid} - {symbol}</h4>
          {pool.weight !== undefined && <p className="text-xs text-gray-500 mt-1">Weight: {(pool.weight * 100).toFixed(2)}%</p>}
        </div>
      </div>
      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-xs">Total Staked</span>
          <span className="text-white text-sm font-mono">{formattedTotalStaked} {symbol}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-xs">Your Staked</span>
          <span className="text-white text-sm font-mono">{formattedStaked} {symbol}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-xs">Pending Rewards</span>
          <span className="text-green-400 text-sm font-mono">{formattedPending}</span>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-white text-sm font-semibold">Stake ({symbol})</label>
          {maxStake > 0 && (
            <button onClick={() => onStakeAmountChange(maxStake.toString())} className="text-xs text-[#C9A36A] hover:text-[#b8935f] transition-colors font-medium">
              MAX: {maxStake.toFixed(6)}
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <input type="number" step="0.0001" value={stakeAmount} onChange={(e) => onStakeAmountChange(e.target.value)} placeholder="0.0"
            className="flex-1 px-3 py-2 bg-white/5 border border-[#C9A36A]/20 rounded-lg text-white text-sm focus:border-[#C9A36A]/60 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          {needsApproval ? (
            <button onClick={approve} disabled={isApproving || !stakeAmount || parseFloat(stakeAmount) <= 0}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isApproving ? 'Approving...' : 'Approve'}
            </button>
          ) : (
            <button onClick={onStake} disabled={isPending || isConfirming || !stakeAmount || parseFloat(stakeAmount) <= 0}
              className="px-4 py-2 bg-[#C9A36A] text-[#121212] rounded-lg text-sm font-semibold hover:bg-[#b8935f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isPending || isConfirming ? 'Processing...' : 'Stake'}
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {pendingReward > 0n && (
          <button onClick={onHarvest} disabled={isPending || isConfirming}
            className="flex-1 px-4 py-2 bg-[#C9A36A] text-black rounded-lg text-sm font-semibold hover:bg-[#b8935f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending || isConfirming ? 'Processing...' : 'Claim'}
          </button>
        )}
        {pendingReward > 0n && (
          <button onClick={onHarvest} disabled={isPending || isConfirming}
            className="flex-1 px-4 py-2 bg-white/5 border border-[#C9A36A]/30 text-[#C9A36A] rounded-lg text-sm font-semibold hover:bg-[#C9A36A]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Claim & Stake
          </button>
        )}
        {stakedAmount > 0n && (
          <button onClick={onEmergencyWithdraw} disabled={isPending || isConfirming}
            className="px-4 py-2 bg-red-800 text-white rounded-lg text-xs font-semibold hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Emergency
          </button>
        )}
      </div>
    </div>
  );
}
