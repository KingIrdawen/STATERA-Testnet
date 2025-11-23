# Configuration Vercel KV pour les Stratégies

## Problème

Sur Vercel, le système de fichiers est en **lecture seule**. Les stratégies stockées dans `data/strategies.json` ne peuvent pas être lues au runtime, ce qui explique pourquoi vous ne voyez pas les stratégies déployées.

## Solution : Vercel KV (Redis)

Nous utilisons maintenant **Vercel KV** (Redis géré par Vercel) pour stocker les stratégies de manière persistante.

## Configuration

### 1. Créer une base KV dans Vercel

1. Allez sur votre projet dans [Vercel Dashboard](https://vercel.com)
2. Onglet **"Storage"** → **"Create Database"** → **"KV"**
3. Donnez un nom à votre base (ex: `statera-kv`)
4. Vercel génère automatiquement les variables d'environnement

### 2. Variables d'environnement

Vercel ajoute automatiquement ces variables à votre projet :
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN` (optionnel)

**Important** : Ces variables sont déjà configurées automatiquement par Vercel, vous n'avez rien à faire !

### 3. Migrer les données existantes

Si vous avez déjà des stratégies dans `data/strategies.json`, migrez-les vers Vercel KV :

#### Option A : Via le script de migration (recommandé)

```bash
cd axone-app
npx tsx scripts/migrate-to-kv.ts
```

**Prérequis** : 
- Avoir les variables d'environnement KV configurées localement (copiez-les depuis Vercel Dashboard)
- Créer un fichier `.env.local` avec :
  ```
  KV_REST_API_URL=votre_url
  KV_REST_API_TOKEN=votre_token
  ```

#### Option B : Via variable d'environnement INITIAL_STRATEGIES

1. Copiez le contenu de `data/strategies.json`
2. Dans Vercel Dashboard → Settings → Environment Variables
3. Ajoutez une variable `INITIAL_STRATEGIES` avec le contenu JSON (en une ligne)
4. Au premier déploiement, les stratégies seront automatiquement migrées vers KV

## Fonctionnement

### En local (développement)
- Les stratégies sont stockées dans `data/strategies.json`
- Fonctionne comme avant

### Sur Vercel (production)
- Les stratégies sont stockées dans Vercel KV
- Persistance garantie même après redémarrage
- Accessible depuis toutes les instances serverless

## Vérification

Après la migration, vérifiez que les stratégies sont bien chargées :

1. Déployez sur Vercel
2. Visitez votre site
3. Les stratégies devraient maintenant être visibles

## Dépannage

### Les stratégies ne s'affichent pas

1. Vérifiez que Vercel KV est bien créé dans le Dashboard
2. Vérifiez les logs de déploiement pour voir s'il y a des erreurs
3. Vérifiez que les variables d'environnement KV sont bien configurées
4. Utilisez le script de migration pour transférer les données

### Erreur "KV not available"

- Vérifiez que vous avez bien créé une base KV dans Vercel
- Vérifiez que les variables d'environnement sont bien configurées
- Redéployez après avoir configuré KV

## Coûts

Vercel KV offre un plan gratuit généreux :
- 256 MB de stockage
- 30 000 requêtes/jour
- Plus que suffisant pour stocker vos stratégies


