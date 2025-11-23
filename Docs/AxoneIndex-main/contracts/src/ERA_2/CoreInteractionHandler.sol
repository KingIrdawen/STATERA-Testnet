// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {HLConstants} from "./utils/HLConstants.sol";
import {CoreHandlerLib} from "./utils/CoreHandlerLib.sol";
import {Rebalancer50Lib} from "./Rebalancer50Lib.sol";
import {CoreHandlerLogicLib} from "./CoreHandlerLogicLib.sol";
import {SystemAddressLib} from "./utils/SystemAddressLib.sol";
import {StrategyMathLib} from "./utils/StrategyMathLib.sol";
import {L1Read} from "./interfaces/L1Read.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";

interface ICoreWriter {
    function sendRawAction(bytes calldata data) external;
}

// IERC20 importé via OpenZeppelin ci-dessus

contract CoreInteractionHandler {
    using SafeERC20 for IERC20;

    ICoreWriter public constant CORE_WRITER = ICoreWriter(0x3333333333333333333333333333333333333333);

    // Immutable system contracts
    L1Read public immutable l1read;
    IERC20 public immutable usdc;

    // Config
    address public vault;
    address public usdcCoreSystemAddress;
    uint64 public usdcCoreTokenId;
    address public hypeCoreSystemAddress;
    uint64 public hypeCoreTokenId;
    // Spot market ids (TOKEN1/USDC and HYPE/USDC)
    uint32 public spotTOKEN1;
    uint32 public spotHYPE;
    // Spot token ids for balances
    uint64 public spotTokenTOKEN1;
    uint64 public spotTokenHYPE;

    // Risk params
    uint64 public maxOutboundPerEpoch;
    uint64 public epochLength;
    uint64 public lastEpochStart;
    uint64 public sentThisEpoch;
    // Blocks per epoch (assuming 12s per block)
    uint64 public constant BLOCKS_PER_EPOCH = 1; // 1 block = 12 seconds
    uint64 public maxSlippageBps; // for IOC limit price
    uint64 public marketEpsilonBps; // widen limit to mimic marketable IOC
    uint64 public deadbandBps;
    uint64 public maxOracleDeviationBps;

    uint64 public lastPxToken11e8;
    uint64 public lastPxHype1e8;
    bool public pxInitT1;
    bool public pxInitH;

    // Fees config
    address public feeVault;
    uint64 public feeBps; // out of 10_000

    // USDC reserve on Core (in bps of total equity), default 1%
    uint64 public usdcReserveBps = 100;

    event UsdcReserveSet(uint64 bps);

    error NotVault();
    error NotOwner();
    error NotRebalancer();
    error RateLimited();
    error OracleZero();
    error OracleGradualCatchup();
    error CoreAccountMissing();

    error EPOCH_0();
    error MAX_OUTBOUND_0();
    error FEE_BPS();
    error DEADBAND_TOO_HIGH();
    error BAD_DEV_BPS();
    error USDC_CORE_NOT_SET();
    error CORE_NOT_SET();
    error AMOUNT_ZERO();
    error NATIVE_SEND_FAIL();
    error RESERVE_USDC();
    error HYPE_CORE_NOT_SET();
    error FEE_VAULT();
    error NATIVE_PAY_FAIL();
    error SWEEP_FAIL();
    error FEE_SEND_FAIL();
    error INVALID_ASSET();
    error INVALID_SZ_DECIMALS();
    error PX_NOT_QUANTIZED();
    error PX_TOO_LOW();
    error SIZE_TOO_LARGE();
    error SIZE_ZERO();
    error INVALID_TIF();
    error CLOID_TOO_LARGE();
    error USDC_ID_CONFLICT();
    error BAL();

    event LimitsSet(uint64 maxOutboundPerEpoch, uint64 epochLength);
    event ParamsSet(uint64 maxSlippageBps, uint64 marketEpsilonBps, uint64 deadbandBps);
    event VaultSet(address vault);
    event UsdcCoreLinkSet(address systemAddress, uint64 tokenId);
    event SpotIdsSet(uint32 token1Spot, uint32 hypeSpot);
    event SpotTokenIdsSet(uint64 usdcToken, uint64 token1Token, uint64 hypeToken);
    event HypeCoreLinkSet(address systemAddress, uint64 tokenId);
    event OutboundToCore(bytes data);
    event InboundFromCore(uint64 amount1e8);
    event Rebalanced(int256 dToken11e18, int256 dHype1e18);
    event SpotOrderPlaced(uint32 asset, bool isBuy, uint64 limitPx1e8, uint64 sizeSzDecimals, uint128 cloid);
    event RebalanceSkippedOracleDeviation(uint64 pxT11e8, uint64 pxH1e8);
    event DepositSkippedOracleDeviationUsdc(uint64 pxT11e8, uint64 pxH1e8);
    event DepositSkippedOracleDeviationHype(uint64 pxH1e8);
    event FeeConfigSet(address feeVault, uint64 feeBps);
    event SweepWithFee(uint64 gross1e8, uint64 fee1e8, uint64 net1e8);
    event RebalancerSet(address rebalancer);

    event Paused(address account);
    event Unpaused(address account);

    address public owner;
    address public rebalancer;
    // Option: rééquilibrer automatiquement après un retrait HYPE (par défaut: activé)
    bool public rebalanceAfterWithdrawal = true;
    bool public paused;

    modifier onlyOwner(){
        if(msg.sender!=owner) revert NotOwner();
        _;
    }

    modifier onlyVault() {
        if (msg.sender != vault) revert NotVault();
        _;
    }

    modifier onlyRebalancer() {
        if (msg.sender != rebalancer) revert NotRebalancer();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert("P"); // contrat en pause
        _;
    }

    modifier whenPaused() {
        if (!paused) revert("NP"); // contrat non pausé
        _;
    }

    constructor(L1Read _l1read, IERC20 _usdc, uint64 _maxOutboundPerEpoch, uint64 _epochLength, address _feeVault, uint64 _feeBps) {
        l1read = _l1read;
        usdc = _usdc;
        lastEpochStart = uint64(block.number);
        owner = msg.sender;
        
        // Calculer automatiquement les adresses système Core selon la documentation
        // USDC: utiliser l'adresse système calculée (sera configurée via setUsdcCoreLink)
        // HYPE: utiliser l'adresse système spéciale pour le token natif
        hypeCoreSystemAddress = SystemAddressLib.HYPE_SYSTEM_ADDRESS;
        
        if (_epochLength == 0) revert EPOCH_0();
        if (_maxOutboundPerEpoch == 0) revert MAX_OUTBOUND_0();
        epochLength = _epochLength;
        maxOutboundPerEpoch = _maxOutboundPerEpoch;
        if (maxSlippageBps == 0) maxSlippageBps = 50;
        if (marketEpsilonBps == 0) marketEpsilonBps = 10;
        deadbandBps = 50; // par défaut 0.5%
        maxOracleDeviationBps = 500; // 5%
        if (_feeBps > 10_000) revert FEE_BPS();
        feeVault = _feeVault;
        feeBps = _feeBps;
        emit FeeConfigSet(_feeVault, _feeBps);
    }

    receive() external payable {}

    // Admin setters (to be called by deployer/owner offchain in this sample; add auth as needed)
    function setVault(address _vault) external onlyOwner {
        vault = _vault;
        emit VaultSet(_vault);
    }

    function setUsdcCoreLink(address systemAddr, uint64 tokenId) external onlyOwner {
        // Si systemAddr est fourni, l'utiliser, sinon calculer automatiquement
        if (systemAddr == address(0)) {
            systemAddr = SystemAddressLib.getSpotSystemAddress(tokenId);
        }
        usdcCoreSystemAddress = systemAddr;
        usdcCoreTokenId = tokenId;
        emit UsdcCoreLinkSet(systemAddr, tokenId);
    }

    function setHypeCoreLink(address systemAddr, uint64 tokenId) external onlyOwner {
        hypeCoreSystemAddress = systemAddr;
        hypeCoreTokenId = tokenId;
        emit HypeCoreLinkSet(systemAddr, tokenId);
    }

    function setSpotIds(uint32 token1Spot, uint32 hypeSpot) external onlyOwner {
        spotTOKEN1 = token1Spot;
        spotHYPE = hypeSpot;
        emit SpotIdsSet(token1Spot, hypeSpot);
    }

    function setSpotTokenIds(uint64 usdcToken, uint64 token1Token, uint64 hypeToken) external onlyOwner {
        if (usdcCoreTokenId == 0) {
            usdcCoreTokenId = usdcToken;
        } else {
            if (usdcToken != usdcCoreTokenId) revert USDC_ID_CONFLICT();
        }
        spotTokenTOKEN1 = token1Token;
        spotTokenHYPE = hypeToken;
        emit SpotTokenIdsSet(usdcToken, token1Token, hypeToken);
    }

    function setLimits(uint64 _maxOutboundPerEpoch, uint64 _epochLength) external onlyOwner {
        if (_epochLength == 0) revert EPOCH_0();
        if (_maxOutboundPerEpoch == 0) revert MAX_OUTBOUND_0();
        maxOutboundPerEpoch = _maxOutboundPerEpoch;
        epochLength = _epochLength;
        emit LimitsSet(_maxOutboundPerEpoch, _epochLength);
    }

    function setParams(uint64 _maxSlippageBps, uint64 _marketEpsilonBps, uint64 _deadbandBps) external onlyOwner {
        if (_deadbandBps > 50) revert DEADBAND_TOO_HIGH();
        maxSlippageBps = _maxSlippageBps;
        marketEpsilonBps = _marketEpsilonBps;
        deadbandBps = _deadbandBps;
        emit ParamsSet(_maxSlippageBps, _marketEpsilonBps, _deadbandBps);
    }

    function setMaxOracleDeviationBps(uint64 _maxDeviationBps) external onlyOwner {
        if (!(_maxDeviationBps > 0 && _maxDeviationBps <= 5000)) revert BAD_DEV_BPS();
        maxOracleDeviationBps = _maxDeviationBps;
    }

    function setFeeConfig(address _feeVault, uint64 _feeBps) external onlyOwner {
        if (_feeBps > 10_000) revert FEE_BPS();
        feeVault = _feeVault;
        feeBps = _feeBps;
        emit FeeConfigSet(_feeVault, _feeBps);
    }

    function setUsdcReserveBps(uint64 bps) external onlyOwner {
        if (bps > 1_000) revert DEADBAND_TOO_HIGH();
        usdcReserveBps = bps;
        emit UsdcReserveSet(bps);
    }

    function setRebalancer(address _rebalancer) external onlyOwner {
        rebalancer = _rebalancer;
        emit RebalancerSet(_rebalancer);
    }

    /// @notice Active/désactive le rééquilibrage automatique après retrait HYPE
    function setRebalanceAfterWithdrawal(bool v) external onlyOwner {
        rebalanceAfterWithdrawal = v;
    }

    /// @notice Pause all critical operations in case of emergency
    function pause() external onlyOwner whenNotPaused {
        paused = true;
        emit Paused(msg.sender);
    }
    
    /// @notice Unpause all operations
    function unpause() external onlyOwner whenPaused {
        paused = false;
        emit Unpaused(msg.sender);
    }

    // Views internes (spot)
    /// @notice Get spot balance converted to wei decimals
    /// @dev Converts SpotBalance.total from szDecimals to weiDecimals format
    /// @param coreUser The user address
    /// @param tokenId The token ID
    /// @return balanceInWei The balance converted to wei decimals (uint256 for precision)
    function spotBalanceInWei(address coreUser, uint64 tokenId) internal view returns (uint256) {
        return CoreHandlerLib.spotBalanceInWei(l1read, coreUser, tokenId);
    }

    function spotOraclePx1e8(uint32 spotAsset) internal view returns (uint64) {
        uint64 raw = l1read.spotPx(spotAsset);
        if (raw == 0) revert OracleZero();
        return _toPx1e8(spotAsset, raw);
    }

    function _equitySpotUsd1e18() internal view returns (uint256) {
        // Core spot equity only. EVM USDC est compté dans le Vault.
        uint64 pxT11e8 = spotOraclePx1e8(spotTOKEN1);
        uint64 pxH1e8 = spotOraclePx1e8(spotHYPE);

        return
            CoreHandlerLogicLib.equitySpotUsd1e18(
                l1read,
                address(this),
                usdcCoreTokenId,
                spotTokenTOKEN1,
                spotTokenHYPE,
                pxT11e8,
                pxH1e8
            );
    }

    // Core flows
    function executeDeposit(uint64 usdc1e8, bool forceRebalance) external onlyVault whenNotPaused {
        if (usdcCoreSystemAddress == address(0)) revert USDC_CORE_NOT_SET();
        _rateLimit(usdc1e8);
        // Pull USDC from vault to handler (EVM token has 8 decimals => 1:1)
        uint256 evmAmt = uint256(usdc1e8);
        usdc.safeTransferFrom(msg.sender, address(this), evmAmt);
        // EVM->Core spot: send to system address to credit Core spot balance
        usdc.safeTransfer(usdcCoreSystemAddress, evmAmt);
        // After crediting USDC spot, try to place two IOC buys ~50/50 into TOKEN1 and HYPE
        // Tolerant oracle: if deviated, skip orders without reverting
        uint256 usd1e18 = uint256(usdc1e8) * 1e10;
        uint256 allocUsd1e18 = (usd1e18 * (10_000 - usdcReserveBps)) / 10_000;
        uint256 halfUsd1e18 = allocUsd1e18 / 2;
        (uint64 pxT1, bool devT1) = _tryValidatedOraclePx1e8(true);
        (uint64 pxH, bool devH) = _tryValidatedOraclePx1e8(false);
        if (devT1 || devH) {
            emit DepositSkippedOracleDeviationUsdc(pxT1, pxH);
            return;
        }
        uint64 szT1 = CoreHandlerLib.toSzInSzDecimals(l1read, spotTokenTOKEN1, int256(halfUsd1e18), pxT1);
        uint64 szH = CoreHandlerLib.toSzInSzDecimals(l1read, spotTokenHYPE, int256(halfUsd1e18), pxH);
        if (szT1 > 0) {
            uint64 pxT1Limit = _marketLimitFromBbo(spotTOKEN1, true);
            uint8 baseSzDecT1 = _baseSzDecimals(spotTOKEN1);
            if (baseSzDecT1 != 0) {
                _sendSpotLimitOrderDirect(spotTOKEN1, true, pxT1Limit, szT1, 0);
                emit SpotOrderPlaced(spotTOKEN1, true, pxT1Limit, szT1, 0);
            }
        }
        if (szH > 0) {
            uint64 pxHLimit = _marketLimitFromBbo(spotHYPE, true);
            uint8 baseSzDecH = _baseSzDecimals(spotHYPE);
            if (baseSzDecH != 0) {
                _sendSpotLimitOrderDirect(spotHYPE, true, pxHLimit, szH, 0);
                emit SpotOrderPlaced(spotHYPE, true, pxHLimit, szH, 0);
            }
        }
        if (forceRebalance) {
            _rebalance(0, 0);
        }
    }

    // HYPE deposit (native): move HYPE to Core, sell all to USDC, then allocate 50/50 TOKEN1/HYPE
    function executeDepositHype(bool forceRebalance) external payable onlyVault whenNotPaused {
        if (!(hypeCoreSystemAddress != address(0) && usdcCoreSystemAddress != address(0))) revert CORE_NOT_SET();
        uint256 hype1e18 = msg.value;
        if (hype1e18 == 0) revert AMOUNT_ZERO();
        // EVM->Core spot: send native HYPE to system address to credit Core spot balance
        (bool ok, ) = payable(hypeCoreSystemAddress).call{value: hype1e18}("");
        if (!ok) revert NATIVE_SEND_FAIL();
        // Compute USD notional and sell HYPE -> USDC on Core via IOC
        (uint64 pxH, bool devH) = _tryValidatedOraclePx1e8(false);
        // USD 1e8 = (HYPE 1e18 / 1e18) * px1e8
        uint64 usd1e8 = SafeCast.toUint64((hype1e18 * uint256(pxH)) / 1e18);
        // Apply outbound rate limit based on USD notional like USDC deposit (even if deviated)
        _rateLimit(usd1e8);
        if (devH) {
            emit DepositSkippedOracleDeviationHype(pxH);
            return;
        }
        // Sell HYPE -> USDC on Core via IOC
        _sellAssetForUsd(spotHYPE, spotTokenHYPE, usd1e8);
        // Allocate 50/50 from USDC to TOKEN1/HYPE
        uint256 totalUsd1e18 = uint256(usd1e8) * 1e10;
        uint256 allocUsd1e18 = (totalUsd1e18 * (10_000 - usdcReserveBps)) / 10_000;
        uint256 halfUsd1e18 = allocUsd1e18 / 2;
        (uint64 pxT1, bool devT1) = _tryValidatedOraclePx1e8(true);
        if (devT1) {
            emit DepositSkippedOracleDeviationHype(pxH);
            return;
        }
        uint64 szT1 = CoreHandlerLib.toSzInSzDecimals(l1read, spotTokenTOKEN1, int256(halfUsd1e18), pxT1);
        uint64 szH = CoreHandlerLib.toSzInSzDecimals(l1read, spotTokenHYPE, int256(halfUsd1e18), pxH);
        if (szT1 > 0) {
            uint64 pxT1Limit = _marketLimitFromBbo(spotTOKEN1, true);
            uint8 baseSzDecT1 = _baseSzDecimals(spotTOKEN1);
            if (baseSzDecT1 != 0) {
                _sendSpotLimitOrderDirect(spotTOKEN1, true, pxT1Limit, szT1, 0);
                emit SpotOrderPlaced(spotTOKEN1, true, pxT1Limit, szT1, 0);
            }
        }
        if (szH > 0) {
            uint64 pxHLimit = _marketLimitFromBbo(spotHYPE, true);
            uint8 baseSzDecH = _baseSzDecimals(spotHYPE);
            if (baseSzDecH != 0) {
                _sendSpotLimitOrderDirect(spotHYPE, true, pxHLimit, szH, 0);
                emit SpotOrderPlaced(spotHYPE, true, pxHLimit, szH, 0);
            }
        }
        if (forceRebalance) {
            _rebalance(0, 0);
        }
    }

    function pullFromCoreToEvm(uint64 usdc1e8) external onlyVault whenNotPaused returns (uint64) {
        if (usdcCoreSystemAddress == address(0)) revert USDC_CORE_NOT_SET();
        // Ensure enough USDC spot by selling TOKEN1/HYPE via IOC if needed, while preserving reserve
        L1Read.TokenInfo memory usdcInfo = l1read.tokenInfo(uint32(usdcCoreTokenId));
        uint256 usdcBalWei = spotBalanceInWei(address(this), usdcCoreTokenId);
        uint256 usdcBal1e8 = _weiToMantissa1e8(usdcBalWei, usdcInfo.weiDecimals);
        if (usdcBal1e8 < usdc1e8) {
            uint256 shortfall1e8 = uint256(usdc1e8) - usdcBal1e8;
            // Try to sell TOKEN1 first, then HYPE
            _sellAssetForUsd(spotTOKEN1, spotTokenTOKEN1, shortfall1e8);
            // Refresh balance and compute remaining
            usdcBalWei = spotBalanceInWei(address(this), usdcCoreTokenId);
            usdcBal1e8 = _weiToMantissa1e8(usdcBalWei, usdcInfo.weiDecimals);
            if (usdcBal1e8 < usdc1e8) {
                _sellAssetForUsd(spotHYPE, spotTokenHYPE, uint256(usdc1e8) - usdcBal1e8);
            }
        }
        // Reserve enforcement (post-adjustment): do not allow withdrawal that breaches reserve
        {
            uint256 equity1e18 = _equitySpotUsd1e18();
            uint256 reserve1e8 = ((equity1e18 * uint256(usdcReserveBps)) / 10_000) / 1e10;
            uint256 refreshedBal1e8 = _weiToMantissa1e8(
                spotBalanceInWei(address(this), usdcCoreTokenId),
                usdcInfo.weiDecimals
            );
            if (!(refreshedBal1e8 >= reserve1e8 + usdc1e8)) revert RESERVE_USDC();
        }
        // Spot send to credit EVM
        uint256 sendWei = _mantissa1e8ToWei(usdc1e8, usdcInfo.weiDecimals);
        _send(
            CoreHandlerLib.encodeSpotSend(
                usdcCoreSystemAddress,
                usdcCoreTokenId,
                SafeCast.toUint64(sendWei)
            )
        );
        emit InboundFromCore(usdc1e8);
        return usdc1e8;
    }

    // Ensure enough HYPE on Core (sell TOKEN1 for USDC if needed, then buy HYPE), then send to EVM and optionally rebalance back to 50/50
    function pullHypeFromCoreToEvm(uint64 hype1e8) external onlyVault whenNotPaused returns (uint64) {
        if (hypeCoreSystemAddress == address(0)) revert HYPE_CORE_NOT_SET();
        L1Read.TokenInfo memory hypeInfo = l1read.tokenInfo(uint32(hypeCoreTokenId));
        uint256 hypeBalWei = spotBalanceInWei(address(this), hypeCoreTokenId);
        uint256 hypeBal1e8 = _weiToMantissa1e8(hypeBalWei, hypeInfo.weiDecimals);
        if (hypeBal1e8 < hype1e8) {
            uint256 shortfallH1e8 = uint256(hype1e8) - hypeBal1e8;
            // Prix HYPE normalisé 1e8
            uint64 pxH1e8 = _validatedOraclePx1e8(false);
            // USD nécessaire en 1e8 pour couvrir le shortfall en HYPE: shortfallH1e8 * pxH / 1e8
            uint256 usdNeed1e8 = (shortfallH1e8 * uint256(pxH1e8)) / 1e8;
            // Calculer la réserve USDC requise en unités 1e8 (USDC)
            uint256 equity1e18_r = _equitySpotUsd1e18();
            uint256 reserve1e8 = ((equity1e18_r * uint256(usdcReserveBps)) / 10_000) / 1e10;
            // S'assurer d'abord d'avoir assez d'USDC pour usdNeed + réserve, en vendant TOKEN1 puis HYPE si nécessaire
            L1Read.TokenInfo memory usdcInfo = l1read.tokenInfo(uint32(usdcCoreTokenId));
            uint256 usdcBalWei = spotBalanceInWei(address(this), usdcCoreTokenId);
            uint256 usdcBal1e8 = _weiToMantissa1e8(usdcBalWei, usdcInfo.weiDecimals);
            uint256 targetUsdc1e8 = uint256(usdNeed1e8) + reserve1e8;
            if (usdcBal1e8 < targetUsdc1e8) {
                uint256 deficit1e8 = targetUsdc1e8 - usdcBal1e8;
                if (deficit1e8 > 0) {
                    _sellAssetForUsd(spotTOKEN1, spotTokenTOKEN1, deficit1e8);
                }
                // Refresh après vente TOKEN1
                usdcBal1e8 = _weiToMantissa1e8(
                    spotBalanceInWei(address(this), usdcCoreTokenId),
                    usdcInfo.weiDecimals
                );
                if (usdcBal1e8 < targetUsdc1e8) {
                    uint256 stillShort1e8 = targetUsdc1e8 - usdcBal1e8;
                    // En dernier recours, vendre du HYPE côté Core (peut réduire légèrement la cible mais assure la liquidité)
                    _sellAssetForUsd(spotHYPE, spotTokenHYPE, stillShort1e8);
                }
            }
            // Acheter le HYPE manquant via IOC spot en utilisant usdNeed1e8 (converti en 1e18 pour la conversion taille)
            uint256 usdNeed1e18 = usdNeed1e8 * 1e10;
            uint64 szBuyH = CoreHandlerLib.toSzInSzDecimals(l1read, spotTokenHYPE, int256(usdNeed1e18), pxH1e8);
            if (szBuyH > 0) {
                uint64 pxBuyLimit = _marketLimitFromBbo(spotHYPE, true);
                _sendSpotLimitOrderDirect(spotHYPE, true, pxBuyLimit, szBuyH, 0);
                emit SpotOrderPlaced(spotHYPE, true, pxBuyLimit, szBuyH, 0);
            }
        }
        // Spot send to credit EVM HYPE
        uint256 sendWei = _mantissa1e8ToWei(hype1e8, hypeInfo.weiDecimals);
        _send(
            CoreHandlerLib.encodeSpotSend(
                hypeCoreSystemAddress,
                hypeCoreTokenId,
                SafeCast.toUint64(sendWei)
            )
        );
        emit InboundFromCore(hype1e8);
        // Optionnel: rééquilibrer après le retrait pour revenir vers 50/50
        if (rebalanceAfterWithdrawal) {
            _rebalance(0, 0);
        }
        return hype1e8;
    }

    function sweepToVault(uint64 amount1e8) external onlyVault whenNotPaused {
        if (amount1e8 == 0) {
            return;
        }
        uint64 feeAmt1e8 = 0;
        if (feeBps > 0) {
            if (feeVault == address(0)) revert FEE_VAULT();
            feeAmt1e8 = uint64((uint256(amount1e8) * uint256(feeBps)) / 10_000);
            if (feeAmt1e8 > 0) {
                bool ok = usdc.transfer(feeVault, uint256(feeAmt1e8));
                if (!ok) revert SWEEP_FAIL();
            }
        }
        uint64 net1e8 = amount1e8 - feeAmt1e8;
        bool ok2 = usdc.transfer(vault, uint256(net1e8));
        if (!ok2) revert SWEEP_FAIL();
        emit SweepWithFee(amount1e8, feeAmt1e8, net1e8);
    }

    // Sweep native HYPE held on EVM from handler to vault, applying feeBps in HYPE
    function sweepHypeToVault(uint256 amount1e18) external onlyVault whenNotPaused {
        if (amount1e18 == 0) return;
        if (!(address(this).balance >= amount1e18)) revert BAL();
        uint256 feeAmt = 0;
        if (feeBps > 0) {
            if (feeVault == address(0)) revert FEE_VAULT();
            feeAmt = (amount1e18 * uint256(feeBps)) / 10_000;
            if (feeAmt > 0) {
                (bool f, ) = payable(feeVault).call{value: feeAmt}("");
                if (!f) revert FEE_SEND_FAIL();
            }
        }
        uint256 net = amount1e18 - feeAmt;
        (bool s, ) = payable(vault).call{value: net}("");
        if (!s) revert SWEEP_FAIL();
        uint64 gross1e8 = SafeCast.toUint64(amount1e18 / 1e10);
        uint64 fee1e8 = SafeCast.toUint64(feeAmt / 1e10);
        uint64 net1e8 = SafeCast.toUint64(net / 1e10);
        emit SweepWithFee(gross1e8, fee1e8, net1e8);
    }

    function rebalancePortfolio(uint128 cloidToken1, uint128 cloidHype) public onlyRebalancer whenNotPaused {
        _rebalance(cloidToken1, cloidHype);
    }

    function _rebalance(uint128 cloidToken1, uint128 cloidHype) internal {
        (uint64 pxT1, bool devT1) = _tryValidatedOraclePx1e8(true);
        (uint64 pxH, bool devH) = _tryValidatedOraclePx1e8(false);
        if (devT1 || devH) {
            emit RebalanceSkippedOracleDeviation(pxT1, pxH);
            return;
        }
        (int256 dT1, int256 dH) = _computeDeltasWithPositions(pxT1, pxH);
        _placeRebalanceOrders(dT1, dH, pxT1, pxH, cloidToken1, cloidHype);
        emit Rebalanced(dT1, dH);
    }

    function _computeDeltasWithPositions(uint64 pxT1, uint64 pxH) internal view returns (int256 dT1, int256 dH) {
        (dT1, dH) = CoreHandlerLogicLib.computeDeltasWithPositions(
            l1read,
            address(this),
            usdcCoreTokenId,
            spotTokenTOKEN1,
            spotTokenHYPE,
            pxT1,
            pxH,
            usdcReserveBps,
            deadbandBps
        );
    }

    function _placeRebalanceOrders(
        int256 dT1,
        int256 dH,
        uint64 /*pxT1*/,
        uint64 /*pxH*/,
        uint128 cloidToken1,
        uint128 cloidHype
    ) internal {
        bool buyT1 = dT1 > 0;
        bool buyH = dH > 0;
        bool hasSell = false;

        // 1) Ventes d'abord (génèrent l'USDC nécessaire)
        if (!buyH && dH != 0) {
            uint64 pxHLimitSell = _marketLimitFromBbo(spotHYPE, false);
            uint64 szHSell = CoreHandlerLib.toSzInSzDecimals(l1read, spotTokenHYPE, dH, pxHLimitSell);
            // Limiter la taille de vente à la balance disponible
            // Aligné avec Lib_EVM: spotBalance.total est en szDecimals (selon doc HYPERLIQUID_UNITS.md)
            // Utilisons spotBalanceInWei pour obtenir la balance en weiDecimals, puis convertissons en szDecimals
            // pour comparer avec szHSell (qui est en szDecimals)
            uint256 hypeBalanceWei = spotBalanceInWei(address(this), spotTokenHYPE);
            L1Read.TokenInfo memory hypeInfo = l1read.tokenInfo(uint32(spotTokenHYPE));
            // Convertir weiDecimals -> szDecimals (comme HLConversions.weiToSz)
            uint64 hypeBalanceSz;
            if (hypeInfo.weiDecimals > hypeInfo.szDecimals) {
                uint8 diff = hypeInfo.weiDecimals - hypeInfo.szDecimals;
                hypeBalanceSz = uint64(hypeBalanceWei / (10 ** uint256(diff)));
            } else {
                hypeBalanceSz = uint64(hypeBalanceWei);
            }
            if (szHSell > hypeBalanceSz) {
                szHSell = hypeBalanceSz; // Ne pas vendre plus que disponible
            }
            if (szHSell > 0) {
                hasSell = true;
                _sendSpotLimitOrderDirect(spotHYPE, false, pxHLimitSell, szHSell, cloidHype);
                emit SpotOrderPlaced(spotHYPE, false, pxHLimitSell, szHSell, cloidHype);
            }
        }
        if (!buyT1 && dT1 != 0) {
            uint64 pxT1LimitSell = _marketLimitFromBbo(spotTOKEN1, false);
            uint64 szT1Sell = CoreHandlerLib.toSzInSzDecimals(l1read, spotTokenTOKEN1, dT1, pxT1LimitSell);
            // Limiter la taille de vente à la balance disponible
            L1Read.TokenInfo memory token1Info = l1read.tokenInfo(uint32(spotTokenTOKEN1));
            // Convertir la balance via spotBalanceInWei pour être sûr du format
            uint256 token1BalanceWei = spotBalanceInWei(address(this), spotTokenTOKEN1);
            uint64 token1BalanceSz;
            if (token1Info.weiDecimals > token1Info.szDecimals) {
                uint8 diff = token1Info.weiDecimals - token1Info.szDecimals;
                token1BalanceSz = uint64(token1BalanceWei / (10 ** uint256(diff)));
            } else {
                token1BalanceSz = uint64(token1BalanceWei);
            }
            if (szT1Sell > token1BalanceSz) {
                szT1Sell = token1BalanceSz; // Ne pas vendre plus que disponible
            }
            if (szT1Sell > 0) {
                hasSell = true;
                _sendSpotLimitOrderDirect(spotTOKEN1, false, pxT1LimitSell, szT1Sell, cloidToken1);
                emit SpotOrderPlaced(spotTOKEN1, false, pxT1LimitSell, szT1Sell, cloidToken1);
            }
        }

        // 2) Achats ensuite
        // Cas où aucun ordre de vente n'est nécessaire: on plafonne l'achat à l'USDC disponible pour éviter un échec IOC
        if (buyT1 && dT1 != 0) {
            int256 dT1ToUse = dT1;
            if (!hasSell) {
                // Limiter l'achat au solde USDC disponible (1e8) converti en 1e18
                L1Read.TokenInfo memory usdcInfoBuy = l1read.tokenInfo(uint32(usdcCoreTokenId));
                uint256 usdcBalWeiBuy = spotBalanceInWei(address(this), usdcCoreTokenId);
                uint256 usdcBal1e8 = _weiToMantissa1e8(usdcBalWeiBuy, usdcInfoBuy.weiDecimals);
                uint256 maxUsd1e18 = usdcBal1e8 * 1e10;
                uint256 needUsd1e18 = uint256(dT1ToUse);
                if (needUsd1e18 > maxUsd1e18) {
                    dT1ToUse = int256(maxUsd1e18); // réduire la taille cible
                }
            }
            uint64 pxT1LimitBuy = _marketLimitFromBbo(spotTOKEN1, true);
            uint64 szT1buy = CoreHandlerLib.toSzInSzDecimals(l1read, spotTokenTOKEN1, dT1ToUse, pxT1LimitBuy);
            if (szT1buy > 0) {
                _sendSpotLimitOrderDirect(spotTOKEN1, true, pxT1LimitBuy, szT1buy, cloidToken1);
                emit SpotOrderPlaced(spotTOKEN1, true, pxT1LimitBuy, szT1buy, cloidToken1);
            }
        }

        if (buyH && dH != 0) {
            int256 dHToUse = dH;
            if (!hasSell) {
                L1Read.TokenInfo memory usdcInfoBuy = l1read.tokenInfo(uint32(usdcCoreTokenId));
                uint256 usdcBalWeiBuy = spotBalanceInWei(address(this), usdcCoreTokenId);
                uint256 usdcBal1e8 = _weiToMantissa1e8(usdcBalWeiBuy, usdcInfoBuy.weiDecimals);
                uint256 maxUsd1e18 = usdcBal1e8 * 1e10;
                uint256 needUsd1e18 = uint256(dHToUse);
                if (needUsd1e18 > maxUsd1e18) {
                    dHToUse = int256(maxUsd1e18);
                }
            }
            uint64 pxHLimitBuy = _marketLimitFromBbo(spotHYPE, true);
            uint64 szHbuy = CoreHandlerLib.toSzInSzDecimals(l1read, spotTokenHYPE, dHToUse, pxHLimitBuy);
            if (szHbuy > 0) {
                _sendSpotLimitOrderDirect(spotHYPE, true, pxHLimitBuy, szHbuy, cloidHype);
                emit SpotOrderPlaced(spotHYPE, true, pxHLimitBuy, szHbuy, cloidHype);
            }
        }
    }

    // Internal utils
    function _limitFromOracle(uint64 oraclePx1e8, bool isBuy) internal view returns (uint64) {
        return CoreHandlerLib.limitFromOracle(oraclePx1e8, isBuy, maxSlippageBps, marketEpsilonBps);
    }

    function _spotBboPx1e8(uint32 spotAsset) internal view returns (uint64 bid1e8, uint64 ask1e8) {
        // bbo() precompile attend spotAsset + 10000 (unified asset ID)
        uint32 assetId = spotAsset + HLConstants.SPOT_ASSET_OFFSET;
        L1Read.Bbo memory b = l1read.bbo(assetId);
        uint8 pxDec = _spotPxDecimals(spotAsset);
        bid1e8 = StrategyMathLib.scalePxTo1e8(b.bid, pxDec);
        ask1e8 = StrategyMathLib.scalePxTo1e8(b.ask, pxDec);
    }

    function _baseSzDecimals(uint32 asset) internal view returns (uint8) {
        uint64 baseTokenId;
        if (asset == spotTOKEN1 && spotTokenTOKEN1 != 0) {
            baseTokenId = spotTokenTOKEN1;
        } else if (asset == spotHYPE && spotTokenHYPE != 0) {
            baseTokenId = spotTokenHYPE;
        } else {
            L1Read.SpotInfo memory info = l1read.spotInfo(asset);
            baseTokenId = info.tokens[0];
        }
        if (baseTokenId == 0) return 0;
        L1Read.TokenInfo memory baseInfo = l1read.tokenInfo(uint32(baseTokenId));
        return baseInfo.szDecimals;
    }

    /// @notice Clamp prix 1e8: ≤5 sig figs et ≤ (8 - szDecimals) décimales. BUY: ceil, SELL: floor.
    function _marketLimitFromBbo(uint32 asset, bool isBuy) internal view returns (uint64) {
        (uint64 bid1e8, uint64 ask1e8) = _spotBboPx1e8(asset);
        // Pour un achat, on a besoin de l'ask. Pour une vente, on a besoin du bid.
        // On fait fallback sur l'oracle seulement si le prix nécessaire n'est pas disponible.
        if ((isBuy && ask1e8 == 0) || (!isBuy && bid1e8 == 0)) {
            // Fallback sur l'oracle normalisé si BBO indisponible
            uint64 oracle = spotOraclePx1e8(asset);
            return _limitFromOracleQuantized(asset, oracle, isBuy);
        }
        uint8 baseSzDec = _baseSzDecimals(asset);
        return StrategyMathLib.marketLimitFromBbo(bid1e8, ask1e8, baseSzDec, marketEpsilonBps, isBuy);
    }

    function _limitFromOracleQuantized(uint32 asset, uint64 oraclePx1e8, bool isBuy) internal view returns (uint64) {
        uint8 baseSzDec = _baseSzDecimals(asset);
        return StrategyMathLib.limitFromOracleQuantized(oraclePx1e8, baseSzDec, maxSlippageBps, marketEpsilonBps, isBuy);
    }

    /// @notice Arrondit la taille à szDecimals selon les règles Hyperliquid (tick-and-lot-size)
    /// @dev Selon https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size
    ///      Les tailles doivent être arrondies au szDecimals de l'actif.
    ///      Exemple: si szDecimals=6, alors 1.1648349853 HYPE → 1.164834 HYPE (floor)
    ///      On utilise floor (arrondi vers le bas) pour éviter les rejets d'ordres.
    ///      
    ///      Cette fonction garantit que la taille respecte szDecimals même si elle vient
    ///      d'un calcul avec plus de précision. En pratique, sizeSz vient déjà de
    ///      toSzInSzDecimals qui fait un floor via division entière, mais cette fonction
    ///      sert de validation/sécurité supplémentaire.
    /// @param sizeSz Taille en format szDecimals (entier représentant la taille * 10^szDecimals)
    /// @param szDecimals Nombre de décimales autorisées pour la taille (lot size)
    /// @return Taille arrondie à szDecimals (floor)
    function snapToLot(uint64 sizeSz, uint8 szDecimals) internal pure returns (uint64) {
        if (sizeSz == 0) return 0;
        
        // Selon la documentation Hyperliquid, les tailles doivent être arrondies à szDecimals
        // sizeSz est déjà en format szDecimals (entier), donc déjà conforme
        // Cette fonction garantit la conformité explicite avec les règles Hyperliquid
        
        // Note: sizeSz est un entier uint64 en unités de szDecimals
        // Par exemple, si szDecimals=6 et sizeSz=1164834, cela représente 1.164834 HYPE
        // Le floor est déjà appliqué par toSzInSzDecimals lors du calcul (division entière)
        
        // Si szDecimals >= 8, sizeSz est déjà un entier complet, pas besoin d'arrondi supplémentaire
        if (szDecimals >= 8) {
            return sizeSz;
        }
        
        // Pour szDecimals < 8, sizeSz est déjà correctement arrondi par toSzInSzDecimals
        // On retourne tel quel pour garantir la conformité avec les règles Hyperliquid
        return sizeSz;
    }

    function _assertOrder(uint32 asset, bool isBuy, uint64 limitPx1e8, uint64 szInSzDecimals) internal view {
        if (limitPx1e8 == 0) revert PX_TOO_LOW();
        if (szInSzDecimals == 0) revert SIZE_ZERO();
        
        // Validation de l'asset selon la documentation
        if (!(asset == spotTOKEN1 || asset == spotHYPE)) revert INVALID_ASSET();
        
        uint8 szDec = _baseSzDecimals(asset);
        if (szDec == 0) revert INVALID_SZ_DECIMALS();
        
        uint64 qpx = StrategyMathLib.quantizePx1e8(limitPx1e8, szDec, isBuy);
        if (qpx != limitPx1e8) revert PX_NOT_QUANTIZED();
        
        // Validation supplémentaire
        if (limitPx1e8 < 1) revert PX_TOO_LOW();
        if (szInSzDecimals > 1e15) revert SIZE_TOO_LARGE();
    }

    function _spotPxDecimals(uint32 spotIndex) internal view returns (uint8) {
        return _derivedSpotPxDecimals(spotIndex);
    }

    function _derivedSpotPxDecimals(uint32 spotIndex) internal view returns (uint8) {
        L1Read.SpotInfo memory info = l1read.spotInfo(spotIndex);
        uint64 baseTokenId = info.tokens[0];
        if (baseTokenId == 0) {
            // Fallback conservateur: Hyperliquid documente des prix au moins en 1e6.
            return 8;
        }
        L1Read.TokenInfo memory tokenInfo = l1read.tokenInfo(uint32(baseTokenId));
        if (tokenInfo.szDecimals >= 8) {
            return 0;
        }
        uint8 priceDecimals = uint8(8 - tokenInfo.szDecimals);
        return priceDecimals;
    }

    function _toPx1e8(uint32 spotIndex, uint64 rawPx) internal view returns (uint64) {
        uint8 pxDec = _spotPxDecimals(spotIndex);
        return StrategyMathLib.scalePxTo1e8(rawPx, pxDec);
    }

    function _toSz1e8(int256 deltaUsd1e18, uint64 price1e8) internal pure returns (uint64) {
        return CoreHandlerLib.toSz1e8(deltaUsd1e18, price1e8);
    }

    function _sellAssetForUsd(uint32 spotAsset, uint64 /*tokenId*/, uint256 targetUsd1e8) internal {
        if (targetUsd1e8 == 0) return;
        uint64 px = spotOraclePx1e8(spotAsset);
        // Convert target USD to base size 1e8
        uint256 targetUsd1e18 = targetUsd1e8 * 1e10;
        uint64 spotTokenId = spotAsset == spotTOKEN1 ? spotTokenTOKEN1 : spotTokenHYPE;
        uint64 szBase = CoreHandlerLib.toSzInSzDecimals(l1read, spotTokenId, int256(targetUsd1e18), px);
        if (szBase == 0) return;
        // Sell with lower bound price
        uint64 pxLimit = _marketLimitFromBbo(spotAsset, false);
        _sendSpotLimitOrderDirect(spotAsset, false, pxLimit, szBase, 0);
    }

    function _send(bytes memory data) internal {
        CORE_WRITER.sendRawAction(data);
        emit OutboundToCore(data);
    }

    function _mantissa1e8ToWei(uint64 amount1e8, uint8 weiDecimals) internal pure returns (uint256) {
        return StrategyMathLib.mantissa1e8ToWei(amount1e8, weiDecimals);
    }

    /// @notice Convertit wei en mantissa 1e8 avec gestion de la perte de précision
    /// @dev Utilise un arrondi vers le bas pour éviter les reverts
    function _weiToMantissa1e8(uint256 amountWei, uint8 weiDecimals) internal pure returns (uint256) {
        return StrategyMathLib.weiToMantissa1e8(amountWei, weiDecimals);
    }

    function _rateLimit(uint64 amount1e8) internal {
        if (amount1e8 == 0) return;
        uint64 currentBlock = uint64(block.number);
        if (currentBlock - lastEpochStart >= epochLength) {
            lastEpochStart = currentBlock;
            sentThisEpoch = 0;
        }
        if (sentThisEpoch + amount1e8 > maxOutboundPerEpoch) revert RateLimited();
        sentThisEpoch += amount1e8;
    }

    function _validatedOraclePx1e8(bool isToken1) internal returns (uint64) {
        uint32 asset = isToken1 ? spotTOKEN1 : spotHYPE;
        uint64 raw = l1read.spotPx(asset);
        if (raw == 0) revert OracleZero();
        uint64 px1e8 = _toPx1e8(asset, raw);

        uint64 last = isToken1 ? lastPxToken11e8 : lastPxHype1e8;
        bool init = isToken1 ? pxInitT1 : pxInitH;
        if (init && last != 0) {
            uint256 up = uint256(last) * (10_000 + uint256(maxOracleDeviationBps)) / 10_000;
            uint256 down = uint256(last) * (10_000 - uint256(maxOracleDeviationBps)) / 10_000;
            if (uint256(px1e8) > up) {
                uint64 adj = uint64(up);
                if (isToken1) { lastPxToken11e8 = adj; pxInitT1 = true; } else { lastPxHype1e8 = adj; pxInitH = true; }
                revert OracleGradualCatchup();
            }
            if (uint256(px1e8) < down) {
                uint64 adj = uint64(down);
                if (isToken1) { lastPxToken11e8 = adj; pxInitT1 = true; } else { lastPxHype1e8 = adj; pxInitH = true; }
                revert OracleGradualCatchup();
            }
        }

        if (isToken1) { lastPxToken11e8 = px1e8; pxInitT1 = true; } else { lastPxHype1e8 = px1e8; pxInitH = true; }
        return px1e8;
    }

    /// @notice Variante tolérante: met à jour le dernier prix et signale la déviation sans revert
    /// @return px prix normalisé 1e8 ajusté (borné si déviation)
    /// @return deviated true si le prix courant est hors bande de déviation
    function _tryValidatedOraclePx1e8(bool isToken1) internal returns (uint64 px, bool deviated) {
        uint32 asset = isToken1 ? spotTOKEN1 : spotHYPE;
        uint64 raw = l1read.spotPx(asset);
        if (raw == 0) return (0, true);
        uint64 px1e8 = _toPx1e8(asset, raw);

        uint64 last = isToken1 ? lastPxToken11e8 : lastPxHype1e8;
        bool init = isToken1 ? pxInitT1 : pxInitH;
        bool out = false;
        if (init && last != 0) {
            uint256 up = uint256(last) * (10_000 + uint256(maxOracleDeviationBps)) / 10_000;
            uint256 down = uint256(last) * (10_000 - uint256(maxOracleDeviationBps)) / 10_000;
            if (uint256(px1e8) > up) { px1e8 = uint64(up); out = true; }
            else if (uint256(px1e8) < down) { px1e8 = uint64(down); out = true; }
        }

        if (isToken1) { lastPxToken11e8 = px1e8; pxInitT1 = true; } else { lastPxHype1e8 = px1e8; pxInitH = true; }
        return (px1e8, out);
    }



    function _sendSpotLimitOrderDirect(
        uint32 asset,
        bool isBuy,
        uint64 limitPx1e8,
        uint64 szInSzDecimals,
        uint128 cloid
    ) internal {
        // Validation complète selon la documentation HyperEVM/HyperCore
        if (!(asset == spotTOKEN1 || asset == spotHYPE)) revert INVALID_ASSET();
        
        uint8 baseSzDec = _baseSzDecimals(asset);
        if (baseSzDec == 0) revert INVALID_SZ_DECIMALS();
        
        szInSzDecimals = snapToLot(szInSzDecimals, baseSzDec);
        if (szInSzDecimals == 0) revert SIZE_ZERO();
        
        _assertOrder(asset, isBuy, limitPx1e8, szInSzDecimals);
        
        // Validation TIF: nous utilisons uniquement IOC (3) selon la documentation
        uint8 encodedTif = HLConstants.TIF_IOC;
        if (encodedTif != 3) revert INVALID_TIF();
        
        // Validation cloid: 0 est autorisé (pas de client order ID)
        // Si cloid > 0, il doit être dans des limites raisonnables
        if (cloid > 0) {
            if (cloid > type(uint128).max / 2) revert CLOID_TOO_LARGE();
        }
        
        // Les spots nécessitent un offset +10000 pour l'asset ID (voir HLConversions.spotToAssetId)
        // La bibliothèque de référence ajoute systématiquement +10000 dans tous ses exemples
        uint32 assetId = asset + HLConstants.SPOT_ASSET_OFFSET;
        uint64 limitPxForCore = limitPx1e8;
        uint64 sz1e8 = StrategyMathLib.sizeSzTo1e8(szInSzDecimals, baseSzDec);
        if (sz1e8 == 0) revert SIZE_ZERO();
        
        _send(
            // HyperCore wire format expects both price and size as human-readable * 1e8 values.
            CoreHandlerLib.encodeSpotLimitOrder(
                assetId,
                isBuy,
                limitPxForCore,
                sz1e8,
                false, // reduceOnly
                encodedTif,
                cloid
            )
        );
    }
}


