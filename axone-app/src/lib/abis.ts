/**
 * Central export for all contract ABIs
 */
import { vaultAbi } from '@/contracts/vault';
import { coreInteractionViewsAbi } from '@/contracts/coreInteractionViews';
import { coreInteractionHandlerAbi } from '@/contracts/coreInteractionHandler';
import { l1readAbi } from '@/contracts/l1read';

export const ABIS = {
  vault: vaultAbi,
  views: coreInteractionViewsAbi,
  handler: coreInteractionHandlerAbi,
  l1Read: l1readAbi,
} as const;

