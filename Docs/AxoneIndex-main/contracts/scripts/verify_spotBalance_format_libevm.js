const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x071Bcc062D661536D77a09b38bFfd249B7B8195F";
  const L1READ = process.env.L1READ || "0x46976ef07CA697f1546A7F5fcE6f6C6c1e8fdB6D";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 VÉRIFICATION FORMAT spotBalance.total (référence lib_EVM)");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);

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

  // Lire les balances brutes
  const btcBalance = await l1read.spotBalance(HANDLER, spotTokenBTC);
  const hypeBalance = await l1read.spotBalance(HANDLER, spotTokenHYPE);
  const usdcBalance = await l1read.spotBalance(HANDLER, usdcCoreTokenId);

  console.log(`\n📊 BALANCES BRUTES (spotBalance.total):`);
  console.log(`  BTC: ${btcBalance.total.toString()}`);
  console.log(`  HYPE: ${hypeBalance.total.toString()}`);
  console.log(`  USDC: ${usdcBalance.total.toString()}`);

  // Test 1: Si spotBalance.total est en szDecimals (selon doc)
  console.log("\n" + "=".repeat(80));
  console.log("TEST 1: spotBalance.total EN szDecimals (selon documentation)");
  console.log("=".repeat(80));

  const btcSz = Number(btcBalance.total.toString()) / (10 ** Number(btcInfo.szDecimals));
  const hypeSz = Number(hypeBalance.total.toString()) / (10 ** Number(hypeInfo.szDecimals));
  const usdcSz = Number(usdcBalance.total.toString()) / (10 ** 0); // USDC szDecimals = 0

  console.log(`\n  Interprétation szDecimals:`);
  console.log(`    BTC: ${btcSz} BTC`);
  console.log(`    HYPE: ${hypeSz} HYPE`);
  console.log(`    USDC: ${usdcSz} USDC`);

  // Conversion avec spotBalanceInWei (notre code actuel)
  const btcWeiFromSz = BigInt(btcBalance.total.toString()) * (10n ** BigInt(Number(btcInfo.weiDecimals) - Number(btcInfo.szDecimals)));
  const hypeWeiFromSz = BigInt(hypeBalance.total.toString()) * (10n ** BigInt(Number(hypeInfo.weiDecimals) - Number(hypeInfo.szDecimals)));
  const usdcWeiFromSz = BigInt(usdcBalance.total.toString()) * (10n ** BigInt(Number(usdcInfo.weiDecimals) - 0));

  console.log(`\n  Après spotBalanceInWei (conversion szDecimals → weiDecimals):`);
  console.log(`    BTC: ${btcWeiFromSz.toString()} = ${Number(btcWeiFromSz) / (10 ** Number(btcInfo.weiDecimals))} BTC`);
  console.log(`    HYPE: ${hypeWeiFromSz.toString()} = ${Number(hypeWeiFromSz) / (10 ** Number(hypeInfo.weiDecimals))} HYPE`);
  console.log(`    USDC: ${usdcWeiFromSz.toString()} = ${Number(usdcWeiFromSz) / (10 ** Number(usdcInfo.weiDecimals))} USDC`);

  // Test 2: Si spotBalance.total est déjà en weiDecimals (hypothèse du bug)
  console.log("\n" + "=".repeat(80));
  console.log("TEST 2: spotBalance.total DÉJÀ EN weiDecimals (HYPOTHÈSE BUG)");
  console.log("=".repeat(80));

  const btcWei = Number(btcBalance.total.toString()) / (10 ** Number(btcInfo.weiDecimals));
  const hypeWei = Number(hypeBalance.total.toString()) / (10 ** Number(hypeInfo.weiDecimals));
  const usdcWei = Number(usdcBalance.total.toString()) / (10 ** Number(usdcInfo.weiDecimals));

  console.log(`\n  Interprétation weiDecimals:`);
  console.log(`    BTC: ${btcWei} BTC`);
  console.log(`    HYPE: ${hypeWei} HYPE`);
  console.log(`    USDC: ${usdcWei} USDC`);

  // Si on applique spotBalanceInWei sur une valeur déjà en weiDecimals (double conversion)
  const btcWeiDouble = BigInt(btcBalance.total.toString()) * (10n ** BigInt(Number(btcInfo.weiDecimals) - Number(btcInfo.szDecimals)));
  const hypeWeiDouble = BigInt(hypeBalance.total.toString()) * (10n ** BigInt(Number(hypeInfo.weiDecimals) - Number(hypeInfo.szDecimals)));

  console.log(`\n  Après spotBalanceInWei (DOUBLE CONVERSION - ERREUR):`);
  console.log(`    BTC: ${btcWeiDouble.toString()} = ${Number(btcWeiDouble) / (10 ** Number(btcInfo.weiDecimals))} BTC`);
  console.log(`    HYPE: ${hypeWeiDouble.toString()} = ${Number(hypeWeiDouble) / (10 ** Number(hypeInfo.weiDecimals))} HYPE`);

  // Comparer avec les valeurs attendues
  console.log("\n" + "=".repeat(80));
  console.log("COMPARAISON AVEC VALEURS ATTENDUES");
  console.log("=".repeat(80));

  // Pour HYPE, on sait qu'on a environ 616,986 HYPE
  const expectedHype = 616986;
  console.log(`\n  HYPE attendu: ~${expectedHype} HYPE`);
  console.log(`  HYPE si szDecimals: ${hypeSz} HYPE (diff: ${Math.abs(hypeSz - expectedHype)})`);
  console.log(`  HYPE si weiDecimals: ${hypeWei} HYPE (diff: ${Math.abs(hypeWei - expectedHype)})`);
  console.log(`  HYPE après double conversion: ${Number(hypeWeiDouble) / (10 ** Number(hypeInfo.weiDecimals))} HYPE`);

  if (Math.abs(hypeSz - expectedHype) < Math.abs(hypeWei - expectedHype)) {
    console.log(`  ✅ spotBalance.total est probablement en szDecimals`);
  } else {
    console.log(`  ⚠️  spotBalance.total est probablement déjà en weiDecimals !`);
    console.log(`  💡 Si c'est le cas, spotBalanceInWei() applique une double conversion`);
    console.log(`  💡 Facteur d'erreur pour HYPE: 10^(8-2) = 10^6 = 1,000,000`);
  }

  // Test 3: Vérifier avec un calcul de position USD
  console.log("\n" + "=".repeat(80));
  console.log("TEST 3: CALCUL POSITION USD");
  console.log("=".repeat(80));

  const pxHype1e8 = 7500000000n; // 75 USD
  const pxBtc1e8 = 2750000000000n; // 27,500 USD

  // Position USD avec interprétation szDecimals
  const hypePos1e18FromSz = hypeWeiFromSz * pxHype1e8 * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));
  console.log(`\n  Position HYPE USD (si szDecimals):`);
  console.log(`    ${ethers.formatEther(hypePos1e18FromSz)} USD`);

  // Position USD avec interprétation weiDecimals (sans conversion)
  const hypeWeiDirect = BigInt(hypeBalance.total.toString());
  const hypePos1e18FromWei = hypeWeiDirect * pxHype1e8 * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));
  console.log(`\n  Position HYPE USD (si weiDecimals, sans conversion):`);
  console.log(`    ${ethers.formatEther(hypePos1e18FromWei)} USD`);

  // Position USD avec double conversion (erreur)
  const hypePos1e18Double = hypeWeiDouble * pxHype1e8 * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));
  console.log(`\n  Position HYPE USD (double conversion - ERREUR):`);
  console.log(`    ${ethers.formatEther(hypePos1e18Double)} USD`);

  // Lire la position réelle depuis le handler
  try {
    const equity1e18 = await handler.callStatic._equitySpotUsd1e18();
    console.log(`\n  Equity totale (depuis handler): ${ethers.formatEther(equity1e18)} USD`);
    
    // Calculer la position HYPE approximative (equity - USDC - BTC)
    const usdcPos1e18 = BigInt(usdcBalance.total.toString()) * (10n ** BigInt(18 - Number(usdcInfo.weiDecimals)));
    const hypePos1e18Real = equity1e18 - usdcPos1e18 - 0n; // BTC = 0
    
    console.log(`  Position HYPE réelle (approximative): ${ethers.formatEther(hypePos1e18Real)} USD`);
    
    // Comparer
    const ratioSz = Number(hypePos1e18FromSz) / Number(hypePos1e18Real);
    const ratioWei = Number(hypePos1e18FromWei) / Number(hypePos1e18Real);
    const ratioDouble = Number(hypePos1e18Double) / Number(hypePos1e18Real);
    
    console.log(`\n  Ratios:`);
    console.log(`    szDecimals: ${ratioSz}`);
    console.log(`    weiDecimals: ${ratioWei}`);
    console.log(`    double conversion: ${ratioDouble}`);
    
    if (Math.abs(ratioSz - 1) < 0.01) {
      console.log(`  ✅ spotBalance.total est en szDecimals`);
    } else if (Math.abs(ratioWei - 1) < 0.01) {
      console.log(`  ⚠️  spotBalance.total est déjà en weiDecimals !`);
      console.log(`  💡 Il faut corriger spotBalanceInWei() pour ne pas convertir`);
    } else if (Math.abs(ratioDouble - 1e6) < 100) {
      console.log(`  ❌ DOUBLE CONVERSION DÉTECTÉE !`);
      console.log(`  💡 spotBalance.total est en weiDecimals mais spotBalanceInWei() convertit quand même`);
    }
  } catch (e) {
    console.log(`  ⚠️  Impossible de lire equity depuis handler: ${e.message}`);
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

