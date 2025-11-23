import { useState, useEffect, useCallback } from 'react';
import { Index } from '@/types/index';

export function useStrategies() {
  const [strategies, setStrategies] = useState<Index[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger toutes les stratégies depuis l'API
  const fetchStrategies = useCallback(async () => {
    // S'assurer que nous sommes côté client
    if (typeof window === 'undefined') {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Construire l'URL - utiliser l'URL absolue si possible
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/api/strategies`;
      
      // Utiliser un timeout pour éviter les appels qui traînent
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 secondes timeout (réduit pour accélérer)
      
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'force-cache', // Utiliser le cache pour accélérer le chargement
          next: { revalidate: 60 }, // Revalider toutes les 60 secondes
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
        // Accepter soit data.strategies soit data directement (si c'est un tableau)
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
      // Ne logger l'erreur que si c'est une erreur critique (pas juste un timeout ou réseau)
      if (err instanceof Error && !err.message.includes('timeout') && !err.message.includes('Failed to fetch')) {
        console.error('Error fetching strategies:', err);
      }
      // En cas d'erreur, initialiser avec un tableau vide pour ne pas bloquer l'interface
      setStrategies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer une nouvelle stratégie
  const createStrategy = async (strategy: Index) => {
    if (typeof window === 'undefined') {
      throw new Error('Cannot create strategy on server side');
    }

    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/strategies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(strategy),
        cache: 'no-store', // Forcer le rechargement sans cache
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create strategy');
      }
      const data = await response.json();
      // Re-fetch immédiatement sans cache pour s'assurer que les données sont à jour
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      try {
        const refreshResponse = await fetch(`${baseUrl}/api/strategies`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store', // Pas de cache pour forcer le rechargement
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const strategiesList = Array.isArray(refreshData) ? refreshData : (refreshData.strategies || []);
          setStrategies(strategiesList);
        }
      } catch (_refreshErr) {
        clearTimeout(timeoutId);
        // Si le refresh échoue, on fait quand même un fetchStrategies normal
        await fetchStrategies();
      }
      return data.strategy || strategy;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error creating strategy:', err);
      throw err;
    }
  };

  // Mettre à jour une stratégie
  const updateStrategy = async (strategy: Index) => {
    if (typeof window === 'undefined') {
      throw new Error('Cannot update strategy on server side');
    }

    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/strategies`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(strategy),
        cache: 'no-store', // Forcer le rechargement sans cache
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update strategy');
      }
      const data = await response.json();
      // Re-fetch immédiatement sans cache pour s'assurer que les données sont à jour
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      try {
        const refreshResponse = await fetch(`${baseUrl}/api/strategies`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store', // Pas de cache pour forcer le rechargement
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const strategiesList = Array.isArray(refreshData) ? refreshData : (refreshData.strategies || []);
          setStrategies(strategiesList);
        }
      } catch (_refreshErr) {
        clearTimeout(timeoutId);
        // Si le refresh échoue, on fait quand même un fetchStrategies normal
        await fetchStrategies();
      }
      return data.strategy || strategy;
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
      const response = await fetch(`${baseUrl}/api/strategies?id=${id}`, {
        method: 'DELETE',
        cache: 'no-store', // Forcer le rechargement sans cache
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete strategy');
      }
      // Re-fetch immédiatement sans cache pour s'assurer que les données sont à jour
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      try {
        const refreshResponse = await fetch(`${baseUrl}/api/strategies`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store', // Pas de cache pour forcer le rechargement
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const strategiesList = Array.isArray(data) ? data : (data.strategies || []);
          setStrategies(strategiesList);
        }
      } catch (refreshErr: any) {
        clearTimeout(timeoutId);
        // Si le refresh échoue, on fait quand même un fetchStrategies normal
        await fetchStrategies();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error deleting strategy:', err);
      throw err;
    }
  };

  useEffect(() => {
    // S'assurer que nous sommes côté client et que le DOM est prêt
    if (typeof window !== 'undefined') {
      // Charger immédiatement sans délai pour accélérer
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
