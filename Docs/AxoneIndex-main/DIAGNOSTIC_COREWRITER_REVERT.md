# Diagnostic : Reverts CoreWriter sur ordres spot (HyperEVM Testnet)

**Date** : 2025-11-18  
**Réseau** : HyperEVM Testnet  
**Problème** : Tous les ordres spot envoyés via `CoreWriter.sendRawAction()` sont systématiquement rejetés sans message d'erreur exploitable depuis EVM.

---

## 1. Contexte

Le contrat `CoreInteractionHandler` (STRATEGY_1) place des ordres spot IOC (BTC/USDC et HYPE/USDC) sur HyperCore via la precompile `CoreWriter` (`0x3333...3333`).

- **Fonction EVM qui revert** : `VaultContract.deposit()` avec `autoDeployBps > 0` → appelle `CoreInteractionHandler.executeDepositHype()` → place des ordres spot → revert sans message.
- **Symptôme** : `execution reverted` (parfois `missing revert data`) lors d'`estimateGas` ou de la transaction elle-même, **aucune revert data** exploitable côté EVM.
- **Fonctions impactées** : `executeDepositHype()`, `rebalancePortfolio()`, toute fonction appelant `_sendSpotLimitOrderDirect()`.

---

## 2. Vérifications effectuées (OK ✅)

### 2.1. Configuration EVM/Core

| Élément | Valeur | Statut |
|---------|--------|--------|
| **Handler** | `0x2D4998056b6672eEc2E2f671c96aC0863c242779` | Déployé ✅ |
| **Vault** | `0xfE516927432E52Cb9704272D3b8Bb1b844E4aABE` | Déployé ✅ |
| **CoreViews** | `0x02c7e2E10e5B4995975BCd3fD2cD1799d05781C8` | Déployé ✅ |
| **L1Read** | `0xABD3D32ba0f416b691E1e4Dccb5eEAAd1de646b3` | Fonctionnel ✅ |
| **Compte Core handler** | `coreUserExists(handler) = true` | Initialisé ✅ |

### 2.2. IDs HyperCore

| Paramètre | Valeur configurée | Test L1Read | Statut |
|-----------|-------------------|-------------|--------|
| `spotBTC` | `1054` | `spotInfo(1054)` ✅ | OK ✅ |
| `spotHYPE` | `1035` | `spotInfo(1035)` ✅ | OK ✅ |
| `spotTokenBTC` | `1129` | `tokenInfo(1129)` ✅ (UNIT, szDecimals=5) | OK ✅ |
| `spotTokenHYPE` | `1105` | `tokenInfo(1105)` ✅ (HYPE, szDecimals=2) | OK ✅ |
| `usdcCoreTokenId` | `0` | Non testé (USDC) | Supposé OK |
| `hypeCoreSystemAddress` | `0x2222...2222` | Standard HyperCore | OK ✅ |
| `usdcCoreSystemAddress` | `0x2000...0000` | Standard HyperCore | OK ✅ |

### 2.3. Oracles et prix

```
spotPx(1054) = 45000000   (prix BTC brut)
spotPx(1035) = 107970000  (prix HYPE brut)
oraclePxHype1e8(handler) = 6363100000  (via CoreInteractionViews)
```

✅ Les oracles fonctionnent, les prix sont cohérents.

### 2.4. BBO (Best Bid/Offer)

Test effectué :
- `bbo(1054)` → ❌ revert
- `bbo(11054)` → ✅ fonctionne (bid=10000000, ask=45000000)
- `bbo(1035)` → ❌ revert
- `bbo(11035)` → ✅ fonctionne (bid=85000000, ask=107970000)

**Conclusion** : `L1Read.bbo(assetId)` attend `assetId = spotIndex + 10000` (offset standard Hyperliquid pour les unified asset IDs).

---

## 3. Corrections apportées

### 3.1. Offset asset ID pour `bbo()`

**Avant** :
```solidity
uint32 assetId = spotAsset;  // ERREUR: bbo() revertait
L1Read.Bbo memory b = l1read.bbo(assetId);
```

**Après** :
```solidity
// bbo() precompile attend spotAsset + 10000 (unified asset ID)
uint32 assetId = spotAsset + HLConstants.SPOT_ASSET_OFFSET;
L1Read.Bbo memory b = l1read.bbo(assetId);
```

✅ **Résultat** : `bbo()` fonctionne maintenant, plus de revert sur cette precompile.

### 3.2. Asset ID pour `encodeSpotLimitOrder()` (CoreWriter)

**Hypothèse initiale** : CoreWriter attend aussi `assetId = spotIndex + 10000`.

**Correction testée** :
```solidity
// Dans _sendSpotLimitOrderDirect()
uint32 assetId = asset;  // Utilise spotIndex directement (1054, 1035)
// au lieu de asset + HLConstants.SPOT_ASSET_OFFSET
```

**Justification** : La doc Hyperliquid ([asset-ids](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/asset-ids)) indique que les spots utilisent directement leur index (`1000+`) pour les actions API/L1, et le offset `+10000` est pour les unified asset IDs (perps + spots combinés).

❌ **Résultat** : CoreWriter continue de rejeter les ordres **même avec `assetId = 1054`**.

---

## 4. Encodage actuel des ordres CoreWriter

### 4.1. Format d'encodage

Implémentation actuelle (`HLConstants.sol`) :

```solidity
// Format: [0]=0x01, [1..3]=ActionID (big-endian), [4..]=abi.encode(...)
function _encodeAction(uint24 actionId, bytes memory abiEncoded) private pure returns (bytes memory data) {
    data = new bytes(4 + abiEncoded.length);
    data[0] = 0x01;
    data[1] = bytes1(uint8(actionId >> 16));
    data[2] = bytes1(uint8(actionId >> 8));
    data[3] = bytes1(uint8(actionId));
    for (uint256 i = 0; i < abiEncoded.length; i++) {
        data[4 + i] = abiEncoded[i];
    }
}

function encodeSpotLimitOrder(
    uint24 actionId,
    uint32 asset,
    bool isBuy,
    uint64 limitPx1e8,
    uint64 sz1e8,
    bool reduceOnly,
    uint8 encodedTif,
    uint128 cloid
) internal pure returns (bytes memory) {
    bytes memory abiEncoded = abi.encode(asset, isBuy, limitPx1e8, sz1e8, reduceOnly, encodedTif, cloid);
    return _encodeAction(actionId, abiEncoded);
}
```

**Paramètres utilisés** :
- `actionId = 1` (ACTION_LIMIT_ORDER)
- `asset = 1054` ou `1035` (spotBTC / spotHYPE, **sans offset +10000**)
- `isBuy = true/false`
- `limitPx1e8` = prix quantifié en 1e8 (via `StrategyMathLib.quantizePx1e8`)
- `sz1e8` = taille en 1e8 (convertie via `StrategyMathLib.sizeSzTo1e8`)
- `reduceOnly = false`
- `encodedTif = 3` (TIF_IOC)
- `cloid = 0` (pas de client order ID)

### 4.2. Quantization des prix

Implémentation (`StrategyMathLib.quantizePx1e8`) :
- ≤ 5 chiffres significatifs
- ≤ (8 - szDecimals) décimales
- Arrondi : BUY → ceil, SELL → floor

Testé et conforme à la doc Hyperliquid ([tick-and-lot-size](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size)).

### 4.3. Conversion des tailles

```solidity
// USD 1e18 → taille base en szDecimals
uint256 numerator = usd1e18 * 10**szDecimals;
uint256 denom = price1e8 * 1e10;
uint64 sizeSz = numerator / denom;

// szDecimals → 1e8 (format CoreWriter)
uint64 sz1e8 = StrategyMathLib.sizeSzTo1e8(sizeSz, szDecimals);
```

Conforme à la formule documentée.

---

## 5. Tests effectués (tous en revert ❌)

| Test | Montant | autoDeployBps | Résultat |
|------|---------|---------------|----------|
| `deposit()` | 0.1 HYPE | 1000 (10%) | ❌ revert |
| `deposit()` | 0.6 HYPE | 9500 (95%) | ❌ revert |
| `rebalancePortfolio()` | N/A | N/A | ❌ revert |

**Symptôme constant** : `execution reverted` sans revert data exploitable depuis EVM.

---

## 6. Hypothèses sur la cause du revert

### 6.1. Asset ID incorrect pour CoreWriter (hypothèse principale)

Malgré la correction (`assetId = 1054` au lieu de `11054`), CoreWriter rejette. Possibilités :
- CoreWriter attend peut-être **un autre format d'asset ID** (ex: un mapping interne différent, ou un ID dérivé).
- Ou bien l'asset ID `1054`/`1035` n'est pas valide pour placer des ordres spot sur testnet (marchés non ouverts / désactivés ?).

### 6.2. Format d'encodage incorrect

Le format `abi.encode(asset, isBuy, limitPx1e8, sz1e8, reduceOnly, encodedTif, cloid)` pourrait ne pas correspondre exactement à ce que HyperCore attend :
- Ordre des champs
- Types exacts (uint32 vs uint256, etc.)
- Padding ABI

### 6.3. Validation HyperCore (risk engine / checks internes)

CoreWriter peut rejeter les ordres pour des raisons internes non visibles depuis EVM :
- Taille d'ordre trop petite (< $10 notional ?)
- Prix hors range
- Marché spot non disponible / liquide sur testnet
- Autre règle de validation

---

## 7. Actions recommandées

### 7.1. Logs HyperCore (urgent)

**Consulter les logs/actions CoreWriter** pour le handler `0x2D4998056b6672eEc2E2f671c96aC0863c242779` :
- Via l'explorer HyperEVM testnet
- Ou via l'API Hyperliquid (endpoint `/info` avec `type: "userActions"`)

**But** : voir l'erreur exacte retournée par HyperCore lors du rejet des actions (ex: "invalid asset", "MinTradeNtl", "TickSizeViolation", etc.).

### 7.2. Comparaison avec un ordre qui fonctionne

Encoder un ordre spot IOC via le SDK officiel Hyperliquid (Python/JS) pour BTC/USDC ou HYPE/USDC, et comparer byte-by-byte avec l'encodage Solidity actuel.

### 7.3. Validation du mapping asset ID

Confirmer auprès de l'équipe Hyperliquid :
- Quel `assetId` doit être passé à `CoreWriter.sendRawAction()` pour les ordres spot ?
  - `spotIndex` direct (`1054`, `1035`) ?
  - `spotIndex + 10000` (`11054`, `11035`) ?
  - Autre format ?

### 7.4. Test avec un marché perp (si possible)

Essayer de placer un ordre perp (action ID=1 aussi) pour voir si le revert vient spécifiquement des spots ou de l'encodage général.

---

## 8. Workaround actuel (production/testnet)

En attendant la résolution :

**Utiliser l'ancien vault avec `autoDeployBps = 0`** :
- Vault : `0x4A1A7d8F9F03920d834e9283ce13c973CfEeEDA3`
- Handler : `0x06533bC79FCB68f15F8B61C26C35975B83873B26`
- État : ✅ Fonctionnel (dépôts/retraits/NAV OK, pas d'ordres Core)

**Avantages** :
- Les utilisateurs peuvent déposer/retirer sans revert
- Le vault mint des parts correctement
- La NAV est calculée (EVM HYPE + Core equity)

**Limitations** :
- Pas d'auto-déploiement vers Core (pas de stratégie 50/50)
- Pas de rebalancing automatique

Une fois l'encodage CoreWriter validé, on pourra remonter `autoDeployBps` et activer la stratégie complète.

---

## 9. Fichiers et contrats concernés

### 9.1. Contrats Solidity

- `contracts/src/STRATEGY_1/CoreInteractionHandler.sol` (lignes 843-890 : `_sendSpotLimitOrderDirect`)
- `contracts/src/STRATEGY_1/utils/HLConstants.sol` (encodage CoreWriter)
- `contracts/src/STRATEGY_1/utils/CoreHandlerLib.sol` (helpers)
- `contracts/src/STRATEGY_1/utils/StrategyMathLib.sol` (quantization, conversions)

### 9.2. Scripts de test

- `contracts/scripts/strategy1_deposit_testnet.js`
- `contracts/scripts/strategy1_rebalance_testnet.js`
- `contracts/scripts/test_bbo_ids.js` (test offset asset ID pour bbo)

### 9.3. Documentation consultée

- [Asset IDs](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/asset-ids)
- [Tick and Lot Size](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size)
- [Interacting with HyperCore](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/interacting-with-hypercore)
- [Interaction Timings](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/interaction-timings)

---

## 10. Récapitulatif pour l'équipe Hyperliquid

**Symptôme** : Tous les ordres spot envoyés via `CoreWriter.sendRawAction()` sont rejetés sans message d'erreur exploitable depuis EVM.

**Configurations testées** :
- Asset ID = `1054` (sans offset) ❌
- Asset ID = `11054` (avec offset +10000) : non testé côté CoreWriter (mais `bbo(11054)` fonctionne)

**Question clé** : Quel `assetId` doit être passé dans `encodeSpotLimitOrder(assetId, ...)` pour les ordres spot sur HyperCore ?

**Compte Core** : `0x2D4998056b6672eEc2E2f671c96aC0863c242779` (initialisé, `coreUserExists = true`)

**Demande** : Consulter les logs HyperCore pour ce handler et partager l'erreur exacte retournée lors du rejet des actions CoreWriter.

---

**Contact** : Morgan Magalhães  
**Repo** : AxoneIndex (STRATEGY_1)  
**Date** : 2025-11-18

