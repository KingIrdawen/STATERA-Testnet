/**
 * Hook to fetch TOKEN1 metadata (symbol/name) from on-chain data
 * Reads token1CoreTokenId from handler, then tokenInfo from L1Read
 */
import { useReadContract } from 'wagmi';
import type { Strategy } from '@/types/strategy';
import { getStrategyContracts } from '@/lib/strategyContracts';

export interface TokenMeta {
  symbol?: string;
  name?: string;
  decimals?: number;
  loading: boolean;
  error: Error | null;
}

export function useStrategyToken1Meta(strategy: Strategy | null): TokenMeta {
  // Get contracts
  const contracts = strategy ? getStrategyContracts(strategy) : null;
  const handler = contracts?.handler;
  const l1Read = contracts?.l1Read;

  // Step 1: Read TOKEN1's Core token ID from handler
  const token1Id = useReadContract({
    ...handler,
    functionName: 'spotTokenTOKEN1',
    query: {
      enabled: !!handler && !!strategy,
    },
  });

  // Step 2: Read token metadata from L1Read (only when token1Id is available)
  // Note: tokenInfo takes uint32, but spotTokenTOKEN1 returns uint64, so we need to convert
  const tokenInfo = useReadContract({
    ...l1Read,
    functionName: 'tokenInfo',
    args: token1Id.data ? [Number(token1Id.data)] : undefined,
    query: {
      enabled: !!l1Read && !!token1Id.data,
    },
  });

  const loading = token1Id.isLoading || tokenInfo.isLoading;
  const error = (token1Id.error || tokenInfo.error) as Error | null;

  if (!tokenInfo.data) {
    return {
      symbol: undefined,
      name: undefined,
      decimals: undefined,
      loading,
      error,
    };
  }

  // tokenInfo.data is a tuple with named fields
  const info = tokenInfo.data as {
    name: string;
    spots: bigint[];
    deployerTradingFeeShare: bigint;
    deployer: `0x${string}`;
    evmContract: `0x${string}`;
    szDecimals: number;
    weiDecimals: number;
    evmExtraWeiDecimals: number;
  };

  // Extract symbol from name (e.g., "Bitcoin" -> "BTC" or use name as-is)
  // For now, we'll use the name directly, or try to extract a symbol
  // If evmContract is set, we could fetch ERC20 symbol, but for now use name
  const symbol = info.name ? extractSymbolFromName(info.name) : undefined;

  return {
    symbol: symbol || info.name,
    name: info.name,
    decimals: info.weiDecimals != null ? Number(info.weiDecimals) : undefined,
    loading,
    error,
  };
}

/**
 * Helper to extract a symbol from a token name
 * Examples: "Bitcoin" -> "BTC", "Ethereum" -> "ETH"
 * Falls back to first 4 uppercase letters or the name itself
 */
function extractSymbolFromName(name: string): string | undefined {
  if (!name) return undefined;

  // Common mappings
  const mappings: Record<string, string> = {
    bitcoin: 'BTC',
    ethereum: 'ETH',
    usdc: 'USDC',
    usdt: 'USDT',
    hype: 'HYPE',
  };

  const lowerName = name.toLowerCase();
  if (mappings[lowerName]) {
    return mappings[lowerName];
  }

  // If name is already short and uppercase, use it
  if (name.length <= 6 && name === name.toUpperCase()) {
    return name;
  }

  // Try to extract acronym from words
  const words = name.split(/\s+/);
  if (words.length > 1) {
    const acronym = words.map(w => w[0]?.toUpperCase() || '').join('');
    if (acronym.length >= 2 && acronym.length <= 6) {
      return acronym;
    }
  }

  // Fallback: return undefined to use name instead
  return undefined;
}

