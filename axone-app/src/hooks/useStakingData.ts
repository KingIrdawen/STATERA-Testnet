import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useReadContracts } from 'wagmi';
import { rewardsHubContract, REWARDS_HUB_ADDRESS } from '@/contracts/rewardsHub';
import { useStakingPools } from './useStakingPools';

export interface UserPoolData {
  pid: number;
  stakedAmount: bigint;
  pendingReward: bigint;
}

export interface StakingUserData {
  pools: UserPoolData[];
  totalPendingReward: bigint;
  totalStaked: bigint;
  isLoading: boolean;
  error: Error | null;
}

export function useStakingData(): StakingUserData {
  const { address } = useAccount();
  const { pools, isLoading: poolsLoading } = useStakingPools();

  // Build contracts array for user data
  const userContracts = useMemo(() => {
    if (!REWARDS_HUB_ADDRESS || !address || pools.length === 0) {
      return [];
    }

    const contracts: any[] = [];

    for (const pool of pools) {
      // Read userInfo
      contracts.push({
        ...rewardsHubContract(),
        functionName: 'userInfo' as const,
        args: [BigInt(pool.pid), address] as const,
      });

      // Read pendingReward
      contracts.push({
        ...rewardsHubContract(),
        functionName: 'pendingReward' as const,
        args: [BigInt(pool.pid), address] as const,
      });
    }

    return contracts;
  }, [pools, address]);

  const { data: userData, isLoading: userDataLoading } = useReadContracts({
    contracts: userContracts,
    query: {
      enabled: userContracts.length > 0,
    },
  });

  // Compute user pool data
  const userPools = useMemo(() => {
    if (!userData || userData.length === 0 || pools.length === 0) {
      return [];
    }

    const results: UserPoolData[] = [];
    let dataIndex = 0;

    for (const pool of pools) {
      const userInfoResult = userData[dataIndex++]?.result;
      const pendingRewardResult = userData[dataIndex++]?.result;

      const [stakedAmount] = (userInfoResult as [bigint, bigint] | undefined) ?? [0n, 0n];
      const pendingReward = (pendingRewardResult as bigint | undefined) ?? 0n;

      results.push({
        pid: pool.pid,
        stakedAmount,
        pendingReward,
      });
    }

    return results;
  }, [userData, pools]);

  // Compute totals
  const totalPendingReward = useMemo(() => {
    return userPools.reduce((sum, pool) => sum + pool.pendingReward, 0n);
  }, [userPools]);

  const totalStaked = useMemo(() => {
    return userPools.reduce((sum, pool) => sum + pool.stakedAmount, 0n);
  }, [userPools]);

  return {
    pools: userPools,
    totalPendingReward,
    totalStaked,
    isLoading: poolsLoading || userDataLoading,
    error: null,
  };
}

