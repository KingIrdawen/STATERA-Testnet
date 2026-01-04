/**
 * Safe Ethereum provider access
 * Prevents crashes when multiple wallet extensions try to set window.ethereum
 */

/**
 * Safely get the Ethereum provider without modifying window.ethereum
 * If multiple providers exist, prefer MetaMask, otherwise use the first one
 */
export function getSafeEthereumProvider(): any {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const injected = (window as any).ethereum;
    
    if (!injected) {
      return undefined;
    }

    // If multiple providers exist (e.g., MetaMask + Coinbase Wallet)
    if (injected.providers && Array.isArray(injected.providers)) {
      // Prefer MetaMask if available
      const metaMask = injected.providers.find((p: any) => p.isMetaMask);
      if (metaMask) {
        return metaMask;
      }
      // Otherwise use the first provider
      return injected.providers[0];
    }

    // Single provider
    return injected;
  } catch (error) {
    // Silently fail if accessing window.ethereum throws
    console.warn('[safeEthereum] Error accessing window.ethereum:', error);
    return undefined;
  }
}

/**
 * Check if window.ethereum is available (read-only check)
 */
export function hasEthereumProvider(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return !!(window as any).ethereum;
  } catch {
    return false;
  }
}

