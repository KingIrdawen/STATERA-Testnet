import { RankingEntry } from '@/types/ranking';
import fs from 'fs';
import path from 'path';

const RANKING_FILE = path.join(process.cwd(), 'data', 'ranking.json');

export interface RankingData {
  entries: RankingEntry[];
  lastUpdate: string; // ISO timestamp
}

// Créer le fichier de ranking s'il n'existe pas
export function ensureRankingFile() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(RANKING_FILE)) {
    const initialData: RankingData = {
      entries: [],
      lastUpdate: new Date().toISOString(),
    };
    fs.writeFileSync(RANKING_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Lire le ranking depuis le fichier
export function getRanking(): RankingData {
  ensureRankingFile();
  try {
    const fileData = fs.readFileSync(RANKING_FILE, 'utf-8');
    const data = JSON.parse(fileData);
    return {
      entries: data.entries || [],
      lastUpdate: data.lastUpdate || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error reading ranking:', error);
    return {
      entries: [],
      lastUpdate: new Date().toISOString(),
    };
  }
}

// Sauvegarder le ranking
export function saveRanking(entries: RankingEntry[]): void {
  ensureRankingFile();
  try {
    const data: RankingData = {
      entries,
      lastUpdate: new Date().toISOString(),
    };
    fs.writeFileSync(RANKING_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving ranking:', error);
    throw error;
  }
}

// Obtenir le timestamp de la dernière mise à jour
export function getLastUpdate(): string {
  const data = getRanking();
  return data.lastUpdate;
}

