/**
 * Points storage using Upstash Redis
 * Namespaced with "statera:" prefix to avoid collisions
 */
import { Redis } from '@upstash/redis';

// Initialize Redis client from environment variables
const redis = Redis.fromEnv();

const PREFIX = 'statera:points';

export interface DailyPointsResult {
  address: string;
  swapPoints: number;
  lpPoints: number;
  vaultPoints: number;
  referralPoints: number;
  totalPoints: number;
}

export interface UserPoints {
  total: number;
  daily?: Record<string, DailyPointsResult>;
}

/**
 * Store daily points for a specific day
 */
export async function storeDailyPoints(
  day: string,
  results: DailyPointsResult[]
): Promise<void> {
  // Store individual daily points per address
  for (const result of results) {
    const key = `${PREFIX}:daily:${day}:${result.address}`;
    await redis.set(key, result);
  }

  // Update total points per address and leaderboard in one pass
  for (const result of results) {
    const totalKey = `${PREFIX}:total:${result.address}`;
    const currentTotal = (await redis.get<number>(totalKey)) || 0;
    const newTotal = currentTotal + result.totalPoints;
    await redis.set(totalKey, newTotal);
    
    // Update leaderboard sorted set
    await redis.zadd(`${PREFIX}:leaderboard`, {
      score: newTotal,
      member: result.address,
    });
  }

  // Mark day as processed
  await redis.sadd(`${PREFIX}:days`, day);
}

/**
 * Get user points (total and optionally daily breakdown)
 */
export async function getUserPoints(
  address: string,
  days?: string[]
): Promise<UserPoints> {
  const totalKey = `${PREFIX}:total:${address}`;
  const total = (await redis.get<number>(totalKey)) || 0;

  const daily: Record<string, DailyPointsResult> = {};

  if (days && days.length > 0) {
    for (const day of days) {
      const key = `${PREFIX}:daily:${day}:${address}`;
      const dayData = await redis.get<DailyPointsResult>(key);
      if (dayData) {
        daily[day] = dayData;
      }
    }
  }

  return { total, daily: Object.keys(daily).length > 0 ? daily : undefined };
}

/**
 * Get leaderboard (paginated)
 */
export async function getLeaderboard(
  limit: number = 100,
  offset: number = 0
): Promise<Array<{ address: string; points: number; rank: number }>> {
  // Get top N entries (highest scores first)
  // First get members, then get scores
  const members = await redis.zrange<string[]>(
    `${PREFIX}:leaderboard`,
    offset,
    offset + limit - 1,
    {
      rev: true, // Reverse order (highest first)
    }
  );

  const leaderboard: Array<{ address: string; points: number; rank: number }> = [];

  for (let i = 0; i < members.length; i++) {
    const address = members[i];
    // Get score for this member
    const scoreResult = await redis.zscore(`${PREFIX}:leaderboard`, address);
    const score = typeof scoreResult === 'number' ? scoreResult : 0;
    
    leaderboard.push({
      address,
      points: score,
      rank: offset + i + 1,
    });
  }

  return leaderboard;
}

/**
 * Get user rank
 */
export async function getUserRank(address: string): Promise<number | null> {
  const rank = await redis.zrevrank(`${PREFIX}:leaderboard`, address);
  return rank !== null ? rank + 1 : null; // Redis ranks are 0-based
}

/**
 * Mark a day as processed
 */
export async function markDayProcessed(day: string): Promise<void> {
  await redis.sadd(`${PREFIX}:days`, day);
}

/**
 * Check if a day has been processed
 */
export async function isDayProcessed(day: string): Promise<boolean> {
  const exists = await redis.sismember(`${PREFIX}:days`, day);
  return exists === 1;
}

/**
 * Get all processed days
 */
export async function getProcessedDays(): Promise<string[]> {
  return await redis.smembers<string[]>(`${PREFIX}:days`);
}

