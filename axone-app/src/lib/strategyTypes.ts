// axone-app/src/lib/strategyTypes.ts
// Types pour les stratégies, basés sur l'interface Index existante

export interface Token {
  symbol: string;
  name: string;
  allocation: number;
  logo: string;
  tokenId: string;
}

export type Strategy = {
  id: string;
  name: string;
  tokens: Token[];
  riskLevel: 'low' | 'medium' | 'high';
  description?: string;
  apy?: number; // APY global de la stratégie en pourcentage
  usdcAddress: string;
  vaultAddress: string;
  handlerAddress: string;
  l1ReadAddress: string;
  coreWriterAddress?: string; // Adresse CoreWriter (par défaut: 0x3333333333333333333333333333333333333333)
  // Pour les grands nombres qui pourraient être des bigint, on les garde en number/string selon le besoin
  tvl?: string; // Total Value Locked en string pour éviter les problèmes de précision
};

export type StrategyInput = Omit<Strategy, "id"> & { id?: string };

