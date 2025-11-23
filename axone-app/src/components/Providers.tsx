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
        retry: 2, // Retry par défaut (aligné avec les bonnes pratiques)
        staleTime: 1000 * 60 * 5, // 5 minutes - augmenté pour réduire les appels
        gcTime: 1000 * 60 * 10, // 10 minutes de cache - augmenté
        refetchOnWindowFocus: false, // Ne pas refetch quand on revient sur la fenêtre
        refetchOnReconnect: false, // Ne pas refetch automatiquement après reconnexion
        refetchOnMount: false, // Ne pas refetch au montage si les données sont en cache
        // ❌ onError retiré - non supporté en React Query v5
        // Les erreurs doivent être gérées au niveau des useQuery individuels via onError dans chaque query
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