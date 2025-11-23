'use client';

import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import { useState } from 'react';
import ConsoleErrorFilter from './ConsoleErrorFilter';

// Note: setLogger n'existe pas dans React Query v5 (@tanstack/react-query@^5.90.5)
// Les erreurs doivent être gérées au niveau des useQuery individuels via onError dans chaque query

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // ❌ onError n'est pas supporté ici en React Query v5
        retry: 2,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        staleTime: 30_000,
        gcTime: 5 * 60 * 1000,
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