# Dépannage Vercel — Build et CSS

<!--
title: "Dépannage Vercel — Build et CSS"
lang: fr
updated: 2025-10-24
owner: Axone Team
-->

Ce document consolide tous les correctifs liés aux erreurs de build et aux problèmes CSS rencontrés sur Vercel. Il remplace les anciens fichiers suivants (archivés): `VERCEL_BUILD_FIX_FINAL.md`, `VERCEL_BUILD_FIX_COMPLETE.md`, `VERCEL_CSS_FIX.md` et `docs/ops/VERCEL_BUILD_FIX_FINAL.md`.

## Problèmes connus et correctifs

### 1) Gestionnaire wagmi — `injected()`

Erreur:

```
Type 'typeof injected' is not assignable to type 'CreateConnectorFn | Connector | Connector<CreateConnectorFn>'
```

Correctif (wagmi v2): appeler la fonction `injected()` au lieu de passer la référence:

```diff
- onClick={() => connect({ connector: injected })}
+ onClick={() => connect({ connector: injected() })}
```

Fichiers typiques affectés: `Header.tsx`, `src/app/referral/page.tsx`, `src/app/documentation/page.tsx`.

### 2) Classe Tailwind inconnue

Erreur:

```
Error: Cannot apply unknown utility class `bg-axone-black-20`
```

Correctif: utiliser la classe native Tailwind

```diff
- className="bg-axone-black-20 ..."
+ className="bg-black/20 ..."
```

### 3) Event listener typé incorrectement

Erreur:

```
Type '(error: { code?: number; }) => void' is not assignable to parameter of type 'EventListener'
```

Correctif minimal:

```diff
- const handleChainError = (error: { code?: number }) => {
+ const handleChainError = (event: Event) => {
+   const error = event as any;
    if (error.code === 4902) {
      alert("Chain non supportée, veuillez choisir la bonne chaîne");
    }
  };
```

### 4) Problèmes CSS/Tailwind non pris en compte

Symptômes: styles non appliqués, variables CSS non reconnues sur Vercel.

Actions recommandées:

```diff
// globals.css
- @custom-variant dark (&:is(.dark *));
- @theme {
+ :root {
  /* Variables CSS */
}
+ @tailwind base;
+ @tailwind components;
+ @tailwind utilities;

// tailwind.config.ts
 colors: {
-  'axone-accent': 'var(--color-axone-accent)',
+  'axone-accent': '#fab062',
-  'axone-flounce': 'var(--color-axone-flounce)',
+  'axone-flounce': '#4a8c8c',
-  'axone-dark': 'var(--color-axone-dark)',
+  'axone-dark': '#011f26',
 }
```

### 5) Réseau Vercel et pnpm

Sur Vercel, forcer pnpm `9.x` dans `package.json` pour éviter les erreurs ETIMEDOUT liées au registre (Vercel utilise pnpm@10 par défaut):

```json
{
  "engines": {
    "pnpm": "9.x"
  }
}
```

Référence interne: voir aussi `vercel.json` si vous personnalisez l'environnement d'exécution.

### 6) Configuration des variables d'environnement

Pour configurer les variables d'environnement sur Vercel (comme `NEXT_PUBLIC_CORE_VIEWS_ADDRESS`), suivez ces étapes:

#### Via le Dashboard Vercel (recommandé)

1. **Accédez à votre projet** sur [vercel.com](https://vercel.com)
2. Allez dans **Settings** → **Environment Variables**
3. Ajoutez chaque variable avec les valeurs suivantes:

| Variable | Valeur | Environnement |
|----------|--------|---------------|
| `NEXT_PUBLIC_CORE_VIEWS_ADDRESS` | `0x1E2B0DccE25Eeb479F83DABE24ab687C6AB64292` (STRATEGY_1) ou `0x71a2B85dD822782A8031549f9B35629a5759F81B` (ERA_2) | Production, Preview, Development |

**Note:** Cochez tous les environnements (Production, Preview, Development) pour que la variable soit disponible partout.

#### Variables d'environnement recommandées

Variables essentielles pour le fonctionnement de l'application:

```env
# Adresse du contrat CoreInteractionViews (obligatoire pour les prix oracle)
NEXT_PUBLIC_CORE_VIEWS_ADDRESS=0x1E2B0DccE25Eeb479F83DABE24ab687C6AB64292

# Autres variables optionnelles (si utilisées)
# NEXT_PUBLIC_USDC_ADDRESS=0x0B80659a4076E9E93C7DbE0f10675A16a3e5C206
# NEXT_PUBLIC_VAULT_ADDRESS=0x72eEdd6cE1039E429e44F86b3DcA4A45e206a410
# NEXT_PUBLIC_HANDLER_ADDRESS=0x7551Ca74B5f2Cb3EF9f2e885f2fe9BF993bF570c
# NEXT_PUBLIC_L1_READ_ADDRESS=0xacE17480F4d157C48180f4ed10AB483238143e11
```

#### Adresses selon le déploiement

**STRATEGY_1** (déploiement 2025-11-21):
- `NEXT_PUBLIC_CORE_VIEWS_ADDRESS=0x1E2B0DccE25Eeb479F83DABE24ab687C6AB64292`

**ERA_2** (déploiement 2025-11-21):
- `NEXT_PUBLIC_CORE_VIEWS_ADDRESS=0x71a2B85dD822782A8031549f9B35629a5759F81B`

#### Gestion de plusieurs vaults

Si vous avez plusieurs vaults avec des adresses `CoreInteractionViews` différentes, vous pouvez :

1. **Option 1 (Recommandée)** : Définir `coreViewsAddress` pour chaque vault dans l'interface d'administration (`/admin/vaults`)
   - Chaque vault peut avoir sa propre adresse `CoreInteractionViews`
   - Si non défini, le système utilisera `NEXT_PUBLIC_CORE_VIEWS_ADDRESS` comme fallback

2. **Option 2** : Utiliser uniquement la variable d'environnement globale
   - Tous les vaults utiliseront la même adresse `NEXT_PUBLIC_CORE_VIEWS_ADDRESS`
   - Fonctionne si tous vos vaults partagent le même contrat `CoreInteractionViews`

**Recommandation** : Utilisez l'Option 1 pour une meilleure flexibilité, surtout si vous avez des vaults avec des déploiements différents (STRATEGY_1, ERA_2, etc.).

#### Après avoir ajouté les variables

1. **Redéployez** votre application (Vercel redéploiera automatiquement ou vous pouvez déclencher un nouveau déploiement)
2. Vérifiez que les variables sont bien chargées dans les logs de build

#### Via la CLI Vercel (alternative)

```bash
# Installer Vercel CLI si nécessaire
npm i -g vercel

# Ajouter une variable d'environnement
vercel env add NEXT_PUBLIC_CORE_VIEWS_ADDRESS

# Suivre les instructions pour sélectionner les environnements
```

#### Vérification

Après le déploiement, vérifiez que l'erreur "Variable d'environnement NEXT_PUBLIC_CORE_VIEWS_ADDRESS non définie" a disparu.

## Checklist rapide de validation

- [ ] `connect({ connector: injected() })`
- [ ] Aucune classe custom inconnue (ex: `bg-axone-black-20`) → remplacer par équivalent Tailwind
- [ ] `globals.css`: `@tailwind base/components/utilities` présents et ordonnés
- [ ] `tailwind.config.ts`: couleurs hex directes si besoin
- [ ] Event listeners typés `Event` si nécessaire
- [ ] `package.json → engines.pnpm` à `9.x` sur Vercel

## Résultat attendu

- Build Vercel sans erreur
- Styles Tailwind correctement appliqués
- Compatibilité wagmi v2 respectée
- Types TypeScript validés

