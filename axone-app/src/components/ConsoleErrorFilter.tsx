'use client';

import { useEffect } from 'react';

/**
 * Composant pour filtrer les erreurs non critiques dans la console
 * Masque les erreurs Coinbase Analytics qui sont normales avec RainbowKit
 */
export default function ConsoleErrorFilter() {
  useEffect(() => {
    // Sauvegarder la fonction console.error originale
    const originalError = console.error;
    const originalWarn = console.warn;

    // Liste des patterns d'erreurs à ignorer (non critiques)
    const ignoredPatterns = [
      'cca-lite.coinbase.com',
      'Analytics SDK',
      'ERR_NAME_NOT_RESOLVED',
      'ERR_BLOCKED_BY_CLIENT',
      'Failed to fetch',
      'coinbase',
      'Cannot set property ethereum',
      'which has only a getter',
      'net::ERR_BLOCKED_BY_CLIENT',
    ];

    // Fonction pour vérifier si une erreur doit être ignorée
    const shouldIgnore = (message: string): boolean => {
      const messageStr = String(message).toLowerCase();
      return ignoredPatterns.some((pattern) =>
        messageStr.includes(pattern.toLowerCase())
      );
    };

    // Remplacer console.error
    console.error = (...args: unknown[]) => {
      const message = args.map(arg => String(arg)).join(' ');
      if (!shouldIgnore(message)) {
        originalError.apply(console, args);
      }
      // Sinon, on ignore silencieusement
    };

    // Intercepter les erreurs non gérées (window.onerror)
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      const messageStr = String(message);
      if (shouldIgnore(messageStr)) {
        return true; // Supprimer l'erreur
      }
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };

    // Intercepter les promesses rejetées non gérées
    const originalUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = ((event: PromiseRejectionEvent) => {
      const message = event.reason?.message || String(event.reason || '');
      if (shouldIgnore(message)) {
        event.preventDefault(); // Supprimer l'erreur
        return;
      }
      if (originalUnhandledRejection) {
        originalUnhandledRejection.call(window, event);
      }
    }) as typeof window.onunhandledrejection;

    // Remplacer console.warn (au cas où)
    console.warn = (...args: unknown[]) => {
      const message = args.map(arg => String(arg)).join(' ');
      if (!shouldIgnore(message)) {
        originalWarn.apply(console, args);
      }
      // Sinon, on ignore silencieusement
    };

    // Nettoyer au démontage
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.onerror = originalOnError;
      window.onunhandledrejection = originalUnhandledRejection;
    };
  }, []);

  // Ce composant ne rend rien
  return null;
}

