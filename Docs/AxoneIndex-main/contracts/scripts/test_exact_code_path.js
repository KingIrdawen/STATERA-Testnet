const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x071Bcc062D661536D77a09b38bFfd249B7B8195F";
  const L1READ = process.env.L1READ || "0x46976ef07CA697f1546A7F5fcE6f6C6c1e8fdB6D";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x38fCB5F1e4498b537142ca2563e355127Af68fD2";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 TEST: SIMULATION EXACTE DU CODE");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);

  const spotTokenHYPE = await handler.spotTokenHYPE();
  const spotHYPE = await handler.spotHYPE();
  const hypeInfo = await l1read.tokenInfo(Number(spotTokenHYPE));
  const hypeBalance = await l1read.spotBalance(HANDLER, spotTokenHYPE);

  console.log("📦 HYPE:");
  console.log(`  spotBalance.total: ${hypeBalance.total.toString()}`);
  console.log(`  szDecimals: ${hypeInfo.szDecimals}, weiDecimals: ${hypeInfo.weiDecimals}`);

  // Simuler exactement spotBalanceInWei() (CoreHandlerLib.sol ligne 15-35)
  console.log(`\n📊 ÉTAPE 1: spotBalanceInWei()`);
  const total = BigInt(hypeBalance.total.toString());
  const diff = Number(hypeInfo.weiDecimals) - Number(hypeInfo.szDecimals);
  const hypeBalWei = total * (10n ** BigInt(diff));
  console.log(`  total (szDecimals): ${total.toString()}`);
  console.log(`  diff: ${diff}`);
  console.log(`  hypeBalWei: ${hypeBalWei.toString()}`);
  console.log(`  Vérification: ${Number(hypeBalWei) / (10 ** Number(hypeInfo.weiDecimals))} HYPE`);

  // Simuler exactement _usdPositions() pour HYPE (CoreHandlerLogicLib.sol ligne 156-177)
  console.log(`\n📊 ÉTAPE 2: _usdPositions() - Position HYPE USD`);
  const pxH1e8 = await views.oraclePxHype1e8(HANDLER);
  const hypeWeiDec = Number(hypeInfo.weiDecimals);
  
  let posH1e18;
  if (hypeWeiDec + 8 <= 18) {
    posH1e18 = hypeBalWei * BigInt(pxH1e8.toString()) * (10n ** BigInt(18 - hypeWeiDec - 8));
    console.log(`  hypeBalWei: ${hypeBalWei.toString()}`);
    console.log(`  pxH1e8: ${pxH1e8.toString()}`);
    console.log(`  factor: 10^(18-${hypeWeiDec}-8) = ${10n ** BigInt(18 - hypeWeiDec - 8)}`);
  } else {
    posH1e18 = (hypeBalWei * BigInt(pxH1e8.toString())) / (10n ** BigInt(hypeWeiDec + 8 - 18));
    console.log(`  (hypeBalWei * pxH1e8) / 10^(${hypeWeiDec}+8-18)`);
  }
  console.log(`  posH1e18: ${posH1e18.toString()}`);
  console.log(`  Position USD: ${ethers.formatEther(posH1e18)} USD`);

  // Simuler computeDeltasWithPositions
  console.log(`\n📊 ÉTAPE 3: computeDeltasWithPositions()`);
  const usdcCoreTokenId = await handler.usdcCoreTokenId();
  const usdcBalance = await l1read.spotBalance(HANDLER, usdcCoreTokenId);
  const usdcInfo = await l1read.tokenInfo(Number(usdcCoreTokenId));
  const usdcBalWei = BigInt(usdcBalance.total.toString()) * (10n ** BigInt(Number(usdcInfo.weiDecimals) - 0));
  const usdc1e18 = usdcBalWei * (10n ** BigInt(18 - Number(usdcInfo.weiDecimals)));
  
  const equity1e18 = usdc1e18 + posH1e18 + 0n; // BTC = 0
  const usdcReserveBps = await handler.usdcReserveBps();
  const targetEquity1e18 = (equity1e18 * (10000n - BigInt(usdcReserveBps.toString()))) / 10000n;
  const targetPerAsset = targetEquity1e18 / 2n;
  const dHype1e18 = targetPerAsset - posH1e18;
  
  console.log(`  equity1e18: ${ethers.formatEther(equity1e18)} USD`);
  console.log(`  targetPerAsset: ${ethers.formatEther(targetPerAsset)} USD`);
  console.log(`  dHype1e18: ${ethers.formatEther(dHype1e18)} USD`);

  // Simuler toSzInSzDecimals (CoreHandlerLib.sol ligne 47-65)
  console.log(`\n📊 ÉTAPE 4: toSzInSzDecimals()`);
  const absUsd = dHype1e18 > 0n ? dHype1e18 : -dHype1e18;
  const numerator = absUsd * (10n ** BigInt(Number(hypeInfo.szDecimals)));
  const denom = BigInt(pxH1e8.toString()) * 10000000000n; // 1e10
  const sizeSz = numerator / denom;
  
  console.log(`  absUsd: ${absUsd.toString()}`);
  console.log(`  numerator: absUsd * 10^${hypeInfo.szDecimals} = ${numerator.toString()}`);
  console.log(`  denom: px1e8 * 1e10 = ${denom.toString()}`);
  console.log(`  sizeSz: ${sizeSz.toString()}`);
  console.log(`  Taille humaine: ${Number(sizeSz) / (10 ** Number(hypeInfo.szDecimals))} HYPE`);

  // Simuler sizeSzTo1e8 (StrategyMathLib.sol ligne 70-83)
  console.log(`\n📊 ÉTAPE 5: sizeSzTo1e8()`);
  const szDecimals = Number(hypeInfo.szDecimals);
  let sz1e8;
  if (szDecimals == 8) {
    sz1e8 = sizeSz;
  } else if (szDecimals < 8) {
    const factor = 10n ** BigInt(8 - szDecimals);
    sz1e8 = sizeSz * factor;
    console.log(`  factor: 10^(8-${szDecimals}) = ${factor.toString()}`);
  } else {
    const divisor = 10n ** BigInt(szDecimals - 8);
    sz1e8 = sizeSz / divisor;
    console.log(`  divisor: 10^(${szDecimals}-8) = ${divisor.toString()}`);
  }
  console.log(`  sz1e8: ${sz1e8.toString()}`);
  console.log(`  Taille humaine finale: ${Number(sz1e8) / 1e8} HYPE`);

  // Comparer avec l'ordre observé
  const observedHypeSizeSz = 49195531n;
  const observedHypeSize1e8 = observedHypeSizeSz * (10n ** BigInt(8 - szDecimals));
  
  console.log(`\n📊 COMPARAISON AVEC ORDRE OBSERVÉ:`);
  console.log(`  Taille calculée (szDecimals): ${sizeSz.toString()}`);
  console.log(`  Taille observée (szDecimals): ${observedHypeSizeSz.toString()}`);
  console.log(`  Ratio: ${Number(sizeSz) / Number(observedHypeSizeSz)}`);
  
  console.log(`  Taille calculée (1e8): ${sz1e8.toString()}`);
  console.log(`  Taille observée (1e8): ${observedHypeSize1e8.toString()}`);
  console.log(`  Ratio: ${Number(sz1e8) / Number(observedHypeSize1e8)}`);
  
  if (Math.abs(Number(sizeSz) / Number(observedHypeSizeSz) - 1e6) < 100) {
    console.log(`  ⚠️  FACTEUR 1e6 DÉTECTÉ dans sizeSz !`);
    console.log(`  💡 Le problème est dans toSzInSzDecimals() ou dans les deltas USD`);
  } else if (Math.abs(Number(sz1e8) / Number(observedHypeSize1e8) - 1e6) < 100) {
    console.log(`  ⚠️  FACTEUR 1e6 DÉTECTÉ dans sz1e8 !`);
    console.log(`  💡 Le problème est dans sizeSzTo1e8()`);
  }

  console.log("\n" + "=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  process.exit(1);
});


