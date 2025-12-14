import { useMemo } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { rewardsHubContract, REWARDS_HUB_ADDRESS } from '@/contracts/rewardsHub';
import { lpTokenAbi } from '@/lib/abi/lpToken';

export interface PoolInfo {
  pid: number;
  stakeToken: `0x${string}`;
  allocPoint: bigint;
  lastRewardTime: bigint;
  accRewardPerShare: bigint;
  totalStaked: bigint;
  stakeTokenSymbol?: string;
  stakeTokenDecimals?: number;
  weight?: number; // allocPoint / totalAllocPoint
}

export interface StakingPoolsData {
  pools: PoolInfo[];
  totalAllocPoint: bigint;
  rewardToken: `0x${string}` | null;
  isLoading: boolean;
  error: Error | null;
}

export function useStakingPools(): StakingPoolsData {
  // Check if RewardsHub is configured
  if (!REWARDS_HUB_ADDRESS) {
    return {
      pools: [],
      totalAllocPoint: 0n,
      rewardToken: null,
      isLoading: false,
      error: new Error('REWARDS_HUB_ADDRESS is not configured'),
    };
  }

  // Read poolLength
  const { data: poolLengthData, isLoading: poolLengthLoading } = useReadContract({
    ...rewardsHubContract(),
    functionName: 'poolLength',
    query: {
      enabled: !!REWARDS_HUB_ADDRESS,
    },
  });

  const poolLength = poolLengthData as bigint | undefined;
  const numPools = poolLength ? Number(poolLength) : 0;

  // Read totalAllocPoint and rewardToken
  const { data: globalData, isLoading: globalLoading } = useReadContracts({
    contracts: [
      {
        ...rewardsHubContract(),
        functionName: 'totalAllocPoint' as const,
      },
      {
        ...rewardsHubContract(),
        functionName: 'rewardToken' as const,
      },
    ],
    query: {
      enabled: !!REWARDS_HUB_ADDRESS && numPools > 0,
    },
  });

  const totalAllocPoint = (globalData?.[0]?.result as bigint | undefined) ?? 0n;
  const rewardToken = (globalData?.[1]?.result as `0x${string}` | undefined) ?? null;

  // Build contracts array for all pools
  const poolContracts = useMemo(() => {
    if (!REWARDS_HUB_ADDRESS || numPools === 0) {
      return [];
    }

    const contracts: any[] = [];

    // Read poolInfo for each pool
    for (let pid = 0; pid < numPools; pid++) {
      contracts.push({
        ...rewardsHubContract(),
        functionName: 'poolInfo' as const,
        args: [BigInt(pid)] as const,
      });
    }

    // Read token metadata for each pool's stakeToken
    // We'll need to read this after we get poolInfo results
    return contracts;
  }, [numPools]);

  const { data: poolsData, isLoading: poolsLoading } = useReadContracts({
    contracts: poolContracts,
    query: {
      enabled: poolContracts.length > 0,
    },
  });

  // Build token metadata contracts
  const poolsDataArray = Array.isArray(poolsData) ? poolsData : [];
  const tokenMetadataContracts = useMemo(() => {
    if (!poolsDataArray || poolsDataArray.length === 0) {
      return [];
    }

    const contracts: any[] = [];
    for (let i = 0; i < poolsDataArray.length; i++) {
      const poolResult = poolsDataArray[i]?.result;
      if (!poolResult) continue;

      const stakeToken = (poolResult as any[])[0] as `0x${string}`;
      if (!stakeToken) continue;

      contracts.push(
        {
          address: stakeToken,
          abi: lpTokenAbi,
          functionName: 'symbol' as const,
        },
        {
          address: stakeToken,
          abi: lpTokenAbi,
          functionName: 'decimals' as const,
        }
      );
    }
    return contracts;
  }, [poolsDataArray]);

  const { data: tokenMetadataData, isLoading: tokenMetadataLoading } = useReadContracts({
    contracts: tokenMetadataContracts,
    query: {
      enabled: tokenMetadataContracts.length > 0,
    },
  });

  // Compute pools with metadata
  const pools = useMemo(() => {
    if (!poolsDataArray || poolsDataArray.length === 0) {
      return [];
    }

    const results: PoolInfo[] = [];
    let tokenMetadataIndex = 0;

    for (let pid = 0; pid < poolsDataArray.length; pid++) {
      const poolResult = poolsDataArray[pid]?.result;
      if (!poolResult) continue;

      const [stakeToken, allocPoint, lastRewardTime, accRewardPerShare, totalStaked] = poolResult as [
        `0x${string}`,
        bigint,
        bigint,
        bigint,
        bigint,
      ];

      // Read token metadata
      const symbol = tokenMetadataData?.[tokenMetadataIndex]?.result as string | undefined;
      tokenMetadataIndex++;
      const decimals = tokenMetadataData?.[tokenMetadataIndex]?.result as number | undefined;
      tokenMetadataIndex++;

      const weight = totalAllocPoint > 0n ? Number(allocPoint) / Number(totalAllocPoint) : 0;

      results.push({
        pid,
        stakeToken,
        allocPoint,
        lastRewardTime,
        accRewardPerShare,
        totalStaked,
        stakeTokenSymbol: symbol,
        stakeTokenDecimals: decimals,
        weight,
      });
    }

    return results;
  }, [poolsDataArray, tokenMetadataData, totalAllocPoint]);

  return {
    pools,
    totalAllocPoint,
    rewardToken,
    isLoading: poolLengthLoading || globalLoading || poolsLoading || tokenMetadataLoading,
    error: null,
  };
}

