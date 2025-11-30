# ERA Cleanup Notes

## Removed Fields

Les champs suivants ont été retirés de la configuration des stratégies car ils sont gérés automatiquement on-chain par le handler :

- **Token IDs** (`tokenId` dans les tokens) : Les token IDs sont définis dans le handler et n'ont pas besoin d'être spécifiés par l'admin
- **Spot IDs** : Les spot IDs sont également gérés par le handler
- **strategyType** : Plus besoin de spécifier explicitement le type, le système est maintenant générique pour ERA

## New Structure

La nouvelle structure `Strategy` utilise :
- `StrategyMeta` : Métadonnées (nom, description, risque, statut, tokens avec symbol/allocation uniquement)
- `StrategyContracts` : Adresses des contrats (vault, handler, coreViews, l1Read, coreWriter, chainId, etc.)

## Migration

Les stratégies existantes devront être migrées vers le nouveau format. Les anciennes stratégies avec `tokenId` dans les tokens continueront de fonctionner via l'ancien hook `useStrategyData`, mais les nouvelles stratégies utiliseront `useStrategyDataEra`.

