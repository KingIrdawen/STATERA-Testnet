# Statera - Plateforme de gestion de vaults crypto

Application Next.js pour la gestion de stratégies d'investissement décentralisées sur HyperEVM Testnet.

## 🚀 Démarrage rapide

### Installation

```bash
npm install
```

### Configuration

1. Créer un fichier `.env.local` à la racine du projet :
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=votre_project_id_ici
```

Pour obtenir un Project ID : https://cloud.walletconnect.com

### Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📚 Documentation

### Création de stratégies

#### 📘 Flux complet : Création, Stockage et Consultation

**📖 [`README-STRATEGIES-FLOW.md`](./README-STRATEGIES-FLOW.md)** - **NOUVEAU**

Ce document explique en détail :
- ✅ **Création** : Comment le formulaire admin crée une stratégie
- ✅ **Stockage** : Comment les données sont sauvegardées dans `data/strategies.json`
- ✅ **Consultation** : Comment le dashboard lit et affiche les stratégies
- ✅ **Flux complet** : Diagrammes et exemples de code pour chaque étape
- ✅ **Opérations CRUD** : CREATE, READ, UPDATE, DELETE détaillées

#### 📗 Hooks et Smart Contracts

**📖 [`../Info/README-STRATEGIES-ET-HOOKS.md`](../Info/README-STRATEGIES-ET-HOOKS.md)**

Ce guide explique :
- ✅ Comment utiliser les hooks pour récupérer les données depuis les smart contracts
- ✅ Les informations requises (adresses de contrats, tokens, allocations)
- ✅ Le système de hooks (`useStrategyData`, `useVaultActions`)
- ✅ La structure des données retournées

### Autres documentations

- **📋 Contrats et informations requises** : [`REQUIREMENTS.md`](./REQUIREMENTS.md)
  - Liste complète des contrats nécessaires
  - Variables d'environnement
  - Checklist de configuration
  - Résolution des erreurs courantes
- **🔍 Fichiers manquants** : [`MISSING-FILES.md`](./MISSING-FILES.md) - **NOUVEAU**
  - Liste des fichiers à créer
  - Checklist de démarrage
  - Commandes pour créer les fichiers manquants
- **Configuration Wallet** : [`WALLET_SETUP.md`](./WALLET_SETUP.md)
- **Mise à jour du ranking** : [`README-RANKING-UPDATE.md`](./README-RANKING-UPDATE.md)

## 🎯 Pages principales

- **Landing Page** : `/` - Page d'accueil
- **Dashboard** : `/dashboard` - Gestion des stratégies et points
- **Admin** : `/admin` - Création et modification des stratégies
- **Documentation** : `/docs` - Documentation du protocole

## 🔧 Technologies utilisées

- **Next.js 15** - Framework React
- **Wagmi** - Hooks Ethereum
- **RainbowKit** - Interface de connexion wallet
- **Viem** - Bibliothèque Ethereum
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## 🌐 Blockchain

- **Chaîne** : HyperEVM Testnet
- **Chain ID** : 998
- **RPC** : `https://rpc-testnet.hyperliquid.xyz/evm`

Configuration dans : [`src/lib/wagmi.ts`](./src/lib/wagmi.ts)

## 📝 Structure du projet

```
axone-app/
├── src/
│   ├── app/              # Pages Next.js
│   │   ├── admin/        # Page admin
│   │   ├── dashboard/    # Page dashboard
│   │   └── docs/         # Documentation
│   ├── components/       # Composants React
│   ├── hooks/            # Hooks personnalisés
│   ├── contracts/        # Définitions des contrats
│   └── lib/              # Utilitaires
├── data/                 # Données JSON (strategies, ranking)
└── public/               # Assets statiques
```

## 🚢 Déploiement

Le déploiement le plus simple est via [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Consultez la [documentation de déploiement Next.js](https://nextjs.org/docs/app/building-your-application/deploying) pour plus de détails.
