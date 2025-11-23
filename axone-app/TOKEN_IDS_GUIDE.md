# Guide des Token IDs pour la création de stratégies

Ce document liste les tokens et leurs IDs à utiliser lors de la création de stratégies dans la page Admin.

## 📋 STRATEGY_1 (50% BTC / 50% HYPE)

### Adresses des contrats (dernier déploiement 2025-11-21)
- **USDC Address**: `0x0B80659a4076E9E93C7DbE0f10675A16a3e5C206`
- **Vault Address**: `0x72eEdd6cE1039E429e44F86b3DcA4A45e206a410`
- **Handler Address**: `0x7551Ca74B5f2Cb3EF9f2e885f2fe9BF993bF570c`
- **L1Read Address**: `0xacE17480F4d157C48180f4ed10AB483238143e11`
- **CoreWriter Address**: `0x3333333333333333333333333333333333333333`

### Tokens à ajouter dans le formulaire Admin

| Symbol | Name | Allocation | Token ID | Logo |
|--------|------|-------------|---------|------|
| **BTC** | Bitcoin | 50 | `1129` | (optionnel) |
| **HYPE** | Hyperliquid | 50 | `1105` | (optionnel) |

### Configuration dans le formulaire
- **Nom de la stratégie**: Doit contenir "STRATEGY_1", "STRATEGY1", "STRATEGIE_1" ou "STRATEGIE1" (le type est détecté automatiquement)
- **Risk Level**: `low`, `medium`, ou `high`
- **Total allocation**: Doit être 100% (50% + 50%)

---

## 📋 ERA_2 (50% TOKEN1 / 50% HYPE)

### Adresses des contrats (dernier déploiement 2025-11-21)
- **USDC Address**: `0x0B80659a4076E9E93C7DbE0f10675A16a3e5C206`
- **Vault Address**: `0x3F60ff8c0838965A981B115E86E1d2567266b021`
- **Handler Address**: `0xb0e110f9236a6c48BE31E0EEaa26272e5973Bc5b`
- **L1Read Address**: `0x2021BFd4D98ffE9fB1AC5B757a50005fEbF684D3`
- **CoreWriter Address**: `0x3333333333333333333333333333333333333333`

### Tokens à ajouter dans le formulaire Admin

| Symbol | Name | Allocation | Token ID | Logo |
|--------|------|-------------|---------|------|
| **TOKEN1** | (nom du token) | 50 | `1242` | (optionnel) |
| **HYPE** | Hyperliquid | 50 | `1105` | (optionnel) |

### Configuration dans le formulaire
- **Nom de la stratégie**: Doit contenir "ERA_2" ou "ERA2" (le type est détecté automatiquement)
- **Risk Level**: `low`, `medium`, ou `high`
- **Total allocation**: Doit être 100% (50% + 50%)

---

## 🔑 Token IDs communs

| Token | Token ID | Notes |
|-------|----------|-------|
| **USDC** | `0` | Utilisé comme quote dans les deux stratégies (ne pas ajouter dans les tokens) |
| **HYPE** | `1105` | Commun aux deux stratégies |

## 📝 Notes importantes

1. **USDC n'est pas ajouté dans les tokens** : C'est le token de quote (référence), il n'a pas besoin d'être dans la liste des tokens de la stratégie.

2. **Vérification des allocations** : La somme des allocations doit être exactement 100%.

3. **Token IDs** : Les IDs sont en décimal (pas en hexadécimal). Entrez simplement le nombre, par exemple `1129` et non `0x1129`.

4. **Détection automatique du type** : 
   - Le type de stratégie est détecté automatiquement à partir du nom
   - Pour STRATEGY_1 : incluez "STRATEGY_1", "STRATEGY1", "STRATEGIE_1" ou "STRATEGIE1" dans le nom
   - Pour ERA_2 : incluez "ERA_2" ou "ERA2" dans le nom
   - Le type détecté s'affiche sous le champ "Niveau de risque" pendant la saisie

5. **Adresses** : Utilisez les adresses du dernier déploiement (marquées ⚡ NOUVEAU dans la documentation).

## 🔍 Vérification

Après création, vérifiez que :
- Les tokens s'affichent correctement dans le dashboard
- Les balances Core sont visibles
- Les prix oracle sont affichés (BTC pour STRATEGY_1, TOKEN1 pour ERA_2)

