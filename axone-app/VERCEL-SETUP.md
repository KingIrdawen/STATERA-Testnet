# Configuration Vercel

## ✅ Fichier `vercel.json` créé

Un fichier `vercel.json` a été créé à la **racine du repository** pour indiquer à Vercel que le projet Next.js se trouve dans le dossier `axone-app/`.

## 📋 Configuration dans Vercel Dashboard (Alternative)

Si vous préférez configurer via l'interface Vercel :

1. Allez sur votre projet dans Vercel
2. **Settings** → **General**
3. Dans la section **Root Directory**, sélectionnez ou entrez : `axone-app`
4. Cliquez sur **Save**

## ⚠️ Important

- Le fichier `vercel.json` doit être à la **racine** du repository (pas dans `axone-app/`)
- Vercel utilisera automatiquement `axone-app/` comme répertoire de travail
- Toutes les commandes (`npm install`, `npm run build`) seront exécutées dans `axone-app/`

## 🔄 Après configuration

1. **Commit et push** le fichier `vercel.json` à la racine
2. Vercel détectera automatiquement le changement
3. Le build devrait maintenant fonctionner correctement

## 📝 Note sur les warnings npm

Les warnings concernant React 19 et les peer dependencies sont **normaux** et n'empêchent pas le build. Ils sont causés par des dépendances transitives qui n'ont pas encore été mises à jour pour React 19.

