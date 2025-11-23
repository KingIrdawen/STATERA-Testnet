const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x071Bcc062D661536D77a09b38bFfd249B7B8195F";
  const L1READ = process.env.L1READ || "0x46976ef07CA697f1546A7F5fcE6f6C6c1e8fdB6D";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x38fCB5F1e4498b537142ca2563e355127Af68fD2";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 ANALYSE: FORMULE CALCUL POSITION USD");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);

  const spotTokenHYPE = await handler.spotTokenHYPE();
  const hypeInfo = await l1read.tokenInfo(Number(spotTokenHYPE));
  const hypeBalance = await l1read.spotBalance(HANDLER, spotTokenHYPE);
  const pxHype1e8 = await views.oraclePxHype1e8(HANDLER);

  console.log("📦 HYPE:");
  console.log(`  spotBalance.total: ${hypeBalance.total.toString()}`);
  console.log(`  szDecimals: ${hypeInfo.szDecimals}, weiDecimals: ${hypeInfo.weiDecimals}`);
  console.log(`  Prix oracle: ${ethers.formatUnits(pxHype1e8, 8)} USD`);

  // Valeur attendue: ~616,986 HYPE × 75 USD = ~46,273,950 USD

  // Formule actuelle dans _usdPositions():
  // posH1e18 = hypeBalWei * pxH1e8 * 10^(18 - weiDecimals - 8)
  // Pour HYPE: weiDecimals=8, donc 10^(18-8-8) = 10^2 = 100

  console.log(`\n📊 FORMULE ACTUELLE:`);
  console.log(`  posH1e18 = hypeBalWei * pxH1e8 * 10^(18 - weiDecimals - 8)`);
  console.log(`  Pour HYPE: 10^(18-8-8) = 10^2 = 100`);

  // Avec conversion (code actuel)
  const hypeBalWeiConverted = BigInt(hypeBalance.total.toString()) * (10n ** BigInt(Number(hypeInfo.weiDecimals) - Number(hypeInfo.szDecimals)));
  const hypePos1e18Converted = hypeBalWeiConverted * BigInt(pxHype1e8.toString()) * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));
  
  console.log(`\n  Avec conversion (szDecimals → weiDecimals):`);
  console.log(`    hypeBalWei: ${hypeBalWeiConverted.toString()}`);
  console.log(`    Position USD: ${ethers.formatEther(hypePos1e18Converted)} USD`);

  // Sans conversion (hypothèse)
  const hypeBalWeiDirect = BigInt(hypeBalance.total.toString());
  const hypePos1e18Direct = hypeBalWeiDirect * BigInt(pxHype1e8.toString()) * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));
  
  console.log(`\n  Sans conversion (total déjà en weiDecimals):`);
  console.log(`    hypeBalWei: ${hypeBalWeiDirect.toString()}`);
  console.log(`    Position USD: ${ethers.formatEther(hypePos1e18Direct)} USD`);

  // Vérification manuelle
  const expectedHype = 616986;
  const expectedUsd = expectedHype * 75;
  
  console.log(`\n📊 VÉRIFICATION MANUELLE:`);
  console.log(`  Valeur attendue: ${expectedHype} HYPE × 75 USD = ${expectedUsd} USD`);
  console.log(`  Avec conversion: ${ethers.formatEther(hypePos1e18Converted)} USD`);
  console.log(`  Sans conversion: ${ethers.formatEther(hypePos1e18Direct)} USD`);
  
  const ratioConverted = Number(hypePos1e18Converted) / expectedUsd;
  const ratioDirect = Number(hypePos1e18Direct) / expectedUsd;
  
  console.log(`\n  Ratios:`);
  console.log(`    Avec conversion: ${ratioConverted}`);
  console.log(`    Sans conversion: ${ratioDirect}`);
  
  if (Math.abs(ratioConverted - 1) < 0.01) {
    console.log(`  ✅ Formule avec conversion est correcte`);
  } else if (Math.abs(ratioDirect - 1) < 0.01) {
    console.log(`  ✅ Formule sans conversion est correcte`);
  } else if (Math.abs(ratioConverted - 1e6) < 100) {
    console.log(`  ❌ Formule avec conversion a un facteur 1e6`);
  }

  // Peut-être que le problème est dans le facteur 10^(18 - weiDecimals - 8) ?
  // Pour HYPE: 10^(18-8-8) = 10^2 = 100
  // Mais peut-être qu'il devrait être 10^(18-8) = 10^10 ?

  console.log(`\n💡 HYPOTHÈSE ALTERNATIVE:`);
  console.log(`  Peut-être que le facteur devrait être 10^(18-weiDecimals) au lieu de 10^(18-weiDecimals-8) ?`);
  const hypePos1e18Alt = hypeBalWeiConverted * BigInt(pxHype1e8.toString()) * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals)));
  console.log(`  Avec facteur 10^(18-weiDecimals): ${ethers.formatEther(hypePos1e18Alt)} USD`);
  console.log(`  Ratio: ${Number(hypePos1e18Alt) / expectedUsd}`);

  console.log("\n" + "=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  process.exit(1);
});


