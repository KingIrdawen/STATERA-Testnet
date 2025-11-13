# Guide : Mise à jour automatique du Ranking

Le système de ranking utilise une base de données locale (`data/ranking.json`) qui est mise à jour périodiquement depuis le smart contract pour améliorer les performances.

## Architecture

1. **Base de données locale** : `data/ranking.json`
   - Stocke les données du ranking avec un timestamp de dernière mise à jour
   - Permet un affichage instantané sans appel au smart contract

2. **Hook `useRanking`** : Lit depuis `/api/ranking`
   - Affiche les données de la base de données locale
   - Pas d'appel direct au smart contract depuis le frontend

3. **Script de mise à jour** : `scripts/update-ranking.ts`
   - Récupère les données depuis le smart contract
   - Met à jour la base de données locale
   - Doit être exécuté toutes les heures

## Configuration

### 1. Configurer le smart contract

Avant de pouvoir mettre à jour le ranking, il faut configurer l'appel au smart contract dans `scripts/update-ranking.ts` :

```typescript
// Dans fetchRankingFromContract()
// 1. Importer les dépendances nécessaires
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains'; // ou votre chaîne

// 2. Créer le client public
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

// 3. Appeler la fonction du smart contract
const rankingData = await publicClient.readContract({
  address: POINTS_CONTRACT_ADDRESS,
  abi: pointsContractAbi,
  functionName: 'getRanking', // ou la fonction appropriée
});

// 4. Transformer les données en format RankingEntry[]
return rankingData.map((entry, index) => ({
  rank: index + 1,
  address: entry.address,
  points: entry.points.toString(),
}));
```

### 2. Automatiser la mise à jour

#### Option A : Cron Job (Linux/Mac)

Ajouter une ligne dans le crontab :

```bash
# Mettre à jour le ranking toutes les heures
0 * * * * cd /path/to/statera-app && npm run update-ranking
```

Dans `package.json`, ajouter :

```json
{
  "scripts": {
    "update-ranking": "tsx scripts/update-ranking.ts"
  }
}
```

#### Option B : Vercel Cron Jobs

Créer un fichier `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/ranking/update",
      "schedule": "0 * * * *"
    }
  ]
}
```

Puis implémenter l'appel au smart contract directement dans `app/api/ranking/update/route.ts`.

#### Option C : Service externe (ex: GitHub Actions, Cloud Functions)

Configurer un service qui appelle `/api/ranking/update` toutes les heures.

## API Endpoints

### GET `/api/ranking`
Récupère le ranking depuis la base de données locale.

**Réponse :**
```json
{
  "entries": [
    {
      "rank": 1,
      "address": "0x...",
      "points": "1000000"
    }
  ],
  "lastUpdate": "2024-01-01T12:00:00.000Z"
}
```

### POST `/api/ranking/update`
Met à jour le ranking depuis le smart contract.

**Réponse :**
```json
{
  "success": true,
  "entriesCount": 150,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Utilisation

Une fois configuré :

1. Le script de mise à jour s'exécute automatiquement toutes les heures
2. Les utilisateurs voient les données mises à jour depuis la base de données locale
3. Aucun appel au smart contract depuis le frontend, seulement depuis le backend
4. Affichage instantané du ranking

## Notes

- Le ranking est mis à jour toutes les heures pour équilibrer fraîcheur des données et performance
- Si le script échoue, les anciennes données restent affichées
- L'utilisateur peut voir la date de dernière mise à jour dans l'interface

