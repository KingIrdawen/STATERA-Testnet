/**
 * Zod schema for Strategy validation
 * Updated for ERA generic model - no token IDs or token arrays required
 * Composition is determined on-chain by the handler
 */
import { z } from "zod";

const StrategyContractsSchema = z.object({
  chainId: z.number().default(998),
  vaultAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address"),
  handlerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address"),
  coreViewsAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address"),
  l1ReadAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address"),
  coreWriterAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address").default("0x3333333333333333333333333333333333333333"),
  usdcAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address").optional(),
  shareDecimals: z.number().default(18),
  hypeDecimals: z.number().default(18),
  usdcDecimals: z.number().default(6),
  depositIsNative: z.boolean().default(true),
});

export const StrategyInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  status: z.enum(['open', 'paused', 'closed']).optional(),
  contracts: StrategyContractsSchema,
});

export type StrategyInputDTO = z.infer<typeof StrategyInputSchema>;
