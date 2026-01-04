/**
 * Public client HTTP for on-chain reads
 * Independent from wallet provider to avoid window.ethereum conflicts
 */
import { createPublicClient, http, type PublicClient, defineChain } from 'viem';

// Define chain directly here to avoid importing wagmi config (which has client-only code)
const hyperevmTestnet = defineChain({
  id: 998,
  name: 'HyperEVM Testnet',
  nativeCurrency: {
    name: 'HYPE',
    symbol: 'HYPE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_HYPEREVM_RPC_URL || 'https://hyperliquid-testnet.core.chainstack.com/98107cd968ac1c4168c442fa6b1fe200/evm'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_HYPEREVM_RPC_URL || 'https://hyperliquid-testnet.core.chainstack.com/98107cd968ac1c4168c442fa6b1fe200/evm'],
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

let clientInstance: PublicClient | null = null;

/**
 * Get or create a public client for HTTP RPC reads
 * This client is independent from wallet providers and works even if window.ethereum is unavailable
 */
export function getPublicClient(): PublicClient {
  if (typeof window === 'undefined') {
    // Server-side: create a new client each time (Next.js handles cleanup)
    const rpcUrl = process.env.NEXT_PUBLIC_HYPEREVM_RPC_URL || 'https://hyperliquid-testnet.core.chainstack.com/98107cd968ac1c4168c442fa6b1fe200/evm';
    return createPublicClient({
      chain: hyperevmTestnet,
      transport: http(rpcUrl),
    });
  }

  // Client-side: reuse singleton instance
  if (!clientInstance) {
    const rpcUrl = process.env.NEXT_PUBLIC_HYPEREVM_RPC_URL || 'https://hyperliquid-testnet.core.chainstack.com/98107cd968ac1c4168c442fa6b1fe200/evm';
    clientInstance = createPublicClient({
      chain: hyperevmTestnet,
      transport: http(rpcUrl),
    });
  }

  return clientInstance;
}

