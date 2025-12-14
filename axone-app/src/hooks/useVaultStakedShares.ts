/**
 * Hook to get staked shares for a specific vault address
 * Returns shares staked in RewardsHub for the given vault
 */
import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useReadContract } from 'wagmi';
import { rewardsHubContract, REWARDS_HUB_ADDRESS } from '@/contracts/rewardsHub';
import { useStakingPools } from './useStakingPools';
import type { Address } from 'viem';

export interface VaultStakedShares {
  sharesStaked: bigint;
  pid: number | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Get staked shares for a vault address
 * @param vaultAddress The vault address (share token address)
 */
export function useVaultStakedShares(vaultAddress: Address | undefined): VaultStakedShares {
  const { address } = useAccount();
  const { pools, isLoading: poolsLoading } = useStakingPools();

  // Find the pool ID for this vault address
  const poolForVault = useMemo(() => {
    if (!vaultAddress || pools.length === 0) {
      return null;
    }
    return pools.find((pool) => pool.stakeToken.toLowerCase() === vaultAddress.toLowerCase()) ?? null;
  }, [vaultAddress, pools]);

  // Read userInfo for this pool
  const { data: userInfoData, isLoading: userInfoLoading } = useReadContract({
    ...rewardsHubContract(),
    functionName: 'userInfo',
    args: poolForVault ? [BigInt(poolForVault.pid), address!] : undefined,
    query: {
      enabled: !!REWARDS_HUB_ADDRESS && !!address && !!poolForVault,
    },
  });

  const sharesStaked = useMemo(() => {
    if (!userInfoData) {
      return 0n;
    }
    const [amount] = userInfoData as [bigint, bigint];
    return amount ?? 0n;
  }, [userInfoData]);

  return {
    sharesStaked,
    pid: poolForVault?.pid ?? null,
    isLoading: poolsLoading || userInfoLoading,
    error: null,
  };
}

