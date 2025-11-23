const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x071Bcc062D661536D77a09b38bFfd249B7B8195F";
  const L1READ = process.env.L1READ || "0x46976ef07CA697f1546A7F5fcE6f6C6c1e8fdB6D";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x38fCB5F1e4498b537142ca2563e355127Af68fD2";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 DIAGNOSTIC DÉTAILLÉ: PROBLÈME TAILLES 1e6");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);

  const spotBTC = await handler.spotBTC();
  const spotHYPE = await handler.spotHYPE();
  const spotTokenBTC = await handler.spotTokenBTC();
  const spotTokenHYPE = await handler.spotTokenHYPE();
  const usdcCoreTokenId = await handler.usdcCoreTokenId();

  // Infos tokens
  const btcInfo = await l1read.tokenInfo(Number(spotTokenBTC));
  const hypeInfo = await l1read.tokenInfo(Number(spotTokenHYPE));
  const usdcInfo = await l1read.tokenInfo(Number(usdcCoreTokenId));

  console.log("📦 INFOS TOKENS:");
  console.log(`  BTC: szDecimals=${btcInfo.szDecimals}, weiDecimals=${btcInfo.weiDecimals}`);
  console.log(`  HYPE: szDecimals=${hypeInfo.szDecimals}, weiDecimals=${hypeInfo.weiDecimals}`);
  console.log(`  USDC: weiDecimals=${usdcInfo.weiDecimals}`);

  // ========== ÉTAPE 1: LECTURE DES BALANCES BRUTES ==========
  console.log("\n" + "=".repeat(80));
  console.log("ÉTAPE 1: BALANCES BRUTES (szDecimals depuis spotBalance)");
  console.log("=".repeat(80));

  const btcBalanceRaw = await l1read.spotBalance(HANDLER, spotTokenBTC);
  const hypeBalanceRaw = await l1read.spotBalance(HANDLER, spotTokenHYPE);
  const usdcBalanceRaw = await l1read.spotBalance(HANDLER, usdcCoreTokenId);

  console.log(`\n📊 Balances brutes (szDecimals):`);
  console.log(`  BTC total: ${btcBalanceRaw.total.toString()}`);
  console.log(`  HYPE total: ${hypeBalanceRaw.total.toString()}`);
  console.log(`  USDC total: ${usdcBalanceRaw.total.toString()}`);

  // Convertir en valeurs humaines
  const btcBalanceHuman = Number(btcBalanceRaw.total.toString()) / (10 ** Number(btcInfo.szDecimals));
  const hypeBalanceHuman = Number(hypeBalanceRaw.total.toString()) / (10 ** Number(hypeInfo.szDecimals));
  const usdcBalanceHuman = Number(usdcBalanceRaw.total.toString()) / (10 ** 0); // USDC szDecimals = 0

  console.log(`\n📊 Balances humaines:`);
  console.log(`  BTC: ${btcBalanceHuman} BTC`);
  console.log(`  HYPE: ${hypeBalanceHuman} HYPE`);
  console.log(`  USDC: ${usdcBalanceHuman} USDC`);

  // ========== ÉTAPE 2: CONVERSION szDecimals → weiDecimals ==========
  console.log("\n" + "=".repeat(80));
  console.log("ÉTAPE 2: CONVERSION szDecimals → weiDecimals (spotBalanceInWei)");
  console.log("=".repeat(80));

  // Simuler spotBalanceInWei
  const btcDiff = Number(btcInfo.weiDecimals) - Number(btcInfo.szDecimals);
  const hypeDiff = Number(hypeInfo.weiDecimals) - Number(hypeInfo.szDecimals);
  const usdcDiff = Number(usdcInfo.weiDecimals) - 0;

  const btcBalanceWei = BigInt(btcBalanceRaw.total.toString()) * (10n ** BigInt(btcDiff));
  const hypeBalanceWei = BigInt(hypeBalanceRaw.total.toString()) * (10n ** BigInt(hypeDiff));
  const usdcBalanceWei = BigInt(usdcBalanceRaw.total.toString()) * (10n ** BigInt(usdcDiff));

  console.log(`\n📊 Conversion szDecimals → weiDecimals:`);
  console.log(`  BTC: diff=${btcDiff}, ${btcBalanceRaw.total.toString()} * 10^${btcDiff} = ${btcBalanceWei.toString()}`);
  console.log(`  HYPE: diff=${hypeDiff}, ${hypeBalanceRaw.total.toString()} * 10^${hypeDiff} = ${hypeBalanceWei.toString()}`);
  console.log(`  USDC: diff=${usdcDiff}, ${usdcBalanceRaw.total.toString()} * 10^${usdcDiff} = ${usdcBalanceWei.toString()}`);

  // Vérifier les valeurs humaines
  const btcBalanceWeiHuman = Number(btcBalanceWei) / (10 ** Number(btcInfo.weiDecimals));
  const hypeBalanceWeiHuman = Number(hypeBalanceWei) / (10 ** Number(hypeInfo.weiDecimals));
  const usdcBalanceWeiHuman = Number(usdcBalanceWei) / (10 ** Number(usdcInfo.weiDecimals));

  console.log(`\n📊 Balances weiDecimals (humaines):`);
  console.log(`  BTC: ${btcBalanceWeiHuman} BTC`);
  console.log(`  HYPE: ${hypeBalanceWeiHuman} HYPE`);
  console.log(`  USDC: ${usdcBalanceWeiHuman} USDC`);
  console.log(`  ✅ Vérification: ${btcBalanceWeiHuman === btcBalanceHuman ? "CORRECT" : "ERREUR"}`);
  console.log(`  ✅ Vérification: ${hypeBalanceWeiHuman === hypeBalanceHuman ? "CORRECT" : "ERREUR"}`);

  // ========== ÉTAPE 3: CONVERSION weiDecimals → USD 1e18 ==========
  console.log("\n" + "=".repeat(80));
  console.log("ÉTAPE 3: CONVERSION weiDecimals → USD 1e18 (_usdPositions)");
  console.log("=".repeat(80));

  // Prix oracles
  const pxBtc1e8 = await views.oraclePxBtc1e8(HANDLER);
  const pxHype1e8 = await views.oraclePxHype1e8(HANDLER);

  console.log(`\n📊 Prix oracles (1e8):`);
  console.log(`  BTC: ${ethers.formatUnits(pxBtc1e8, 8)} USD`);
  console.log(`  HYPE: ${ethers.formatUnits(pxHype1e8, 8)} USD`);

  // USDC → USD 1e18
  const usdc1e18 = usdcBalanceWei * (10n ** BigInt(18 - Number(usdcInfo.weiDecimals)));
  console.log(`\n💵 USDC → USD 1e18:`);
  console.log(`  ${usdcBalanceWei} * 10^(18-${usdcInfo.weiDecimals}) = ${usdc1e18.toString()}`);
  console.log(`  Valeur USD: ${ethers.formatEther(usdc1e18)} USD`);

  // BTC → USD 1e18
  const btcWeiDec = Number(btcInfo.weiDecimals);
  const btcFactor = btcWeiDec + 8 <= 18 ? (10n ** BigInt(18 - btcWeiDec - 8)) : 1n;
  const btcDivisor = btcWeiDec + 8 > 18 ? (10n ** BigInt(btcWeiDec + 8 - 18)) : 1n;
  
  let btcPos1e18;
  if (btcWeiDec + 8 <= 18) {
    btcPos1e18 = btcBalanceWei * BigInt(pxBtc1e8.toString()) * btcFactor;
    console.log(`\n💵 BTC → USD 1e18 (multiplication):`);
    console.log(`  ${btcBalanceWei} * ${pxBtc1e8} * 10^(18-${btcWeiDec}-8)`);
    console.log(`  = ${btcBalanceWei} * ${pxBtc1e8} * ${btcFactor}`);
  } else {
    btcPos1e18 = (btcBalanceWei * BigInt(pxBtc1e8.toString())) / btcDivisor;
    console.log(`\n💵 BTC → USD 1e18 (division):`);
    console.log(`  (${btcBalanceWei} * ${pxBtc1e8}) / 10^(${btcWeiDec}+8-18)`);
    console.log(`  = (${btcBalanceWei} * ${pxBtc1e8}) / ${btcDivisor}`);
  }
  console.log(`  Résultat: ${btcPos1e18.toString()}`);
  console.log(`  Valeur USD: ${ethers.formatEther(btcPos1e18)} USD`);

  // Vérification manuelle
  const btcValueManual = btcBalanceWeiHuman * (Number(pxBtc1e8.toString()) / 1e8);
  console.log(`  Vérification manuelle: ${btcBalanceWeiHuman} BTC * ${ethers.formatUnits(pxBtc1e8, 8)} USD = ${btcValueManual} USD`);
  const btcValueFromCode = Number(ethers.formatEther(btcPos1e18));
  console.log(`  Différence: ${Math.abs(btcValueManual - btcValueFromCode)} USD`);
  if (Math.abs(btcValueManual - btcValueFromCode) < 0.01) {
    console.log(`  ✅ CORRECT`);
  } else {
    console.log(`  ❌ ERREUR - Facteur: ${btcValueFromCode / btcValueManual}`);
  }

  // HYPE → USD 1e18
  const hypeWeiDec = Number(hypeInfo.weiDecimals);
  const hypeFactor = hypeWeiDec + 8 <= 18 ? (10n ** BigInt(18 - hypeWeiDec - 8)) : 1n;
  const hypeDivisor = hypeWeiDec + 8 > 18 ? (10n ** BigInt(hypeWeiDec + 8 - 18)) : 1n;
  
  let hypePos1e18;
  if (hypeWeiDec + 8 <= 18) {
    hypePos1e18 = hypeBalanceWei * BigInt(pxHype1e8.toString()) * hypeFactor;
    console.log(`\n💵 HYPE → USD 1e18 (multiplication):`);
    console.log(`  ${hypeBalanceWei} * ${pxHype1e8} * 10^(18-${hypeWeiDec}-8)`);
    console.log(`  = ${hypeBalanceWei} * ${pxHype1e8} * ${hypeFactor}`);
  } else {
    hypePos1e18 = (hypeBalanceWei * BigInt(pxHype1e8.toString())) / hypeDivisor;
    console.log(`\n💵 HYPE → USD 1e18 (division):`);
    console.log(`  (${hypeBalanceWei} * ${pxHype1e8}) / 10^(${hypeWeiDec}+8-18)`);
    console.log(`  = (${hypeBalanceWei} * ${pxHype1e8}) / ${hypeDivisor}`);
  }
  console.log(`  Résultat: ${hypePos1e18.toString()}`);
  console.log(`  Valeur USD: ${ethers.formatEther(hypePos1e18)} USD`);

  // Vérification manuelle
  const hypeValueManual = hypeBalanceWeiHuman * (Number(pxHype1e8.toString()) / 1e8);
  console.log(`  Vérification manuelle: ${hypeBalanceWeiHuman} HYPE * ${ethers.formatUnits(pxHype1e8, 8)} USD = ${hypeValueManual} USD`);
  const hypeValueFromCode = Number(ethers.formatEther(hypePos1e18));
  console.log(`  Différence: ${Math.abs(hypeValueManual - hypeValueFromCode)} USD`);
  if (Math.abs(hypeValueManual - hypeValueFromCode) < 0.01) {
    console.log(`  ✅ CORRECT`);
  } else {
    console.log(`  ❌ ERREUR - Facteur: ${hypeValueFromCode / hypeValueManual}`);
  }

  // Equity totale
  const equity1e18 = usdc1e18 + btcPos1e18 + hypePos1e18;
  console.log(`\n💵 EQUITY TOTALE:`);
  console.log(`  USDC: ${ethers.formatEther(usdc1e18)} USD`);
  console.log(`  BTC: ${ethers.formatEther(btcPos1e18)} USD`);
  console.log(`  HYPE: ${ethers.formatEther(hypePos1e18)} USD`);
  console.log(`  TOTAL: ${ethers.formatEther(equity1e18)} USD`);

  // ========== ÉTAPE 4: CALCUL DES DELTAS ==========
  console.log("\n" + "=".repeat(80));
  console.log("ÉTAPE 4: CALCUL DES DELTAS USD (computeDeltasWithPositions)");
  console.log("=".repeat(80));

  const usdcReserveBps = await handler.usdcReserveBps();
  const deadbandBps = await handler.deadbandBps();

  console.log(`\n⚙️  Paramètres:`);
  console.log(`  USDC Reserve: ${usdcReserveBps.toString()} bps`);
  console.log(`  Deadband: ${deadbandBps.toString()} bps`);

  const targetEquity1e18 = (equity1e18 * (10000n - BigInt(usdcReserveBps.toString()))) / 10000n;
  const targetPerAsset = targetEquity1e18 / 2n;

  const dBtc1e18 = targetPerAsset - btcPos1e18;
  const dHype1e18 = targetPerAsset - hypePos1e18;

  console.log(`\n📊 Deltas calculés:`);
  console.log(`  Target equity: ${ethers.formatEther(targetEquity1e18)} USD`);
  console.log(`  Target per asset: ${ethers.formatEther(targetPerAsset)} USD`);
  console.log(`  Delta BTC: ${ethers.formatEther(dBtc1e18)} USD`);
  console.log(`  Delta HYPE: ${ethers.formatEther(dHype1e18)} USD`);

  // ========== ÉTAPE 5: CONVERSION DELTAS → TAILLES ==========
  console.log("\n" + "=".repeat(80));
  console.log("ÉTAPE 5: CONVERSION DELTAS USD → TAILLES (toSzInSzDecimals)");
  console.log("=".repeat(80));

  if (dBtc1e18 > 0n) {
    console.log(`\n🔍 Conversion Delta BTC → Taille:`);
    console.log(`  Delta USD: ${ethers.formatEther(dBtc1e18)} USD (1e18)`);
    console.log(`  Prix: ${ethers.formatUnits(pxBtc1e8, 8)} USD (1e8)`);
    
    const numeratorBtc = dBtc1e18 * (10n ** BigInt(Number(btcInfo.szDecimals)));
    const denomBtc = BigInt(pxBtc1e8.toString()) * 10000000000n; // 1e10
    const sizeSzBtc = numeratorBtc / denomBtc;
    
    console.log(`  toSzInSzDecimals:`);
    console.log(`    numerator = ${ethers.formatEther(dBtc1e18)} * 10^${btcInfo.szDecimals} = ${numeratorBtc.toString()}`);
    console.log(`    denom = ${pxBtc1e8} * 1e10 = ${denomBtc.toString()}`);
    console.log(`    sizeSz = ${sizeSzBtc.toString()}`);
    console.log(`    Taille humaine: ${Number(sizeSzBtc) / (10 ** Number(btcInfo.szDecimals))} BTC`);
    
    // Vérification manuelle
    const expectedSizeBtc = Number(ethers.formatEther(dBtc1e18)) / (Number(pxBtc1e8.toString()) / 1e8);
    console.log(`  Vérification manuelle:`);
    console.log(`    Taille attendue: ${expectedSizeBtc} BTC`);
    console.log(`    Taille calculée: ${Number(sizeSzBtc) / (10 ** Number(btcInfo.szDecimals))} BTC`);
    const diffBtc = Math.abs(expectedSizeBtc - (Number(sizeSzBtc) / (10 ** Number(btcInfo.szDecimals))));
    if (diffBtc < 0.0001) {
      console.log(`    ✅ CORRECT (diff: ${diffBtc} BTC)`);
    } else {
      console.log(`    ❌ ERREUR (diff: ${diffBtc} BTC)`);
      console.log(`    Facteur: ${(Number(sizeSzBtc) / (10 ** Number(btcInfo.szDecimals))) / expectedSizeBtc}`);
    }
  }

  if (dHype1e18 > 0n) {
    console.log(`\n🔍 Conversion Delta HYPE → Taille:`);
    console.log(`  Delta USD: ${ethers.formatEther(dHype1e18)} USD (1e18)`);
    console.log(`  Prix: ${ethers.formatUnits(pxHype1e8, 8)} USD (1e8)`);
    
    const numeratorHype = dHype1e18 * (10n ** BigInt(Number(hypeInfo.szDecimals)));
    const denomHype = BigInt(pxHype1e8.toString()) * 10000000000n; // 1e10
    const sizeSzHype = numeratorHype / denomHype;
    
    console.log(`  toSzInSzDecimals:`);
    console.log(`    numerator = ${ethers.formatEther(dHype1e18)} * 10^${hypeInfo.szDecimals} = ${numeratorHype.toString()}`);
    console.log(`    denom = ${pxHype1e8} * 1e10 = ${denomHype.toString()}`);
    console.log(`    sizeSz = ${sizeSzHype.toString()}`);
    console.log(`    Taille humaine: ${Number(sizeSzHype) / (10 ** Number(hypeInfo.szDecimals))} HYPE`);
    
    // Vérification manuelle
    const expectedSizeHype = Number(ethers.formatEther(dHype1e18)) / (Number(pxHype1e8.toString()) / 1e8);
    console.log(`  Vérification manuelle:`);
    console.log(`    Taille attendue: ${expectedSizeHype} HYPE`);
    console.log(`    Taille calculée: ${Number(sizeSzHype) / (10 ** Number(hypeInfo.szDecimals))} HYPE`);
    const diffHype = Math.abs(expectedSizeHype - (Number(sizeSzHype) / (10 ** Number(hypeInfo.szDecimals))));
    if (diffHype < 0.0001) {
      console.log(`    ✅ CORRECT (diff: ${diffHype} HYPE)`);
    } else {
      console.log(`    ❌ ERREUR (diff: ${diffHype} HYPE)`);
      console.log(`    Facteur: ${(Number(sizeSzHype) / (10 ** Number(hypeInfo.szDecimals))) / expectedSizeHype}`);
    }
  }

  // ========== COMPARAISON AVEC VALEURS OBSERVÉES ==========
  console.log("\n" + "=".repeat(80));
  console.log("COMPARAISON AVEC VALEURS OBSERVÉES");
  console.log("=".repeat(80));

  // Valeurs observées du dernier rebalancing
  const observedBtcSizeSz = 53737490n;
  const observedBtcPrice1e8 = 4262500000000n;
  const observedHypeSizeSz = 49195531n;
  const observedHypePrice1e8 = 4750095000n;

  console.log(`\n📊 Ordres observés:`);
  console.log(`  BTC: ${observedBtcSizeSz.toString()} (szDecimals) = ${Number(observedBtcSizeSz) / (10 ** Number(btcInfo.szDecimals))} BTC`);
  console.log(`  HYPE: ${observedHypeSizeSz.toString()} (szDecimals) = ${Number(observedHypeSizeSz) / (10 ** Number(hypeInfo.szDecimals))} HYPE`);

  // Calculer les notional USD des ordres observés
  const observedBtcNotional1e18 = (observedBtcSizeSz * observedBtcPrice1e8 * 10000000000n) / (10n ** BigInt(Number(btcInfo.szDecimals)));
  const observedHypeNotional1e18 = (observedHypeSizeSz * observedHypePrice1e8 * 10000000000n) / (10n ** BigInt(Number(hypeInfo.szDecimals)));

  console.log(`\n💵 Notional USD des ordres observés:`);
  console.log(`  BTC: ${ethers.formatEther(observedBtcNotional1e18)} USD`);
  console.log(`  HYPE: ${ethers.formatEther(observedHypeNotional1e18)} USD`);

  // Comparer avec les deltas calculés
  if (dBtc1e18 > 0n) {
    const ratioBtc = Number(observedBtcNotional1e18) / Number(ethers.formatEther(dBtc1e18));
    console.log(`\n🔍 Comparaison BTC:`);
    console.log(`  Delta calculé: ${ethers.formatEther(dBtc1e18)} USD`);
    console.log(`  Notional observé: ${ethers.formatEther(observedBtcNotional1e18)} USD`);
    console.log(`  Ratio: ${ratioBtc}`);
    if (Math.abs(ratioBtc - 1e6) < 100) {
      console.log(`  ⚠️  FACTEUR 1e6 DÉTECTÉ !`);
    }
  }

  if (dHype1e18 > 0n) {
    const ratioHype = Number(observedHypeNotional1e18) / Number(ethers.formatEther(dHype1e18));
    console.log(`\n🔍 Comparaison HYPE:`);
    console.log(`  Delta calculé: ${ethers.formatEther(dHype1e18)} USD`);
    console.log(`  Notional observé: ${ethers.formatEther(observedHypeNotional1e18)} USD`);
    console.log(`  Ratio: ${ratioHype}`);
    if (Math.abs(ratioHype - 1e6) < 100) {
      console.log(`  ⚠️  FACTEUR 1e6 DÉTECTÉ !`);
    }
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


