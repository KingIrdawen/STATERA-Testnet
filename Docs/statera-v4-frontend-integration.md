Statera v4 — Intégration
Frontend
Guide d’intégration multi-counterpart pour développeurs
1 mai 2026
Contexte
Le Statera v4 est l’évolution multi-counterpart du vault v1.2
actuel. Là où la v1.2 maintient un panier HYPE / 1 token (par ex.
HYPE/UETH), la v4 gère un panier HYPE / N tokens avec poids
configurables (par ex. HYPE 33% / UETH 33% / UNIT 34%).
Côté smart contracts, c’est un nouveau couple implementation +
factory déployé en parallèle de l’ancien sur le même testnet
HyperEVM (chainId 998). Les deux versions cohabitent — les vaults
v1.2 existants restent fonctionnels et indépendants.
Bonne nouvelle : 90% du
boulot frontend est identique
L’API publique du contrat v4 conserve les mêmes signatures pour
les fonctions clés que la v1.2 :
Signature identique ?
Méthode v1.2 v4 deposit() ✓ ✓ ✓
requestRedeem(shares) ✓ ✓ ✓
claimBatch(reqId) ✓ ✓ ✓
claimRecovery() ✓ ✓ ✓
grossAssets() ✓ ✓ ✓
sharePriceUsdc8() ✓ ✓ ✓
currentCycle() ✓ ✓ ✓ (même tuple)
currentSettlement() ✓ ✓ ✓ (même tuple)
Méthode v1.2 v4 Signature identique ?
currentBatchId ✓ ✓ ✓
batches(uint64) ✓ ✓ ✓ (même tuple)
withdrawRequests(uint) ✓ ✓ ✓
emergencyMode ✓ ✓ ✓
recoveryComplete ✓ ✓ ✓
targetHypeBps ✓ ✓ ✓
targetUsdcBps ✓ ✓ ✓
hypeTokenIndex ✓ ✓ ✓
usdcTokenIndex ✓ ✓ ✓
balanceOf(addr) ✓ ✓ ✓ (ERC-20)
totalSupply() ✓ ✓ ✓ (ERC-20)
Concrètement : tous les hooks de deposit/redeem/claim/affichage
NAV/cycle status fonctionnent tels quels — il suffit de pointer sur
l’ABI v4 au lieu de l’ABI v1.2.
Adresses testnet (chainId
998)
RebalancingVaultV4 (impl)
0x75bb7a9613a21721ed3d0308058b06349f543ba9
VaultFactoryV4
0xf77cFeFaeA0FEad738A3e77dA3E7Fbd950350CDd
IdentityLibV4 (lib externe)
0xb504f94d4653649bd7dd41ba0fb69780664a792a
Vault demo HYPE/UETH/UNIT
0x3DBCd84FB3C5C8Ae0D228c6C80f207325a5B8bA6
Composition : HYPE 33% / UETH 33% / UNIT 34% / USDC 0%
maxSingleDeposit : 10 HYPE
L’ABI v4 est dans le repo : out/RebalancingVaultV4.sol/
RebalancingVaultV4.json (extrait via jq '.abi' de l’artifact Foundry).
L’ABI factory v4 : out/VaultFactoryV4.sol/VaultFactoryV4.json.
Découverte des vaults
Comme en v1.2, la factory expose vaultCount() et
allVaults(uint256). Pour avoir tous les vaults (anciens +
nouveaux), il faut itérer sur les deux factories en parallèle et
tagger chaque vault avec sa version :
// Pseudo-code TypeScript (wagmi/viem)
const v3Count = await read(factoryV3, 'vaultCount');
const v3Vaults = await Promise.all(
Array.from({ length: Number(v3Count) },
(_, i) => read(factoryV3, 'allVaults', [BigInt(i)])
.then(addr => ({ addr, version: 'v3' as const }))
)
);
const v4Count = await read(factoryV4, 'vaultCount');
const v4Vaults = await Promise.all(
Array.from({ length: Number(v4Count) },
(_, i) => read(factoryV4, 'allVaults', [BigInt(i)])
.then(addr => ({ addr, version: 'v4' as const }))
)
);
const allVaults = [...v3Vaults, ...v4Vaults];
Ensuite, chaque appel de hook prend l’ABI correspondante :
const abi = vault.version === 'v4' ? rebalancingVaultV4Abi :
rebalancingVaultAbi;
Seule différence structurelle :
la composition du panier
En v1.2, le panier est connu via deux storage slots :
counterpartToken (adresse EVM) et counterpartTokenIndex (index HL
spot).
En v4, le panier est un tableau dynamique : counterparts[].
Lecture de la composition v4
function counterpartCount() external view returns (uint256);
function counterparts(uint256 i) external view returns (
address evmContract,
address deployer,
bytes32 nameHash,
uint32 tokenIndex,
uint32 spotMarketIndex,
uint16 targetBps,
uint8 szDecimals,
uint8 weiDecimals,
uint8 evmDecimals
);
Hook React typé
type Counterpart = {
evmContract: `0x${string}`
deployer: `0x${string}`
nameHash: `0x${string}`
;
;
tokenIndex: number;
spotMarketIndex: number;
targetBps: number;
szDecimals: number;
weiDecimals: number;
evmDecimals: number;
;
};
async function readCounterparts(vaultAddr: `0x${string}`):
Promise<Counterpart[]> {
const count = await read(vaultAddr, rebalancingVaultV4Abi,
'counterpartCount');
const cps = await Promise.all(
Array.from({ length: Number(count) }, (_, i) =>
read(vaultAddr, rebalancingVaultV4Abi, 'counterparts',
[BigInt(i)])
)
);
spotMarketIndex,
return cps.map(([evmContract, deployer, nameHash, tokenIndex,
targetBps, szDecimals, weiDecimals,
evmDecimals]) => ({
evmContract, deployer, nameHash,
tokenIndex: Number(tokenIndex),
spotMarketIndex: Number(spotMarketIndex),
targetBps: Number(targetBps),
szDecimals: Number(szDecimals),
weiDecimals: Number(weiDecimals),
evmDecimals: Number(evmDecimals),
}));
}
Affichage de la composition
Pour afficher la pondération complète d’un vault v4 :
const cps = await readCounterparts(vaultAddr);
const hypeBps = await read(vaultAddr, abi, 'targetHypeBps'); //
ex: 3333
const usdcBps = await read(vaultAddr, abi, 'targetUsdcBps'); //
ex: 0
const composition = [
{ symbol: 'HYPE', bps: hypeBps },
...cps.map(cp => ({ symbol: tokenNameFromIndex(cp.tokenIndex),
bps: cp.targetBps })),
...(usdcBps > 0 ? [{ symbol: 'USDC', bps: usdcBps }] : []),
];
// Σ targetBps = 10000 (invariant garanti à la création)
Pour résoudre tokenNameFromIndex, soit on appelle l’API HL POST /
info {"type": "spotMeta"} une fois et on cache le mapping
tokenIndex → name, soit on stocke un mapping local pour les tokens
connus (HYPE 1105, UETH 1242, UNIT 1129…).
Storage v4 supplémentaire
(pour info, optionnel à
afficher)
Le contrat v4 expose quelques renonciations granulaires en plus de
la v1.2 :
bool public targetsRenounced; // pondérations figées
bool public driftRenounced; // seuil drift figé
bool public feeConfigRenounced; // config frais figée
bool public depositsLockRenounced; // lock dépôts figé
Utile pour afficher un badge “Immuable” / “Configurable” dans l’UI
selon les flags actifs (mais pas bloquant pour une intégration de
base).
Resumé : checklist
d’intégration
1.
Ajouter VAULT_FACTORY_V4_ADDRESS + rebalancingVaultV4Abi aux
constants
2.
3.
4.
5.
Étendre la découverte → itérer les deux factories, tagger
chaque vault v3/v4
Dans chaque hook (useDeposit, useUserPosition, useVaultReads,
useRequestRedeem, useClaimBatch), choisir l’ABI selon la version
Adapter le composant “Détail vault” pour afficher la
composition complète via counterparts[] au lieu d’un seul token
(Optionnel) Afficher les badges de renonciation
Tout le reste (NAV, share price, batch claim, emergency, etc.)
fonctionne tel quel sans rien modifier.
Vérification rapide
Pour confirmer que ton intégration lit correctement le vault v4
demo :
Vault : 0x3DBCd84FB3C5C8Ae0D228c6C80f207325a5B8bA6
Attendu : counterpartCount() == 2
counterparts(0).evmContract ==
0x5a1A1339ad9e52B7a4dF78452D5c18e8690746f3 (UETH)
counterparts(0).targetBps == 3333
counterparts(1).evmContract ==
0x09F83c5052784c63603184e016e1Db7a24626503 (UNIT)
counterparts(1).targetBps == 3334
targetHypeBps == 3333
targetUsdcBps == 0