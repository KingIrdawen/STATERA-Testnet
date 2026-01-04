import { NextResponse } from 'next/server';
import {
  getLeaderboard,
  getUserPoints,
  getUserRank,
} from '@/server/points/pointsStore';
import { isAddress } from 'viem';

export const runtime = 'nodejs';

/**
 * GET /api/points
 * Query params:
 * - leaderboard=true&limit=...&offset=... → returns leaderboard
 * - address=0x...&days=... → returns user points
 * - rank=true&address=0x... → returns user rank
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const leaderboard = url.searchParams.get('leaderboard') === 'true';
    const address = url.searchParams.get('address');
    const rank = url.searchParams.get('rank') === 'true';
    const limitParam = url.searchParams.get('limit');
    const offsetParam = url.searchParams.get('offset');
    const daysParam = url.searchParams.get('days');

    // Leaderboard request
    if (leaderboard) {
      const limit = limitParam ? parseInt(limitParam, 10) : 100;
      const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

      if (isNaN(limit) || limit < 1 || limit > 1000) {
        return NextResponse.json(
          { error: 'Invalid limit (must be 1-1000)' },
          { status: 400 }
        );
      }

      if (isNaN(offset) || offset < 0) {
        return NextResponse.json(
          { error: 'Invalid offset (must be >= 0)' },
          { status: 400 }
        );
      }

      const leaderboardData = await getLeaderboard(limit, offset);
      return NextResponse.json({ leaderboard: leaderboardData });
    }

    // Rank request
    if (rank && address) {
      if (!isAddress(address)) {
        return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
      }

      const userRank = await getUserRank(address);
      return NextResponse.json({
        address,
        rank: userRank,
      });
    }

    // User points request
    if (address) {
      if (!isAddress(address)) {
        return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
      }

      const days = daysParam ? daysParam.split(',') : undefined;
      const userPoints = await getUserPoints(address, days);

      return NextResponse.json({
        address,
        points: userPoints,
      });
    }

    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[api/points] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

