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
    };
  }, []);

  // Ce composant ne rend rien
  return null;
}

