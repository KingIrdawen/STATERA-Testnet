/**
 * Script de migration pour transférer les stratégies de strategies.json vers Vercel KV
 * 
 * Usage:
 * 1. Créer une base KV dans Vercel Dashboard
 * 2. Configurer les variables d'environnement KV_REST_API_URL et KV_REST_API_TOKEN
 * 3. Exécuter: npx tsx scripts/migrate-to-kv.ts
 */

import { kv } from '@vercel/kv';
import * as fs from 'fs';
import * as path from 'path';

const STRATEGIES_KEY = 'strategies';
const STRATEGIES_FILE = path.join(process.cwd(), 'data', 'strategies.json');

async function migrate() {
  try {
    // Lire les stratégies depuis le fichier JSON
    if (!fs.existsSync(STRATEGIES_FILE)) {
      console.error('❌ Fichier strategies.json introuvable:', STRATEGIES_FILE);
      process.exit(1);
    }

    const fileData = fs.readFileSync(STRATEGIES_FILE, 'utf-8');
    const strategies = JSON.parse(fileData);

    if (!Array.isArray(strategies)) {
      console.error('❌ Le fichier strategies.json ne contient pas un tableau');
      process.exit(1);
    }

    console.log(`📦 Migration de ${strategies.length} stratégie(s) vers Vercel KV...`);

    // Sauvegarder dans Vercel KV
    await kv.set(STRATEGIES_KEY, strategies);

    // Vérifier que les données ont bien été sauvegardées
    const saved = await kv.get<typeof strategies>(STRATEGIES_KEY);
    
    if (saved && saved.length === strategies.length) {
      console.log('✅ Migration réussie !');
      console.log(`✅ ${saved.length} stratégie(s) sauvegardée(s) dans Vercel KV`);
    } else {
      console.error('❌ Erreur lors de la vérification des données sauvegardées');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

migrate();

