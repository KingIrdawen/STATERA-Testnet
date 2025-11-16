'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import { useState } from 'react';
import ConsoleErrorFilter from './ConsoleErrorFilter';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Optimisations pour accélérer le chargement
        retry: 0, // Pas de retry par défaut - accélère le chargement initial
        staleTime: 1000 * 60 * 5, // 5 minutes - augmenté pour réduire les appels
        gcTime: 1000 * 60 * 10, // 10 minutes de cache - augmenté
        refetchOnWindowFocus: false, // Ne pas refetch quand on revient sur la fenêtre
        refetchOnReconnect: false, // Ne pas refetch automatiquement après reconnexion
        refetchOnMount: false, // Ne pas refetch au montage si les données sont en cache
        // Logger les erreurs RPC pour le débogage
        onError: (error) => {
          // Logger toutes les erreurs RPC pour diagnostiquer le problème
          if (error && typeof error === 'object' && 'message' in error) {
            const errorMessage = String(error.message);
            // Logger les erreurs "Failed to fetch" pour le débogage RPC
            if (errorMessage.includes('Failed to fetch') || errorMessage.includes('HTTP request failed')) {
              console.warn('[RPC Error]', {
                message: errorMessage,
                url: errorMessage.includes('rpc-testnet.hyperliquid.xyz') ? 'https://rpc-testnet.hyperliquid.xyz/evm' : 'unknown',
                suggestion: 'Vérifiez que le RPC est accessible et que CORS est configuré correctement',
              });
            } else if (!errorMessage.includes('timeout')) {
              console.error('Query error:', error);
            }
          }
        },
      },
    },
  }));

  return (
    <>
      <ConsoleErrorFilter />
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: '#fab062',
              accentColorForeground: '#000000',
              borderRadius: 'large',
              fontStack: 'system',
              overlayBlur: 'small',
            })}
          >
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}