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
        // Ne pas logger les erreurs réseau non critiques
        onError: (error) => {
          // Ne logger que les erreurs critiques (pas les erreurs réseau normales)
          if (error && typeof error === 'object' && 'message' in error) {
            const errorMessage = String(error.message);
            if (!errorMessage.includes('Failed to fetch') && !errorMessage.includes('timeout')) {
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