# CoreInteractionViews

## Présentation
`CoreInteractionViews` est un contrat de vues/comptabilité **strictement en lecture** pour `CoreInteractionHandler` (STRATEGY_1).  
Il expose des fonctions utilitaires pour lire :
- les **balances spot Core**,
- les **prix oracles BTC/HYPE** normalisés en 1e8,
- l’**equity totale Core** (USDC+BTC+HYPE) en USD 1e18,
sans alourdir le bytecode du handler principal.

Ce contrat lit l’état du handler via l’interface minimale `ICoreInteractionHandlerReadable` (L1Read, IDs tokens/spot) et réutilise les mêmes libs que le handler (`CoreHandlerLib`, `StrategyMathLib`).

## Éléments clés
- **Adresse**: dépend du déploiement (`CORE_VIEWS_ADDRESS`, `NEXT_PUBLIC_CORE_VIEWS_ADDRESS` côté front/scripts).
- **Héritage**: aucun.
- **Réseau(x)**: HyperEVM Testnet / Mainnet (mêmes conventions que `CoreInteractionHandler`).

## Événements
Ce contrat n’émet **aucun événement**. Toutes les fonctions sont `view`.

## Erreurs
- `OracleZero()` — l’oracle spot Hyperliquid a renvoyé un prix nul (`spotPx == 0`).  
  - Utilisé comme garde-fou dans `_spotOraclePx1e8` lorsqu’un prix nul serait incohérent.

## Modifiers
Aucun modifier: toutes les fonctions publiques sont `external view` et sans accès restreint.

## Fonctions (vue d’ensemble)

| Nom               | Signature                                                                           | Visibilité     | Mutabilité | Accès | Emits/Reverts        |
|-------------------|-------------------------------------------------------------------------------------|----------------|-----------|-------|----------------------|
| spotBalance       | `spotBalance(ICoreInteractionHandlerReadable handler, address coreUser, uint64 tokenId) → uint64` | external       | view      | -     | -                    |
| oraclePxHype1e8   | `oraclePxHype1e8(ICoreInteractionHandlerReadable handler) → uint64`                | external       | view      | -     | `OracleZero()`       |
| oraclePxBtc1e8    | `oraclePxBtc1e8(ICoreInteractionHandlerReadable handler) → uint64`                 | external       | view      | -     | `OracleZero()`       |
| equitySpotUsd1e18 | `equitySpotUsd1e18(ICoreInteractionHandlerReadable handler) → uint256`             | external       | view      | -     | `OracleZero()` via `_spotOraclePx1e8` si un prix brut retourné par `spotPx` vaut 0 |

> ℹ️ Les helpers internes (`_spotOraclePx1e8`, `_toPx1e8`, `_spotPxDecimals`, `_derivedSpotPxDecimals`) reproduisent la logique de normalisation de prix du handler afin de rester parfaitement alignés.

## Détails des fonctions

### spotBalance(handler, coreUser, tokenId) → uint64
- **Description**: renvoie la **balance spot brute** (champ `total`) pour un utilisateur Core donné (`coreUser`) et un `tokenId` HyperCore.
- **Paramètres**:
  - `handler` (`ICoreInteractionHandlerReadable`) – instance du handler STRATEGY_1 (lire `l1read` et IDs).
  - `coreUser` (`address`) – adresse Core dont on veut la balance (souvent `address(handler)` ou l’adresse d’un user Core).
  - `tokenId` (`uint64`) – ID du token spot dans HyperCore (USDC/BTC/HYPE…).
- **Retour**:
  - `uint64` — balance `total` dans l’unité native Core (souvent 1e8 pour USDC, `szDecimals` pour les autres).
- **Accès**: `external view`.
- **State**: lecture de `L1Read.spotBalance(coreUser, tokenId)`.
- **Exemple (ethers.js)**:

```ts
import { ethers } from "ethers";

const coreViews = new ethers.Contract(coreViewsAddress, coreViewsAbi, provider);
const rawUsdc = await coreViews.spotBalance(handlerAddress, handlerAddress, usdcTokenId);
console.log("USDC Core (raw):", rawUsdc.toString());
```

### oraclePxHype1e8(handler) → uint64
- **Description**: renvoie le **prix HYPE/USD** normalisé en 1e8 via l’oracle Hyperliquid.
- **Paramètres**:
  - `handler` (`ICoreInteractionHandlerReadable`) – handler à partir duquel on lit `l1read()` et `spotHYPE()`.
- **Retour**:
  - `uint64` — prix HYPE en USD 1e8 (`pxH1e8`).
- **Accès**: `external view`.
- **State**:
  - lit `l1read().spotPx(spotHYPE)` puis applique la même normalisation que le handler (`StrategyMathLib.scalePxTo1e8`).
- **Reverts**:
  - `OracleZero()` si `spotPx` vaut 0.
- **Exemple**:

```ts
const pxH1e8: bigint = await coreViews.oraclePxHype1e8(handlerAddress);
console.log("HYPE/USD:", Number(pxH1e8) / 1e8);
```

### oraclePxBtc1e8(handler) → uint64
- **Description**: renvoie le **prix BTC/USD** normalisé en 1e8 via l’oracle Hyperliquid.
- **Paramètres**:
  - `handler` (`ICoreInteractionHandlerReadable`) – handler à partir duquel on lit `l1read()` et `spotBTC()`.
- **Retour**:
  - `uint64` — prix BTC en USD 1e8 (`pxB1e8`).
- **Accès**: `external view`.
- **State**:
  - lecture de `spotPx(spotBTC)` puis normalisation vers 1e8.
- **Reverts**:
  - `OracleZero()` si le prix brut est nul.

### equitySpotUsd1e18(handler) → uint256
- **Description**: calcule l’**equity totale spot Core** (USDC+BTC+HYPE) de `handler` en **USD 1e18**, en reproduisant la logique `_equitySpotUsd1e18()` du handler.
- **Paramètres**:
  - `handler` (`ICoreInteractionHandlerReadable`) – handler dont on valorise les positions Core.
- **Retour**:
  - `uint256` — equity en USD 1e18.
- **Accès**: `external view`.
- **State**:
  1. lit `usdcCoreTokenId()`, `spotTokenBTC()`, `spotTokenHYPE()` sur le handler,
  2. lit les balances spot via `CoreHandlerLib.spotBalanceInWei` (USDC/BTC/HYPE → `weiDecimals`),
  3. lit les métadonnées tokens (`tokenInfo`) pour obtenir `weiDecimals`,
  4. valorise chaque balance:
     - USDC : `usdc1e18 = usdcBalWei * 10^(18 - usdcWeiDecimals)`
     - BTC/HYPE : `balanceWei * px1e8` remis en 1e18 en fonction de `weiDecimals`,
  5. retourne la somme `usdc1e18 + btcUsd1e18 + hypeUsd1e18`.
- **Reverts**:
  - `OracleZero()` si un prix oracle (BTC ou HYPE) est nul.
- **Exemple (ethers.js)**:

```ts
const equity1e18: bigint = await coreViews.equitySpotUsd1e18(handlerAddress);
console.log("Equity Core (USD):", Number(equity1e18) / 1e18);
```

## Notes

- **Motivation principale**: réduire la taille de bytecode de `CoreInteractionHandler` en déportant les vues non-critiques vers un contrat dédié, tout en conservant exactement la même logique de pricing/équity.
- **Intégration on-chain**:
  - Le `VaultContract` STRATEGY_1 appelle `setCoreViews(coreViews)` puis utilise:
    - `coreViews.oraclePxHype1e8(handler)` pour le prix HYPE,
    - `coreViews.equitySpotUsd1e18(handler)` pour la NAV Core.
- **Intégration off-chain**:
  - Scripts Node (`contracts/scripts/*.js`) utilisent `CORE_VIEWS_ADDRESS` quand il est défini.
  - Le front Next.js utilise `NEXT_PUBLIC_CORE_VIEWS_ADDRESS` pour lire les prix/equity via ce contrat.
  - Le bot de rebalancement (`rebalancingbot/bot.py`) lit les balances et l’equity via `VIEWS_ABI`/`VIEWS_ADDRESS`.
- **Compatibilité**:
  - Les anciennes références `handler.equitySpotUsd1e18()` / `handler.oraclePx*()` doivent être remplacées, pour la lecture, par des appels à `CoreInteractionViews`.
  - Le handler conserve une version interne `_equitySpotUsd1e18()` utilisée pour la logique de rebalance; `CoreInteractionViews` est la façade de lecture publique recommandée. 


