/**
 * Unified transaction toast system for all transactions
 * Provides consistent toast notifications for submitted, confirmed, and failed transactions
 */
import { useToast } from '@/components/Toast';

export type TxStatus = 'submitted' | 'confirmed' | 'failed';

export interface TxToastOptions {
  hash?: string;
  error?: string | Error;
  action?: string; // e.g., "Deposit", "Withdraw", "Swap", "Stake"
}

/**
 * Hook to show transaction toasts
 * Usage:
 *   const { showTxToast } = useTxToasts();
 *   showTxToast('submitted', { hash: txHash, action: 'Deposit' });
 *   showTxToast('confirmed', { hash: txHash, action: 'Deposit' });
 *   showTxToast('failed', { hash: txHash, error: errorMessage, action: 'Deposit' });
 */
export function useTxToasts() {
  const { showToast } = useToast();

  const showTxToast = (status: TxStatus, options: TxToastOptions = {}) => {
    const { hash, error, action = 'Transaction' } = options;
    const shortHash = hash ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : '';

    switch (status) {
      case 'submitted':
        showToast(
          'success',
          `${action} envoyée${shortHash ? ` (${shortHash})` : ''}`,
          hash
        );
        break;

      case 'confirmed':
        showToast(
          'success',
          `${action} confirmée${shortHash ? ` (${shortHash})` : ''}`,
          hash
        );
        break;

      case 'failed':
        const errorMessage = error instanceof Error ? error.message : (error || 'Transaction échouée');
        const fullMessage = `${action} échouée: ${errorMessage}${shortHash ? `\nHash: ${shortHash}` : ''}`;
        showToast('error', fullMessage, hash);
        break;
    }
  };

  return { showTxToast };
}

