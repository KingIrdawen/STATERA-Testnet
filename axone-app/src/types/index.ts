export interface Token {
  symbol: string;
  name: string;
  allocation: number;
  logo: string;
  tokenId: string;
}

export interface Index {
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
}

export const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'low': return 'text-green-400';
    case 'medium': return 'text-yellow-400';
    case 'high': return 'text-red-400';
    case 'faible': return 'text-green-400'; // Support legacy
    case 'moyen': return 'text-yellow-400';
    case 'élevé': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

export const getRiskBgColor = (risk: string) => {
  switch (risk) {
    case 'low': return 'bg-green-400/20 border-green-400/30';
    case 'medium': return 'bg-yellow-400/20 border-yellow-400/30';
    case 'high': return 'bg-red-400/20 border-red-400/30';
    case 'faible': return 'bg-green-400/20 border-green-400/30'; // Support legacy
    case 'moyen': return 'bg-yellow-400/20 border-yellow-400/30';
    case 'élevé': return 'bg-red-400/20 border-red-400/30';
    default: return 'bg-gray-400/20 border-gray-400/30';
  }
};
