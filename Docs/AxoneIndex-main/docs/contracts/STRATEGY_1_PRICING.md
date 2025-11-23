## STRATEGY_1 — Règles de prix, quantization et gardes

Cette page documente la logique de prix SPOT réellement utilisée par STRATEGY_1 dans :
- `CoreInteractionHandler.sol`
- `CoreInteractionViews.sol`
- `utils/StrategyMathLib.sol`
- `utils/HLConstants.sol` / `utils/CoreHandlerLib.sol`

Toutes les références sont pour les marchés SPOT BTC/USDC et HYPE/USDC tels qu’exposés par Hyperliquid.

---

### Source des décimales de prix (`pxDecimals`) et normalisation en 1e8

- Les précompilés Hyperliquid renvoient un prix brut `rawPx` dont l’échelle dépend de l’actif (par ex. HYPE peut être en 1e6, BTC en 1e3, etc.).
- STRATEGY_1 **ne maintient plus de mapping manuel** `spotPxDecimals[spotIndex]`.
- Les décimales de prix sont dérivées dynamiquement à partir des métadonnées du token de base du marché :
  - `spotInfo(spotIndex)` → `tokens[0]` = `baseTokenId`
  - `tokenInfo(baseTokenId)` → `szDecimals` du token base
  - `pxDecimals = 8 - szDecimals` (avec borne à 0 si `szDecimals >= 8`)

Implémentation (côté vues et handler) :
- `_derivedSpotPxDecimals(...)` lit `spotInfo` puis `tokenInfo` et dérive `pxDecimals`.
- `_spotPxDecimals(...)` retourne `_derivedSpotPxDecimals(...)`.
- `_toPx1e8(...)` appelle `StrategyMathLib.scalePxTo1e8(rawPx, pxDecimals)` :
  - si `pxDecimals == 8`: `px1e8 = rawPx`
  - si `pxDecimals < 8`: `px1e8 = rawPx * 10^(8 - pxDecimals)`
  - si `pxDecimals > 8`: `px1e8 = rawPx / 10^(pxDecimals - 8)`

Inverse exact 1e8 → décimales natives (pour soumission d’ordres) :
- `StrategyMathLib.scalePxFrom1e8(px1e8, pxDecimals)` applique l’inverse exact de la règle ci‑dessus.

Résultat : tous les prix utilisés dans la stratégie sont normalisés en **USD 1e8**, tout en respectant les contraintes de tick/lot Hyperliquid.

---

### Quantization du prix (après epsilon/slippage)

Les règles Hyperliquid imposent :
- ≤ **5 chiffres significatifs**
- ≤ **(8 − szDecimals)** décimales sur un prix exprimé en 1e8
- Arrondi agressif pour conserver la « marketability » :
  - BUY → arrondi **vers le haut** (ceil)
  - SELL → arrondi **vers le bas** (floor)

STRATEGY_1 applique ces règles via `StrategyMathLib.quantizePx1e8(px1e8, szDecimals, isBuy)` :
- calcule `maxPxDecimals = max(0, 8 − szDecimals)`
- tronque les décimales excédentaires (avec ceil/floor selon `isBuy`)
- tronque au besoin pour ne pas dépasser 5 chiffres significatifs

Chemins utilisant la quantization :
- BBO (`_marketLimitFromBbo`) :
  - lit `(bid1e8, ask1e8)` normalisés via `StrategyMathLib.scalePxTo1e8`
  - ajuste par `marketEpsilonBps` (ε) pour construire un prix **marketable IOC**
  - passe par `StrategyMathLib.marketLimitFromBbo(...)` qui appelle `quantizePx1e8`
- Fallback oracle (`_limitFromOracleQuantized`) :
  - part d’un prix oracle `oraclePx1e8`
  - applique `(maxSlippageBps + marketEpsilonBps)`
  - quantize via `StrategyMathLib.limitFromOracleQuantized(...)`

---

### Taille et notional (USD 1e18 → taille base en `szDecimals`)

Les soldes et notional sont manipulés en plusieurs représentations :
- USD : `1e18`
- Prix : `1e8`
- Taille base : `szDecimals`

Conversion clé (corrigée) pour un notional USD 1e18 vers une taille base :

```solidity
// tailleBase(szDecimals) = (USD1e18 / px1e8) * 10^(szDecimals-8)
// = USD1e18 * 10^szDecimals / (px1e8 * 1e10)
uint256 numerator = usd1e18 * 10**szDecimals;
uint256 denom     = price1e8 * 1e10; // CORRECT
uint256 sizeSz    = numerator / denom;
```

- Implémentation : `CoreHandlerLib.toSzInSzDecimals(...)` (utilisée par le handler).
- Cette formule corrige un ancien bug où le dénominateur utilisait `price1e8 * 1e8`, ce qui gonflait les tailles d’un facteur ×100 et causait des rejets d’ordres.

Avant tout envoi à HyperCore, les tailles sont :
- alignées sur le lot via `snapToLot(...)` (dans le handler),
- converties en format 1e8 si nécessaire via `StrategyMathLib.sizeSzTo1e8(sizeSz, szDecimals)`.

Garde `_assertOrder(...)` dans le handler :
- vérifie que `asset` est soit BTC soit HYPE (`spotBTC`, `spotHYPE`),
- calcule `szDecimals` via les métadonnées (ou les IDs fournis),
- impose :
  - `limitPx1e8 != 0`,
  - `szInSzDecimals != 0`,
  - `limitPx1e8` déjà quantisé (`quantizePx1e8`),
  - bornes supplémentaires (`PX_TOO_LOW`, `PX_TOO_HIGH`, `SIZE_TOO_LARGE`…).

---

### Asset IDs et métadonnées

- Identifiant de marché SPOT :
  - `assetId = HLConstants.SPOT_ASSET_OFFSET + spotIndex` (typiquement `10000 + spotIndex`).
- Métadonnées :
  - `spotInfo(spotIndex)` → `tokens[0]` (base), `tokens[1]` (quote).
  - `tokenInfo(tokenId)` → `szDecimals` (lot size), `weiDecimals` (décimales de représentation on‑chain).
- Les appels suivants prennent des identifiants différents :
  - `spotPx(spotIndex)`, `spotInfo(spotIndex)` → index du marché.
  - `tokenInfo(tokenId)`, `spotBalance(user, tokenId)` → token ID.
  - `bbo(assetId)` → asset ID (offset 10000).

Résumé des usages :
- `bbo(assetId)` et `encodeSpotLimitOrder(assetId, ...)` utilisent `assetId = spotIndex + HLConstants.SPOT_ASSET_OFFSET`.
- `spotPx`, `spotInfo`, `tokenInfo`, `spotBalance` n’acceptent **pas** `assetId`, mais respectivement `spotIndex` ou `tokenId`.

---

### Tests et cas d’usage clés

1. **BTC/USDC BUY** avec ask brut quelconque :
   - `rawPx` normalisé via `_toPx1e8` en `px1e8`,
   - application de `marketEpsilonBps` puis `quantizePx1e8` pour respecter tick/lot,
   - vérification que le prix final respecte ≤5 chiffres significatifs et ≤(8−szDecimals) décimales.
2. **Meme coin** avec `szDecimals = 2` :
   - `maxPxDecimals = 6`,
   - quantization garantit ≤5 chiffres significatifs.
3. **Fallback BBO = 0** :
   - `_marketLimitFromBbo` bascule sur `_limitFromOracleQuantized(spotOraclePx1e8(asset), ...)`,
   - même logique de slippage+epsilon puis quantization.
4. **Direction BUY/SELL** :
   - BUY : prix limite poussé vers le haut après ε/slippage,
   - SELL : prix limite poussé vers le bas après ε/slippage,
   - garantit un comportement « agressif mais sûr » pour les IOC.
5. **Round‑trip raw ↔ 1e8** :
   - `rawPx → px1e8 = StrategyMathLib.scalePxTo1e8(rawPx, pxDecimals)` puis `StrategyMathLib.scalePxFrom1e8(px1e8, pxDecimals)` renvoient un prix compatible avec les contraintes Hyperliquid.


