import { NextResponse } from 'next/server';
import { createPublicClient, http, formatUnits } from 'viem';
import { getAllStrategies } from '@/lib/strategyRepo';
import { ABIS } from '@/lib/abis';
import type { Strategy } from '@/types/strategy';

// Get RPC URL from env (same as wagmi config)
const rpcUrl = process.env.NEXT_PUBLIC_HYPEREVM_RPC_URL || 'https://hyperliquid-testnet.core.chainstack.com/98107cd968ac1c4168c442fa6b1fe200/evm';

// Create public client for server-side reads
const publicClient = createPublicClient({
  transport: http(rpcUrl),
});

// Chunk size for scanning events (100k-250k blocks)
const CHUNK_SIZE = 200_000;

// Starting block for all vaults
const FROM_BLOCK = 420000000n;

interface VaultStats {
  id: string;
  name: string;
  riskLevel: string;
  status: string;
  tvlUsd: number;
  vaultAddress: string;
  chainId: number;
}

interface LandingStatsResponse {
  vaultCount: number;
  vaultAddresses: string[];
  totalDepositCount: number;
  depositCountByVault: Record<string, number>;
  fromBlockUsed: number;
  totalDepositedUsd: number;
  vaults: VaultStats[];
}

/**
 * Read NAV (TVL) for a single vault
 */
async function getVaultTvl(vaultAddress: `0x${string}`): Promise<number> {
  try {
    const nav1e18 = await publicClient.readContract({
      address: vaultAddress,
      abi: ABIS.vault,
      functionName: 'nav1e18',
    });

    if (!nav1e18 || typeof nav1e18 !== 'bigint') {
      return 0;
    }

    // Convert from 1e18 to USD
    const navUsd = Number(formatUnits(nav1e18, 18));
    return navUsd;
  } catch (error) {
    console.error(`[landing-stats] Error reading NAV for vault ${vaultAddress}:`, error);
    return 0;
  }
}

/**
 * Scan Deposit events for a single vault with chunking
 */
async function scanDepositEvents(
  vaultAddress: `0x${string}`,
  fromBlock: bigint,
  toBlock: bigint
): Promise<number> {
  let totalCount = 0;
  let currentStart = fromBlock;

  console.log(`[landing-stats] Scanning vault ${vaultAddress} from block ${currentStart} to ${toBlock}`);

  while (currentStart <= toBlock) {
    const currentEnd = currentStart + BigInt(CHUNK_SIZE) - 1n;
    const chunkEnd = currentEnd > toBlock ? toBlock : currentEnd;

    try {
      // Extract Deposit event from ABI
      const depositEvent = ABIS.vault.find(
        (item) => item.type === 'event' && item.name === 'Deposit'
      );

      if (!depositEvent || depositEvent.type !== 'event') {
        throw new Error(`Deposit event not found in vault ABI`);
      }

      const logs = await publicClient.getLogs({
        address: vaultAddress,
        event: depositEvent,
        fromBlock: currentStart,
        toBlock: chunkEnd,
      });

      totalCount += logs.length;
      console.log(
        `[landing-stats] Vault ${vaultAddress} chunk [${currentStart}-${chunkEnd}]: ${logs.length} deposits (total so far: ${totalCount})`
      );

      // Move to next chunk
      currentStart = chunkEnd + 1n;
    } catch (error) {
      console.error(
        `[landing-stats] Error scanning chunk [${currentStart}-${chunkEnd}] for vault ${vaultAddress}:`,
        error
      );
      throw new Error(
        `Failed to scan deposit events for vault ${vaultAddress} in chunk [${currentStart}-${chunkEnd}]: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  return totalCount;
}

export async function GET() {
  try {
    // Get all strategies from repository
    const strategies = await getAllStrategies();
    console.log(`[landing-stats] Found ${strategies.length} strategies in repository`);

    // Filter valid strategies (must have vaultAddress)
    const validStrategies = strategies.filter(
      (s: Strategy) =>
        s?.contracts?.vaultAddress &&
        typeof s.contracts.vaultAddress === 'string' &&
        s.contracts.vaultAddress !== '0x0000000000000000000000000000000000000000'
    );

    if (validStrategies.length === 0) {
      console.error('[landing-stats] No vaults found in strategyRepo');
      return NextResponse.json(
        { error: 'No vaults found in strategyRepo' },
        { status: 500 }
      );
    }

    console.log(`[landing-stats] Valid vaults: ${validStrategies.length}`);
    const vaultAddresses = validStrategies.map((s: Strategy) => s.contracts.vaultAddress as string);
    console.log(`[landing-stats] Vault addresses:`, vaultAddresses);

    // Get latest block
    const latestBlock = await publicClient.getBlockNumber();
    console.log(`[landing-stats] Latest block: ${latestBlock}`);

    // Scan deposit events for each vault in parallel
    const depositCountPromises = validStrategies.map(async (strategy: Strategy) => {
      const vaultAddress = strategy.contracts.vaultAddress as `0x${string}`;
      try {
        const depositCount = await scanDepositEvents(vaultAddress, FROM_BLOCK, latestBlock);
        return { vaultAddress, depositCount };
      } catch (error) {
        console.error(`[landing-stats] Failed to scan vault ${vaultAddress}:`, error);
        throw error;
      }
    });

    const depositResults = await Promise.all(depositCountPromises);

    // Build depositCountByVault map
    const depositCountByVault: Record<string, number> = {};
    let totalDepositCount = 0;

    for (const result of depositResults) {
      depositCountByVault[result.vaultAddress] = result.depositCount;
      totalDepositCount += result.depositCount;
    }

    // Verify coherence
    if (validStrategies.length !== Object.keys(depositCountByVault).length) {
      const errorMsg = `Coherence check failed: vaultCount (${validStrategies.length}) !== depositCountByVault keys (${Object.keys(depositCountByVault).length})`;
      console.error(`[landing-stats] ${errorMsg}`);
      throw new Error(errorMsg);
    }

    // Read TVL for each vault in parallel
    const vaultStatsPromises = validStrategies.map(async (strategy: Strategy) => {
      const vaultAddress = strategy.contracts.vaultAddress as `0x${string}`;
      const tvlUsd = await getVaultTvl(vaultAddress);

      return {
        id: strategy.id,
        name: strategy.name || 'Unnamed Strategy',
        riskLevel: strategy.riskLevel || 'low',
        status: strategy.status || 'open',
        tvlUsd,
        vaultAddress,
        chainId: strategy.contracts.chainId || 998,
      };
    });

    const vaultStats = await Promise.all(vaultStatsPromises);

    // Calculate total deposited
    const totalDepositedUsd = vaultStats.reduce((sum, vault) => sum + vault.tvlUsd, 0);

    // Sort vaults by TVL descending
    vaultStats.sort((a, b) => b.tvlUsd - a.tvlUsd);

    const response: LandingStatsResponse = {
      vaultCount: validStrategies.length,
      vaultAddresses,
      totalDepositCount,
      depositCountByVault,
      fromBlockUsed: Number(FROM_BLOCK),
      totalDepositedUsd,
      vaults: vaultStats,
    };

    console.log(`[landing-stats] Response:`, {
      vaultCount: response.vaultCount,
      totalDepositCount: response.totalDepositCount,
      totalDepositedUsd: response.totalDepositedUsd,
    });

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[landing-stats] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch landing stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
