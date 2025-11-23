import { RankingEntry } from '@/types/ranking';

// Lazy load fs pour éviter les problèmes au build time
function getFs() {
  try {
    return require('fs');
  } catch {
    return null;
  }
}

function getPath() {
  try {
    return require('path');
  } catch {
    return null;
  }
}

function getRankingFile() {
  const path = getPath();
  if (!path) return null;
  return path.join(process.cwd(), 'data', 'ranking.json');
}

export interface RankingData {
  entries: RankingEntry[];
  lastUpdate: string; // ISO timestamp
}

// Créer le fichier de ranking s'il n'existe pas
export function ensureRankingFile() {
  const fs = getFs();
  const path = getPath();
  if (!fs || !path) return;
  
  const RANKING_FILE = getRankingFile();
  if (!RANKING_FILE) return;
  
  try {
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
  } catch (error) {
    // Ignorer les erreurs
  }
}

// Lire le ranking depuis le fichier
export function getRanking(): RankingData {
  const fs = getFs();
  if (!fs) {
    return {
      entries: [],
      lastUpdate: new Date().toISOString(),
    };
  }
  
  ensureRankingFile();
  const RANKING_FILE = getRankingFile();
  if (!RANKING_FILE) {
    return {
      entries: [],
      lastUpdate: new Date().toISOString(),
    };
  }
  
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
  const fs = getFs();
  if (!fs) {
    console.warn('fs not available, ranking not saved');
    return;
  }
  
  ensureRankingFile();
  const RANKING_FILE = getRankingFile();
  if (!RANKING_FILE) {
    console.warn('Could not determine ranking file path');
    return;
  }
  
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

