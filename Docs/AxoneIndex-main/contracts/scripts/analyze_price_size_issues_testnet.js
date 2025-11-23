const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x071Bcc062D661536D77a09b38bFfd249B7B8195F";
  const L1READ = process.env.L1READ || "0x46976ef07CA697f1546A7F5fcE6f6C6c1e8fdB6D";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x38fCB5F1e4498b537142ca2563e355127Af68fD2";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 ANALYSE DES PROBLÈMES DE PRIX ET TAILLES");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);

  const spotBTC = await handler.spotBTC();
  const spotHYPE = await handler.spotHYPE();
  const spotTokenBTC = await handler.spotTokenBTC();
  const spotTokenHYPE = await handler.spotTokenHYPE();

  console.log("📊 CONFIGURATION:");
  console.log(`  Spot BTC ID: ${spotBTC}`);
  console.log(`  Spot HYPE ID: ${spotHYPE}`);
  console.log(`  Spot Token BTC ID: ${spotTokenBTC}`);
  console.log(`  Spot Token HYPE ID: ${spotTokenHYPE}`);

  // Infos tokens
  const btcInfo = await l1read.tokenInfo(Number(spotTokenBTC));
  const hypeInfo = await l1read.tokenInfo(Number(spotTokenHYPE));
  
  console.log(`\n📦 INFOS TOKENS:`);
  console.log(`  BTC: szDecimals=${btcInfo.szDecimals}, weiDecimals=${btcInfo.weiDecimals}`);
  console.log(`  HYPE: szDecimals=${hypeInfo.szDecimals}, weiDecimals=${hypeInfo.weiDecimals}`);

  // Paramètres
  const marketEpsilonBps = await handler.marketEpsilonBps();
  const maxSlippageBps = await handler.maxSlippageBps();
  console.log(`\n⚙️  PARAMÈTRES:`);
  console.log(`  Market Epsilon: ${marketEpsilonBps.toString()} bps`);
  console.log(`  Max Slippage: ${maxSlippageBps.toString()} bps`);

  // ========== PROBLÈME 1: PRIX LIMITE ==========
  console.log("\n" + "=".repeat(80));
  console.log("🔍 PROBLÈME 1: ANALYSE DU PRIX LIMITE BTC");
  console.log("=".repeat(80));

  // BBO BTC
  const assetIdBtc = Number(spotBTC) + 10000;
  const bboBtc = await l1read.bbo(assetIdBtc);
  console.log(`\n📊 BBO BTC (raw):`);
  console.log(`  Bid: ${bboBtc.bid.toString()}`);
  console.log(`  Ask: ${bboBtc.ask.toString()}`);

  // Calculer pxDec pour BTC
  const pxDecBtc = Number(btcInfo.szDecimals) >= 8 ? 0 : (8 - Number(btcInfo.szDecimals));
  console.log(`  pxDec: ${pxDecBtc}`);

  // Normaliser les prix
  const factorBtc = pxDecBtc === 0 ? 1n : (10n ** BigInt(8 - pxDecBtc));
  const bidBtc1e8 = BigInt(bboBtc.bid.toString()) * factorBtc;
  const askBtc1e8 = BigInt(bboBtc.ask.toString()) * factorBtc;
  
  console.log(`\n📊 BBO BTC (normalisé 1e8):`);
  console.log(`  Bid: ${ethers.formatUnits(bidBtc1e8, 8)} USD`);
  console.log(`  Ask: ${ethers.formatUnits(askBtc1e8, 8)} USD`);

  // Prix oracle
  const pxBtcOracle = await views.oraclePxBtc1e8(HANDLER);
  console.log(`  Oracle: ${ethers.formatUnits(pxBtcOracle, 8)} USD`);

  // Simuler _marketLimitFromBbo pour un achat BTC
  console.log(`\n🔍 Simulation _marketLimitFromBbo(isBuy=true):`);
  console.log(`  Condition: bid1e8 == 0 || ask1e8 == 0`);
  console.log(`  bid1e8: ${bidBtc1e8.toString()} (${bidBtc1e8 === 0n ? "ZÉRO ⚠️" : "OK"})`);
  console.log(`  ask1e8: ${askBtc1e8.toString()} (${askBtc1e8 === 0n ? "ZÉRO ⚠️" : "OK"})`);
  
  if (bidBtc1e8 === 0n || askBtc1e8 === 0n) {
    console.log(`  ⚠️  FALLBACK sur oracle (car bid ou ask = 0)`);
    console.log(`  Oracle: ${ethers.formatUnits(pxBtcOracle, 8)} USD`);
    console.log(`  Calcul avec maxSlippageBps (${maxSlippageBps}) + marketEpsilonBps (${marketEpsilonBps}):`);
    const totalBps = BigInt(maxSlippageBps) + BigInt(marketEpsilonBps);
    const adj = (pxBtcOracle * totalBps) / 10000n;
    const limitFromOracle = pxBtcOracle + adj;
    console.log(`    Adj: ${ethers.formatUnits(adj, 8)} USD`);
    console.log(`    Prix limite: ${ethers.formatUnits(limitFromOracle, 8)} USD`);
    console.log(`  ❌ PROBLÈME: Utilise oracle au lieu de l'ask disponible !`);
    console.log(`  💡 SOLUTION: Pour un achat, utiliser l'ask même si bid=0`);
  } else {
    console.log(`  ✅ Utilise BBO`);
    const adj = (askBtc1e8 * BigInt(marketEpsilonBps)) / 10000n;
    const limitFromBbo = askBtc1e8 + adj;
    console.log(`    Adj (epsilon): ${ethers.formatUnits(adj, 8)} USD`);
    console.log(`    Prix limite: ${ethers.formatUnits(limitFromBbo, 8)} USD`);
  }

  // ========== PROBLÈME 2: TAILLES ==========
  console.log("\n" + "=".repeat(80));
  console.log("🔍 PROBLÈME 2: ANALYSE DES TAILLES (1e6 trop grandes)");
  console.log("=".repeat(80));

  // Test avec une valeur connue
  const testUsd1e18 = ethers.parseEther("100"); // 100 USD
  const testPrice1e8 = ethers.parseUnits("75", 8); // 75 USD
  
  console.log(`\n📊 Test avec valeur connue:`);
  console.log(`  USD: ${ethers.formatEther(testUsd1e18)} USD (1e18)`);
  console.log(`  Prix: ${ethers.formatUnits(testPrice1e8, 8)} USD (1e8)`);
  console.log(`  Taille attendue: ${ethers.formatEther(testUsd1e18) / ethers.formatUnits(testPrice1e8, 8)} HYPE`);

  // Simuler toSzInSzDecimals pour HYPE (szDecimals=2)
  console.log(`\n🔍 Simulation toSzInSzDecimals pour HYPE (szDecimals=2):`);
  const szDecimalsHype = Number(hypeInfo.szDecimals);
  const numerator = testUsd1e18 * (10n ** BigInt(szDecimalsHype));
  const denom = testPrice1e8 * 10000000000n; // 1e10
  const sizeSz = numerator / denom;
  
  console.log(`  numerator = USD1e18 * 10^szDecimals = ${testUsd1e18} * 10^${szDecimalsHype}`);
  console.log(`    = ${numerator.toString()}`);
  console.log(`  denom = price1e8 * 1e10 = ${testPrice1e8} * 1e10`);
  console.log(`    = ${denom.toString()}`);
  console.log(`  sizeSz = ${sizeSz.toString()}`);
  console.log(`  Taille humaine: ${Number(sizeSz) / (10 ** szDecimalsHype)} HYPE`);
  
  // Simuler sizeSzTo1e8
  console.log(`\n🔍 Simulation sizeSzTo1e8(sizeSz=${sizeSz}, szDecimals=${szDecimalsHype}):`);
  if (szDecimalsHype < 8) {
    const factor = 10n ** BigInt(8 - szDecimalsHype);
    const sz1e8 = sizeSz * factor;
    console.log(`  factor = 10^(8-${szDecimalsHype}) = ${factor.toString()}`);
    console.log(`  sz1e8 = ${sizeSz} * ${factor} = ${sz1e8.toString()}`);
    console.log(`  Taille humaine finale: ${Number(sz1e8) / 1e8} HYPE`);
    
    // Vérifier si c'est correct
    const expectedSize = Number(testUsd1e18) / Number(testPrice1e8);
    const actualSize = Number(sz1e8) / 1e8;
    console.log(`\n  ✅ Vérification:`);
    console.log(`    Taille attendue: ${expectedSize} HYPE`);
    console.log(`    Taille calculée: ${actualSize} HYPE`);
    if (Math.abs(expectedSize - actualSize) < 0.0001) {
      console.log(`    ✅ CORRECT`);
    } else {
      console.log(`    ❌ ERREUR: Différence de ${Math.abs(expectedSize - actualSize)} HYPE`);
    }
  }

  // Test avec BTC (szDecimals=5)
  console.log(`\n🔍 Simulation toSzInSzDecimals pour BTC (szDecimals=5):`);
  const szDecimalsBtc = Number(btcInfo.szDecimals);
  const testPriceBtc1e8 = ethers.parseUnits("27500", 8); // 27500 USD
  const numeratorBtc = testUsd1e18 * (10n ** BigInt(szDecimalsBtc));
  const denomBtc = testPriceBtc1e8 * 10000000000n;
  const sizeSzBtc = numeratorBtc / denomBtc;
  
  console.log(`  numerator = ${numeratorBtc.toString()}`);
  console.log(`  denom = ${denomBtc.toString()}`);
  console.log(`  sizeSz = ${sizeSzBtc.toString()}`);
  console.log(`  Taille humaine: ${Number(sizeSzBtc) / (10 ** szDecimalsBtc)} BTC`);
  
  // sizeSzTo1e8 pour BTC
  if (szDecimalsBtc < 8) {
    const factorBtc = 10n ** BigInt(8 - szDecimalsBtc);
    const sz1e8Btc = sizeSzBtc * factorBtc;
    console.log(`  sz1e8 = ${sz1e8Btc.toString()}`);
    console.log(`  Taille humaine finale: ${Number(sz1e8Btc) / 1e8} BTC`);
    
    const expectedSizeBtc = Number(testUsd1e18) / Number(testPriceBtc1e8);
    const actualSizeBtc = Number(sz1e8Btc) / 1e8;
    console.log(`\n  ✅ Vérification:`);
    console.log(`    Taille attendue: ${expectedSizeBtc} BTC`);
    console.log(`    Taille calculée: ${actualSizeBtc} BTC`);
    if (Math.abs(expectedSizeBtc - actualSizeBtc) < 0.0001) {
      console.log(`    ✅ CORRECT`);
    } else {
      console.log(`    ❌ ERREUR: Différence de ${Math.abs(expectedSizeBtc - actualSizeBtc)} BTC`);
    }
  }

  // Vérifier les tailles réelles des ordres
  console.log("\n" + "=".repeat(80));
  console.log("🔍 VÉRIFICATION DES TAILLES RÉELLES DES ORDRES");
  console.log("=".repeat(80));

  // Dernier ordre BTC observé
  const observedBtcSizeSz = 53737490n;
  const observedBtcPrice1e8 = 4262500000000n;
  console.log(`\n📊 Ordre BTC observé:`);
  console.log(`  Taille (szDecimals): ${observedBtcSizeSz.toString()}`);
  console.log(`  Prix (1e8): ${observedBtcPrice1e8.toString()} = ${ethers.formatUnits(observedBtcPrice1e8, 8)} USD`);
  
  // Convertir en taille humaine
  const btcSizeHuman = Number(observedBtcSizeSz) / (10 ** szDecimalsBtc);
  console.log(`  Taille humaine (szDecimals): ${btcSizeHuman} BTC`);
  
  // Convertir en 1e8
  const factorBtcObs = 10n ** BigInt(8 - szDecimalsBtc);
  const btcSize1e8 = observedBtcSizeSz * factorBtcObs;
  console.log(`  Taille (1e8): ${btcSize1e8.toString()}`);
  console.log(`  Taille humaine (1e8): ${Number(btcSize1e8) / 1e8} BTC`);
  
  // Vérifier si c'est 1e6 trop grand
  const expectedBtcSize = btcSizeHuman / 1e6;
  console.log(`\n  🔍 Si on divise par 1e6:`);
  console.log(`    ${btcSizeHuman} / 1e6 = ${expectedBtcSize} BTC`);
  console.log(`    Cela semble-t-il raisonnable ?`);

  // Dernier ordre HYPE observé
  const observedHypeSizeSz = 49195531n;
  const observedHypePrice1e8 = 4750095000n;
  console.log(`\n📊 Ordre HYPE observé:`);
  console.log(`  Taille (szDecimals): ${observedHypeSizeSz.toString()}`);
  console.log(`  Prix (1e8): ${observedHypePrice1e8.toString()} = ${ethers.formatUnits(observedHypePrice1e8, 8)} USD`);
  
  const hypeSizeHuman = Number(observedHypeSizeSz) / (10 ** szDecimalsHype);
  console.log(`  Taille humaine (szDecimals): ${hypeSizeHuman} HYPE`);
  
  const factorHypeObs = 10n ** BigInt(8 - szDecimalsHype);
  const hypeSize1e8 = observedHypeSizeSz * factorHypeObs;
  console.log(`  Taille (1e8): ${hypeSize1e8.toString()}`);
  console.log(`  Taille humaine (1e8): ${Number(hypeSize1e8) / 1e8} HYPE`);
  
  const expectedHypeSize = hypeSizeHuman / 1e6;
  console.log(`\n  🔍 Si on divise par 1e6:`);
  console.log(`    ${hypeSizeHuman} / 1e6 = ${expectedHypeSize} HYPE`);
  console.log(`    Cela semble-t-il raisonnable ?`);

  // Résumé
  console.log("\n" + "=".repeat(80));
  console.log("📊 RÉSUMÉ DES PROBLÈMES IDENTIFIÉS");
  console.log("=".repeat(80));
  
  console.log(`\n1. PRIX LIMITE BTC:`);
  console.log(`   ❌ Problème: Utilise fallback oracle (27,500 USD) au lieu de l'ask (45,000 USD)`);
  console.log(`   💡 Cause: Condition "bid1e8 == 0 || ask1e8 == 0" déclenche le fallback même si ask est disponible`);
  console.log(`   💡 Solution: Pour un achat, vérifier seulement ask1e8. Pour une vente, vérifier seulement bid1e8`);
  
  console.log(`\n2. TAILLES DES ORDRES:`);
  console.log(`   ⚠️  À vérifier: Les tailles semblent correctes selon la formule`);
  console.log(`   💡 Si elles sont 1e6 trop grandes, le problème pourrait être:`);
  console.log(`      - Double conversion quelque part`);
  console.log(`      - Mauvais format dans l'encodage final`);
  console.log(`      - Problème dans la lecture des événements`);

  console.log("\n" + "=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  process.exit(1);
});


