/**
 * Hook pour lire les données on-chain d'un SwapPool :
 * réserves, adresse LP token, balances LP de l'utilisateur, total supply LP.
 */
import { useAccount, useReadContracts, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { swapPool, lpToken } from '@/contracts/swapContracts';
import { lpTokenAbi } from '@/lib/abi/lpToken';

const QUERY_OPTIONS = {
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchInterval: false as const,
  retry: 2,
  retryDelay: (i: number) => Math.min(1000 * 2 ** i, 8000),
};

export interface SwapPoolData {
  loading: boolean;
  error: Error | null;
  hypeReserve: bigint | undefined;
  vaultTokenReserve: bigint | undefined;
  hypeReserveFormatted: number | undefined;
  vaultTokenReserveFormatted: number | undefined;
  lpTokenAddress: `0x${string}` | undefined;
  lpTotalSupply: bigint | undefined;
  lpBalance: bigint | undefined;                // LP tokens du user
  lpBalanceFormatted: number | undefined;       // lisible (18 dec)
  lpShare: number | undefined;                  // % de la pool
  // Montants récupérables si on retire tout
  withdrawableHype: number | undefined;
  withdrawableVaultToken: number | undefined;
}

export function useSwapPool(
  poolAddress: `0x${string}` | undefined,
  shareDecimals = 18
): SwapPoolData {
  const { address: userAddress } = useAccount();

  const poolContract = poolAddress ? swapPool(poolAddress) : null;

  // ─── Étape 1 : lire poolAddress pour récupérer lpTokenAddress ────────────
  const { data: step1, isLoading: step1Loading, error: step1Error } = useReadContracts({
    contracts: poolContract
      ? [
          { ...poolContract, functionName: 'getReserves' as const },
          { ...poolContract, functionName: 'lpToken' as const },
        ]
      : [],
    query: { ...QUERY_OPTIONS, enabled: !!poolAddress },
  });

  const rawReserves = step1?.[0]?.result as readonly [bigint, bigint] | undefined;
  const hypeReserve = rawReserves?.[0];
  const vaultTokenReserve = rawReserves?.[1];
  const lpTokenAddress = step1?.[1]?.result as `0x${string}` | undefined;

  const lpContract = lpTokenAddress ? lpToken(lpTokenAddress) : null;

  // ─── Étape 2a : totalSupply du LP token ──────────────────────────────────
  const { data: lpTotalSupply, isLoading: tsLoading, error: tsError } = useReadContract({
    ...(lpContract ?? { address: undefined as any, abi: lpTokenAbi }),
    functionName: 'totalSupply' as const,
    query: { ...QUERY_OPTIONS, enabled: !!lpTokenAddress },
  });

  // ─── Étape 2b : balance LP de l'utilisateur ──────────────────────────────
  const { data: lpBalance, isLoading: balLoading, error: balError } = useReadContract({
    ...(lpContract ?? { address: undefined as any, abi: lpTokenAbi }),
    functionName: 'balanceOf' as const,
    args: userAddress ? [userAddress] : undefined,
    query: { ...QUERY_OPTIONS, enabled: !!lpTokenAddress && !!userAddress },
  });

  // ─── Calculs dérivés ─────────────────────────────────────────────────────
  const hypeReserveFormatted = hypeReserve !== undefined
    ? Number(formatUnits(hypeReserve, 18))
    : undefined;

  const vaultTokenReserveFormatted = vaultTokenReserve !== undefined
    ? Number(formatUnits(vaultTokenReserve, shareDecimals))
    : undefined;

  const lpBalanceFormatted = lpBalance !== undefined
    ? Number(formatUnits(lpBalance, 18))
    : undefined;

  const lpShare = lpBalance !== undefined && lpTotalSupply !== undefined && lpTotalSupply > 0n
    ? Number(lpBalance) / Number(lpTotalSupply)
    : undefined;

  const withdrawableHype = lpShare !== undefined && hypeReserveFormatted !== undefined
    ? lpShare * hypeReserveFormatted
    : undefined;

  const withdrawableVaultToken = lpShare !== undefined && vaultTokenReserveFormatted !== undefined
    ? lpShare * vaultTokenReserveFormatted
    : undefined;

  return {
    loading: step1Loading || tsLoading || balLoading,
    error: (step1Error || tsError || balError) as Error | null,
    hypeReserve,
    vaultTokenReserve,
    hypeReserveFormatted,
    vaultTokenReserveFormatted,
    lpTokenAddress,
    lpTotalSupply,
    lpBalance,
    lpBalanceFormatted,
    lpShare,
    withdrawableHype,
    withdrawableVaultToken,
  };
}
