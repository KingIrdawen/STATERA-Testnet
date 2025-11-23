// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {L1Read} from "./interfaces/L1Read.sol";
import {CoreHandlerLib} from "./utils/CoreHandlerLib.sol";
import {Rebalancer50Lib} from "./Rebalancer50Lib.sol";

/// @notice Librairie de logique partagée pour CoreInteractionHandler.
/// @dev Contient les calculs lourds (equity, valorisation, deltas) afin de
///      réduire la taille du bytecode du contrat principal.
///      Hypothèse: la stratégie ne manipule que des positions spot long (pas de short perp).
library CoreHandlerLogicLib {
    /// @notice Calcule l'equity spot Core (USDC+BTC+HYPE) en USD 1e18.
    /// @param l1read Contrat L1Read utilisé pour interroger HyperCore.
    /// @param handlerAddr Adresse du handler (utilisée pour lire les soldes spot).
    /// @param usdcCoreTokenId TokenId spot USDC côté Core.
    /// @param spotTokenBTC TokenId spot BTC côté Core.
    /// @param spotTokenHYPE TokenId spot HYPE côté Core.
    /// @param pxB1e8 Prix BTC en 1e8.
    /// @param pxH1e8 Prix HYPE en 1e8.
    function equitySpotUsd1e18(
        L1Read l1read,
        address handlerAddr,
        uint64 usdcCoreTokenId,
        uint64 spotTokenBTC,
        uint64 spotTokenHYPE,
        uint64 pxB1e8,
        uint64 pxH1e8
    ) external view returns (uint256) {
        (, , , uint256 equity1e18) = _usdPositions(
                l1read,
                handlerAddr,
                usdcCoreTokenId,
                spotTokenBTC,
                spotTokenHYPE,
                pxB1e8,
                pxH1e8
            );

        // equity1e18 = usdc1e18 + posB1e18 + posH1e18
        // On renvoie simplement la somme totale déjà calculée.
        // Les conversions en int/uint sont internes à _usdPositions.
        return equity1e18;
    }

    /// @notice Calcule les deltas BTC/HYPE en USD 1e18 pour atteindre la cible 50/50.
    /// @param l1read Contrat L1Read utilisé pour interroger HyperCore.
    /// @param handlerAddr Adresse du handler (utilisée pour lire les soldes spot).
    /// @param usdcCoreTokenId TokenId spot USDC côté Core.
    /// @param spotTokenBTC TokenId spot BTC côté Core.
    /// @param spotTokenHYPE TokenId spot HYPE côté Core.
    /// @param pxB Prix BTC en 1e8.
    /// @param pxH Prix HYPE en 1e8.
    /// @param usdcReserveBps Réserve USDC cible en bps de l'equity totale.
    /// @param deadbandBps Deadband autorisé autour de la cible 50/50.
    /// @return dBtc1e18 Delta BTC en USD 1e18.
    /// @return dHype1e18 Delta HYPE en USD 1e18.
    function computeDeltasWithPositions(
        L1Read l1read,
        address handlerAddr,
        uint64 usdcCoreTokenId,
        uint64 spotTokenBTC,
        uint64 spotTokenHYPE,
        uint64 pxB,
        uint64 pxH,
        uint64 usdcReserveBps,
        uint64 deadbandBps
    ) external view returns (int256 dBtc1e18, int256 dHype1e18) {
        (, int256 posB1e18, int256 posH1e18, uint256 equity1e18) = _usdPositions(
                l1read,
                handlerAddr,
                usdcCoreTokenId,
                spotTokenBTC,
                spotTokenHYPE,
                pxB,
                pxH
            );

        // Même logique que dans le handler : on applique la réserve USDC en bps
        // avant de viser 50/50 sur le reste de l'equity.
        uint256 targetEquity1e18 = (equity1e18 * (10_000 - uint256(usdcReserveBps))) /
            10_000;

        (dBtc1e18, dHype1e18) = Rebalancer50Lib.computeDeltas(
            targetEquity1e18,
            posB1e18,
            posH1e18,
            uint256(deadbandBps)
        );
    }

    /// @dev Calcule les valorisations USD 1e18 pour USDC, BTC et HYPE ainsi que
    ///      l'equity totale.
    /// @return usdc1e18 Valeur USDC en 1e18.
    /// @return posB1e18 Position BTC en USD 1e18 (signée).
    /// @return posH1e18 Position HYPE en USD 1e18 (signée).
    /// @return equity1e18 Equity totale en USD 1e18.
    function _usdPositions(
        L1Read l1read,
        address handlerAddr,
        uint64 usdcCoreTokenId,
        uint64 spotTokenBTC,
        uint64 spotTokenHYPE,
        uint64 pxB1e8,
        uint64 pxH1e8
    )
        internal
        view
        returns (
            uint256 usdc1e18,
            int256 posB1e18,
            int256 posH1e18,
            uint256 equity1e18
        )
    {
        // USDC en 1e18 (balances + décimales dans un bloc pour limiter la profondeur de pile)
        {
            uint256 usdcBalWei = CoreHandlerLib.spotBalanceInWei(
                l1read,
                handlerAddr,
                usdcCoreTokenId
            );
            L1Read.TokenInfo memory usdcInfo = l1read.tokenInfo(
                uint32(usdcCoreTokenId)
            );
            usdc1e18 = usdcBalWei * (10 ** (18 - usdcInfo.weiDecimals));
        }

        // Position BTC en USD 1e18
        {
            uint256 btcBalWei = CoreHandlerLib.spotBalanceInWei(
                l1read,
                handlerAddr,
                spotTokenBTC
            );
            L1Read.TokenInfo memory btcInfo = l1read.tokenInfo(
                uint32(spotTokenBTC)
            );

            if (btcInfo.weiDecimals + 8 <= 18) {
                posB1e18 = int256(
                    btcBalWei *
                        uint256(pxB1e8) *
                        (10 ** (18 - btcInfo.weiDecimals - 8))
                );
            } else {
                posB1e18 = int256(
                    (btcBalWei * uint256(pxB1e8)) /
                        (10 ** (btcInfo.weiDecimals + 8 - 18))
                );
            }
        }

        // Position HYPE en USD 1e18
        {
            uint256 hypeBalWei = CoreHandlerLib.spotBalanceInWei(
                l1read,
                handlerAddr,
                spotTokenHYPE
            );
            L1Read.TokenInfo memory hypeInfo = l1read.tokenInfo(
                uint32(spotTokenHYPE)
            );

            if (hypeInfo.weiDecimals + 8 <= 18) {
                posH1e18 = int256(
                    hypeBalWei *
                        uint256(pxH1e8) *
                        (10 ** (18 - hypeInfo.weiDecimals - 8))
                );
            } else {
                posH1e18 = int256(
                    (hypeBalWei * uint256(pxH1e8)) /
                        (10 ** (hypeInfo.weiDecimals + 8 - 18))
                );
            }
        }

        equity1e18 = usdc1e18 + uint256(posB1e18) + uint256(posH1e18);
    }
}


