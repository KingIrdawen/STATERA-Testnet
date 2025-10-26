import { Index } from '@/types/index';
import fs from 'fs';
import path from 'path';

const STRATEGIES_FILE = path.join(process.cwd(), 'data', 'strategies.json');

// Créer le dossier data s'il n'existe pas
export function ensureStrategiesFile() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(STRATEGIES_FILE)) {
    fs.writeFileSync(STRATEGIES_FILE, JSON.stringify([]));
  }
}

// Lire toutes les stratégies
export function getStrategies(): Index[] {
  ensureStrategiesFile();
  try {
    const fileData = fs.readFileSync(STRATEGIES_FILE, 'utf-8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error reading strategies:', error);
    return [];
  }
}

// Sauvegarder toutes les stratégies
export function saveStrategies(strategies: Index[]): void {
  ensureStrategiesFile();
  try {
    fs.writeFileSync(STRATEGIES_FILE, JSON.stringify(strategies, null, 2));
  } catch (error) {
    console.error('Error saving strategies:', error);
    throw error;
  }
}

// Ajouter une nouvelle stratégie
export function addStrategy(strategy: Index): void {
  const strategies = getStrategies();
  strategies.push(strategy);
  saveStrategies(strategies);
}

// Mettre à jour une stratégie existante
export function updateStrategy(id: string, updatedStrategy: Index): void {
  const strategies = getStrategies();
  const index = strategies.findIndex(s => s.id === id);
  if (index !== -1) {
    strategies[index] = updatedStrategy;
    saveStrategies(strategies);
  }
}

// Supprimer une stratégie
export function deleteStrategy(id: string): void {
  const strategies = getStrategies();
  const filtered = strategies.filter(s => s.id !== id);
  saveStrategies(filtered);
}

// Obtenir une stratégie par son ID
export function getStrategyById(id: string): Index | undefined {
  const strategies = getStrategies();
  return strategies.find(s => s.id === id);
}
