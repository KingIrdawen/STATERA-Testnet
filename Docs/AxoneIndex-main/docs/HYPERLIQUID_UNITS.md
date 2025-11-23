# Hyperliquid — Unités et conversions (SPOT)

Ce document synthétise les unités attendues par Hyperliquid pour les opérations SPOT (ordres, soldes, prix), ainsi que les conversions implémentées dans `STRATEGY_1`.

## Références officielles
- Notation (Px, Sz, TIF, Asset): [`hyperliquid-docs/for-developers/api/notation`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/notation)
- Asset IDs (spot offset 10000): [`hyperliquid-docs/for-developers/api/asset-ids`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/asset-ids)
- Tick & lot size (szDecimals, règles décimales Px/Sz): [`hyperliquid-docs/for-developers/api/tick-and-lot-size`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size)
- Info endpoint (meta: `spotInfo`, `tokenInfo`): [`hyperliquid-docs/for-developers/api/info-endpoint`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint) et [`/spot`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot)
- Exchange endpoint (soumission d’ordres): [`hyperliquid-docs/for-developers/api/exchange-endpoint`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint)
- Signing, Nonces, erreurs, limites, timings, HyperCore/EVM: 
  - [`nonces-and-api-wallets`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets)
  - [`error-responses`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/error-responses)
  - [`signing`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/signing)
  - [`rate-limits-and-user-limits`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/rate-limits-and-user-limits)
  - [`activation-gas-fee`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/activation-gas-fee)
  - [`optimizing-latency`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/optimizing-latency)
  - [`bridge2`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/bridge2)
  - [`deploying-hip-1-and-hip-2-assets`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets)
  - [`hip-3-deployer-actions`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/hip-3-deployer-actions)
  - [`interacting-with-hypercore`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/interacting-with-hypercore)
  - [`hypercore-<>-hyperevm-transfers`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/hypercore-less-than-greater-than-hyperevm-transfers)
  - [`interaction-timings`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/interaction-timings)

---

## Unités principales
- **Sz (size)**: exprimée en unités de coin (base), arrondies à `szDecimals` de l’actif. Voir tick/lot size.
- **Px (price)**: prix déterminé avec contrainte de chiffres significatifs et de décimales max (voir tick/lot size). Dans nos contrats, les prix oracles sont normalisés en 1e8.
- **Asset (spot)**: `assetId = 10000 + spotIndex` (offset de 10000 pour spot).
- **TIF**: `IOC` (Immediate-Or-Cancel) pour simuler des ordres « marketables ».

Hyperliquid impose des bornes: 
- `sz` doit respecter `szDecimals` de l’actif (lot size).
- `px` doit respecter les contraintes de décimales et de significatifs (tick size). 
Voir: [`tick-and-lot-size`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size).

---

## Métadonnées utilisées
- `spotInfo(spotIndex)` → contient `tokens[0]` (base) et `tokens[1]` (quote).
- `tokenInfo(tokenId)` → fournit `szDecimals`, `weiDecimals` et autres champs.
- `spotPx(spotIndex)` → prix spot brut (décimales variables selon l’actif).
- `bbo(assetId)` → meilleur bid/ask brut pour `assetId = spotIndex + 10000`.
- `spotBalance(user, tokenId)` → solde spot brut en `szDecimals` pour ce `tokenId`.

---

## Normalisation du prix (vers 1e8)
Les précompilés renvoient un Px brut dont l’échelle varie par actif. STRATEGY_1 normalise en **1e8** (base commune) en utilisant la précision prix propre au marché (`pxDecimals`) dérivée dynamiquement depuis les métadonnées:

```
// pxDecimals = 8 - szDecimals (avec borne à 0 si szDecimals >= 8)
// px1e8 = rawPx * 10^(8 - pxDecimals), avec garde pour pxDecimals > 8
if pxDecimals == 8:  px1e8 = rawPx
if pxDecimals < 8:   px1e8 = rawPx * 10^(8 - pxDecimals)
if pxDecimals > 8:   px1e8 = rawPx / 10^(pxDecimals - 8)
```

Conséquence: tous les actifs spot sont ramenés à une base commune (1e8), en respectant exactement la précision de prix du marché (HIP-1/HIP-3 compatibles). Cela facilite les calculs de valorisation et d'allocation en USD.

**Note**: La librairie de référence (`PrecompileLib.normalizedSpotPx`) utilise une approche différente: `spotPx * 10^szDecimals`, qui donne un prix avec `szDecimals` décimales (variable par actif). Voir la section "Différences avec la librairie de référence" pour plus de détails.

Implémentations:
- `CoreInteractionHandler._derivedSpotPxDecimals()` dérive `pxDecimals` depuis `tokenInfo.szDecimals`
- `_spotPxDecimals()`, `_toPx1e8()`, `_toRawPx()` (conversion inverse)
- `_spotBboPx1e8()`/`spotOraclePx1e8()` utilisent `_toPx1e8()`
- `_validatedOraclePx1e8()`/_`_tryValidatedOraclePx1e8()` normalisent avant validations de déviation

---

## Conversion des soldes (szDecimals → weiDecimals)
Les soldes de `spotBalance` sont en `szDecimals`. Pour valoriser en USD 1e18, on convertit d’abord en `weiDecimals`:

```
if weiDecimals > szDecimals: totalWei = totalSz * 10^(weiDecimals - szDecimals)
```

**Note importante**: Dans STRATEGY_1 et la librairie de référence (`HLConversions.szToWei`), on assume que `weiDecimals >= szDecimals` pour tous les tokens spot. Le cas `weiDecimals < szDecimals` est considéré comme une erreur et provoque un revert (`INVALID_DECIMALS`).

Implémentation: `CoreHandlerLib.spotBalanceInWei()` (utilisé par le handler), aligné avec `HLConversions.szToWei()` de la librairie de référence.

---

## Conversion USD1e18 → taille base (szDecimals)
Pour convertir un notional USD 1e18 en taille base respectant `szDecimals` (en utilisant un prix normalisé 1e8):

```
// tailleBase(szDecimals) = (USD1e18 / px1e8) * 10^(szDecimals-8)
numerator = USD1e18 * 10^szDecimals
denom     = px1e8 * 1e10     // IMPORTANT (et non 1e8)
sizeSz    = numerator / denom
```

Implémentation: `CoreHandlerLib.toSzInSzDecimals()`. Cette version corrige un ancien facteur ×100.

---

## Encodage des ordres SPOT et envois
- `assetId` utilisé pour le carnet/BBO et la soumission d’ordres: `assetId = 10000 + spotIndex`
- `encodeSpotLimitOrder(assetId, isBuy, limitPx1e8, sz1e8, reduceOnly, encodedTif, cloid)`
  - **Format final**: HyperCore attend les prix et tailles en format **1e8** (human-readable * 1e8).
  - `limitPx1e8`: prix quantifié en 1e8 (après normalisation et quantization via `StrategyMathLib.quantizePx1e8()`).
  - `sz1e8`: taille convertie en 1e8 depuis `szDecimals` via `StrategyMathLib.sizeSzTo1e8(szInSzDecimals, szDecimals)`.
  - **Calculs intermédiaires**: Les calculs utilisent `szInSzDecimals` et `limitPx1e8`, puis conversion finale avant encodage.
  - `reduceOnly` = `false` pour les ordres marketables de STRATEGY_1.
  - `encodedTif` = `HLConstants.TIF_IOC` (3) pour exécuter en IOC.
- `encodeSpotSend(destination, tokenId, amount1e8)` pour crédits EVM/Core (montant en 1e8)

Implémentations: `HLConstants`, `CoreHandlerLib.encodeSpotLimitOrder`, `CoreHandlerLib.encodeSpotSend`, `CoreInteractionHandler._sendSpotLimitOrderDirect`.

---

## Règles pratiques appliquées par STRATEGY_1
- Prix normalisés en 1e8; quantisation appliquée après epsilon/slippage:
  - Contrainte prix: ≤ 5 chiffres significatifs et ≤ (8 − szDecimals) décimales
  - Direction d'arrondi agressif pour conserver la « marketability »: BUY ↑ (ceil), SELL ↓ (floor)
- Ordres « market IOC » via le BBO:
  - BUY: limite sur `ask` (élargie par `marketEpsilonBps`)
  - SELL: limite sur `bid` (réduite par `marketEpsilonBps`)
- Rebalance et dépôts:
  - Les deltas/allocations sont calculés en USD 1e18
  - Convertis en tailles `szDecimals` avec `toSzInSzDecimals`
  - Cap achat par solde USDC disponible si aucune vente préalable
- **Lot size**: la taille est arrondie à `szDecimals` selon les règles Hyperliquid ([tick-and-lot-size](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size))
  - `toSzInSzDecimals()` calcule la taille en `szDecimals` avec floor (division entière)
  - `snapToLot()` garantit la conformité explicite avec les règles Hyperliquid
  - Exemple: si `szDecimals=6`, alors `1.1648349853` HYPE → `1.164834` HYPE (floor)
  - L'arrondi vers le bas (floor) évite les rejets d'ordres
- Notional minimum: un seuil en USD 1e8 évite les IOC « poussière »
- Asset IDs:
  - `assetId = spotIndex + 10000` pour `bbo()` et `encodeSpotLimitOrder()`
  - `spotPx/spotInfo/tokenInfo/spotBalance` prennent respectivement `spotIndex` ou `tokenId`, pas `assetId`

---

## Exemples rapides
- AssetId SPOT:
  - BTC/USDC: `assetId = 10000 + spotBTC`
  - HYPE/USDC: `assetId = 10000 + spotHYPE`
- Prix:
  - `px1e8 = rawPx * scalar(spot)` puis éventuellement `_toRawPx()` pour soumettre l’ordre.
- Taille achat 50% d’un dépôt USDC:
  - `allocUsd1e18 = usdc1e8 * 1e10 * (1 - reserveBps)`
  - `halfUsd1e18 = allocUsd1e18 / 2`
  - `sz = toSzInSzDecimals(l1read, spotTokenId, halfUsd1e18, px1e8)`

---

## Conformité aux docs Hyperliquid
- Notation Px/Sz/Side/Asset/TIF: conforme [`notation`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/notation)
- Asset IDs SPOT avec offset 10000: conforme [`asset-ids`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/asset-ids)
- Respect des `szDecimals`/tick rules et normalisation px: conforme [`tick-and-lot-size`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size)

## Adresses système (Spot et HYPE natif)
- Spot system address: premier octet `0x20`, le reste zéro sauf l’index `tokenId` (big‑endian implicite sur les derniers octets).
- HYPE natif: `0x2222222222222222222222222222222222222222`.
- STRATEGY_1: `SystemAddressLib.getSpotSystemAddress(tokenId)` calcule toujours `0x20 + tokenId` — y compris pour `tokenId = 0` (USDC). Le natif HYPE est géré séparément via la constante HYPE.

**Cohérence avec la librairie de référence**: `CoreWriterLib.getSystemAddress()` utilise la même logique: `BASE_SYSTEM_ADDRESS + index` (où `BASE_SYSTEM_ADDRESS = 0x20...`) pour les tokens spot, et `HYPE_SYSTEM_ADDRESS = 0x2222...2222` pour HYPE.

---

## Différences avec la librairie de référence (Lib_EVM/hyper-evm-lib)

Cette section documente les différences entre l'approche de STRATEGY_1 et celle de la librairie de référence `hyper-evm-lib`.

### Normalisation des prix spot

**Librairie de référence (`PrecompileLib.normalizedSpotPx`)**:
- Normalise avec `szDecimals`: `normalizedSpotPx = spotPx * 10^baseSzDecimals`
- Résultat: prix avec `szDecimals` décimales (variable selon l'actif)

**STRATEGY_1**:
- Normalise vers **1e8** (base commune): `px1e8 = rawPx * 10^(8 - pxDecimals)` où `pxDecimals = 8 - szDecimals`
- Résultat: tous les prix en USD 1e8, facilitant les comparaisons et calculs inter-actifs

**Raison**: STRATEGY_1 nécessite une base commune (1e8) pour les calculs de valorisation et d'allocation en USD, tandis que la librairie de référence offre une normalisation plus simple basée sur les décimales natives de chaque actif.

### Conversion szDecimals → weiDecimals

**Cohérence**: Les deux approches sont alignées:
- `HLConversions.szToWei()`: `sz * 10^(weiDecimals - szDecimals)`
- `CoreHandlerLib.spotBalanceInWei()`: même formule avec vérification `weiDecimals >= szDecimals`

**Note**: Le cas `weiDecimals < szDecimals` n'est pas géré (erreur dans les deux cas).

### Encodage des ordres

**Librairie de référence (`CoreWriterLib.placeLimitOrder`)**:
- Accepte `limitPx` et `sz` directement (précision non spécifiée dans la signature)
- Les exemples utilisent des valeurs en wei/1e8

**STRATEGY_1**:
- Convertit explicitement `szInSzDecimals` → `sz1e8` avant encodage via `StrategyMathLib.sizeSzTo1e8()`
- Utilise `limitPx1e8` directement (après quantization)
- **Format final identique**: HyperCore attend 1e8 pour prix et taille dans les deux cas

**Raison**: STRATEGY_1 gère explicitement les conversions pour garantir la cohérence des calculs intermédiaires (en `szDecimals`) avec le format final (1e8).



