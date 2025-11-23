# Gestion de plusieurs vaults avec CoreInteractionViews

## Problème

Quand vous avez plusieurs vaults (par exemple STRATEGY_1 et ERA_2), chaque vault peut avoir son propre contrat `CoreInteractionViews` avec une adresse différente. L'ancienne approche utilisait une seule variable d'environnement `NEXT_PUBLIC_CORE_VIEWS_ADDRESS` pour tous les vaults.

## Solution

Chaque vault peut maintenant avoir sa propre adresse `coreViewsAddress` dans sa configuration. Si cette adresse n'est pas définie pour un vault, le système utilisera automatiquement `NEXT_PUBLIC_CORE_VIEWS_ADDRESS` comme fallback.

## Configuration

### Option 1 : Via l'interface d'administration (Recommandée)

1. Accédez à `/admin/vaults`
2. Créez ou modifiez un vault
3. Dans le champ **"Adresse CoreInteractionViews (optionnel)"**, entrez l'adresse du contrat pour ce vault spécifique
4. Si vous laissez ce champ vide, le vault utilisera `NEXT_PUBLIC_CORE_VIEWS_ADDRESS`

**Exemple :**
- **Vault STRATEGY_1** : `coreViewsAddress = 0x1E2B0DccE25Eeb479F83DABE24ab687C6AB64292`
- **Vault ERA_2** : `coreViewsAddress = 0x71a2B85dD822782A8031549f9B35629a5759F81B`

### Option 2 : Variable d'environnement globale

Si tous vos vaults partagent le même contrat `CoreInteractionViews`, vous pouvez simplement définir `NEXT_PUBLIC_CORE_VIEWS_ADDRESS` dans vos variables d'environnement (voir `docs/troubleshooting/vercel.md`).

## Adresses de référence

D'après les déploiements documentés :

- **STRATEGY_1** (déploiement 2025-11-21) : `0x1E2B0DccE25Eeb479F83DABE24ab687C6AB64292`
- **ERA_2** (déploiement 2025-11-21) : `0x71a2B85dD822782A8031549f9B35629a5759F81B`

Vérifiez les fichiers de déploiement dans `docs/deployments/` pour les adresses les plus récentes.

## Fonctionnement technique

Le code utilise maintenant la logique suivante dans tous les hooks :

```typescript
const coreViewsAddress = vault?.coreViewsAddress || process.env.NEXT_PUBLIC_CORE_VIEWS_ADDRESS
```

Cela signifie :
1. Si le vault a une `coreViewsAddress` définie → utilise cette adresse
2. Sinon → utilise `NEXT_PUBLIC_CORE_VIEWS_ADDRESS` comme fallback
3. Si aucune des deux n'est définie → les prix oracle ne seront pas disponibles (avertissement affiché)

## Avantages

- ✅ Flexibilité : chaque vault peut avoir son propre contrat `CoreInteractionViews`
- ✅ Rétrocompatibilité : les vaults existants continuent de fonctionner avec `NEXT_PUBLIC_CORE_VIEWS_ADDRESS`
- ✅ Simplicité : pas besoin de modifier le code pour ajouter un nouveau vault
- ✅ Configuration centralisée : tout se gère via l'interface d'administration

## Migration

Si vous avez des vaults existants qui utilisent `NEXT_PUBLIC_CORE_VIEWS_ADDRESS`, vous pouvez :

1. **Laisser tel quel** : ils continueront de fonctionner avec la variable d'environnement
2. **Migrer progressivement** : ajoutez `coreViewsAddress` à chaque vault via l'interface d'administration quand vous le souhaitez

Aucune action urgente n'est requise.

