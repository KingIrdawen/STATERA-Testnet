# Flux complet : Création, Stockage et Consultation des Stratégies

Ce document explique en détail comment une stratégie est créée, stockée et consultée dans l'application Statera.

## 📊 Vue d'ensemble du flux

```
┌─────────────────┐
│  Page Admin     │  ← Création via formulaire
│  /admin         │
└────────┬────────┘
         │
         │ POST /api/strategies
         ▼
┌─────────────────┐
│  API Route      │  ← Validation et traitement
│  route.ts       │
└────────┬────────┘
         │
         │ addStrategy()
         ▼
┌─────────────────┐
│  lib/strategies │  ← Écriture dans le fichier
│  .ts            │
└────────┬────────┘
         │
         │ writeFileSync()
         ▼
┌─────────────────┐
│  data/          │  ← Stockage persistant
│  strategies.json│
└────────┬────────┘
         │
         │ GET /api/strategies
         ▼
┌─────────────────┐
│  useStrategies  │  ← Hook de lecture
│  hook           │
└────────┬────────┘
         │
         │ strategies[]
         ▼
┌─────────────────┐
│  Dashboard      │  ← Affichage
│  /dashboard     │
└─────────────────┘
```

---

## 1️⃣ CRÉATION : Page Admin (`/admin`)

### Fichier : `src/app/admin/page.tsx`

### Processus de création

#### Étape 1 : Remplissage du formulaire

L'utilisateur remplit le formulaire avec :

```typescript
{
  name: string,              // Nom de la stratégie
  description: string,       // Description (optionnel)
  riskLevel: 'low' | 'medium' | 'high',
  apy?: number,             // APY en % (optionnel)
  usdcAddress: string,      // Adresse du contrat USDC
  vaultAddress: string,     // Adresse du contrat Vault
  handlerAddress: string,   // Adresse du CoreInteractionHandler
  l1ReadAddress: string,    // Adresse du contrat L1Read
  tokens: Token[]          // Liste des tokens avec allocations
}
```

#### Étape 2 : Validation

```typescript
// Vérification que les allocations totalisent 100%
const totalAllocation = formData.tokens.reduce((sum, token) => sum + token.allocation, 0);
if (totalAllocation !== 100) {
  alert('La répartition des tokens doit totaliser 100%');
  return;
}
```

#### Étape 3 : Construction de l'objet Index

```typescript
const newIndex: Index = {
  id: editingIndex?.id || Date.now().toString(),  // ID unique (timestamp)
  name: formData.name,
  description: formData.description,
  riskLevel: formData.riskLevel,
  apy: formData.apy,
  usdcAddress: formData.usdcAddress,
  vaultAddress: formData.vaultAddress,
  handlerAddress: formData.handlerAddress,
  l1ReadAddress: formData.l1ReadAddress,
  tokens: formData.tokens.filter(token => token.symbol)  // Filtre les tokens vides
};
```

#### Étape 4 : Envoi à l'API

```typescript
if (editingIndex) {
  await updateStrategy(newIndex);  // Modification
} else {
  await createStrategy(newIndex);  // Création
}
```

---

## 2️⃣ STOCKAGE : API Route et Fichier JSON

### Fichier API : `src/app/api/strategies/route.ts`

### Processus de stockage

#### Étape 1 : Réception de la requête POST

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  const strategy: Index = body;
  
  // Validation basique
  if (!strategy.name || !strategy.tokens || strategy.tokens.length === 0) {
    return NextResponse.json({ error: 'Invalid strategy data' }, { status: 400 });
  }
  
  addStrategy(strategy);  // Appel à la fonction de stockage
  return NextResponse.json({ success: true, strategy });
}
```

### Fichier de stockage : `src/lib/strategies.ts`

#### Étape 2 : Lecture du fichier existant

```typescript
const STRATEGIES_FILE = path.join(process.cwd(), 'data', 'strategies.json');

export function getStrategies(): Index[] {
  ensureStrategiesFile();  // Crée le fichier s'il n'existe pas
  const fileData = fs.readFileSync(STRATEGIES_FILE, 'utf-8');
  return JSON.parse(fileData);  // Parse le JSON
}
```

#### Étape 3 : Ajout de la nouvelle stratégie

```typescript
export function addStrategy(strategy: Index): void {
  const strategies = getStrategies();  // Lit toutes les stratégies
  strategies.push(strategy);            // Ajoute la nouvelle
  saveStrategies(strategies);           // Sauvegarde dans le fichier
}
```

#### Étape 4 : Écriture dans le fichier JSON

```typescript
export function saveStrategies(strategies: Index[]): void {
  ensureStrategiesFile();  // S'assure que le dossier data/ existe
  fs.writeFileSync(
    STRATEGIES_FILE, 
    JSON.stringify(strategies, null, 2)  // Formatage avec indentation
  );
}
```

### Fichier de stockage : `data/strategies.json`

#### Structure du fichier

```json
[
  {
    "id": "1762104896326",
    "name": "BTC50DEF",
    "description": "",
    "riskLevel": "low",
    "apy": 12.5,
    "usdcAddress": "0xd9cbec81df392a88aeff575e962d149d57f4d6bc",
    "vaultAddress": "0x5A972d1F33e8fC6fda9a0d90695c8Ab88C45aA38",
    "handlerAddress": "0x481e6bB8E5C5BfF55c21cb1D4b873cEdFdF4C7c7e6",
    "l1ReadAddress": "0xB0abB10Ebe4ba837Ff145a7eE18fa7E7d31F8fF7",
    "tokens": [
      {
        "symbol": "BTC",
        "name": "",
        "allocation": 50,
        "logo": "",
        "tokenId": ""
      },
      {
        "symbol": "HYPE",
        "name": "",
        "allocation": 50,
        "logo": "",
        "tokenId": "0x0d01dc56dcaac6a6d901c959b4011ec"
      }
    ]
  }
]
```

---

## 3️⃣ CONSULTATION : Hook et Dashboard

### Fichier Hook : `src/hooks/useStrategies.ts`

### Processus de consultation

#### Étape 1 : Chargement initial au montage

```typescript
useEffect(() => {
  if (typeof window !== 'undefined') {
    fetchStrategies();  // Charge les stratégies au montage du composant
  }
}, [fetchStrategies]);
```

#### Étape 2 : Appel API GET

```typescript
const fetchStrategies = useCallback(async () => {
  const baseUrl = window.location.origin;
  const apiUrl = `${baseUrl}/api/strategies`;
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'force-cache',
    next: { revalidate: 60 },
  });
  
  const data = await response.json();
  const strategiesList = Array.isArray(data) ? data : (data.strategies || []);
  setStrategies(strategiesList);  // Met à jour l'état
}, []);
```

#### Étape 3 : Retour de l'API

L'API route lit le fichier JSON :

```typescript
// src/app/api/strategies/route.ts
export async function GET() {
  const strategies = getStrategies();  // Lit depuis data/strategies.json
  return NextResponse.json({ strategies });
}
```

#### Étape 4 : Mise à jour de l'état React

```typescript
const [strategies, setStrategies] = useState<Index[]>([]);

// Après le fetch
setStrategies(strategiesList);  // Met à jour l'état
```

### Fichier Dashboard : `src/app/dashboard/page.tsx`

#### Étape 5 : Utilisation du hook

```typescript
export default function DashboardPage() {
  const { strategies, loading } = useStrategies();  // Récupère les stratégies
  
  // Filtrage et tri
  const getFilteredStrategies = () => {
    // ... logique de filtrage
    return filtered;
  };
  
  // Affichage
  return (
    <div>
      {getFilteredStrategies().map((strategy) => (
        <StrategyCard key={strategy.id} strategy={strategy} />
      ))}
    </div>
  );
}
```

#### Étape 6 : Affichage dans StrategyCard

```typescript
function StrategyCard({ strategy }: { strategy: Index }) {
  const { data, isLoading } = useStrategyData(strategy);  // Récupère les données on-chain
  
  return (
    <div>
      <h4>{strategy.name}</h4>
      <p>APY: {strategy.apy}%</p>
      <p>Total Deposited: {data?.coreEquityUsd}</p>
      {/* ... */}
    </div>
  );
}
```

---

## 🔄 Opérations CRUD complètes

### CREATE (Créer)

```
Admin Page → handleSubmit()
  ↓
createStrategy(newIndex)
  ↓
POST /api/strategies
  ↓
addStrategy(strategy)
  ↓
getStrategies() → strategies.push() → saveStrategies()
  ↓
data/strategies.json (écriture)
```

### READ (Lire)

```
Dashboard → useStrategies()
  ↓
fetchStrategies()
  ↓
GET /api/strategies
  ↓
getStrategies()
  ↓
data/strategies.json (lecture)
  ↓
setStrategies(strategiesList)
```

### UPDATE (Modifier)

```
Admin Page → handleEdit() → handleSubmit()
  ↓
updateStrategy(updatedIndex)
  ↓
PUT /api/strategies
  ↓
updateStrategy(id, updatedStrategy)
  ↓
getStrategies() → findIndex() → strategies[index] = updated → saveStrategies()
  ↓
data/strategies.json (écriture)
```

### DELETE (Supprimer)

```
Admin Page → handleDelete()
  ↓
deleteStrategy(id)
  ↓
DELETE /api/strategies?id=xxx
  ↓
deleteStrategy(id)
  ↓
getStrategies() → filter() → saveStrategies()
  ↓
data/strategies.json (écriture)
```

---

## 📁 Structure des fichiers

```
axone-app/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.tsx          ← Création (formulaire)
│   │   ├── dashboard/
│   │   │   └── page.tsx          ← Consultation (affichage)
│   │   └── api/
│   │       └── strategies/
│   │           └── route.ts      ← API CRUD (GET, POST, PUT, DELETE)
│   ├── hooks/
│   │   └── useStrategies.ts     ← Hook de lecture/écriture
│   ├── lib/
│   │   └── strategies.ts        ← Fonctions de stockage (fichier JSON)
│   └── types/
│       └── index.ts              ← Interface TypeScript Index
└── data/
    └── strategies.json           ← Stockage persistant (JSON)
```

---

## 🔑 Points importants

### 1. **ID unique**
- Généré avec `Date.now().toString()` lors de la création
- Conservé lors des modifications
- Utilisé pour identifier une stratégie lors des opérations UPDATE/DELETE

### 2. **Validation**
- **Côté client** : Vérification des allocations (100%)
- **Côté serveur** : Vérification de la présence de `name` et `tokens`

### 3. **Synchronisation**
- Après chaque opération (CREATE, UPDATE, DELETE), le hook `useStrategies` fait un `fetchStrategies()` pour rafraîchir les données
- Garantit que l'interface affiche toujours les données à jour

### 4. **Stockage persistant**
- Les stratégies sont stockées dans `data/strategies.json`
- Le fichier est créé automatiquement s'il n'existe pas
- Format JSON avec indentation pour lisibilité

### 5. **Type Safety**
- Toutes les stratégies respectent l'interface `Index` définie dans `types/index.ts`
- TypeScript garantit la cohérence des données

---

## 🎯 Exemple complet : Création d'une stratégie

1. **Utilisateur va sur `/admin`**
2. **Remplit le formulaire** :
   - Nom: "BTC50DEF"
   - Risk: "low"
   - APY: 12.5
   - USDC Address: `0xd9c...`
   - Vault Address: `0x5A9...`
   - Handler Address: `0x481...`
   - L1Read Address: `0xB0a...`
   - Token 1: BTC, 50%, tokenId: ""
   - Token 2: HYPE, 50%, tokenId: "0x0d01..."
3. **Clique sur "Créer"**
4. **Validation** : Les allocations totalisent 100% ✅
5. **Construction de l'objet** : `{ id: "1762104896326", name: "BTC50DEF", ... }`
6. **POST `/api/strategies`** avec le body JSON
7. **API route** valide et appelle `addStrategy()`
8. **`lib/strategies.ts`** :
   - Lit `data/strategies.json` → `[]`
   - Ajoute la nouvelle stratégie → `[{...}]`
   - Écrit dans `data/strategies.json`
9. **Hook `useStrategies`** fait un `fetchStrategies()` pour rafraîchir
10. **Dashboard** affiche automatiquement la nouvelle stratégie

---

## 📝 Notes techniques

- **Côté serveur** : Les fonctions dans `lib/strategies.ts` utilisent `fs` (Node.js) et ne fonctionnent que côté serveur
- **Côté client** : Le hook `useStrategies` fait des appels HTTP vers l'API
- **Cache** : Les requêtes GET utilisent `cache: 'force-cache'` avec revalidation toutes les 60 secondes
- **Timeout** : Les requêtes ont un timeout de 3 secondes pour éviter les blocages

