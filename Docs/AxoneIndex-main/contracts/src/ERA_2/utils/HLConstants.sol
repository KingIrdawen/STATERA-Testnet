// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library HLConstants {
    // Time-in-force
    uint8 internal constant TIF_IOC = 3;

    // CoreWriter action identifiers
    uint24 internal constant ACTION_LIMIT_ORDER = 1;
    uint24 internal constant ACTION_SPOT_SEND = 6;

    // Spot asset ID offset requis par HyperCore
    // Les asset IDs spot doivent être dans le range [10000, 99999]
    // Voir HLConversions.spotToAssetId() dans la bibliothèque de référence
    uint32 internal constant SPOT_ASSET_OFFSET = 10000;

    // Encoding selon le format de la bibliothèque de référence (CoreWriterLib)
    // Format: abi.encodePacked(uint8(1), actionId (uint24), abi.encode(...))
    // Utilise abi.encodePacked pour garantir l'endianness correct (little-endian pour uint24)

    // Action 1: Spot Limit Order (IOC)
    // asset: spot asset id avec offset +10000 (uint32)
    // isBuy: true if buy
    // limitPx1e8: prix humain * 1e8 (quantifié)
    // sz1e8: taille base humaine * 1e8
    // reduceOnly: true si l'ordre ne doit que réduire la position
    // encodedTif: time-in-force encodé
    // cloid: client order id
    function encodeSpotLimitOrder(
        uint24 actionId,
        uint32 asset,
        bool isBuy,
        uint64 limitPx1e8,
        uint64 sz1e8,
        bool reduceOnly,
        uint8 encodedTif,
        uint128 cloid
    ) internal pure returns (bytes memory) {
        // Utiliser abi.encodePacked comme la bibliothèque de référence pour garantir l'endianness correct
        return abi.encodePacked(
            uint8(1),
            actionId,
            abi.encode(asset, isBuy, limitPx1e8, sz1e8, reduceOnly, encodedTif, cloid)
        );
    }

    // Action 6: Spot Send (Core -> EVM credit)
    function encodeSpotSend(
        uint24 actionId,
        address destination,
        uint64 tokenId,
        uint64 amount1e8
    ) internal pure returns (bytes memory) {
        // Utiliser abi.encodePacked comme la bibliothèque de référence pour garantir l'endianness correct
        return abi.encodePacked(
            uint8(1),
            actionId,
            abi.encode(destination, tokenId, amount1e8)
        );
    }
}

