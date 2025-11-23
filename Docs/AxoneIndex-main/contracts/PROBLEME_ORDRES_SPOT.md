# Problème des Ordres Spot - Analyse Complète

## Résumé Exécutif

Les ordres spot placés via `CoreWriter.sendRawAction()` sont **acceptés** (événements `SpotOrderPlaced` émis) mais **ne sont pas exécutés** (pas de fills détectés via l'API HyperLiquid).

---

## 1. État Actuel du Code

### Configuration Actuelle ✅

Le code utilise maintenant :
- **Asset ID avec offset +10000** : `assetId = asset + SPOT_ASSET_OFFSET` (ligne 934 de CoreInteractionHandler.sol)
- **Format d'encodage corrigé** : Utilise `abi.encodePacked` comme la bibliothèque de référence
- **Validation complète** : Prix quantifiés, tailles arrondies, TIF=IOC

### Observations Récentes

Lors des tests effectués aujourd'hui (2025-11-21) :

1. **Dépôt de 0.6 HYPE** :
   - ✅ 3 événements `SpotOrderPlaced` émis
   - ❌ Aucun fill détecté via l'API HyperLiquid
   - ✅ Les balances Core ont changé (achats effectués)

2. **Rebalancing #1** :
   - ✅ 2 événements `SpotOrderPlaced` émis (vente HYPE, achat BTC)
   - ❌ Aucun fill détecté via l'API
   - ✅ Les balances Core ont changé (vente HYPE effectuée)

3. **Rebalancing #2** :
   - ✅ 2 événements `SpotOrderPlaced` émis (achats BTC et HYPE)
   - ❌ Aucun fill détecté via l'API
   - ❌ Les balances Core n'ont pas changé (ordres non exécutés)

---

## 2. Problèmes Identifiés

### 2.1. Ordres Acceptés mais Non Exécutés

**Symptôme** :
- Les événements `SpotOrderPlaced` sont émis (CoreWriter accepte les ordres)
- Aucun fill n'est détecté via l'API HyperLiquid
- Parfois les balances Core changent (exécution partielle ?), parfois non

**Causes Possibles** :

1. **Prix Non Marketable** :
   - Les ordres IOC doivent être exécutés immédiatement ou être rejetés
   - Si le prix limite est trop éloigné du marché, l'ordre est rejeté silencieusement
   - Exemple : Achat BTC à 47,250 USD alors que l'ask est à 47,300 USD

2. **Liquidité Insuffisante** :
   - Sur testnet, la liquidité peut être faible
   - Les ordres de petite taille peuvent ne pas trouver de contrepartie

3. **Taille d'Ordre Trop Petite** :
   - HyperCore peut avoir un minimum de taille d'ordre (notional minimum)
   - Les ordres très petits peuvent être rejetés

4. **Problème de Corrélation API** :
   - Les fills peuvent exister mais ne pas être corrélés correctement
   - Problème de timestamp, cloid, ou asset ID dans la corrélation

### 2.2. Problème Historique (Résolu ?)

D'après `DIAGNOSTIC_COREWRITER_REVERT.md` (2025-11-18) :
- **Problème initial** : Les ordres causaient des reverts (`execution reverted`)
- **Correction appliquée** : Asset ID avec offset +10000
- **État actuel** : Les ordres ne revertent plus, mais ne s'exécutent pas toujours

---

## 3. Analyse des Ordres Récents

### Dépôt de 0.6 HYPE (Block 38245772)

**Ordres placés** :
1. BTC ACHAT : 66 szDecimals @ 47,250 USD
2. HYPE ACHAT : 29 szDecimals @ 102.9 USD  
3. BTC ACHAT : 2 szDecimals @ 47,250 USD

**Résultat** :
- ✅ Balances Core ont changé (achats effectués)
- ❌ Aucun fill détecté via API (problème de corrélation ?)

### Rebalancing #1 (Block 38246138)

**Ordres placés** :
1. HYPE VENTE : 16 szDecimals @ 58.9 USD
2. BTC ACHAT : 20 szDecimals @ 47,250 USD

**Résultat** :
- ✅ Vente HYPE effectuée (balance HYPE diminuée)
- ❌ Achat BTC non détecté (balance BTC inchangée)

### Rebalancing #2 (Block 38246321)

**Ordres placés** :
1. BTC ACHAT : 8 szDecimals @ 47,250 USD
2. HYPE ACHAT : 5 szDecimals @ 102.9 USD

**Résultat** :
- ❌ Aucun changement de balance (ordres non exécutés)
- ❌ Aucun fill détecté

---

## 4. Causes Probables

### 4.1. Prix Non Marketable (Hypothèse Principale)

Les ordres IOC doivent être exécutés immédiatement. Si le prix limite n'est pas marketable :
- Pour un **ACHAT** : `limitPx >= ask` du marché
- Pour une **VENTE** : `limitPx <= bid` du marché

**Problème observé** :
- Les prix limites sont calculés avec `_marketLimitFromBbo()` qui utilise le BBO
- Mais le BBO peut changer entre le calcul et l'exécution
- Ou le prix peut être légèrement sous l'ask (pour achat) ou au-dessus du bid (pour vente)

### 4.2. Liquidité Testnet

Sur HyperLiquid Testnet :
- La liquidité peut être très faible
- Les ordres peuvent ne pas trouver de contrepartie
- Les marchés peuvent être peu actifs

### 4.3. Taille Minimum

HyperCore peut avoir des règles de taille minimum :
- Notional minimum (ex: $10 USD)
- Taille minimum en base asset
- Les ordres très petits peuvent être rejetés silencieusement

### 4.4. Problème de Corrélation API

La corrélation entre les événements EVM et les fills API peut échouer si :
- Le `cloid` est 0 (pas de client order ID unique)
- Le timestamp ne correspond pas exactement
- L'asset ID dans l'API est différent (unified ID vs spot ID)

---

## 5. Solutions Recommandées

### 5.1. Vérifier les Prix Marketables

**Action** : Analyser si les prix limites sont réellement marketables au moment de l'envoi

```solidity
// Dans _sendSpotLimitOrderDirect, avant l'envoi :
(uint64 bid1e8, uint64 ask1e8) = _spotBboPx1e8(asset);
if (isBuy && limitPx1e8 < ask1e8) {
    // Prix non marketable pour achat
    revert PX_NOT_MARKETABLE();
}
if (!isBuy && limitPx1e8 > bid1e8) {
    // Prix non marketable pour vente
    revert PX_NOT_MARKETABLE();
}
```

### 5.2. Améliorer la Corrélation API

**Action** : Utiliser un `cloid` unique pour chaque ordre

```solidity
// Générer un cloid unique basé sur block.number et nonce
uint128 cloid = uint128(uint256(keccak256(abi.encodePacked(block.number, block.timestamp, nonce))));
```

### 5.3. Vérifier les Fills via spotClearinghouseState

**Action** : Utiliser l'API `spotClearinghouseState` au lieu de `userFills` pour les ordres spot

```javascript
const spotState = await post("spotClearinghouseState", { user: handlerAddress });
// Vérifier spotState.openOrders et spotState.recentFills
```

### 5.4. Augmenter les Tailles d'Ordre

**Action** : Vérifier si les tailles respectent les minimums HyperCore

### 5.5. Utiliser des Prix Plus Agressifs

**Action** : Pour les ordres IOC, utiliser des prix plus agressifs (ask + slippage pour achat, bid - slippage pour vente)

---

## 6. Conclusion

**État Actuel** :
- ✅ Les ordres sont acceptés par CoreWriter (pas de revert)
- ❌ Les ordres ne sont pas toujours exécutés (pas de fills)
- ⚠️ Parfois les balances changent (exécution partielle ?)

**Problème Principal** :
Les ordres spot sont probablement **non marketables** au moment de l'exécution, ou la **liquidité est insuffisante** sur testnet.

**Prochaines Étapes** :
1. Vérifier les prix marketables avant l'envoi
2. Améliorer la corrélation avec l'API HyperLiquid
3. Tester avec des tailles d'ordre plus grandes
4. Vérifier les logs HyperCore pour les erreurs exactes


