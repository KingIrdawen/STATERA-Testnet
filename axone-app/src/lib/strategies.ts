import { Index } from '@/types/index';

// Vérifier si on est sur Vercel (environnement serverless)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

// Clé pour stocker les stratégies dans Vercel KV
const STRATEGIES_KEY = 'strategies';

// Lazy load pour éviter les problèmes au build time
async function getKv() {
  if (!isVercel) return null;
  try {
    const { kv } = await import('@vercel/kv');
    return kv;
  } catch {
    return null;
  }
}

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

// Initialiser depuis Vercel KV, variable d'environnement ou le fichier
async function initializeStrategies(): Promise<Index[]> {
  // Sur Vercel, utiliser Vercel KV
  if (isVercel) {
    const kv = await getKv();
    if (kv) {
      try {
        const strategies = await kv.get<Index[]>(STRATEGIES_KEY);
        if (strategies && Array.isArray(strategies)) {
          return strategies;
        }
      } catch (error) {
        console.error('Error reading strategies from KV:', error);
      }
    }
    
    // Fallback: essayer de charger depuis une variable d'environnement
    const envStrategies = process.env.INITIAL_STRATEGIES;
    if (envStrategies) {
      try {
        const parsed = JSON.parse(envStrategies);
        if (Array.isArray(parsed)) {
          // Initialiser KV avec ces stratégies si KV est disponible
          const kv = await getKv();
          if (kv) {
            try {
              await kv.set(STRATEGIES_KEY, parsed);
            } catch (error) {
              console.error('Error initializing KV with INITIAL_STRATEGIES:', error);
            }
          }
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing INITIAL_STRATEGIES:', e);
      }
    }
    
    // Retourner un tableau vide si rien n'est disponible
    return [];
  }

  // En développement/local, utiliser le fichier
  const fs = getFs();
  const path = getPath();
  if (!fs || !path) {
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

// Lire toutes les stratégies (async maintenant)
export async function getStrategies(): Promise<Index[]> {
  return await initializeStrategies();
}

// Sauvegarder toutes les stratégies (async maintenant)
export async function saveStrategies(strategies: Index[]): Promise<void> {
  if (isVercel) {
    const kv = await getKv();
    if (kv) {
      try {
        await kv.set(STRATEGIES_KEY, strategies);
        console.log('✅ Strategies saved to Vercel KV');
        return;
      } catch (error) {
        console.error('Error saving strategies to KV:', error);
        throw error;
      }
    } else {
      console.warn('⚠️ Vercel KV not available. Strategies saved in memory only.');
      return;
    }
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

// Ajouter une nouvelle stratégie (async maintenant)
export async function addStrategy(strategy: Index): Promise<void> {
  const strategies = await getStrategies();
  strategies.push(strategy);
  await saveStrategies(strategies);
}

// Mettre à jour une stratégie existante (async maintenant)
export async function updateStrategy(id: string, updatedStrategy: Index): Promise<void> {
  const strategies = await getStrategies();
  const index = strategies.findIndex(s => s.id === id);
  if (index !== -1) {
    strategies[index] = updatedStrategy;
    await saveStrategies(strategies);
  }
}

// Supprimer une stratégie (async maintenant)
export async function deleteStrategy(id: string): Promise<void> {
  const strategies = await getStrategies();
  const filtered = strategies.filter(s => s.id !== id);
  await saveStrategies(filtered);
}

// Obtenir une stratégie par son ID (async maintenant)
export async function getStrategyById(id: string): Promise<Index | undefined> {
  const strategies = await getStrategies();
  return strategies.find(s => s.id === id);
}
