/**
 * On-chain data collection for points calculation
 * Scans events and balances with rate-limit safe chunking
 */
import { getPublicClient } from '@/lib/publicClient';
import { getAllStrategies } from '@/lib/strategyRepo';
import { REFERRAL_REGISTRY_ADDRESS } from '@/contracts/referralRegistry';
import { referralRegistryAbi } from '@/lib/abi/referralRegistry';
import { parseAbiItem, type Address, type PublicClient } from 'viem';
import type { UserActivity, ReferralRelations } from './pointsCalculator';

export const START_BLOCK = 420000000n;
const CHUNK_SIZE = 100_000n; // Conservative chunk size to avoid 429s

/**
 * Get logs in chunks with exponential backoff on 429
 */
async function getLogsInChunks({
  address,
  event,
  args,
  fromBlock,
  toBlock,
  chunkSize = CHUNK_SIZE,
}: {
  address: Address;
  event: any; // AbiEvent from parseAbiItem
  args?: any;
  fromBlock: bigint;
  toBlock: bigint;
  chunkSize?: bigint;
}): Promise<any[]> {
  const publicClient = getPublicClient();
  const allLogs: any[] = [];
  let currentBlock = fromBlock;
  let retryCount = 0;
  const maxRetries = 5;

  while (currentBlock <= toBlock) {
    const endBlock = currentBlock + chunkSize - 1n > toBlock ? toBlock : currentBlock + chunkSize - 1n;

    try {
      const logs = await publicClient.getLogs({
        address,
        event,
        args,
        fromBlock: currentBlock,
        toBlock: endBlock,
      });

      allLogs.push(...logs);
      currentBlock = endBlock + 1n;
      retryCount = 0; // Reset retry count on success
    } catch (error: any) {
      // Handle 429 rate limit
      if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('rate limit')) {
        retryCount++;
        if (retryCount > maxRetries) {
          throw new Error(`Rate limit exceeded after ${maxRetries} retries`);
        }

        // Exponential backoff: 1s, 2s, 4s, 8s, 16s
        const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 16000);
        console.warn(`[onchainData] Rate limit hit, retrying in ${delay}ms (attempt ${retryCount}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue; // Retry same chunk
      }

      // Other errors: throw immediately
      throw error;
    }
  }

  return allLogs;
}

/**
 * Get vault shares holders and balances
 */
export async function getVaultSharesData(
  fromBlock: bigint = START_BLOCK,
  toBlock: bigint | 'latest' = 'latest'
): Promise<Map<Address, bigint>> {
  const strategies = await getAllStrategies();
  const publicClient = getPublicClient();
  const sharesMap = new Map<Address, bigint>();

  // Transfer event for ERC20 (vault shares)
  const TransferEvent = parseAbiItem(
    'event Transfer(address indexed from, address indexed to, uint256 value)'
  );

  for (const strategy of strategies) {
    const vaultAddress = strategy.contracts.vaultAddress;

    try {
      // Get all Transfer events for this vault
      const logs = await getLogsInChunks({
        address: vaultAddress,
        event: TransferEvent,
        fromBlock,
        toBlock: typeof toBlock === 'string' ? await publicClient.getBlockNumber() : toBlock,
      });

      // Track unique holders
      const holders = new Set<Address>();

      for (const log of logs) {
        const decoded = log.args;
        if (decoded.to && decoded.to !== '0x0000000000000000000000000000000000000000') {
          holders.add(decoded.to as Address);
        }
      }

      // Get current balance for each holder
      for (const holder of holders) {
        try {
          const balance = await publicClient.readContract({
            address: vaultAddress,
            abi: [
              {
                type: 'function',
                name: 'balanceOf',
                stateMutability: 'view',
                inputs: [{ name: 'account', type: 'address' }],
                outputs: [{ name: 'balance', type: 'uint256' }],
              },
            ],
            functionName: 'balanceOf',
            args: [holder],
          }) as bigint;

          if (balance > 0n) {
            const current = sharesMap.get(holder) || 0n;
            sharesMap.set(holder, current + balance);
          }
        } catch (e) {
          // Skip if balance read fails
          console.debug(`[onchainData] Failed to read balance for ${holder} in vault ${vaultAddress}:`, e);
        }
      }
    } catch (error) {
      console.error(`[onchainData] Error scanning vault ${vaultAddress}:`, error);
      // Continue with other vaults
    }
  }

  return sharesMap;
}

/**
 * Get LP token holders and balances (if swap pools exist)
 */
export async function getLpBalancesData(
  fromBlock: bigint = START_BLOCK,
  toBlock: bigint | 'latest' = 'latest'
): Promise<Map<Address, bigint>> {
  // TODO: Implement LP balance scanning if Statera has LP pools
  // For now, return empty map
  // This would require:
  // 1. Get all pools from SwapPoolFactory
  // 2. For each pool, get LP token address
  // 3. Scan Transfer events for LP token
  // 4. Get balanceOf for each holder
  return new Map<Address, bigint>();
}

/**
 * Get swap volume per user (if swap events exist)
 */
export async function getSwapVolumeData(
  fromBlock: bigint = START_BLOCK,
  toBlock: bigint | 'latest' = 'latest'
): Promise<Map<Address, bigint>> {
  // TODO: Implement swap volume tracking if Statera has swap events
  // For now, return empty map
  // This would require:
  // 1. Get all pools from SwapPoolFactory
  // 2. For each pool, scan Swap events
  // 3. Aggregate volume per user
  return new Map<Address, bigint>();
}

/**
 * Get referral relations from ReferralRegistry
 */
export async function getReferralRelations(
  fromBlock: bigint = START_BLOCK,
  toBlock: bigint | 'latest' = 'latest'
): Promise<ReferralRelations> {
  if (!REFERRAL_REGISTRY_ADDRESS) {
    return {};
  }

  const publicClient = getPublicClient();
  const relations: ReferralRelations = {};

  try {
    // CodeUsed event: event CodeUsed(bytes32 indexed codeHash, address indexed user, address indexed referrer)
    const CodeUsedEvent = parseAbiItem(
      'event CodeUsed(bytes32 indexed codeHash, address indexed user, address indexed referrer)'
    );

    const logs = await getLogsInChunks({
      address: REFERRAL_REGISTRY_ADDRESS,
      event: CodeUsedEvent,
      fromBlock,
      toBlock: typeof toBlock === 'string' ? await publicClient.getBlockNumber() : toBlock,
    });

    for (const log of logs) {
      const decoded = log.args;
      const referrer = decoded.referrer as Address;
      const user = decoded.user as Address;

      if (referrer && user && referrer !== user) {
        if (!relations[referrer]) {
          relations[referrer] = [];
        }
        // Avoid duplicates
        if (!relations[referrer].includes(user)) {
          relations[referrer].push(user);
        }
      }
    }
  } catch (error) {
    console.error('[onchainData] Error scanning referral relations:', error);
  }

  return relations;
}

/**
 * Collect all on-chain data for points calculation
 */
export async function collectOnchainData(
  fromBlock: bigint = START_BLOCK,
  toBlock: bigint | 'latest' = 'latest'
): Promise<{
  activities: UserActivity[];
  referralRelations: ReferralRelations;
}> {
  const [vaultShares, lpBalances, swapVolumes, referralRelations] = await Promise.all([
    getVaultSharesData(fromBlock, toBlock),
    getLpBalancesData(fromBlock, toBlock),
    getSwapVolumeData(fromBlock, toBlock),
    getReferralRelations(fromBlock, toBlock),
  ]);

  // Combine all unique addresses
  const allAddresses = new Set<Address>();
  vaultShares.forEach((_, addr) => allAddresses.add(addr));
  lpBalances.forEach((_, addr) => allAddresses.add(addr));
  swapVolumes.forEach((_, addr) => allAddresses.add(addr));

  // Build activities array
  const activities = Array.from(allAddresses).map((address) => ({
    address,
    swapVolume: swapVolumes.get(address),
    lpBalance: lpBalances.get(address),
    vaultShares: vaultShares.get(address),
  }));

  // Convert activities to UserActivity format
  const userActivities: UserActivity[] = activities.map((a) => ({
    address: a.address,
    swapVolume: a.swapVolume,
    lpBalance: a.lpBalance,
    vaultShares: a.vaultShares,
  }));

  return { activities: userActivities, referralRelations };
}

