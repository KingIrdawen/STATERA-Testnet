# Guide de Déploiement sur Vercel

## ⚠️ Problème de Stockage

Sur Vercel (environnement serverless), le système de fichiers est **en lecture seule**. Les stratégies ne peuvent pas être sauvegardées dans `data/strategies.json` de manière permanente.

## 🔧 Solutions Recommandées

### Option 1 : Vercel KV (Recommandé - Simple et Rapide)

Vercel KV est un service Redis géré par Vercel, parfait pour stocker des données JSON.

#### Installation

1. **Installer le package** :
```bash
npm install @vercel/kv
```

2. **Créer une base KV dans Vercel** :
   - Allez sur votre projet Vercel
   - Onglet "Storage" → "Create Database" → "KV"
   - Notez les variables d'environnement générées

3. **Configurer les variables d'environnement** :
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN` (optionnel)

4. **Mettre à jour `src/lib/strategies.ts`** pour utiliser Vercel KV (voir exemple ci-dessous)

### Option 2 : Vercel Postgres

Pour des données plus complexes ou des relations, utilisez Vercel Postgres.

1. **Créer une base Postgres dans Vercel**
2. **Installer le driver** : `npm install @vercel/postgres`
3. **Créer une table** pour les stratégies
4. **Adapter `src/lib/strategies.ts`** pour utiliser Postgres

### Option 3 : Base de Données Externe

- **Supabase** (Postgres gratuit)
- **MongoDB Atlas** (MongoDB gratuit)
- **PlanetScale** (MySQL serverless)

### Option 4 : Solution Temporaire (Développement uniquement)

La version actuelle utilise un stockage en mémoire qui sera **perdu à chaque redémarrage du serveur**.

Pour initialiser avec des stratégies par défaut, ajoutez une variable d'environnement :

```bash
INITIAL_STRATEGIES='[{"id":"...","name":"...",...}]'
```

## 📝 Exemple d'Implémentation avec Vercel KV

```typescript
// src/lib/strategies.ts avec Vercel KV
import { kv } from '@vercel/kv';
import { Index } from '@/types/index';

const STRATEGIES_KEY = 'strategies';

export async function getStrategies(): Promise<Index[]> {
  try {
    const strategies = await kv.get<Index[]>(STRATEGIES_KEY);
    return strategies || [];
  } catch (error) {
    console.error('Error reading strategies from KV:', error);
    return [];
  }
}

export async function saveStrategies(strategies: Index[]): Promise<void> {
  try {
    await kv.set(STRATEGIES_KEY, strategies);
  } catch (error) {
    console.error('Error saving strategies to KV:', error);
    throw error;
  }
}

// ... autres fonctions adaptées pour être async
```

**Important** : Les fonctions API routes devront être mises à jour pour utiliser `await` :

```typescript
// src/app/api/strategies/route.ts
export async function GET() {
  const strategies = await getStrategies(); // async maintenant
  return NextResponse.json(strategies);
}
```

## 🚀 Déploiement

1. **Choisir une solution de stockage** (recommandé : Vercel KV)
2. **Installer les dépendances nécessaires**
3. **Configurer les variables d'environnement dans Vercel**
4. **Adapter le code** pour utiliser la nouvelle solution
5. **Tester localement** avec les mêmes variables d'environnement
6. **Déployer sur Vercel**

## ⚠️ Notes Importantes

- Le stockage en mémoire actuel est **temporaire** et ne convient pas pour la production
- Les données seront perdues à chaque redémarrage du serveur
- Pour la production, utilisez une solution de stockage persistante (KV, Postgres, etc.)

