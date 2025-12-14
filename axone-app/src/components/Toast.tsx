// FIX: swap hypeIn/value consistency + tx toast notifications + truncate long messages
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  hash?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, hash?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const showToast = useCallback((type: ToastType, message: string, hash?: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, type, message, hash }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => {
          const isExpanded = expandedId === toast.id;
          const MAX_LEN = 120;
          const message = toast.message ?? '';
          const isLong = message.length > MAX_LEN;
          const displayMessage = !isLong || isExpanded
            ? message
            : message.slice(0, MAX_LEN) + '…';

          const handleHashClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (toast.hash) {
              window.open(`https://app.hyperliquid-testnet.xyz/explorer/tx/${toast.hash}`, '_blank', 'noopener,noreferrer');
            }
          };

          return (
            <div
              key={toast.id}
              className={`
                px-4 py-3 rounded-lg shadow-lg border min-w-[300px] max-w-[400px]
                ${toast.type === 'success' 
                  ? 'bg-green-900/90 border-green-600 text-green-100' 
                  : 'bg-red-900/90 border-red-600 text-red-100'
                }
                ${toast.hash ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''}
              `}
              onClick={toast.hash ? handleHashClick : undefined}
              title={toast.hash ? 'Cliquer pour voir la transaction sur Hyperliquid Explorer' : undefined}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">
                    {toast.type === 'success' ? '✓ Transaction confirmée' : '✗ Transaction échouée'}
                  </p>
                  <p
                    className={`text-xs mt-1 opacity-90 break-words ${isLong ? 'cursor-pointer' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLong) return;
                      setExpandedId((prev) => (prev === toast.id ? null : toast.id));
                    }}
                  >
                    {displayMessage}
                    {isLong && !isExpanded && (
                      <span className="ml-1 underline text-white/80 hover:text-white">
                        Voir plus
                      </span>
                    )}
                    {isLong && isExpanded && (
                      <span className="ml-1 underline text-white/80 hover:text-white">
                        Voir moins
                      </span>
                    )}
                  </p>
                  {toast.hash && (
                    <p 
                      className="text-xs mt-1 font-mono opacity-75 break-all hover:opacity-100 transition-opacity underline"
                      onClick={handleHashClick}
                    >
                      {toast.hash.slice(0, 6)}...{toast.hash.slice(-4)}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                  }}
                  className="text-white/70 hover:text-white transition-colors flex-shrink-0"
                  aria-label="Fermer"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

