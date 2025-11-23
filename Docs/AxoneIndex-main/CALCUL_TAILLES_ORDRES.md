# Calcul des tailles d'ordres pour 1.3222 HYPE et 0.0323 BTC

## Hypothèses
- **HYPE** : `szDecimals = 6` (selon les tests récents)
- **BTC** : `szDecimals = 4` (selon les tests récents)

## Scénario
Le contrat calcule qu'il faut :
- **Vendre 1.3222 HYPE** pour acheter **0.0323 BTC**

---

## Ordre de VENTE HYPE (1.3222 HYPE)

### Étape 1 : Conversion en szDecimals
```
Taille humaine = 1.3222 HYPE
Taille en szDecimals (szDecimals=6) = 1.3222 * 10^6 = 1_322_200
```

### Étape 2 : snapToLot()
```solidity
snapToLot(1_322_200, 6) = 1_322_200  // Pas de changement (déjà entier)
```

### Étape 3 : Conversion vers 1e8 pour HyperCore
```solidity
sizeSzTo1e8(1_322_200, 6)
= 1_322_200 * 10^(8-6)  // car szDecimals < 8
= 1_322_200 * 100
= 132_220_000
```

**Taille envoyée à HyperCore : `132_220_000` (1.3222 * 1e8)**

---

## Ordre d'ACHAT BTC (0.0323 BTC)

### Étape 1 : Conversion en szDecimals
```
Taille humaine = 0.0323 BTC
Taille en szDecimals (szDecimals=4) = 0.0323 * 10^4 = 323
```

### Étape 2 : snapToLot()
```solidity
snapToLot(323, 4) = 323  // Pas de changement (déjà entier)
```

### Étape 3 : Conversion vers 1e8 pour HyperCore
```solidity
sizeSzTo1e8(323, 4)
= 323 * 10^(8-4)  // car szDecimals < 8
= 323 * 10_000
= 3_230_000
```

**Taille envoyée à HyperCore : `3_230_000` (0.0323 * 1e8)**

---

## Résumé

| Actif | Taille humaine | szDecimals | Taille en szDecimals | Taille envoyée (1e8) |
|-------|---------------|------------|---------------------|---------------------|
| **HYPE (vente)** | 1.3222 | 6 | 1_322_200 | **132_220_000** |
| **BTC (achat)** | 0.0323 | 4 | 323 | **3_230_000** |

---

## Note importante

Si le contrat calcule **1.3222 HYPE** via `toSzInSzDecimals()`, cela signifie que :
- Le calcul brut a donné une valeur ≥ 1.3222 mais < 1.3223
- Après floor en `szDecimals=6`, on obtient exactement **1.3222** HYPE
- La taille envoyée sera donc **132_220_000** (1.3222 * 1e8)

De même pour BTC :
- Si le calcul donne **0.0323 BTC**, après floor en `szDecimals=4`, on obtient **323** unités
- La taille envoyée sera **3_230_000** (0.0323 * 1e8)


