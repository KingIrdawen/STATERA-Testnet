import { Index } from '@/types/index';

// Vérifier si on est sur Vercel (environnement serverless)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

// Stockage en mémoire pour Vercel (temporaire - sera perdu au redémarrage)
let inMemoryStrategies: Index[] | null = null;

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

// Initialiser depuis la variable d'environnement ou le fichier
function initializeStrategies(): Index[] {
  // Sur Vercel, essayer d'utiliser une variable d'environnement pour les stratégies initiales
  if (isVercel) {
    // Essayer de charger depuis une variable d'environnement
    const envStrategies = process.env.INITIAL_STRATEGIES;
    if (envStrategies) {
      try {
        const parsed = JSON.parse(envStrategies);
        // Initialiser le stockage en mémoire avec ces stratégies
        if (inMemoryStrategies === null) {
          inMemoryStrategies = parsed;
        }
        return inMemoryStrategies;
      } catch (e) {
        // Ignorer les erreurs de parsing
      }
    }
    // Essayer de lire le fichier au build time (lecture seule sur Vercel)
    // Note: Sur Vercel, le fichier peut ne pas être accessible au runtime, seulement au build time
    const fs = getFs();
    const path = getPath();
    if (fs && path) {
      try {
        const STRATEGIES_FILE = path.join(process.cwd(), 'data', 'strategies.json');
        const fileData = fs.readFileSync(STRATEGIES_FILE, 'utf-8');
        const parsed = JSON.parse(fileData);
        // Initialiser le stockage en mémoire avec les stratégies du fichier
        if (inMemoryStrategies === null && Array.isArray(parsed)) {
          inMemoryStrategies = parsed;
        }
        return inMemoryStrategies || [];
      } catch (error) {
        // Le fichier n'existe pas ou n'est pas accessible - c'est normal sur Vercel au runtime
        // On continuera avec le stockage en mémoire vide ou depuis INITIAL_STRATEGIES
      }
    }
    // Sinon, utiliser le stockage en mémoire (vide au départ)
    if (inMemoryStrategies === null) {
      inMemoryStrategies = [];
    }
    return inMemoryStrategies;
  }

  // En développement/local, utiliser le fichier
  const fs = getFs();
  const path = getPath();
  if (!fs || !path) {
    // Si fs n'est pas disponible, retourner un tableau vide
    return [];
  }

  const STRATEGIES_FILE = path.join(process.cwd(), 'data', 'strategies.json');
  const dataDir = path.join(process.cwd(), 'data');
  
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(STRATEGIES_FILE)) {
      fs.writeFileSync(STRATEGIES_FILE, JSON.stringify([]));
    }
    const fileData = fs.readFileSync(STRATEGIES_FILE, 'utf-8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error reading strategies file:', error);
    return [];
  }
}

// Créer le dossier data s'il n'existe pas (uniquement en local)
export function ensureStrategiesFile() {
  if (isVercel) {
    return; // Pas de fichier sur Vercel
  }
  const fs = getFs();
  const path = getPath();
  if (!fs || !path) {
    return;
  }
  const STRATEGIES_FILE = path.join(process.cwd(), 'data', 'strategies.json');
  const dataDir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(STRATEGIES_FILE)) {
      fs.writeFileSync(STRATEGIES_FILE, JSON.stringify([]));
    }
  } catch (error) {
    // Ignorer les erreurs
  }
}

// Lire toutes les stratégies
export function getStrategies(): Index[] {
  return initializeStrategies();
}

// Sauvegarder toutes les stratégies
export function saveStrategies(strategies: Index[]): void {
  if (isVercel) {
    // Sur Vercel, stocker en mémoire uniquement
    // ⚠️ ATTENTION: Les données seront perdues au redémarrage du serveur
    // Pour une solution permanente, utilisez Vercel KV, Postgres, ou une base de données externe
    inMemoryStrategies = strategies;
    console.warn('⚠️ Strategies saved in memory only. Data will be lost on server restart.');
    console.warn('💡 Consider using Vercel KV, Postgres, or an external database for persistent storage.');
    return;
  }

  // En local, sauvegarder dans le fichier
  const fs = getFs();
  const path = getPath();
  if (!fs || !path) {
    console.warn('fs not available, strategies saved in memory only');
    return;
  }
  ensureStrategiesFile();
  try {
    const STRATEGIES_FILE = path.join(process.cwd(), 'data', 'strategies.json');
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
