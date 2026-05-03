# STATERA-Testnet — Récap de session

> Dernière session : 9 mars 2026
> Repo GitHub : https://github.com/KingIrdawen/STATERA-Testnet
> Branch active : `main`
> App : `axone-app/` (Next.js 15, Wagmi v2, RainbowKit v2, Tailwind CSS 4)
> Chain : HyperEVM Testnet — Chain ID 998, token natif HYPE

---

## État du projet au moment de la pause

### Travaux réalisés cette session

#### 1. Landing page (`src/app/page-landing.tsx`)
- Police **Cinzel** appliquée globalement
- Fond `bg-[#0A0A0A]`
- Titres h1/h2/h3 en **gradient or métallique** : `linear-gradient(135deg, #7A4F28 0%, #C98B3D 25%, #F0CA7A 50%, #C98B3D 75%, #7A4F28 100%)`
- Logo sphère `logo-hero-detoure.png` : 600px, `brightness(1.25) contrast(0.95)`, positionné entre la description et les boutons CTA
- KPIs sous le fold (pas en hero)
- Texte "The Art of Volatility" supprimé
- **Bordures dorées avec reflet du haut** via `.landing-card` (cf. section Style ci-dessous)

#### 2. Navigation restructurée
- **Sidebar** (`DashboardSidebar.tsx`) : largeur `w-52` (était `w-64`)
  - Items : Dashboard · Market · ERA Staking · STA Staking · Swap · Arbitrage
  - Supprimé : Referral · Points (déplacés dans le header)
- **Header** (`DashboardHeader.tsx`) : nav centrale = Referral · Points · Docs uniquement
- **Mobile drawer** : liste unifiée de toutes les pages
- Toutes les pages dashboard : padding `md:pl-52` (était `md:pl-64`)

#### 3. Pages App — style unifié
Toutes les pages ont maintenant :
- Police Cinzel
- Fond `bg-[#0A0A0A]`
- Titres h1 en gradient or métallique (inline style)

Pages concernées : Dashboard · Market · ERA Staking · STA Staking · Swap · Arbitrage · Referral · Points

#### 4. Pages légales & docs — style unifié
- `terms-of-use/page.tsx`, `users-risk/page.tsx`, `cookies/page.tsx` : Cinzel + `bg-[#0A0A0A]` + classe `.legal-content` pour le gradient sur les titres
- `docs/layout.tsx` : Cinzel + `bg-[#0A0A0A]` + `.docs-content` CSS

#### 5. Nouvelles pages & fonctionnalités
- **STA Staking** (`/dashboard/staking-sta`) : nouvelle page, même modèle qu'ERA Staking avec `variant="STA"`
- **ERA Staking** : ancienne page Staking renommée, `variant="ERA"`
- **Staking summary** sur le Dashboard : affiche les pools ERA + STA avec bouton Claim
- **Liste/carte toggle** sur Market et pages Staking
- **Bouton Invest** sur chaque ligne du Market
- **Empty states** : "Go to Market" si pas de stratégies, "Start Staking" si pas de staking actif
- **Swap** : labels "Vault" remplacés par "ERA" (HYPE → ERA, ERA → HYPE)
- **Swap & Arbitrage** ajoutés dans la sidebar

#### 6. Style global — `.landing-card`
Défini dans `globals.css`, appliqué à **42 éléments cartes** partout dans l'app :
```css
.landing-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(140,90,30,0.22);
  position: relative;
}
.landing-card::before {
  /* Reflet doré centré sur le bord supérieur */
  content: '';
  position: absolute;
  top: -1px; left: 12%; right: 12%; height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(240,202,122,0.80) 50%, transparent 100%);
}
.landing-card:hover { border-color: rgba(180,120,40,0.38); }
```
Appliqué dans : DashboardStakingTab · DashboardReferralTab · DashboardArbitrageTab · DashboardSwapTab · StrategyCardEra · dashboard/strategy/page · dashboard/points/page · dashboard/strategy/[id]/page · app/strategies/page

---

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `src/app/page-landing.tsx` | Landing page complète |
| `src/app/globals.css` | CSS global : `.landing-card`, `.title-glow-line`, `.title-glow-blur` |
| `src/lib/fonts.ts` | Exports `cinzel` et `playfairDisplay` (next/font/google) |
| `src/components/DashboardSidebar.tsx` | Sidebar `w-52`, items : Dashboard/Market/ERA Staking/STA Staking/Swap/Arbitrage |
| `src/components/DashboardHeader.tsx` | Header : nav centre = Referral/Points/Docs |
| `src/components/DashboardStakingTab.tsx` | Tab staking avec `variant?: 'ERA'\|'STA'`, list/card toggle |
| `src/app/dashboard/staking-sta/page.tsx` | Page STA Staking (nouvelle) |
| `src/lib/placeholders.ts` | Données démo : DEMO_* |
| `public/logo-hero-detoure.png` | Sphère cuivrée (hero logo) |

---

## Choses à faire / idées en suspens

- [ ] Connexion aux vrais contrats on-chain quand déployés (remplacer DEMO_* par vraies données)
- [ ] Page de gouvernance / forum (mentionné dans Terms of Use comme "TBD")
- [ ] Tests E2E sur la navigation restructurée
- [ ] Vérifier le rendu mobile de la sidebar (actuellement `hidden md:block`)
- [ ] Optimisation images (logo hero 600px peut être lourd)

---

## Commandes utiles

```bash
# Depuis axone-app/
npm run dev      # Dev server http://localhost:3000
npm run build    # Build de production
npm run lint     # ESLint
```

## Variables d'environnement requises (`.env.local`)
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```
