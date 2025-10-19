import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, arbitrum, optimism, base, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Axone',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID', // Vous devrez obtenir un Project ID depuis https://cloud.walletconnect.com
  chains: [mainnet, polygon, arbitrum, optimism, base, sepolia],
  ssr: true, // Si votre dApp utilise le rendu côté serveur (SSR)
});