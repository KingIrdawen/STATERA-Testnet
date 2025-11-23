# STRATEGY_1 — Déploiement HyperEVM Testnet

## Adresses

- L1Read: `0xCA4A9c9e937535c131394E868C6134f3e82974E0`
- CoreWriter (système): `0x3333333333333333333333333333333333333333`
- USDC (EVM): `0x0B80659a4076E9E93C7DbE0f10675A16a3e5C206`
- CoreInteractionHandler: `0x5d5Cd778D5C5FD8082e099A8e6d95ad83AE5CfeE`
- VaultContract: `0x5c4a979F19CaFE67ABf1E1fE883e4c15e8379473`

## Adresses — déploiement courant (dernier run `deploy_strategy1_testnet.js`)

**Dernier déploiement:** 2025-11-21 (redéploiement complet)

- L1Read: `0xacE17480F4d157C48180f4ed10AB483238143e11` ⚡ **NOUVEAU**
- CoreHandlerLogicLib: `0xD3d068ae44B19E7d398eDa2E4bAE1F83A27de863` ⚡ **NOUVEAU**
- CoreWriter (système): `0x3333333333333333333333333333333333333333`
- USDC (EVM): `0x0B80659a4076E9E93C7DbE0f10675A16a3e5C206`
- CoreInteractionHandler: `0x7551Ca74B5f2Cb3EF9f2e885f2fe9BF993bF570c` ⚡ **NOUVEAU**
- VaultContract: `0x72eEdd6cE1039E429e44F86b3DcA4A45e206a410` ⚡ **NOUVEAU**
- CoreInteractionViews: `0x1E2B0DccE25Eeb479F83DABE24ab687C6AB64292` ⚡ **NOUVEAU**

**Historique des déploiements précédents:**
- Déploiement 2025-01-XX:
  - L1Read: `0x46976ef07CA697f1546A7F5fcE6f6C6c1e8fdB6D`
  - CoreHandlerLogicLib: `0x79201af8A766F96A129c086477931742Bbec25bf`
  - CoreInteractionHandler: `0x071Bcc062D661536D77a09b38bFfd249B7B8195F`
  - VaultContract: `0x7659E4D1E1CAf66cCd7573Fa640c33E5e6bbd2F9`
  - CoreInteractionViews: `0x38fCB5F1e4498b537142ca2563e355127Af68fD2`
- Déploiement 2025-11-20:
  - L1Read: `0x4F730c91A1a4C3cC4733a96eF6Ea52901164c761`
  - CoreHandlerLogicLib: `0xF2E413D3F9F3582e8A39BEb962f60aeee6683701`
  - CoreInteractionHandler: `0xe1F039cEF269Ba678D867c55F5681852Cb7ad797` (avec limite de vente)
  - VaultContract: `0x83ec125f62521a15940857EdD19069d5cc4EAabE`
  - CoreInteractionViews: `0xa51941b7744013c8BFe0b9F52A351aAe290588Dc`
- Handler v2 (sans limite 1e12): `0x96f2b90dDe33348F347bd95CbF3A0830c30506C0`
- Handler v1 (avec limite 1e12): `0xa7b8306307572c3ec388939A4C18931D905519a1` (déprécié)

## Historique des déploiements

### Déploiement 2025-11-15

- L1Read: `0x71752E1caFa851f3Cdb34C1B8Dd5D4745d55403A`
- CoreWriter (système): `0x3333333333333333333333333333333333333333`
- USDC (EVM): `0x0B80659a4076E9E93C7DbE0f10675A16a3e5C206`
- CoreInteractionHandler: `0x5Ac60985E55d2B33cc2a26286a7325202bA487db`
- VaultContract: `0x82A9ec1B0c949c80dC9fDddD530DF83AB5190D46`

## Paramètres appliqués

- setUsdcCoreLink(`0x2000000000000000000000000000000000000000`, `0`)
- setHypeCoreLink(`0x2222222222222222222222222222222222222222`, `1105`)
- setSpotIds(`1054`, `1035`)
- setSpotTokenIds(`0`, `1129`, `1105`)
- setParams(`5000`, `500`, `50`)
- setMaxOracleDeviationBps(`4500`)
- setRebalancer(`0x1eE9C37E28D2DB4d8c35A94bB05C3f189191D506`)
- Vault.setFees(`50`, `50`, `10000`)

## Notes d’usage

- Les scripts de vérification lisent ces adresses par défaut, et acceptent des overrides via variables d’environnement: `HANDLER`, `VAULT`, `L1READ`.
- Réseau: `--network testnet` (HyperEVM). Assurez-vous que `contracts/env` contient `PRIVATE_KEY` et `TESTNET_RPC_URL`.

## Commandes utiles

- Statut: `cd contracts && ./node_modules/.bin/hardhat run scripts/status_strategy1_testnet.js --network testnet`
- Événements: `cd contracts && ./node_modules/.bin/hardhat run scripts/strategy1_verify_events_testnet.js --network testnet`
- Rebalance: `cd contracts && GAS_PRICE_GWEI=3 ./node_modules/.bin/hardhat run scripts/strategy1_rebalance_testnet.js --network testnet`


