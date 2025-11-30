/**
 * Hook for managing strategies
 * Updated to use the new Strategy type
 */
import { useState, useEffect, useCallback } from 'react';
import type { Strategy } from '@/types/strategy';

export function useStrategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger toutes les stratégies depuis l'API
  const fetchStrategies = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/api/strategies`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'force-cache',
          next: { revalidate: 60 },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          let errorText = '';
          try {
            errorText = await response.text();
          } catch {
            errorText = 'Unknown error';
          }
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }
        
        const data = await response.json();
        const strategiesList = Array.isArray(data) ? data : (data.strategies || []);
        setStrategies(strategiesList);
        setError(null);
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        if (fetchErr instanceof Error && fetchErr.name === 'AbortError') {
          throw new Error('Request timeout: Server did not respond');
        }
        throw fetchErr;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch strategies';
      setError(errorMessage);
      if (err instanceof Error && !err.message.includes('timeout') && !err.message.includes('Failed to fetch')) {
        console.error('Error fetching strategies:', err);
      }
      setStrategies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer une nouvelle stratégie
  const createStrategy = async (strategy: Strategy) => {
    if (typeof window === 'undefined') {
      throw new Error('Cannot create strategy on server side');
    }

    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/strategies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(strategy),
        cache: 'no-store',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create strategy');
      }
      const data = await response.json();
      await fetchStrategies();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error creating strategy:', err);
      throw err;
    }
  };

  // Mettre à jour une stratégie
  const updateStrategy = async (strategy: Strategy) => {
    if (typeof window === 'undefined') {
      throw new Error('Cannot update strategy on server side');
    }

    if (!strategy.id) {
      throw new Error('Strategy ID is required for update');
    }

    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/strategies/${strategy.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(strategy),
        cache: 'no-store',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update strategy');
      }
      const data = await response.json();
      await fetchStrategies();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error updating strategy:', err);
      throw err;
    }
  };

  // Supprimer une stratégie
  const deleteStrategy = async (id: string) => {
    if (typeof window === 'undefined') {
      throw new Error('Cannot delete strategy on server side');
    }

    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/strategies/${id}`, {
        method: 'DELETE',
        cache: 'no-store',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete strategy');
      }
      await fetchStrategies();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error deleting strategy:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchStrategies().catch(() => {
        // Erreur silencieuse - le hook gère déjà l'état d'erreur
      });
    }
  }, [fetchStrategies]);

  return {
    strategies,
    loading,
    error,
    fetchStrategies,
    createStrategy,
    updateStrategy,
    deleteStrategy,
  };
}
