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

export function DashboardStakingTab() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;

  const { pools, rewardToken, isLoading: poolsLoading, error: poolsError } = useStakingPools();
  const { pools: userPools, totalPendingReward, totalStaked, isLoading: userDataLoading } = useStakingData();
  const { deposit, unstake, harvest, emergencyWithdraw, isPending, isConfirming, error: actionsError } = useStakingActions();

  // State for input amounts per pool
  const [stakeAmounts, setStakeAmounts] = useState<Record<number, string>>({});
  const [withdrawAmounts, setWithdrawAmounts] = useState<Record<number, string>>({});

  // Not connected
  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-8 max-w-md text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Connect Wallet</h3>
          <p className="text-[#5a9a9a]">
            Please connect your wallet to view and interact with staking pools.
          </p>
        </div>
      </div>
    );
  }

  // Wrong network
  if (!isCorrectChain) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-8 max-w-md text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Wrong Network</h3>
          <p className="text-[#5a9a9a] mb-6">
            Please switch to HyperEVM Testnet (Chain ID {EXPECTED_CHAIN_ID}) to view staking pools.
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

  // Loading
  if (poolsLoading || userDataLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-[rgba(230,230,230,0.5)] text-lg">Loading staking data...</p>
      </div>
    );
  }

  // Error
  if (poolsError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-lg">Error loading staking pools: {poolsError.message}</p>
      </div>
    );
  }

  // No pools — afficher les données démo
  // ⚠️  PLACEHOLDER — Pools de staking démo. À remplacer par useStakingPools() quand le contrat est déployé.
  if (!pools || pools.length === 0) {
    return (
      <div className="space-y-6">
        {/* Banner démo */}
        <div className="bg-[#C9A36A]/8 border border-[#C9A36A]/20 rounded-xl p-4 text-center">
          <p className="text-[#C9A36A]/80 text-xs tracking-[0.1em] uppercase font-semibold mb-1">Demo Mode</p>
          <p className="text-[rgba(230,230,230,0.5)] text-sm">
            Showing placeholder staking pools — live data available after contract deployment.
          </p>
        </div>

        {/* Overview démo */}
        <div className="bg-white/5 border border-[#C9A36A]/15 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#C9A36A] tracking-[0.04em] mb-4">Staking Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/3 border border-[#C9A36A]/10 rounded-lg p-4 flex flex-col items-center justify-center text-center">
              <p className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)] mb-2">Total Pools</p>
              <p className="text-[#C9A36A] text-xl font-bold font-mono">{DEMO_STAKING_POOLS.length}</p>
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
              <p className="text-[#C9A36A] text-xl font-bold font-mono mb-3">{DEMO_STAKING_PENDING_REWARDS} STA</p>
              <button disabled className="px-4 py-1.5 bg-[#C9A36A]/30 text-[#C9A36A]/50 text-xs font-semibold rounded-lg cursor-not-allowed">
                Claim
              </button>
            </div>
          </div>
        </div>

        {/* Pool cards démo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {DEMO_STAKING_POOLS.map((pool) => (
            <div key={pool.pid} className="bg-white/5 border border-[#C9A36A]/15 rounded-xl p-6 hover:border-[#C9A36A]/35 transition-colors duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-bold text-[#C9A36A] tracking-[0.03em]">
                    Pool #{pool.pid} — {pool.symbol}
                  </h4>
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
              <div className="p-3 bg-[#C9A36A]/5 border border-[#C9A36A]/15 rounded-lg text-center">
                <p className="text-[rgba(230,230,230,0.4)] text-xs">Available after contract deployment</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Get user data for a pool
  const getUserPoolData = (pid: number) => {
    return userPools.find(up => up.pid === pid);
  };

  const handleClaimAll = () => {
    userPools
      .filter(up => up.pendingReward > 0n)
      .forEach(up => harvest(up.pid));
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#C9A36A] tracking-[0.04em] mb-4">Staking Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/3 border border-[#C9A36A]/10 rounded-lg p-4 flex flex-col items-center justify-center text-center">
            <p className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)] mb-2">Total Pools</p>
            <p className="text-[#C9A36A] text-2xl font-bold font-mono">{pools.length}</p>
          </div>
          <div className="bg-white/3 border border-[#C9A36A]/10 rounded-lg p-4 flex flex-col items-center justify-center text-center">
            <p className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)] mb-2">Your Staking</p>
            <p className="text-[#C9A36A] text-2xl font-bold font-mono">
              {totalStaked > 0n ? formatUnits(totalStaked, 18) : '0'}
            </p>
          </div>
          <div className="bg-white/3 border border-[#C9A36A]/10 rounded-lg p-4 flex flex-col items-center justify-center text-center">
            <p className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)] mb-2">Pending Rewards</p>
            <p className="text-[#C9A36A] text-2xl font-bold font-mono mb-3">
              {totalPendingReward > 0n ? formatUnits(totalPendingReward, 18) : '0'}
            </p>
            <button
              onClick={handleClaimAll}
              disabled={isPending || isConfirming || totalPendingReward === 0n}
              className="px-4 py-1.5 bg-[#C9A36A] text-black text-xs font-semibold rounded-lg hover:bg-[#b8935f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending || isConfirming ? 'Processing...' : 'Claim'}
            </button>
          </div>
        </div>
      </div>

      {/* Pools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pools.map((pool) => {
          const userData = getUserPoolData(pool.pid);
          const stakedAmount = userData?.stakedAmount ?? 0n;
          const pendingReward = userData?.pendingReward ?? 0n;
          const stakeAmount = stakeAmounts[pool.pid] || '';
          const withdrawAmount = withdrawAmounts[pool.pid] || '';

          return (
            <PoolCard
              key={pool.pid}
              pool={pool}
              stakedAmount={stakedAmount}
              pendingReward={pendingReward}
              stakeAmount={stakeAmount}
              withdrawAmount={withdrawAmount}
              onStakeAmountChange={(val) => setStakeAmounts({ ...stakeAmounts, [pool.pid]: val })}
              onWithdrawAmountChange={(val) => setWithdrawAmounts({ ...withdrawAmounts, [pool.pid]: val })}
              onStake={() => deposit(pool.pid, stakeAmount, pool.stakeToken, pool.stakeTokenDecimals ?? 18)}
              onUnstake={() => unstake(pool.pid, withdrawAmount, pool.stakeTokenDecimals ?? 18)}
              onHarvest={() => harvest(pool.pid)}
              onEmergencyWithdraw={() => emergencyWithdraw(pool.pid)}
              isPending={isPending}
              isConfirming={isConfirming}
              address={address}
            />
          );
        })}
      </div>
    </div>
  );
}

interface PoolCardProps {
  pool: {
    pid: number;
    stakeToken: `0x${string}`;
    allocPoint: bigint;
    totalStaked: bigint;
    stakeTokenSymbol?: string;
    stakeTokenDecimals?: number;
    weight?: number;
  };
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

function PoolCard({
  pool,
  stakedAmount,
  pendingReward,
  stakeAmount,
  withdrawAmount,
  onStakeAmountChange,
  onWithdrawAmountChange,
  onStake,
  onUnstake,
  onHarvest,
  onEmergencyWithdraw,
  isPending,
  isConfirming,
  address,
}: PoolCardProps) {
  const decimals = pool.stakeTokenDecimals ?? 18;
  const symbol = pool.stakeTokenSymbol || 'TOKEN';

  // Get user's balance of stake token
  const { data: balance } = useBalance({
    address,
    token: pool.stakeToken,
    query: { enabled: !!address },
  });

  const maxStake = balance ? Number(formatUnits(balance.value, decimals)) : 0;
  const maxWithdraw = stakedAmount > 0n ? Number(formatUnits(stakedAmount, decimals)) : 0;

  // Check approval for staking
  const { needsApproval, approve, isApproving } = useStakingTokenApproval(
    pool.stakeToken,
    stakeAmount,
    decimals
  );

  const formattedTotalStaked = pool.totalStaked > 0n ? formatUnits(pool.totalStaked, decimals) : '0';
  const formattedStaked = stakedAmount > 0n ? formatUnits(stakedAmount, decimals) : '0';
  const formattedPending = pendingReward > 0n ? formatUnits(pendingReward, 18) : '0'; // Assuming reward token has 18 decimals

  return (
    <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 hover:border-[#C9A36A]/35 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-xl font-bold text-[#C9A36A] tracking-[0.03em]">
            Pool #{pool.pid} - {symbol}
          </h4>
          {pool.weight !== undefined && (
            <p className="text-xs text-gray-500 mt-1">Weight: {(pool.weight * 100).toFixed(2)}%</p>
          )}
        </div>
      </div>

      {/* Stats */}
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

      {/* Stake Section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-white text-sm font-semibold">Stake ({symbol})</label>
          {maxStake > 0 && (
            <button
              onClick={() => onStakeAmountChange(maxStake.toString())}
              className="text-xs text-[#C9A36A] hover:text-[#b8935f] transition-colors font-medium"
            >
              MAX: {maxStake.toFixed(6)}
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.0001"
            value={stakeAmount}
            onChange={(e) => onStakeAmountChange(e.target.value)}
            placeholder="0.0"
            className="flex-1 px-3 py-2 bg-white/5 border border-[#C9A36A]/20 rounded-lg text-white text-sm focus:border-[#C9A36A]/60 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          {needsApproval ? (
            <button
              onClick={approve}
              disabled={isApproving || !stakeAmount || parseFloat(stakeAmount) <= 0}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApproving ? 'Approving...' : 'Approve'}
            </button>
          ) : (
            <button
              onClick={onStake}
              disabled={isPending || isConfirming || !stakeAmount || parseFloat(stakeAmount) <= 0 || needsApproval}
              className="px-4 py-2 bg-[#C9A36A] text-[#121212] rounded-lg text-sm font-semibold hover:bg-[#b8935f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending || isConfirming ? 'Processing...' : 'Stake'}
            </button>
          )}
        </div>
      </div>

      {/* Unstake Section */}
      {stakedAmount > 0n && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-white text-sm font-semibold">Unstake ({symbol})</label>
            {maxWithdraw > 0 && (
              <button
                onClick={() => onWithdrawAmountChange(maxWithdraw.toString())}
                className="text-xs text-[#C9A36A] hover:text-[#b8935f] transition-colors font-medium"
              >
                MAX: {maxWithdraw.toFixed(6)}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.0001"
              value={withdrawAmount}
              onChange={(e) => onWithdrawAmountChange(e.target.value)}
              placeholder="0.0"
              className="flex-1 px-3 py-2 bg-white/5 border border-[#C9A36A]/20 rounded-lg text-white text-sm focus:border-[#C9A36A]/60 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={onUnstake}
              disabled={isPending || isConfirming || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending || isConfirming ? 'Processing...' : 'Unstake'}
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {pendingReward > 0n && (
          <button
            onClick={onHarvest}
            disabled={isPending || isConfirming}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending || isConfirming ? 'Processing...' : 'Harvest'}
          </button>
        )}
        {stakedAmount > 0n && (
          <button
            onClick={onEmergencyWithdraw}
            disabled={isPending || isConfirming}
            className="px-4 py-2 bg-red-800 text-white rounded-lg text-xs font-semibold hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Emergency
          </button>
        )}
      </div>
    </div>
  );
}


