// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {L1Read} from "./interfaces/L1Read.sol";
import {CoreHandlerLib} from "./utils/CoreHandlerLib.sol";
import {StrategyMathLib} from "./utils/StrategyMathLib.sol";

/// @notice Interface de lecture minimale exposant uniquement l'état nécessaire du handler
interface ICoreInteractionHandlerReadable {
    function l1read() external view returns (L1Read);

    function usdcCoreTokenId() external view returns (uint64);

    function spotTokenTOKEN1() external view returns (uint64);

    function spotTokenHYPE() external view returns (uint64);

    function spotTOKEN1() external view returns (uint32);

    function spotHYPE() external view returns (uint32);
}

/// @notice Contrat de vues/comptabilité off‑chain pour CoreInteractionHandler
/// @dev Toute la logique ici est en lecture seule et ne modifie jamais l'état du handler.
contract CoreInteractionViews {
    /// @notice Oracle renvoie 0
    error OracleZero();

    /// @notice Renvoie le spot balance brut (total) pour un utilisateur Core donné.
    function spotBalance(
        ICoreInteractionHandlerReadable handler,
        address coreUser,
        uint64 tokenId
    ) external view returns (uint64) {
        L1Read l1 = handler.l1read();
        L1Read.SpotBalance memory b = l1.spotBalance(coreUser, tokenId);
        return b.total;
    }

    /// @notice Prix HYPE normalisé en 1e8 (USD 1e8) via l'oracle spot.
    function oraclePxHype1e8(
        ICoreInteractionHandlerReadable handler
    ) external view returns (uint64) {
        uint32 spotH = handler.spotHYPE();
        return _spotOraclePx1e8(handler, spotH);
    }

    /// @notice Prix TOKEN1 normalisé en 1e8 (USD 1e8) via l'oracle spot.
    function oraclePxToken11e8(
        ICoreInteractionHandlerReadable handler
    ) external view returns (uint64) {
        uint32 spotT1 = handler.spotTOKEN1();
        return _spotOraclePx1e8(handler, spotT1);
    }

    /// @notice Equity spot Core (USDC+TOKEN1+HYPE) en USD 1e18, en lisant directement l'état du handler.
    /// @dev Reprend la logique d'`equitySpotUsd1e18()` du handler, mais externalisée ici.
    function equitySpotUsd1e18(
        ICoreInteractionHandlerReadable handler
    ) external view returns (uint256) {
        L1Read l1 = handler.l1read();
        address handlerAddr = address(handler);

        uint64 usdcTokenId = handler.usdcCoreTokenId();
        uint64 token1TokenId = handler.spotTokenTOKEN1();
        uint64 hypeTokenId = handler.spotTokenHYPE();

        uint256 usdc1e18 = _usdcUsd1e18(l1, handlerAddr, usdcTokenId);
        uint256 token1Usd1e18 = _assetUsd1e18(l1, handler, handlerAddr, token1TokenId, handler.spotTOKEN1());
        uint256 hypeUsd1e18 = _assetUsd1e18(l1, handler, handlerAddr, hypeTokenId, handler.spotHYPE());

        return usdc1e18 + token1Usd1e18 + hypeUsd1e18;
    }

    function _usdcUsd1e18(
        L1Read l1,
        address handlerAddr,
        uint64 usdcTokenId
    ) internal view returns (uint256) {
        uint256 usdcBalWei = CoreHandlerLib.spotBalanceInWei(l1, handlerAddr, usdcTokenId);
        L1Read.TokenInfo memory usdcInfo = l1.tokenInfo(uint32(usdcTokenId));
        // Conversion USDC: balanceWei * 10^(18 - weiDecimals)
        return usdcBalWei * (10 ** (18 - usdcInfo.weiDecimals));
    }

    function _assetUsd1e18(
        L1Read l1,
        ICoreInteractionHandlerReadable handler,
        address handlerAddr,
        uint64 tokenId,
        uint32 spotIndex
    ) internal view returns (uint256) {
        uint256 balWei = CoreHandlerLib.spotBalanceInWei(l1, handlerAddr, tokenId);
        uint256 px1e8 = _spotOraclePx1e8(handler, spotIndex);
        L1Read.TokenInfo memory info = l1.tokenInfo(uint32(tokenId));

        // Conversion assets: valueUsd1e18 = balanceWei * price1e8 * 10^(18 - weiDecimals - 8)
        if (info.weiDecimals + 8 <= 18) {
            return balWei * px1e8 * (10 ** (18 - info.weiDecimals - 8));
        }

        return (balWei * px1e8) / (10 ** (info.weiDecimals + 8 - 18));
    }

    // ===== Internals =====

    function _spotOraclePx1e8(
        ICoreInteractionHandlerReadable handler,
        uint32 spotAsset
    ) internal view returns (uint64) {
        L1Read l1 = handler.l1read();
        uint64 raw = l1.spotPx(spotAsset);
        if (raw == 0) revert OracleZero();
        return _toPx1e8(handler, spotAsset, raw);
    }

    function _toPx1e8(
        ICoreInteractionHandlerReadable handler,
        uint32 spotIndex,
        uint64 rawPx
    ) internal view returns (uint64) {
        uint8 pxDec = _spotPxDecimals(handler, spotIndex);
        return StrategyMathLib.scalePxTo1e8(rawPx, pxDec);
    }

    function _spotPxDecimals(
        ICoreInteractionHandlerReadable handler,
        uint32 spotIndex
    ) internal view returns (uint8) {
        return _derivedSpotPxDecimals(handler, spotIndex);
    }

    function _derivedSpotPxDecimals(
        ICoreInteractionHandlerReadable handler,
        uint32 spotIndex
    ) internal view returns (uint8) {
        L1Read l1 = handler.l1read();
        L1Read.SpotInfo memory info = l1.spotInfo(spotIndex);
        uint64 baseTokenId = info.tokens[0];
        if (baseTokenId == 0) {
            // Fallback conservateur: Hyperliquid documente des prix au moins en 1e6.
            return 8;
        }
        L1Read.TokenInfo memory tokenInfo = l1.tokenInfo(uint32(baseTokenId));
        if (tokenInfo.szDecimals >= 8) {
            return 0;
        }
        uint8 priceDecimals = uint8(8 - tokenInfo.szDecimals);
        return priceDecimals;
    }
}


