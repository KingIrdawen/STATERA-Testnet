import { NextResponse } from 'next/server';
import { getRanking } from '@/lib/ranking';

// GET - Récupérer le ranking depuis la base de données
export async function GET() {
  try {
    const rankingData = getRanking();
    return NextResponse.json(rankingData);
  } catch (error) {
    console.error('Error fetching ranking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ranking' },
      { status: 500 }
    );
  }
}

