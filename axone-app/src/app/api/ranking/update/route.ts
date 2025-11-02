import { NextResponse } from 'next/server';
import { saveRanking } from '@/lib/ranking';
import { RankingEntry } from '@/types/ranking';

/**
 * Fonction pour récupérer le ranking depuis le smart contract
 * TODO: Implémenter l'appel réel au smart contract ici
 */
async function fetchRankingFromContract(): Promise<RankingEntry[]> {
  // TODO: Remplacer par l'appel réel au smart contract
  // Exemple de structure :
  /*
  import { createPublicClient, http } from 'viem';
  import { mainnet } from 'viem/chains'; // ou votre chaîne
  import { pointsContractAbi, POINTS_CONTRACT_ADDRESS } from '@/config/contracts';

  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  const rankingData = await publicClient.readContract({
    address: POINTS_CONTRACT_ADDRESS,
    abi: pointsContractAbi,
    functionName: 'getRanking', // ou la fonction appropriée
  });

  return rankingData.map((entry, index) => ({
    rank: index + 1,
    address: entry.address,
    points: entry.points.toString(),
  }));
  */

  // Pour l'instant, retourner un tableau vide
  console.warn('Smart contract not configured. Please implement fetchRankingFromContract() in app/api/ranking/update/route.ts');
  return [];
}

/**
 * POST - Mettre à jour le ranking depuis le smart contract
 * Cette route sera appelée périodiquement (toutes les heures) pour synchroniser
 * les données du ranking avec le smart contract
 * 
 * Peut être appelée via:
 * - Cron job externe
 * - Vercel Cron Jobs
 * - Tâche planifiée système
 */
export async function POST() {
  try {
    const rankingData: RankingEntry[] = await fetchRankingFromContract();
    
    if (rankingData.length === 0) {
      return NextResponse.json(
        { 
          error: 'Smart contract not configured yet or no ranking data available. Please configure the ranking contract first.',
          warning: 'See README-RANKING-UPDATE.md for configuration instructions'
        },
        { status: 501 } // Not Implemented
      );
    }

    saveRanking(rankingData);
    
    return NextResponse.json({ 
      success: true, 
      entriesCount: rankingData.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating ranking:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update ranking from smart contract',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

