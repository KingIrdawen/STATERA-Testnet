const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x071Bcc062D661536D77a09b38bFfd249B7B8195F";
  const L1READ = process.env.L1READ || "0x46976ef07CA697f1546A7F5fcE6f6C6c1e8fdB6D";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x38fCB5F1e4498b537142ca2563e355127Af68fD2";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 TEST: Views utilise aussi spotBalanceInWei() ?");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);

  const spotTokenHYPE = await handler.spotTokenHYPE();
  const hypeInfo = await l1read.tokenInfo(Number(spotTokenHYPE));
  const hypeBalance = await l1read.spotBalance(HANDLER, spotTokenHYPE);

  // Views utilise CoreHandlerLib.spotBalanceInWei() aussi !
  // Donc si spotBalanceInWei() est incorrect, views sera aussi incorrect
  // Et les deux se correspondent, ce qui explique pourquoi le ratio est 1

  console.log("💡 HYPOTHÈSE:");
  console.log(`  Si spotBalance.total est en weiDecimals:`);
  console.log(`  - spotBalanceInWei() multiplie par 10^6 (double conversion)`);
  console.log(`  - Les positions USD sont 1e6 trop grandes`);
  console.log(`  - Les deltas USD sont 1e6 trop grands`);
  console.log(`  - Les tailles sont 1e6 trop grandes`);
  console.log(`  - Mais views utilise aussi spotBalanceInWei(), donc les deux correspondent`);

  // Test: Calculer manuellement avec les deux hypothèses
  const pxHype1e8 = await views.oraclePxHype1e8(HANDLER);
  
  // Hypothèse: total en weiDecimals (selon lib_EVM)
  const hypeBalWeiDirect = BigInt(hypeBalance.total.toString());
  const hypePos1e18Direct = hypeBalWeiDirect * BigInt(pxHype1e8.toString()) * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));
  
  // Hypothèse: total en szDecimals (notre code actuel)
  const hypeBalWeiConverted = BigInt(hypeBalance.total.toString()) * (10n ** BigInt(Number(hypeInfo.weiDecimals) - Number(hypeInfo.szDecimals)));
  const hypePos1e18Converted = hypeBalWeiConverted * BigInt(pxHype1e8.toString()) * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));
  
  console.log(`\n📊 POSITIONS USD:`);
  console.log(`  Si total en weiDecimals (direct): ${ethers.formatEther(hypePos1e18Direct)} USD`);
  console.log(`  Si total en szDecimals (converti): ${ethers.formatEther(hypePos1e18Converted)} USD`);
  console.log(`  Ratio: ${Number(hypePos1e18Converted) / Number(hypePos1e18Direct)}`);

  // Lire depuis views
  const equity1e18 = await views.equitySpotUsd1e18(HANDLER);
  const usdcBalance = await l1read.spotBalance(HANDLER, await handler.usdcCoreTokenId());
  const usdcInfo = await l1read.tokenInfo(Number(await handler.usdcCoreTokenId()));
  const usdcPos1e18 = BigInt(usdcBalance.total.toString()) * (10n ** BigInt(18 - Number(usdcInfo.weiDecimals)));
  const hypePos1e18FromViews = equity1e18 - usdcPos1e18 - 0n;
  
  console.log(`\n  Depuis views: ${ethers.formatEther(hypePos1e18FromViews)} USD`);
  
  const ratioDirect = Number(hypePos1e18Direct) / Number(hypePos1e18FromViews);
  const ratioConverted = Number(hypePos1e18Converted) / Number(hypePos1e18FromViews);
  
  console.log(`\n🔍 RATIOS:`);
  console.log(`  Direct (weiDecimals): ${ratioDirect}`);
  console.log(`  Converti (szDecimals): ${ratioConverted}`);
  
  // Mais attendez, si on sait qu'on a ~616,986 HYPE
  // Et que spotBalance.total = 61698600
  // Alors:
  // - En szDecimals: 61698600 / 10^2 = 616,986 HYPE ✅
  // - En weiDecimals: 61698600 / 10^8 = 0.616986 HYPE ❌
  
  console.log(`\n💡 MAIS:`);
  console.log(`  Si total = 61698600 est en szDecimals: ${61698600 / (10 ** 2)} HYPE ✅`);
  console.log(`  Si total = 61698600 est en weiDecimals: ${61698600 / (10 ** 8)} HYPE ❌`);
  console.log(`  Valeur attendue: ~616,986 HYPE`);
  
  console.log(`\n  ⚠️  CONTRADICTION !`);
  console.log(`  - Les valeurs suggèrent que total est en szDecimals`);
  console.log(`  - Mais les positions USD suggèrent qu'il est en weiDecimals`);
  console.log(`  - lib_EVM suggère qu'il est en weiDecimals`);

  console.log("\n" + "=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  process.exit(1);
});


