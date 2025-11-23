# ERA_2 — Déploiement HyperEVM Testnet

## Adresses — déploiement courant (dernier run `deploy_era2_testnet.js`)

**Dernier déploiement:** 2025-11-21

- L1Read: `0x2021BFd4D98ffE9fB1AC5B757a50005fEbF684D3` ⚡ **NOUVEAU**
- CoreHandlerLogicLib: `0xFb7D873aFee4c6b7B20c1E8e8386B638FA046247` ⚡ **NOUVEAU**
- CoreWriter (système): `0x3333333333333333333333333333333333333333`
- USDC (EVM): `0x0B80659a4076E9E93C7DbE0f10675A16a3e5C206`
- CoreInteractionHandler: `0xb0e110f9236a6c48BE31E0EEaa26272e5973Bc5b` ⚡ **NOUVEAU**
- VaultContract: `0x3F60ff8c0838965A981B115E86E1d2567266b021` ⚡ **NOUVEAU**
- CoreInteractionViews: `0x71a2B85dD822782A8031549f9B35629a5759F81B` ⚡ **NOUVEAU**

## Paramètres appliqués

- setUsdcCoreLink(`0x2000000000000000000000000000000000000000`, `0`)
- setHypeCoreLink(`0x2222222222222222222222222222222222222222`, `1105`)
- setSpotIds(`1137`, `1035`) — **TOKEN1/USDC et HYPE/USDC**
- setSpotTokenIds(`0`, `1242`, `1105`) — **USDC, TOKEN1, HYPE**
- setParams(`5000`, `500`, `50`)
- setMaxOracleDeviationBps(`4500`)
- setRebalancer(`0x1eE9C37E28D2DB4d8c35A94bB05C3f189191D506`)
- Vault.setFees(`50`, `50`, `10000`)

## Différences avec STRATEGY_1

- **SPOT_TOKEN1_ID**: `1137` (au lieu de `1054` pour BTC)
- **TOKEN1_TOKEN_ID**: `1242` (au lieu de `1129` pour BTC)
- **Vault name**: "ERA 2 Share" (au lieu de "Axone Strategy 1 Share")
- **Vault symbol**: "ERA2" (au lieu de "sAXN1")

## Notes d'usage

- Les scripts de vérification peuvent lire ces adresses par défaut, et acceptent des overrides via variables d'environnement: `HANDLER`, `VAULT`, `L1READ`.
- Réseau: `--network testnet` (HyperEVM). Assurez-vous que `contracts/env` contient `PRIVATE_KEY` et `TESTNET_RPC_URL`.
- **Important**: Effectuez un micro-transfert HyperCore vers l'adresse du handler après déploiement pour éviter `CoreAccountMissing()` lors du premier ordre.

## Commandes utiles

- Déploiement: `cd contracts && npx hardhat run scripts/deploy_era2_testnet.js --network testnet`
- Statut: (scripts à créer si nécessaire)
- Rebalance: (scripts à créer si nécessaire)

