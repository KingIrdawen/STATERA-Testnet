import { NextResponse } from 'next/server';
import {
  storeDailyPoints,
  isDayProcessed,
  markDayProcessed,
} from '@/server/points/pointsStore';
import { calculateDailyPoints } from '@/server/points/pointsCalculator';
import { collectOnchainData } from '@/server/points/onchainData';
import { getPublicClient } from '@/lib/publicClient';
import { START_BLOCK } from '@/server/points/onchainData';

export const runtime = 'nodejs';

/**
 * POST /api/points/calculate
 * Cron-triggerable route to calculate and store daily points
 * 
 * Validates via Vercel cron header (x-vercel-cron) or manual secret param for testing
 * Determines "day" using UTC timezone (YYYY-MM-DD format)
 * If already processed, returns 200 with "already done"
 * Otherwise computes points, stores in Redis, updates leaderboard
 */
export async function POST(req: Request) {
  try {
    // Validate authentication
    // Priority 1: Vercel cron header (most secure, no secret in URL)
    const vercelCronHeader = req.headers.get('x-vercel-cron');
    const isVercelCron = vercelCronHeader === '1';

    // Priority 2: Manual secret param (for testing/debugging)
    const url = new URL(req.url);
    const secretParam = url.searchParams.get('secret');

    let isAuthorized = false;

    if (isVercelCron) {
      // Vercel cron request - automatically authorized
      isAuthorized = true;
    } else if (secretParam) {
      // Manual secret for testing
      const expectedSecret = process.env.CRON_SECRET;
      if (!expectedSecret) {
        return NextResponse.json(
          { error: 'CRON_SECRET not configured' },
          { status: 500 }
        );
      }
      isAuthorized = secretParam === expectedSecret;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Determine day (UTC, YYYY-MM-DD format)
    const now = new Date();
    const day = now.toISOString().split('T')[0]; // e.g., "2024-01-15"

    // Check if already processed
    if (await isDayProcessed(day)) {
      return NextResponse.json({
        success: true,
        message: 'Already processed',
        day,
      });
    }

    // Get current block number
    const publicClient = getPublicClient();
    const toBlock = await publicClient.getBlockNumber();

    // Collect on-chain data
    console.log(`[points/calculate] Collecting on-chain data from block ${START_BLOCK} to ${toBlock}...`);
    const { activities, referralRelations } = await collectOnchainData(
      START_BLOCK,
      toBlock
    );

    console.log(`[points/calculate] Found ${activities.length} active addresses`);

    // Calculate points
    console.log(`[points/calculate] Calculating points for day ${day}...`);
    const results = await calculateDailyPoints(activities, referralRelations);

    // Store results
    console.log(`[points/calculate] Storing ${results.length} point results...`);
    await storeDailyPoints(day, results);

    // Mark as processed
    await markDayProcessed(day);

    const totalPoints = results.reduce((sum, r) => sum + r.totalPoints, 0);

    return NextResponse.json({
      success: true,
      day,
      addresses: results.length,
      totalPoints,
      fromBlock: START_BLOCK.toString(),
      toBlock: toBlock.toString(),
    });
  } catch (error) {
    console.error('[points/calculate] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

