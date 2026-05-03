/**
 * Repository for Strategy persistence
 * Updated to use the new Strategy type
 */
import { getKv } from "./kv";
import { Strategy, StrategyInput } from "@/types/strategy";
import { toJSONSafe } from "./serializers";

const LIST_KEY = "strategies:list";

export async function getAllStrategies(): Promise<Strategy[]> {
  const kv = getKv();
  const list = await kv.get<unknown>(LIST_KEY);

  if (!Array.isArray(list)) {
    return [];
  }

  // Default contract addresses (can be overridden by env vars if needed)
  const DEFAULT_CHAIN_ID = 998;
  const DEFAULT_CORE_WRITER = '0x3333333333333333333333333333333333333333' as `0x${string}`;
  
  // Migrate legacy strategies to new format
  const migrated: Strategy[] = [];
  let migrationCount = 0;

  for (const item of list) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const contracts = item?.contracts;
    
    // Check if already in new format (v1 or v3)
    if (
      contracts &&
      typeof contracts === "object" &&
      typeof contracts.vaultAddress === "string"
    ) {
      // Already valid — keep as is (v3 vaults don't require handler/views/l1Read)
      migrated.push(item as Strategy);
      continue;
    }

    // Legacy format: has vaultAddress/handlerAddress/l1ReadAddress at root level
    const legacyVaultAddress = (item as any).vaultAddress;
    const legacyHandlerAddress = (item as any).handlerAddress;
    const legacyL1ReadAddress = (item as any).l1ReadAddress;
    const legacyCoreViewsAddress = (item as any).coreViewsAddress;
    const legacyCoreWriterAddress = (item as any).coreWriterAddress;

    if (typeof legacyVaultAddress === "string") {
      // Migrate legacy strategy
      const migratedStrategy: Strategy = {
        id: (item as any).id || crypto.randomUUID(),
        name: (item as any).name || "Unnamed Strategy",
        description: (item as any).description,
        riskLevel: (item as any).riskLevel || "low",
        status: (item as any).status || "open",
        contracts: {
          chainId: DEFAULT_CHAIN_ID,
          vaultVersion: 'v1',
          vaultAddress: legacyVaultAddress as `0x${string}`,
          handlerAddress: legacyHandlerAddress ? (legacyHandlerAddress as `0x${string}`) : undefined,
          coreViewsAddress: legacyCoreViewsAddress
            ? (legacyCoreViewsAddress as `0x${string}`)
            : process.env.NEXT_PUBLIC_CORE_VIEWS_ADDRESS
              ? (process.env.NEXT_PUBLIC_CORE_VIEWS_ADDRESS as `0x${string}`)
              : undefined,
          l1ReadAddress: legacyL1ReadAddress ? (legacyL1ReadAddress as `0x${string}`) : undefined,
          coreWriterAddress: (legacyCoreWriterAddress || DEFAULT_CORE_WRITER) as `0x${string}`,
          shareDecimals: (item as any).shareDecimals ?? 18,
          hypeDecimals: (item as any).hypeDecimals ?? 18,
          usdcDecimals: (item as any).usdcDecimals ?? 6,
          depositIsNative: (item as any).depositIsNative ?? true,
        },
      };
      migrated.push(migratedStrategy);
      migrationCount++;
    }
  }

  if (migrationCount > 0) {
    console.warn(
      `[strategyRepo] Migrated ${migrationCount} legacy strategy(ies) to new format.`
    );
    // Save migrated strategies back to KV
    await kv.set(LIST_KEY, migrated);
  }

  return migrated;
}

export async function getStrategyById(id: string): Promise<Strategy | null> {
  const list = await getAllStrategies();
  return list.find((s) => s.id === id) ?? null;
}

export async function saveStrategy(input: StrategyInput): Promise<Strategy> {
  const list = await getAllStrategies();
  const id = input.id ?? crypto.randomUUID();
  const next: Strategy = toJSONSafe({ ...input, id });

  const idx = list.findIndex((s) => s.id === id);
  if (idx >= 0) {
    list[idx] = next;
  } else {
    list.push(next);
  }
  
  const kv = getKv();
  await kv.set(LIST_KEY, list);
  return next;
}

export async function deleteStrategy(id: string): Promise<boolean> {
  const list = await getAllStrategies();
  const next = list.filter((s) => s.id !== id);
  const changed = next.length !== list.length;
  
  if (changed) {
    const kv = getKv();
    await kv.set(LIST_KEY, next);
  }
  
  return changed;
}
