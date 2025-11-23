const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x071Bcc062D661536D77a09b38bFfd249B7B8195F";
  const L1READ = process.env.L1READ || "0x46976ef07CA697f1546A7F5fcE6f6C6c1e8fdB6D";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x38fCB5F1e4498b537142ca2563e355127Af68fD2";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 DIAGNOSTIC FINAL: IDENTIFICATION CAUSE RACINE 1e6");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);

  const spotTokenHYPE = await handler.spotTokenHYPE();
  const hypeInfo = await l1read.tokenInfo(Number(spotTokenHYPE));
  const hypeBalance = await l1read.spotBalance(HANDLER, spotTokenHYPE);

  console.log("📦 HYPE INFO:");
  console.log(`  szDecimals: ${hypeInfo.szDecimals}`);
  console.log(`  weiDecimals: ${hypeInfo.weiDecimals}`);
  console.log(`  Balance total: ${hypeBalance.total.toString()}`);

  // Test 1: Calculer la position USD avec la méthode actuelle
  console.log("\n" + "=".repeat(80));
  console.log("TEST 1: CALCUL ACTUEL (spotBalanceInWei puis USD 1e18)");
  console.log("=".repeat(80));

  // Étape 1: spotBalanceInWei (szDecimals → weiDecimals)
  const diff = Number(hypeInfo.weiDecimals) - Number(hypeInfo.szDecimals);
  const hypeBalanceWei = BigInt(hypeBalance.total.toString()) * (10n ** BigInt(diff));
  console.log(`\n1. spotBalanceInWei:`);
  console.log(`   Input (szDecimals): ${hypeBalance.total.toString()}`);
  console.log(`   diff = ${diff}`);
  console.log(`   Output (weiDecimals): ${hypeBalanceWei.toString()}`);
  console.log(`   Vérification: ${Number(hypeBalanceWei) / 1e8} HYPE`);

  // Étape 2: Conversion USD 1e18
  const pxHype1e8 = await views.oraclePxHype1e8(HANDLER);
  const hypePos1e18 = hypeBalanceWei * BigInt(pxHype1e8.toString()) * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));
  console.log(`\n2. USD 1e18:`);
  console.log(`   balanceWei: ${hypeBalanceWei.toString()}`);
  console.log(`   price1e8: ${pxHype1e8.toString()}`);
  console.log(`   factor: 10^(18-${hypeInfo.weiDecimals}-8) = ${10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8)}`);
  console.log(`   Result: ${hypePos1e18.toString()}`);
  console.log(`   USD: ${ethers.formatEther(hypePos1e18)} USD`);

  // Test 2: Si spotBalance.total est déjà en weiDecimals
  console.log("\n" + "=".repeat(80));
  console.log("TEST 2: HYPOTHÈSE - spotBalance.total DÉJÀ EN weiDecimals");
  console.log("=".repeat(80));

  const hypeBalanceWeiDirect = BigInt(hypeBalance.total.toString());
  const hypePos1e18Direct = hypeBalanceWeiDirect * BigInt(pxHype1e8.toString()) * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));
  
  console.log(`\nSi total est déjà en weiDecimals:`);
  console.log(`   balanceWei: ${hypeBalanceWeiDirect.toString()}`);
  console.log(`   USD: ${ethers.formatEther(hypePos1e18Direct)} USD`);
  console.log(`   Ratio avec test 1: ${Number(hypePos1e18) / Number(hypePos1e18Direct)}`);

  // Test 3: Vérifier avec les valeurs réelles observées
  console.log("\n" + "=".repeat(80));
  console.log("TEST 3: COMPARAISON AVEC ORDRES OBSERVÉS");
  console.log("=".repeat(80));

  const observedHypeSizeSz = 49195531n;
  const observedHypePrice1e8 = 4750095000n;
  const observedHypeNotional1e18 = (observedHypeSizeSz * observedHypePrice1e8 * 10000000000n) / (10n ** BigInt(Number(hypeInfo.szDecimals)));

  console.log(`\nOrdre HYPE observé:`);
  console.log(`   Taille: ${observedHypeSizeSz.toString()} (szDecimals) = ${Number(observedHypeSizeSz) / (10 ** Number(hypeInfo.szDecimals))} HYPE`);
  console.log(`   Prix: ${ethers.formatUnits(observedHypePrice1e8, 8)} USD`);
  console.log(`   Notional: ${ethers.formatEther(observedHypeNotional1e18)} USD`);

  // Calculer le delta USD qui aurait produit cette taille
  // Si on utilise le prix oracle (75 USD) au lieu du prix limite (47.50 USD)
  const deltaUsd1e18Oracle = (observedHypeSizeSz * BigInt(pxHype1e8.toString()) * 10000000000n) / (10n ** BigInt(Number(hypeInfo.szDecimals)));
  console.log(`\nDelta USD si calculé avec prix oracle:`);
  console.log(`   ${ethers.formatEther(deltaUsd1e18Oracle)} USD`);

  // Si on utilise le prix limite observé
  const deltaUsd1e18Limit = (observedHypeSizeSz * observedHypePrice1e8 * 10000000000n) / (10n ** BigInt(Number(hypeInfo.szDecimals)));
  console.log(`\nDelta USD si calculé avec prix limite observé:`);
  console.log(`   ${ethers.formatEther(deltaUsd1e18Limit)} USD`);

  // Vérifier si le problème vient du calcul des deltas
  const equity1e18 = await views.equitySpotUsd1e18(HANDLER);
  console.log(`\nEquity totale (depuis views): ${ethers.formatEther(equity1e18)} USD`);

  // Calculer les deltas comme le code le fait
  const usdcReserveBps = await handler.usdcReserveBps();
  const targetEquity1e18 = (equity1e18 * (10000n - BigInt(usdcReserveBps.toString()))) / 10000n;
  const targetPerAsset = targetEquity1e18 / 2n;
  
  // Lire la position HYPE actuelle (calculer manuellement)
  const hypeBalanceForPos = await l1read.spotBalance(HANDLER, spotTokenHYPE);
  const hypeBalanceWeiForPos = BigInt(hypeBalanceForPos.total.toString()) * (10n ** BigInt(Number(hypeInfo.weiDecimals) - Number(hypeInfo.szDecimals)));
  const hypePos1e18FromViews = hypeBalanceWeiForPos * BigInt(pxHype1e8.toString()) * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));
  const dHype1e18 = targetPerAsset - hypePos1e18FromViews;

  console.log(`\nDeltas calculés:`);
  console.log(`   Target per asset: ${ethers.formatEther(targetPerAsset)} USD`);
  console.log(`   Position HYPE actuelle: ${ethers.formatEther(hypePos1e18FromViews)} USD`);
  console.log(`   Delta HYPE: ${ethers.formatEther(dHype1e18)} USD`);

  // Comparer
  console.log(`\n🔍 COMPARAISON:`);
  console.log(`   Delta calculé: ${ethers.formatEther(dHype1e18)} USD`);
  console.log(`   Notional ordre observé: ${ethers.formatEther(observedHypeNotional1e18)} USD`);
  const ratio = Number(observedHypeNotional1e18) / Number(ethers.formatEther(dHype1e18));
  console.log(`   Ratio: ${ratio}`);
  
  if (Math.abs(ratio - 1e6) < 100) {
    console.log(`   ⚠️  FACTEUR 1e6 DÉTECTÉ !`);
    console.log(`   💡 Le problème est dans le calcul des positions USD ou des deltas`);
  } else if (ratio > 0.5 && ratio < 2) {
    console.log(`   ✅ Ratio raisonnable (différence de prix limite vs oracle)`);
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

