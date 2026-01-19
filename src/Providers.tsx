"use client";
import * as React from 'react';
import { AuthProvider } from './context/AuthContext';
import {
    sepolia,
    polygonAmoy,
} from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';

import { defineChain } from 'viem';

export const cintaraTestnet = defineChain({
    id: 11001,
    name: 'Cintara Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'CINT',
        symbol: 'CINT',
    },
    rpcUrls: {
        default: { http: ['https://rpc-testnet.cintara.io'] },
    },
    blockExplorers: {
        default: { name: 'Explorer', url: 'https://explorer-testnet.cintara.io' },
    },
});

const config = createConfig({
    chains: [sepolia, polygonAmoy, cintaraTestnet],
    connectors: [
        injected(),
    ],
    transports: {
        [sepolia.id]: http(),
        [polygonAmoy.id]: http(),
        [cintaraTestnet.id]: http(),
    },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
