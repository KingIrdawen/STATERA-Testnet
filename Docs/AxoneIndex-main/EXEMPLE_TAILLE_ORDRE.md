# Exemple : Taille envoyée pour acheter 1.16 HYPE

## Scénario
On veut acheter **1.16 HYPE** via un ordre spot.

## Hypothèses
- HYPE a `szDecimals = 6` (comme dans les tests récents de STRATEGY_1)
- HYPE a `weiDecimals = 8`
- Format HyperCore : prix et taille en **1e8** (human-readable * 1e8)

---

## Lib_EVM (hyper-evm-lib)

### Code analysé
- `CoreWriterLib.placeLimitOrder()` accepte `sz` en `uint64`
- Dans les tests (`CoreSimulatorTest.t.sol`), on voit : `uint64 baseAmt = 1e8; // 1 uSOL`
- Le simulateur (`CoreExecution.sol` ligne 71) convertit : `action.sz = scale(action.sz, 8, perpInfo.szDecimals)`
  - Cela signifie que `action.sz` est **reçu en format 1e8**, puis converti vers `szDecimals` pour le traitement interne

### Calcul pour 1.16 HYPE
```
Taille humaine = 1.16 HYPE
Taille en format 1e8 = 1.16 * 1e8 = 116000000
```

**Lib_EVM envoie directement : `116000000` (1.16 * 1e8)**

---

## STRATEGY_1

### Code analysé
1. `CoreHandlerLib.toSzInSzDecimals()` calcule en `szDecimals`
2. `snapToLot()` arrondit (actuellement retourne tel quel)
3. `StrategyMathLib.sizeSzTo1e8()` convertit de `szDecimals` vers `1e8`

### Calcul pour 1.16 HYPE

#### Étape 1 : Calcul en szDecimals
Si on part d'un notional USD (exemple) ou directement de 1.16 HYPE :
```
Taille humaine = 1.16 HYPE
Taille en szDecimals (szDecimals=6) = 1.16 * 1e6 = 1160000
```

#### Étape 2 : snapToLot
```solidity
snapToLot(1160000, 6) = 1160000  // Pas de changement actuellement
```

#### Étape 3 : Conversion vers 1e8
```solidity
sizeSzTo1e8(1160000, 6)
= 1160000 * 10^(8-6)  // car szDecimals < 8
= 1160000 * 100
= 116000000
```

**STRATEGY_1 envoie : `116000000` (1.16 * 1e8)**

---

## Résultat

**Les deux librairies envoient la même taille : `116000000`**

### Détails
- **Format final** : Les deux envoient en format **1e8** (human-readable * 1e8)
- **Différence d'approche** :
  - **Lib_EVM** : L'utilisateur passe directement la taille en 1e8
  - **STRATEGY_1** : Calcule d'abord en `szDecimals`, puis convertit vers 1e8 avant l'encodage

### Note importante
Si HYPE avait `szDecimals = 2` (comme dans certains tests plus anciens) :
- STRATEGY_1 calculerait : `1.16 * 1e2 = 116` en szDecimals
- Puis : `116 * 10^(8-2) = 116 * 1e6 = 116000000`
- **Résultat identique** : `116000000`

Le format final (1e8) est toujours le même, quelle que soit la valeur de `szDecimals`.


