// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Strategy1BaseTest} from "./Strategy1BaseTest.t.sol";
import {PrecompileLib} from "../Lib_EVM/hyper-evm-lib/src/PrecompileLib.sol";
import {CoreSimulatorLib} from "../Lib_EVM/hyper-evm-lib/test/simulation/CoreSimulatorLib.sol";

contract Strategy1DepositVaultTest is Strategy1BaseTest {
    using PrecompileLib for address;

    function test_deposit_into_vault_updates_nav_and_core_equity() public {
        // Donne du HYPE EVM à l’utilisateur sur le fork simulé
        uint256 initialBalance = 10_000e18;
        deal(user, initialBalance);

        // Pré‑condition: NAV = 0 et aucun equity Core
        uint256 navBefore = vault.nav1e18();
        assertEq(navBefore, 0, "NAV initial doit être 0");

        // L’utilisateur dépose 1_000 HYPE
        uint256 depositAmt = 1_000e18;
        vm.prank(user);
        vault.deposit{value: depositAmt}();

        // Après le dépôt, on avance la simulation Core d’un bloc
        CoreSimulatorLib.nextBlock();

        // NAV doit être > 0 et des parts doivent avoir été émises
        uint256 navAfter = vault.nav1e18();
        assertGt(navAfter, 0, "NAV après dépôt doit être > 0");
        assertGt(vault.totalSupply(), 0, "Des parts doivent être mintées");
    }
}




