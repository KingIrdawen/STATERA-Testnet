# Guide : Création de Stratégies et Utilisation des Hooks

## 📋 Vue d'ensemble

Ce document explique comment fonctionne le système de création de stratégies et l'utilisation des hooks pour récupérer les données depuis les smart contracts.

## 🎯 Processus de Création d'une Stratégie

### 1. Création via la Page Admin

Une stratégie est créée dans la page `/admin` avec les informations suivantes :

#### Informations de base
- **Nom de la stratégie** : Identifiant unique de la stratégie
- **Description** : Description textuelle (optionnel)
- **Niveau de risque** : `low`, `medium`, ou `high`
- **APY** : Taux de rendement annuel en pourcentage (optionnel)

#### Adresses des Contrats (obligatoires)
1. **Adresse USDC** (`usdcAddress`) : Adresse du contrat ERC20 USDC
2. **Adresse Vault** (`vaultAddress`) : Adresse du contrat Vault
3. **Adresse CoreInteractionHandler** (`handlerAddress`) : Adresse du handler pour les interactions Core
4. **Adresse L1Read** (`l1ReadAddress`) : Adresse du contrat L1Read pour lire les données Hyperliquid

#### Tokens et Allocation
Pour chaque token de la stratégie :
- **Symbol** : Symbole du token (ex: BTC, HYPE, USDC, ETH)
- **Token ID** : ID du token dans le système Hyperliquid (utilisé pour les appels Core)
- **Allocation** : Pourcentage d'allocation dans la stratégie (doit totaliser 100%)

### 2. Stockage de la Stratégie

Les stratégies sont stockées dans :
- **Fichier** : `axone-app/data/strategies.json`
- **Interface TypeScript** : `Index` dans `axone-app/src/types/index.ts`

## 🔌 Système de Hooks

### Hook Principal : `useStrategyData`

**Fichier** : `axone-app/src/hooks/useStrategyData.ts`

#### Fonctionnement

Le hook `useStrategyData` prend une stratégie (`Index`) en paramètre et récupère automatiquement toutes les données depuis les smart contracts.

```typescript
const { data, isLoading, isConfigured } = useStrategyData(strategy)
```

#### Données Récupérées

Le hook effectue les appels suivants en fonction des informations de la stratégie :

##### ERC20 Contract (`usdcAddress`)
- `balanceOf(address)` → Solde USDC de l'utilisateur connecté
- `decimals()` → Décimales du token USDC

##### Vault Contract (`vaultAddress`)
- `balanceOf(address)` → Nombre de parts du vault détenues par l'utilisateur
- `totalSupply()` → Nombre total de parts émises
- `decimals()` → Décimales du vault
- `pps1e18()` → Prix par share en USD (format 1e18)

##### L1Read Contract (`l1ReadAddress`)
Pour **chaque token** de la stratégie qui a un `tokenId` renseigné :
- `spotBalance(handlerAddress, tokenId)` → Balance spot dans Core pour le token
- `tokenInfo(tokenId)` → Informations complètes du token (décimales, etc.)

##### CoreInteractionHandler Contract (`handlerAddress`)
- `equitySpotUsd1e18()` → Equity totale du handler en USD (format 1e18)
- `oraclePxBtc1e8()` → Prix oracle BTC (format 1e8)
- `oraclePxHype1e8()` → Prix oracle HYPE (format 1e8)

#### Adaptation Dynamique

Le hook s'adapte automatiquement à la stratégie :
- ✅ Récupère les données pour **tous les tokens** présents dans la stratégie
- ✅ Ne fait des appels que si les adresses sont renseignées
- ✅ Ne fait des appels Core que pour les tokens qui ont un `tokenId`

#### Structure des Données Retournées

```typescript
{
  data: {
    usdcBalance: string,           // Solde USDC formaté
    vaultShares: string,           // Parts du vault formatées
    vaultTotalSupply: string,       // Supply total formaté
    coreBalances: {                // Balances Core par symbole de token
      [symbol: string]: CoreBalanceData
    },
    coreEquityUsd: string,         // Equity totale formatée
    pps: string,                   // Prix par share formaté
    oraclePxBtc: string,           // Prix BTC formaté
    oraclePxHype: string           // Prix HYPE formaté
  },
  isLoading: boolean,
  isConfigured: boolean,
  address: string
}
```

### Hook de Référence : `useDashboardData`

**Fichier** : `Info/useDashboardData.ts` ⚠️ **NE PAS MODIFIER**

Ce fichier sert de **référence** pour comprendre :
- Les fonctions disponibles sur chaque contrat
- La structure des données retournées
- Les conversions de décimales

**Important** : Ce fichier ne doit jamais être modifié. Il sert uniquement de documentation technique.

## 🔍 Où Chercher les Hooks

### Fichiers de Contrats

Les définitions des contrats sont dans `axone-app/src/contracts/` :
- `erc20.ts` → Contrat ERC20 avec ABI standard
- `vault.ts` → Contrat Vault avec ABI personnalisé
- `l1read.ts` → Contrat L1Read avec ABI pour Hyperliquid
- `coreInteractionHandler.ts` → Contrat Handler avec ABI

### Utilitaires

- `axone-app/src/lib/format.ts` → Fonctions de formatage des valeurs bigint
- `axone-app/src/lib/strategies.ts` → Fonctions de lecture/écriture des stratégies

### Hooks Personnalisés

- `axone-app/src/hooks/useStrategies.ts` → Gestion CRUD des stratégies (API)
- `axone-app/src/hooks/useStrategyData.ts` → Récupération des données smart contracts

## 🎨 Affichage dans le Dashboard

### Composant `StrategyCard`

**Fichier** : `axone-app/src/app/dashboard/page.tsx`

Le composant `StrategyCard` utilise `useStrategyData` pour afficher :
- **Total Value Deposited** : `coreEquityUsd` ou `vaultTotalSupply × pps`
- **Your deposits** : `vaultShares × pps`
- **Shares** : `vaultShares / vaultTotalSupply`
- **Balance USDC** : Solde USDC de l'utilisateur

### Pages Utilisant les Hooks

1. **Page Dashboard** (`/dashboard`)
   - Onglet "Strategy" : Stratégies avec dépôts (avec bouton Withdraw)
   - Onglet "Strategies" : Toutes les stratégies disponibles

2. **Page Admin** (`/admin`)
   - Création et modification des stratégies
   - Stockage dans `data/strategies.json`

## 📊 Flux de Données

```
1. Admin crée une stratégie
   ↓
2. Stratégie sauvegardée dans data/strategies.json
   ↓
3. Page Dashboard charge les stratégies via useStrategies()
   ↓
4. Pour chaque stratégie, StrategyCard utilise useStrategyData(strategy)
   ↓
5. useStrategyData récupère les données depuis les smart contracts
   ↓
6. Les données sont formatées et affichées dans l'interface
```

## ✅ Prérequis pour qu'une Stratégie Fonctionne

Pour qu'une stratégie affiche correctement les données, elle doit avoir :

1. ✅ **Toutes les adresses renseignées** :
   - `usdcAddress`
   - `vaultAddress`
   - `handlerAddress`
   - `l1ReadAddress`

2. ✅ **Au moins un token avec un tokenId** :
   - Le `tokenId` permet de récupérer les balances Core
   - Sans `tokenId`, les appels `spotBalance` et `tokenInfo` ne sont pas effectués

3. ✅ **Wallet connecté** :
   - L'utilisateur doit avoir son wallet connecté pour voir ses propres données
   - Les données globales (totalSupply, equity) sont visibles même sans wallet

## 🔧 Extensibilité

Pour ajouter de nouvelles fonctionnalités :

1. **Nouveau contrat** : Créer le fichier dans `src/contracts/` avec l'ABI
2. **Nouvelle fonction** : Ajouter l'appel dans `useStrategyData.ts`
3. **Nouveau affichage** : Utiliser les données dans `StrategyCard`

Le système est conçu pour être **flexible** et s'adapter à de nouvelles stratégies sans modification du code.

## 📝 Notes Techniques

- Les valeurs sont formatées depuis `bigint` vers `string` lisible
- Les décimales sont gérées automatiquement selon le token
- Les appels sont groupés via `useReadContracts` pour optimiser les performances
- Les données sont mises en cache par wagmi pour éviter les appels redondants

