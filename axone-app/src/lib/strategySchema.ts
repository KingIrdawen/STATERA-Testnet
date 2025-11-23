// axone-app/src/lib/strategySchema.ts
import { z } from "zod";

const TokenSchema = z.object({
  symbol: z.string().min(1),
  name: z.string(),
  allocation: z.number().min(0).max(100),
  logo: z.string(),
  tokenId: z.string(),
});

export const StrategyInputSchema = z.object({
  id: z.string().optional(), // pour update
  name: z.string().min(1),
  description: z.string().optional(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  apy: z.number().optional(),
  tvl: z.string().optional(),
  usdcAddress: z.string().min(1),
  vaultAddress: z.string().min(1),
  handlerAddress: z.string().min(1),
  l1ReadAddress: z.string().min(1),
  coreWriterAddress: z.string().optional(),
  tokens: z.array(TokenSchema).min(1),
});

export type StrategyInputDTO = z.infer<typeof StrategyInputSchema>;

