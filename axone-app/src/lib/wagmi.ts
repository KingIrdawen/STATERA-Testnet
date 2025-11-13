import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// Configuration de la chaîne HyperEVM Testnet
export const hyperevmTestnet = defineChain({
  id: 998,
  name: 'HyperEVM Testnet',
  nativeCurrency: {
    name: 'HYPE',
    symbol: 'HYPE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.hyperliquid.xyz/evm'],
      webSocket: undefined, // Pas de WebSocket pour l'instant
    },
    public: {
      http: ['https://rpc-testnet.hyperliquid.xyz/evm'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Hyperscan Testnet',
      url: 'https://hyperscan-testnet.hyperliquid.xyz',
    },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'Statera',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID', // Vous devrez obtenir un Project ID depuis https://cloud.walletconnect.com
  chains: [hyperevmTestnet],
  ssr: true, // Si votre dApp utilise le rendu côté serveur (SSR)
});