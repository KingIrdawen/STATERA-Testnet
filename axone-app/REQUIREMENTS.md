# 📋 Contrats et Informations Requises

Ce document liste tous les contrats et informations nécessaires pour que l'application Statera fonctionne correctement.

---

## 🔧 Configuration Blockchain (Obligatoire)

### Fichier : `src/lib/wagmi.ts`

Ces informations sont **codées en dur** dans l'application et doivent correspondre à votre environnement :

```typescript
{
  chainId: 998,                    // ID de la chaîne HyperEVM Testnet
  chainName: 'HyperEVM Testnet',
  rpcUrl: 'https://rpc-testnet.hyperliquid.xyz/evm',
  blockExplorer: 'https://hyperscan-testnet.hyperliquid.xyz',
  nativeCurrency: {
    name: 'HYPE',
    symbol: 'HYPE',
    decimals: 18
  }
}
```

**⚠️ Important** : Si vous changez de réseau (mainnet, autre testnet), modifiez ces valeurs dans `src/lib/wagmi.ts`.

---

## 🔑 Variables d'Environnement (Obligatoire)

### Fichier : `.env.local` (à créer à la racine du projet)

```env
# WalletConnect Project ID (obligatoire pour la connexion de wallet)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=votre_project_id_ici
```

**Comment obtenir un Project ID** :
1. Aller sur https://cloud.walletconnect.com
2. Créer un compte et un nouveau projet
3. Copier le Project ID
4. Le mettre dans `.env.local`

**Sans ce Project ID** : La connexion de wallet ne fonctionnera pas.

---

## 📦 Contrats Requis pour Chaque Stratégie

### Fichier : `src/types/index.ts` (interface `Index`)

Pour qu'une stratégie fonctionne, elle doit avoir **4 adresses de contrats** :

### 1. **Contrat USDC** (`usdcAddress`)

**Type** : ERC20  
**ABI** : Standard ERC20 (défini dans `src/contracts/erc20.ts`)

**Fonctions utilisées** :
- `balanceOf(address)` → Solde USDC de l'utilisateur
- `decimals()` → Nombre de décimales (généralement 6 pour USDC)
- `approve(spender, amount)` → Approuver le vault pour dépenser USDC

**Exemple d'adresse** : `0xd9cbec81df392a88aeff575e962d149d57f4d6bc`

---

### 2. **Contrat Vault** (`vaultAddress`)

**Type** : Contrat personnalisé  
**ABI** : Défini dans `src/contracts/vault.ts`

**Fonctions utilisées** :

#### Lecture (view) :
- `balanceOf(address)` → Nombre de parts détenues par l'utilisateur
- `totalSupply()` → Nombre total de parts émises
- `decimals()` → Nombre de décimales (généralement 18)
- `pps1e18()` → Prix par share en USD (format 1e18)

#### Écriture (nonpayable) :
- `deposit(amount)` → Déposer des USDC et recevoir des parts
- `withdraw(shares)` → Retirer des parts et recevoir des USDC

**Exemple d'adresse** : `0x5A972d1F33e8fC6fda9a0d90695c8Ab88C45aA38`

**⚠️ Important** : Le contrat Vault doit :
- Être un contrat ERC20-like (avec `balanceOf`, `totalSupply`, `decimals`)
- Implémenter `pps1e18()` pour calculer le prix par share
- Implémenter `deposit()` et `withdraw()` pour les opérations

---

### 3. **Contrat CoreInteractionHandler** (`handlerAddress`)

**Type** : Contrat personnalisé  
**ABI** : Défini dans `src/contracts/coreInteractionHandler.ts`

**Fonctions utilisées** (toutes en lecture/view) :
- `equitySpotUsd1e18()` → Equity totale du handler en USD (format 1e18)
- `oraclePxBtc1e8()` → Prix oracle BTC (format 1e8)
- `oraclePxHype1e8()` → Prix oracle HYPE (format 1e8)

**Exemple d'adresse** : `0x481e6bB8E5C5BfF55c21cb1D4b873cEdFdF4C7c7e6`

**⚠️ Important** : Ce contrat doit être connecté au système Hyperliquid Core pour fournir les données d'equity et les prix oracles.

---

### 4. **Contrat L1Read** (`l1ReadAddress`)

**Type** : Contrat Hyperliquid  
**ABI** : Défini dans `src/contracts/l1read.ts`

**Fonctions utilisées** (toutes en lecture/view) :
- `spotBalance(user, tokenId)` → Balance spot dans Core pour un token donné
  - Retourne : `{ total, hold, entryNtl }`
- `tokenInfo(tokenId)` → Informations complètes d'un token
  - Retourne : `{ name, spots, deployer, evmContract, szDecimals, weiDecimals, ... }`

**Exemple d'adresse** : `0xB0abB10Ebe4ba837Ff145a7eE18fa7E7d31F8fF7`

**⚠️ Important** : 
- Ce contrat est spécifique à Hyperliquid
- Il permet de lire les données depuis Hyperliquid Core
- Les `tokenId` doivent correspondre aux IDs des tokens dans Hyperliquid

---

## 🪙 Informations sur les Tokens (Par Stratégie)

### Fichier : `src/types/index.ts` (interface `Token`)

Pour chaque token dans une stratégie, vous devez fournir :

```typescript
{
  symbol: string,      // Ex: "BTC", "HYPE", "ETH"
  name: string,        // Nom complet (optionnel)
  allocation: number,  // Pourcentage (doit totaliser 100% pour tous les tokens)
  logo: string,        // URL du logo (optionnel)
  tokenId: string      // ID du token dans Hyperliquid (obligatoire pour les tokens Core)
}
```

### Token ID (`tokenId`)

**Format accepté** :
- Décimal : `"123456"`
- Hexadécimal : `"0x0d01dc56dcaac6a6d901c959b4011ec"`

**⚠️ Important** :
- Si un token a un `tokenId`, l'application récupérera ses balances Core via `spotBalance()`
- Si `tokenId` est vide, le token ne sera pas suivi dans Core
- Le `tokenId` doit correspondre à un token existant dans Hyperliquid

**Exemples** :
- BTC : Généralement pas de `tokenId` (token natif)
- HYPE : `"0x0d01dc56dcaac6a6d901c959b4011ec"` (exemple)

---

## 📊 Résumé des Contrats par Fonctionnalité

### Pour afficher les données d'une stratégie :

| Contrat | Adresse | Fonctions Requises |
|---------|---------|-------------------|
| **USDC** | `usdcAddress` | `balanceOf()`, `decimals()` |
| **Vault** | `vaultAddress` | `balanceOf()`, `totalSupply()`, `decimals()`, `pps1e18()` |
| **Handler** | `handlerAddress` | `equitySpotUsd1e18()`, `oraclePxBtc1e8()`, `oraclePxHype1e8()` |
| **L1Read** | `l1ReadAddress` | `spotBalance()`, `tokenInfo()` |

### Pour déposer des USDC :

| Contrat | Adresse | Fonctions Requises |
|---------|---------|-------------------|
| **USDC** | `usdcAddress` | `approve(spender, amount)` |
| **Vault** | `vaultAddress` | `deposit(amount)` |

### Pour retirer des parts :

| Contrat | Adresse | Fonctions Requises |
|---------|---------|-------------------|
| **Vault** | `vaultAddress` | `withdraw(shares)` |

---

## ✅ Checklist de Configuration

### Configuration Globale

- [ ] **Chain ID** configuré dans `src/lib/wagmi.ts` (998 pour HyperEVM Testnet)
- [ ] **RPC URL** configuré dans `src/lib/wagmi.ts`
- [ ] **WalletConnect Project ID** dans `.env.local`

### Pour Chaque Stratégie (via `/admin`)

- [ ] **Nom de la stratégie** renseigné
- [ ] **Niveau de risque** sélectionné (low/medium/high)
- [ ] **APY** renseigné (optionnel mais recommandé)
- [ ] **Adresse USDC** (`usdcAddress`) renseignée et valide
- [ ] **Adresse Vault** (`vaultAddress`) renseignée et valide
- [ ] **Adresse Handler** (`handlerAddress`) renseignée et valide
- [ ] **Adresse L1Read** (`l1ReadAddress`) renseignée et valide
- [ ] **Au moins un token** avec :
  - [ ] Symbol renseigné
  - [ ] Allocation renseignée (en %)
  - [ ] TokenId renseigné (si le token est dans Hyperliquid Core)
- [ ] **Total des allocations** = 100%

---

## 🔍 Vérification des Contrats

### Comment vérifier qu'un contrat est correctement configuré :

1. **Vérifier l'adresse** :
   - Format : `0x` suivi de 40 caractères hexadécimaux
   - Longueur totale : 42 caractères

2. **Vérifier les fonctions** :
   - Utiliser un block explorer (Hyperscan Testnet)
   - Vérifier que le contrat a bien les fonctions listées ci-dessus

3. **Tester dans l'application** :
   - Créer une stratégie avec les adresses
   - Aller sur `/dashboard` → Onglet "Strategies"
   - Si la stratégie affiche "Missing configuration", vérifier les adresses
   - Si les données ne s'affichent pas, vérifier que les contrats sont déployés et accessibles

---

## 🚨 Erreurs Courantes

### "Failed to fetch" ou "Request timeout"

**Causes possibles** :
- RPC URL incorrecte ou inaccessible
- Contrat non déployé à l'adresse indiquée
- Fonction inexistante dans le contrat

**Solution** :
- Vérifier que les contrats sont déployés sur HyperEVM Testnet
- Vérifier que les adresses sont correctes
- Vérifier que le RPC est accessible

### "Strategy is not fully configured"

**Cause** : Une ou plusieurs adresses sont manquantes ou invalides

**Solution** :
- Vérifier que toutes les 4 adresses sont renseignées dans la page admin
- Vérifier le format des adresses (doivent commencer par `0x`)

### Les données ne s'affichent pas

**Causes possibles** :
- Wallet non connecté (certaines données nécessitent une adresse)
- Contrat non déployé
- Fonction manquante dans le contrat
- TokenId incorrect pour les tokens Core

**Solution** :
- Connecter le wallet
- Vérifier que les contrats sont déployés
- Vérifier les ABIs dans `src/contracts/`
- Vérifier les tokenIds dans Hyperliquid

---

## 📝 Exemple de Configuration Complète

### Stratégie "BTC50DEF"

```json
{
  "id": "1762104896326",
  "name": "BTC50DEF",
  "riskLevel": "low",
  "apy": 12.5,
  "usdcAddress": "0xd9cbec81df392a88aeff575e962d149d57f4d6bc",
  "vaultAddress": "0x5A972d1F33e8fC6fda9a0d90695c8Ab88C45aA38",
  "handlerAddress": "0x481e6bB8E5C5BfF55c21cb1D4b873cEdFdF4C7c7e6",
  "l1ReadAddress": "0xB0abB10Ebe4ba837Ff145a7eE18fa7E7d31F8fF7",
  "tokens": [
    {
      "symbol": "BTC",
      "allocation": 50,
      "tokenId": ""
    },
    {
      "symbol": "HYPE",
      "allocation": 50,
      "tokenId": "0x0d01dc56dcaac6a6d901c959b4011ec"
    }
  ]
}
```

---

## 🔗 Ressources

- **Hyperliquid Documentation** : https://hyperliquid.gitbook.io/
- **WalletConnect Cloud** : https://cloud.walletconnect.com
- **Hyperscan Testnet** : https://hyperscan-testnet.hyperliquid.xyz
- **HyperEVM Testnet RPC** : https://rpc-testnet.hyperliquid.xyz/evm

---

## 📚 Documentation Complémentaire

- **Flux de création** : [`README-STRATEGIES-FLOW.md`](./README-STRATEGIES-FLOW.md)
- **Hooks et smart contracts** : [`../Info/README-STRATEGIES-ET-HOOKS.md`](../Info/README-STRATEGIES-ET-HOOKS.md)
- **Configuration wallet** : [`WALLET_SETUP.md`](./WALLET_SETUP.md)

