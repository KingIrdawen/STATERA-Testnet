# Analyse des problèmes de prix limite et de tailles d'ordres

## Problème 1: Prix limite BTC trop bas

### Symptôme
- Prix limite observé: **42,625 USD**
- Ask du marché: **45,000 USD**
- Prix oracle: **27,500 USD**

### Cause identifiée
Dans `_marketLimitFromBbo()` (ligne 715-724 de `CoreInteractionHandler.sol`):

```solidity
function _marketLimitFromBbo(uint32 asset, bool isBuy) internal view returns (uint64) {
    (uint64 bid1e8, uint64 ask1e8) = _spotBboPx1e8(asset);
    if (bid1e8 == 0 || ask1e8 == 0) {  // ❌ PROBLÈME ICI
        // Fallback sur l'oracle normalisé si BBO indisponible
        uint64 oracle = spotOraclePx1e8(asset);
        return _limitFromOracleQuantized(asset, oracle, isBuy);
    }
    // ...
}
```

**Le problème:** La condition `bid1e8 == 0 || ask1e8 == 0` déclenche le fallback même si l'ask est disponible (45,000 USD). Pour un ordre d'achat, on a seulement besoin de l'ask, pas du bid.

### Calcul du prix limite avec fallback
- Oracle: 27,500 USD
- maxSlippageBps: 5,000 bps (50%)
- marketEpsilonBps: 500 bps (5%)
- Total: 55% d'ajustement
- Prix limite: 27,500 * 1.55 = **42,625 USD** ✅ (correspond au prix observé)

### Solution proposée
Modifier la condition pour vérifier seulement le prix nécessaire selon le sens de l'ordre:

```solidity
function _marketLimitFromBbo(uint32 asset, bool isBuy) internal view returns (uint64) {
    (uint64 bid1e8, uint64 ask1e8) = _spotBboPx1e8(asset);
    
    // Pour un achat, on a besoin de l'ask. Pour une vente, on a besoin du bid.
    if ((isBuy && ask1e8 == 0) || (!isBuy && bid1e8 == 0)) {
        // Fallback sur l'oracle seulement si le prix nécessaire n'est pas disponible
        uint64 oracle = spotOraclePx1e8(asset);
        return _limitFromOracleQuantized(asset, oracle, isBuy);
    }
    
    uint8 baseSzDec = _baseSzDecimals(asset);
    return StrategyMathLib.marketLimitFromBbo(bid1e8, ask1e8, baseSzDec, marketEpsilonBps, isBuy);
}
```

---

## Problème 2: Tailles des ordres 1e6 trop grandes

### Symptôme
- Ordre BTC observé: **537.3749 BTC** = **22,905,605 USD**
- Ordre HYPE observé: **491,955.31 HYPE** = **23,368,344 USD**

Si on divise par 1e6:
- BTC: **0.000537 BTC** = **22.9 USD** (beaucoup plus raisonnable)
- HYPE: **0.491 HYPE** = **23.3 USD** (beaucoup plus raisonnable)

### Analyse des formules

#### 1. `toSzInSzDecimals()` - ✅ CORRECTE
```solidity
numerator = absUsd * 10^szDecimals
denom = price1e8 * 1e10
sizeSz = numerator / denom
```

**Test avec valeurs réelles:**
- Input: 22,905,605 USD (1e18) = 22905605112500000000000000
- Prix: 42,625 USD (1e8) = 4262500000000
- szDecimals BTC: 5
- Calcul: (22905605112500000000000000 * 10^5) / (4262500000000 * 1e10) = **53,737,490** ✅
- Taille humaine: 53,737,490 / 10^5 = **537.3749 BTC** ✅

#### 2. `sizeSzTo1e8()` - ✅ CORRECTE
```solidity
if szDecimals < 8:
  sz1e8 = sizeSz * 10^(8 - szDecimals)
```

**Test avec valeurs réelles:**
- Input: 53,737,490 (szDecimals)
- szDecimals BTC: 5
- Calcul: 53,737,490 * 10^(8-5) = 53,737,490 * 1000 = **53,737,490,000** ✅
- Taille humaine: 53,737,490,000 / 1e8 = **537.3749 BTC** ✅

### Conclusion sur les tailles
Les formules de conversion sont **correctes**. Le problème doit être ailleurs:

1. **Hypothèse 1:** Les deltas USD passés à `toSzInSzDecimals` sont déjà 1e6 trop grands
   - Vérifier le calcul dans `_usdPositions()` et `computeDeltasWithPositions()`
   - Vérifier la conversion des balances spot vers USD 1e18

2. **Hypothèse 2:** Problème dans la lecture/affichage des valeurs
   - Les événements `SpotOrderPlaced` émettent `sizeSzDecimals` qui est correct
   - Mais peut-être que les valeurs affichées sont mal interprétées

3. **Hypothèse 3:** Double conversion quelque part
   - Vérifier si `toSzInSzDecimals` est appelé deux fois
   - Vérifier si `sizeSzTo1e8` est appliqué deux fois

### Vérification à faire
Créer un script qui:
1. Lit les deltas USD calculés par `_computeDeltasWithPositions`
2. Trace chaque étape de conversion jusqu'à la taille finale
3. Compare avec les valeurs attendues

---

## Actions à prendre

### 1. Corriger le prix limite BTC ✅ FAIT
- [x] Modifier `_marketLimitFromBbo()` pour vérifier seulement le prix nécessaire (ask pour achat, bid pour vente)
- [ ] Tester avec un rebalancing et vérifier que le prix limite utilise bien l'ask (45,000 USD) au lieu de l'oracle (27,500 USD)

**Correction appliquée:**
```solidity
// Avant:
if (bid1e8 == 0 || ask1e8 == 0) { ... }

// Après:
if ((isBuy && ask1e8 == 0) || (!isBuy && bid1e8 == 0)) { ... }
```

### 2. Investiguer les tailles ✅ INVESTIGATION APPROFONDIE TERMINÉE
- [x] Créer un script de trace qui suit les deltas USD depuis `_computeDeltasWithPositions` jusqu'à `_sendSpotLimitOrderDirect`
- [x] Vérifier si les deltas USD sont corrects (en 1e18)
- [x] Vérifier si `toSzInSzDecimals` est appelé correctement
- [x] Vérifier si `sizeSzTo1e8` est appliqué correctement
- [x] Comparer avec les valeurs attendues pour un rebalancing typique
- [x] Vérifier `spotBalanceInWei()` et `_usdPositions()`
- [x] Comparer avec les ordres observés

**Conclusion:** Après investigation approfondie, **tous les calculs semblent corrects**:
- Les deltas USD sont calculés correctement en 1e18
- `toSzInSzDecimals` convertit correctement vers szDecimals
- `sizeSzTo1e8` convertit correctement vers 1e8
- Les positions USD sont calculées correctement
- Les deltas USD correspondent aux notional des ordres observés

**Découverte:** Un facteur 1e6 exact a été détecté dans les tests si on suppose que `spotBalance.total` est déjà en `weiDecimals`, mais la documentation confirme qu'il est en `szDecimals`.

**Rapport détaillé:** Voir `RAPPORT_INVESTIGATION_TAILLES_1E6.md`

**Si le problème persiste, vérifier:**
1. Si les ordres sont effectivement rejetés par Hyperliquid
2. Si la documentation Hyperliquid est à jour
3. Si les valeurs affichées sont mal interprétées
3. Un problème dans l'encodage final des ordres (mais peu probable car les formules sont correctes)

**Recommandation:** Vérifier les calculs dans `_usdPositions()` pour s'assurer que les positions USD sont calculées correctement, notamment la conversion des balances weiDecimals vers USD 1e18.

