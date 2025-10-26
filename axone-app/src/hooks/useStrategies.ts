import { useState, useEffect } from 'react';
import { Index } from '@/types/index';

export function useStrategies() {
  const [strategies, setStrategies] = useState<Index[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger toutes les stratégies depuis l'API
  const fetchStrategies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/strategies', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch strategies: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setStrategies(data.strategies || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching strategies:', err);
      // En cas d'erreur, initialiser avec un tableau vide au lieu de laisser une erreur
      setStrategies([]);
    } finally {
      setLoading(false);
    }
  };

  // Créer une nouvelle stratégie
  const createStrategy = async (strategy: Index) => {
    try {
      const response = await fetch('/api/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(strategy),
      });
      if (!response.ok) {
        throw new Error('Failed to create strategy');
      }
      const data = await response.json();
      setStrategies([...strategies, data.strategy]);
      return data.strategy;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  // Mettre à jour une stratégie
  const updateStrategy = async (strategy: Index) => {
    try {
      const response = await fetch('/api/strategies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(strategy),
      });
      if (!response.ok) {
        throw new Error('Failed to update strategy');
      }
      const data = await response.json();
      setStrategies(strategies.map(s => s.id === strategy.id ? strategy : s));
      return data.strategy;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  // Supprimer une stratégie
  const deleteStrategy = async (id: string) => {
    try {
      const response = await fetch(`/api/strategies?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete strategy');
      }
      setStrategies(strategies.filter(s => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  useEffect(() => {
    // S'assurer que nous sommes côté client
    if (typeof window !== 'undefined') {
      fetchStrategies();
    }
  }, []);

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
