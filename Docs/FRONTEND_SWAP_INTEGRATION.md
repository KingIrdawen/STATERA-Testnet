# Intégration frontend — module Swap (testnet)

**Date** : 2026-05-09
**Réseau** : Hyperliquid testnet (chainId 998)

## 1. Nouvelles adresses à mettre dans la config

```
VAULT_FACTORY_V4   = 0x78da1C971ABf5e19d86F64Ff9dF366aF5269c302   ← NOUVELLE (avec hook auto-pool)
SWAP_POOL_FACTORY  = 0x69Bb934011ca1cdbDf35A39816D9e194FD86F9Eb
```

L'ancienne factory v4 (`0x3e0a2144...`) reste valide pour interagir avec les vaults qu'elle a déployés (notamment le vault demo `0x533abf...8873` et son pool `0x250fbaF...5EB4`). Les **nouveaux** vaults doivent passer par la nouvelle factory pour bénéficier de l'auto-création du pool.

## 2. Pools existantes (à intégrer côté UI)

| Vault | Composition | Adresse vault | Adresse pool LP |
|---|---|---|---|
| v4 demo | HYPE/SOVY/ZIGG (33/33/34) | `0x533abf396c20e241f8100a8640cbb5414b0f8873` | `0x250fbaF854787626dd793a8E85deeE6608Ce5EB4` |
| v1.2 SOVY | HYPE/SOVY (48/48/4) | `0x22276e9562e38c309f8Dedf8f1fB405297560da7` | *(à créer — voir §4)* |
| v1.2 BARK | HYPE/BARK (48/48/4) | `0x720021b106B42a625c1dC2322214A3248A09bb6a` | *(à créer — voir §4)* |
| v1.2 ZIGG | HYPE/ZIGG (48/48/4) | `0x66e880e2bd93243569B985499aD00Df543a77554` | *(à créer — voir §4)* |

## 3. Comment se comporte le hook auto-pool

À chaque appel `VaultFactoryV4.createVault(...)` sur la **nouvelle factory**, un pool est automatiquement créé via `SwapPoolFactory.createPool(vault)`. Ça émet deux events à indexer :

```solidity
event VaultCreated(address indexed vault, address indexed owner, uint256 vaultIndex);
event SwapPoolAutoCreated(address indexed vault, address indexed pool);
```

Le pool est vide à la création — il faut au moins une opération `addLiquidity` avant que les swaps fonctionnent.

## 4. Création manuelle d'un pool pour les vaults existants

Les vaults v1.2 et le vault v4 ont été déployés **avant** l'ajout du hook. Pour leur attacher un pool, il faut un appel manuel :

```solidity
SwapPoolFactory(0x69Bb934...).createPool(<adresse_du_vault>);
```

C'est permissionless (n'importe qui peut appeler `createPool`). Une fois la pool créée, son adresse est récupérable via :

```solidity
SwapPoolFactory(0x69Bb934...).getPool(<adresse_du_vault>);
```

Côté UI, soit :
- (a) on lance ces 3 transactions une fois pour toutes (depuis n'importe quel wallet) puis on hardcode les adresses dans la config,
- (b) on les crée à la volée la première fois qu'un user clique sur "ajouter de la liquidité" pour ce vault.

Recommandation : **(a)** pour les vaults connus, **(b)** générique pour les nouveaux vaults qui ne passent pas par le hook.

## 5. Surface SwapPool — fonctions utilisateur

```solidity
// Lectures (pas de gas)
function getReserves() view returns (uint256 hypeReserve, uint256 vaultTokenReserve);
function getAmountOut(uint256 amountIn, bool hypeIn) view returns (uint256 amountOut);
function lpToken() view returns (address);   // ERC20 à afficher dans le wallet de l'utilisateur

// Liquidité
function addLiquidity(uint256 hypeAmount, uint256 vaultTokenAmount) payable
    returns (uint256 liquidity);              // msg.value === hypeAmount, approve vault token au préalable
function removeLiquidity(uint256 lpTokenAmount, address to)
    returns (uint256 hypeOut, uint256 vaultTokenOut);

// Swaps
function swapHypeForVaultToken(uint256 hypeIn, address to) payable
    returns (uint256 vaultTokenOut);
function swapVaultTokenForHype(uint256 vaultTokenIn, address to)
    returns (uint256 hypeOut);                // approve vault token au préalable

// Maintenance
function sync();                              // resynchronise reserves avec balances réelles
```

### Events à indexer
```solidity
event Mint(address indexed sender, uint256 amount0, uint256 amount1, uint256 liquidity);
event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to);
event Swap(
    address indexed sender,
    uint256 amount0In, uint256 amount1In,
    uint256 amount0Out, uint256 amount1Out,
    uint256 protocolFeeHype, uint256 lpFeeHype,
    address indexed to
);
event Sync(uint256 reserve0, uint256 reserve1);
```

`amount0` = HYPE, `amount1` = vault token. `protocolFeeHype` et `lpFeeHype` permettent d'afficher les fees au user dans une transaction de swap.

## 6. Modèle de fees (info à afficher dans l'UI)

- **Total fee** : 0.5% (50 bps), toujours dénominé en HYPE
  - Swap HYPE → vaultToken : prélevé sur le HYPE input
  - Swap vaultToken → HYPE : prélevé sur le HYPE output
- **Split** :
  - 50% (= 0.25%) → protocole (transferé en HYPE à `protocolFeeRecipient` à chaque swap)
  - 50% (= 0.25%) → reste dans la pool, **auto-compound** sur les positions LP (pas de claim, ça augmente la valeur de chaque LP token au fil des swaps)
- **Cap** : 100 bps (1%), settable par l'owner de `SwapPoolFactory`

Les LPs récupèrent leur part des fees accumulés en faisant `removeLiquidity` (proportionnel à leur LP token / totalSupply).

## 7. UX patterns recommandés

### Add liquidity
1. User saisit montant HYPE et montant vaultToken
2. Si `totalSupply == 0` (premier dépôt) : le ratio fixe le prix initial de la pool — afficher une warning
3. Sinon : auto-suggest le second montant pour respecter le ratio actuel des reserves (sinon le pool prend le min, l'imbalance est perdue)
4. `vault.approve(pool, vaultTokenAmount)` (transaction 1)
5. `pool.addLiquidity{value: hypeAmount}(hypeAmount, vaultTokenAmount)` (transaction 2)
6. Listen `Mint` event → mettre à jour balance LP de l'utilisateur

### Remove liquidity
1. User choisit % de ses LP tokens à retirer
2. Preview : `lpAmount * reserves / totalSupply` pour chaque côté
3. `pool.removeLiquidity(lpAmount, userAddress)` (1 tx)
4. Listen `Burn` event

### Swap
1. User saisit `amountIn` et direction
2. Preview : `pool.getAmountOut(amountIn, hypeIn)` → afficher le slippage par rapport à un swap parfait (sans fee)
3. Si direction = vaultToken→HYPE : `vault.approve(pool, amountIn)` (transaction 1)
4. Appel swap correspondant (transaction 2 ou 1 selon direction)
5. Listen `Swap` event

## 8. Wallet integration

Pour chaque pool, le LP token est un ERC20 standard mintable seulement par la pool. Adresse récupérable via `pool.lpToken()`. Le user peut l'ajouter à son wallet (MetaMask "import token") pour voir son solde.

Symbole du LP token : `LP-HYPE-<symbole_du_vault>` (ex : `LP-HYPE-sV4` pour le vault v4 demo).

## 9. ⚠️ Points d'attention

- **Pas de mainnet pour le moment** — toutes les adresses ci-dessus sont sur testnet 998.
- **Le pool demo v4 est seedé** avec 0.5 HYPE + 50 sV4 (ratio AMM ~100 sV4/HYPE, légèrement éloigné du NAV $1.026/share = 88 sV4/HYPE — ça crée une opportunité d'arbitrage que tu peux laisser au marché).
- **Les vaults v1.2** n'ont pas encore de pools. Il faudra décider qui (équipe ou users) seed la liquidité initiale, et avec quels montants.
- **Le `protocolFeeRecipient` est le keeper EOA** (`0x1eE9C37...D506`) en attendant le multisig/treasury de Lumen Labs. Quand prêt, appeler `SwapPoolFactory.setProtocolFeeRecipient(treasuryAddr)` (onlyOwner).
- **`SLIPPAGE_CAP_BPS` du vault** est figé à 1500 bps (15%) sur testnet — sera ramené à 500 (5%) avant mainnet. Indépendant des fees du swap pool.

## 10. Récap des adresses (à copier dans la config)

```typescript
// testnet (chainId 998)
export const ADDRESSES = {
  vaultFactoryV4: "0x78da1C971ABf5e19d86F64Ff9dF366aF5269c302",
  swapPoolFactory: "0x69Bb934011ca1cdbDf35A39816D9e194FD86F9Eb",

  vaults: {
    v4Demo: {
      vault: "0x533abf396c20e241f8100a8640cbb5414b0f8873",
      pool:  "0x250fbaF854787626dd793a8E85deeE6608Ce5EB4",
    },
    v12Sovy: {
      vault: "0x22276e9562e38c309f8Dedf8f1fB405297560da7",
      pool:  null, // à créer via SwapPoolFactory.createPool(vault)
    },
    v12Bark: {
      vault: "0x720021b106B42a625c1dC2322214A3248A09bb6a",
      pool:  null,
    },
    v12Zigg: {
      vault: "0x66e880e2bd93243569B985499aD00Df543a77554",
      pool:  null,
    },
  },
};
```
