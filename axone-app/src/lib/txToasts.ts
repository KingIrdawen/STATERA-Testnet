/**
 * Unified transaction toast system - single outcome toast only
 * Shows one toast per transaction: either success or error
 */
import { useToast } from '@/components/Toast';

export type TxStatus = 'success' | 'error';

export interface TxToastOptions {
  hash?: string;
  error?: string | Error;
  action?: string; // e.g., "Deposit", "Withdraw", "Swap", "Stake"
}

/**
 * Hook to show transaction toasts (final outcome only)
 * Usage:
 *   const { showTxToast } = useTxToasts();
 *   showTxToast('success', { hash: txHash, action: 'Deposit' });
 *   showTxToast('error', { hash: txHash, error: errorMessage, action: 'Deposit' });
 */
export function useTxToasts() {
  const { showToast } = useToast();

  const showTxToast = (status: TxStatus, options: TxToastOptions = {}) => {
    const { hash, error, action = 'Transaction' } = options;

    if (status === 'success') {
      showToast('success', `${action} confirmée`, hash);
    } else {
      const errorMessage = error instanceof Error ? error.message : (error || 'Transaction échouée');
      showToast('error', `${action} échouée: ${errorMessage}`, hash);
    }
  };

  return { showTxToast };
}
