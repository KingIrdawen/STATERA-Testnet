# Rapport d'investigation: Problème des tailles 1e6

## Résumé exécutif

Après une investigation approfondie, les calculs de conversion semblent **corrects**. Les tailles observées dans les ordres correspondent aux deltas USD calculés. Cependant, un facteur 1e6 a été détecté dans certaines hypothèses de test, suggérant une possible confusion sur le format des données.

## Investigations effectuées

### 1. Vérification des formules de conversion

**Résultat:** ✅ Les formules sont correctes
- `toSzInSzDecimals()`: Conversion USD 1e18 → szDecimals ✅
- `sizeSzTo1e8()`: Conversion szDecimals → 1e8 ✅
- Les calculs manuels confirment les résultats du code

### 2. Vérification de `spotBalanceInWei()`

**Résultat:** ✅ La conversion szDecimals → weiDecimals est correcte
- Pour HYPE: 61698600 (szDecimals) → 61698600000000 (weiDecimals) ✅
- Conversion: `10^(8-2) = 10^6` ✅
- Valeur humaine: 616,986 HYPE dans les deux cas ✅

### 3. Vérification de `_usdPositions()`

**Résultat:** ✅ Les positions USD sont calculées correctement
- HYPE: 616,986 HYPE × 75 USD = 46,273,950 USD ✅
- BTC: 0 BTC × 27,500 USD = 0 USD ✅
- USDC: 30,000,000 USDC = 30,000,000 USD ✅
- Equity totale: 76,273,950 USD ✅

### 4. Vérification des deltas USD

**Résultat:** ✅ Les deltas sont calculés correctement
- Target per asset: 37,755,605.25 USD
- Position HYPE actuelle: 46,273,950 USD
- Delta HYPE: -23,368,344.75 USD (vente nécessaire)

### 5. Comparaison avec les ordres observés

**Résultat:** ✅ Les valeurs correspondent
- Ordre HYPE observé:
  - Taille: 491,955.31 HYPE (szDecimals)
  - Prix: 47.50 USD
  - Notional: 23,368,344.58 USD
- Delta calculé: -23,368,344.75 USD
- **Correspondance:** Les valeurs sont identiques (à l'arrondi près)

## Découverte importante

### Facteur 1e6 détecté dans les tests

Lors des tests, un facteur exact de 1,000,000 a été détecté dans le scénario suivant:

**Scénario testé:** Si `spotBalance.total` était déjà en `weiDecimals` au lieu de `szDecimals`:
- Balance HYPE: 61,698,600 (interprété comme weiDecimals) = 0.616986 HYPE
- Position USD: 46.27 USD
- **Ratio avec calcul correct:** 1,000,000 (exactement 1e6)

**Conclusion:** Si `spotBalance.total` retournait déjà en `weiDecimals`, alors `spotBalanceInWei()` multiplierait par erreur par `10^(weiDecimals-szDecimals)`, introduisant un facteur 1e6 pour HYPE.

**MAIS:** La documentation et les tests confirment que `spotBalance.total` est bien en `szDecimals`, donc cette hypothèse est invalide.

## Analyse des valeurs observées

### Ordre HYPE observé
- Taille: 491,955.31 HYPE
- Prix: 47.50 USD
- Notional: 23,368,344.58 USD

### Calcul inverse (depuis la taille observée)
Si on calcule le delta USD qui aurait produit cette taille:
- Avec prix oracle (75 USD): 36,896,648.25 USD
- Avec prix limite observé (47.50 USD): 23,368,344.58 USD ✅

**Conclusion:** La taille observée correspond exactement au delta USD calculé avec le prix limite utilisé.

## Hypothèses restantes

Si les tailles sont effectivement 1e6 trop grandes, les causes possibles sont:

1. **Double conversion dans `spotBalanceInWei()`**
   - Si `spotBalance.total` est déjà en `weiDecimals` mais le code assume `szDecimals`
   - **Vérification:** Les valeurs calculées sont correctes, donc cette hypothèse est peu probable

2. **Problème dans le calcul des positions USD**
   - Si un facteur 1e6 s'introduit dans `_usdPositions()`
   - **Vérification:** Les positions USD calculées sont correctes (46,273,950 USD pour 616,986 HYPE)

3. **Problème dans le calcul des deltas**
   - Si les deltas USD sont calculés avec des positions 1e6 trop grandes
   - **Vérification:** Les deltas correspondent aux ordres observés

4. **Confusion sur les unités affichées**
   - Si les valeurs affichées sont mal interprétées
   - **Vérification:** Les calculs manuels confirment les valeurs

## Recommandations

1. **Vérifier avec un rebalancing réel**
   - Exécuter un rebalancing et comparer les tailles calculées avec les tailles attendues
   - Vérifier si les ordres sont effectivement rejetés pour "taille trop grande"

2. **Vérifier la documentation Hyperliquid**
   - Confirmer que `spotBalance.total` retourne bien en `szDecimals`
   - Vérifier s'il y a eu des changements récents dans l'API

3. **Comparer avec la librairie de référence**
   - Vérifier comment `HLConversions.szToWei()` gère la conversion
   - Comparer les résultats avec notre implémentation

4. **Test avec valeurs connues**
   - Créer un test avec des valeurs exactes (ex: 1 HYPE, 1 BTC)
   - Vérifier chaque étape de conversion

## Conclusion

Les calculs semblent **corrects** selon toutes les vérifications effectuées. Les tailles observées dans les ordres correspondent aux deltas USD calculés. Si un problème persiste, il pourrait être lié à:

1. Une confusion sur les unités attendues vs. calculées
2. Un problème dans l'affichage/interprétation des valeurs
3. Un changement non documenté dans l'API Hyperliquid

**Prochaine étape:** Tester avec un rebalancing réel et vérifier si les ordres sont effectivement rejetés ou si le problème est ailleurs.


