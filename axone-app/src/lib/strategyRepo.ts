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

  // Filter out legacy strategies that don't have a valid `contracts` block
  const valid = (list as any[]).filter((item) => {
    const contracts = item?.contracts;
    return (
      item &&
      typeof item === "object" &&
      contracts &&
      typeof contracts === "object" &&
      typeof contracts.vaultAddress === "string" &&
      typeof contracts.handlerAddress === "string" &&
      typeof contracts.coreViewsAddress === "string" &&
      typeof contracts.l1ReadAddress === "string"
    );
  });

  if (valid.length !== list.length) {
    console.warn(
      "[strategyRepo] Ignored some legacy strategies without a `contracts` block. " +
      'Consider cleaning the "strategies:list" KV key.'
    );
  }

  return valid as Strategy[];
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
