// FIX: swap hypeIn/value consistency + tx toast notifications
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
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              px-4 py-3 rounded-lg shadow-lg border min-w-[300px] max-w-[400px]
              ${toast.type === 'success' 
                ? 'bg-green-900/90 border-green-600 text-green-100' 
                : 'bg-red-900/90 border-red-600 text-red-100'
              }
              animate-in slide-in-from-right
            `}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {toast.type === 'success' ? '✓ Swap confirmé' : '✗ Swap échoué'}
                </p>
                <p className="text-xs mt-1 opacity-90">{toast.message}</p>
                {toast.hash && (
                  <p className="text-xs mt-1 font-mono opacity-75">
                    {toast.hash.slice(0, 6)}...{toast.hash.slice(-4)}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
          </div>
        ))}
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

