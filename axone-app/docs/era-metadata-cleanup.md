# ERA Metadata Cleanup

## Removed Fields

Les champs suivants ont été retirés de la configuration des stratégies car la composition est maintenant déterminée automatiquement on-chain par le handler :

### Champs supprimés

- **`tokens[]`** : Tableau de tokens avec symbol, name, allocation, logo
  - **Raison** : La composition des tokens (symboles, allocations) est déterminée on-chain par le `CoreInteractionHandler` et peut être lue via `CoreInteractionViews` + `L1Read`
  - **Remplacement** : Utiliser le champ `description` pour décrire la composition de manière textuelle (ex: "BTC/HYPE 50/50, delta-neutral, ERA index")

- **`apy`** : APY global de la stratégie
  - **Raison** : Simplification du modèle de données. L'APY peut être calculé dynamiquement ou ajouté plus tard si nécessaire

## New Structure

La nouvelle structure `Strategy` utilise uniquement :

### StrategyMeta
- `id`: Identifiant unique
- `name`: Nom de la stratégie (ex: "ERA BTC/HYPE 50/50")
- `description`: Description textuelle libre (peut inclure la composition, ex: "BTC/HYPE 50/50 index strategy on ERA")
- `riskLevel`: Niveau de risque ('low' | 'medium' | 'high')
- `status`: Statut ('open' | 'paused' | 'closed')

### StrategyContracts
- Toutes les adresses des contrats ERA (vault, handler, coreViews, l1Read, coreWriter)
- `chainId`, `shareDecimals`, `hypeDecimals`, `usdcDecimals`, `depositIsNative`

## Composition On-Chain

La composition réelle des tokens est déterminée automatiquement :

1. **Via CoreInteractionHandler** : Le handler connaît tous les token IDs et spot IDs en interne
2. **Via CoreInteractionViews** : Les vues permettent de lire l'equity et les prix des oracles
3. **Via L1Read** : Permet de lire les balances Core pour chaque token

Le front-end n'a plus besoin de connaître les token IDs ou les allocations. Tout est dérivé des contrats et des adresses.

## Migration

Les stratégies existantes avec un champ `tokens[]` devront être migrées :

1. Extraire la composition depuis `tokens[]` et la mettre dans `description` si nécessaire
2. Supprimer le champ `tokens[]` de la stratégie
3. Les nouvelles stratégies créées via l'admin n'auront plus ce champ

## Future: Composition Live (Optionnel)

Si on veut afficher la composition actuelle on-chain dans l'UI :

- Utiliser `CoreInteractionViews` + `L1Read` + handler pour :
  - Lire les balances de USDC/TOKEN1/HYPE
  - Lire leurs prix via les oracles
  - Calculer leur pourcentage du total equity
  - Afficher une section "Composition actuelle (on-chain)" : ex: "53% TOKEN1 / 47% HYPE"

Cette fonctionnalité serait optionnelle et clairement étiquetée comme "composition actuelle" (live, pas cible).

