// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {BaseSimulatorTest} from "../Lib_EVM/hyper-evm-lib/test/BaseSimulatorTest.sol";
import {CoreInteractionHandler} from "../src/STRATEGY_1/CoreInteractionHandler.sol";
import {VaultContract, IHandler, ICoreInteractionViews} from "../src/STRATEGY_1/VaultContract.sol";
import {CoreInteractionViews} from "../src/STRATEGY_1/CoreInteractionViews.sol";
import {L1Read} from "../src/STRATEGY_1/interfaces/L1Read.sol";
import {PrecompileLib} from "../Lib_EVM/hyper-evm-lib/src/PrecompileLib.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Contrat de base qui prépare un environnement HyperCore simulé
/// et instancie les contrats STRATEGY_1 connectés à cette simulation.
abstract contract Strategy1BaseTest is BaseSimulatorTest {
    using PrecompileLib for address;

    // Contrats STRATEGY_1
    VaultContract public vault;
    CoreInteractionHandler public handler;
    CoreInteractionViews public views;

    // L1Read de la lib EVM (mêmes structures que l’interface STRATEGY_1)
    L1Read public l1read;

    // USDC EVM et paramètres Core
    address public usdcEvm = 0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8;

    function setUp() public virtual override {
        // Initialise le fork + CoreSimulatorLib + hyperCore + balances user
        BaseSimulatorTest.setUp();

        // Déployer un L1Read qui wrappe les précompiles simulées
        l1read = new L1Read();

        // L’USDC Core est le token 0 dans la simulation Lib_EVM
        uint64 usdcTokenId = USDC_TOKEN;
        // Adresse système Core simulée pour USDC (cf. BASE_SYSTEM_ADDRESS dans HLConstants)
        address usdcSystemAddress =
            address(uint160(0x2000000000000000000000000000000000000000) + usdcTokenId);

        // IDs spot pour BTC/HYPE dans la lib
        uint32 spotBtc = 0; // BTC/USDC market id dans la simulation
        uint32 spotHype = 150; // HYPE/USDC market id dans la simulation

        // Token ids pour les soldes spot HL (USDC=0, BTC=?, HYPE=150)
        uint64 spotTokenBtc = 0; // pour simplifier les premiers tests on ne lit que HYPE/USDC
        uint64 spotTokenHype = HYPE_TOKEN;

        // Deploy handler + vault + views
        handler = new CoreInteractionHandler(
            L1Read(address(l1read)),
            IERC20(usdcEvm),
            1000e8, // maxOutboundPerEpoch (en 1e8)
            1,      // epochLength en blocs
            address(0), // feeVault (fixé ensuite)
            0          // feeBps
        );

        vault = new VaultContract();
        views = new CoreInteractionViews();

        // Lier les contrats entre eux
        vault.setHandler(IHandler(address(handler)));
        vault.setCoreViews(ICoreInteractionViews(address(views)));

        // Configurer le handler pour pointer vers la simulation Core
        handler.setVault(address(vault));
        handler.setUsdcCoreLink(usdcSystemAddress, usdcTokenId);
        // Adresse système spéciale HYPE sur Core simulé (cf. HYPE_SYSTEM_ADDRESS dans HLConstants)
        handler.setHypeCoreLink(0x2222222222222222222222222222222222222222, HYPE_TOKEN);
        handler.setSpotIds(spotBtc, spotHype);
        handler.setSpotTokenIds(usdcTokenId, spotTokenBtc, spotTokenHype);

        // Rebalancer par défaut : l’owner (ce test)
        handler.setRebalancer(address(this));
    }
}


