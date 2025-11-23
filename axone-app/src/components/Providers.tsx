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
// IMPORTANT: onError n'est PAS supporté dans defaultOptions.queries en React Query v5

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    // Configuration React Query v5 - onError n'est PAS supporté dans defaultOptions.queries
    return new QueryClient({
      defaultOptions: {
        queries: {
          retry: 2,
          refetchOnMount: false,
          refetchOnWindowFocus: false,
          staleTime: 30_000,
          gcTime: 5 * 60 * 1000,
          // Note: onError doit être défini dans chaque useQuery individuel, pas ici
        },
      },
    });
  });

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