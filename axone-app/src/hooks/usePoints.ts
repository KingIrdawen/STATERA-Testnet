import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';

export interface PointsData {
  total: number;
  daily?: Record<string, {
    swapPoints: number;
    lpPoints: number;
    vaultPoints: number;
    referralPoints: number;
    totalPoints: number;
  }>;
}

export interface LeaderboardEntry {
  address: string;
  points: number;
  rank: number;
}

export function usePoints() {
  const { address } = useAccount();
  const [points, setPoints] = useState<PointsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setPoints(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    async function fetchPoints() {
      try {
        const res = await fetch(`/api/points?address=${address}`);
        if (!res.ok) {
          throw new Error('Failed to fetch points');
        }

        const data = await res.json();
        if (!cancelled) {
          setPoints(data.points);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Unknown error');
          setPoints(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchPoints();

    return () => {
      cancelled = true;
    };
  }, [address]);

  return {
    points: points?.total ?? 0,
    daily: points?.daily,
    isLoading,
    error,
    address,
  };
}

export function useLeaderboard(limit: number = 100, offset: number = 0) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    async function fetchLeaderboard() {
      try {
        const res = await fetch(`/api/points?leaderboard=true&limit=${limit}&offset=${offset}`);
        if (!res.ok) {
          throw new Error('Failed to fetch leaderboard');
        }

        const data = await res.json();
        if (!cancelled) {
          setLeaderboard(data.leaderboard || []);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Unknown error');
          setLeaderboard([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [limit, offset]);

  return { leaderboard, isLoading, error };
}

export function useUserRank(address: string | undefined) {
  const [rank, setRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setRank(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    async function fetchRank() {
      try {
        const res = await fetch(`/api/points?rank=true&address=${address}`);
        if (!res.ok) {
          throw new Error('Failed to fetch rank');
        }

        const data = await res.json();
        if (!cancelled) {
          setRank(data.rank);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Unknown error');
          setRank(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchRank();

    return () => {
      cancelled = true;
    };
  }, [address]);

  return { rank, isLoading, error };
}
