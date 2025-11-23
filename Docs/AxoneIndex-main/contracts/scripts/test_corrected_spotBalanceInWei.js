const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x071Bcc062D661536D77a09b38bFfd249B7B8195F";
  const L1READ = process.env.L1READ || "0x46976ef07CA697f1546A7F5fcE6f6C6c1e8fdB6D";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x38fCB5F1e4498b537142ca2563e355127Af68fD2";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 TEST: CORRECTION spotBalanceInWei()");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);

  const spotTokenHYPE = await handler.spotTokenHYPE();
  const hypeInfo = await l1read.tokenInfo(Number(spotTokenHYPE));
  const hypeBalance = await l1read.spotBalance(HANDLER, spotTokenHYPE);

  console.log("📦 HYPE:");
  console.log(`  spotBalance.total: ${hypeBalance.total.toString()}`);
  console.log(`  szDecimals: ${hypeInfo.szDecimals}, weiDecimals: ${hypeInfo.weiDecimals}`);

  // Test avec code actuel (convertit szDecimals → weiDecimals)
  const total = BigInt(hypeBalance.total.toString());
  const diff = Number(hypeInfo.weiDecimals) - Number(hypeInfo.szDecimals);
  const hypeBalWeiCurrent = total * (10n ** BigInt(diff));
  
  console.log(`\n📊 CODE ACTUEL (convertit szDecimals → weiDecimals):`);
  console.log(`  Balance wei: ${hypeBalWeiCurrent.toString()}`);
  console.log(`  Balance humaine: ${Number(hypeBalWeiCurrent) / (10 ** Number(hypeInfo.weiDecimals))} HYPE`);

  // Test avec code corrigé (retourne total directement si déjà en weiDecimals)
  const hypeBalWeiCorrected = total; // Ne pas convertir
  
  console.log(`\n📊 CODE CORRIGÉ (retourne total directement):`);
  console.log(`  Balance wei: ${hypeBalWeiCorrected.toString()}`);
  console.log(`  Balance humaine: ${Number(hypeBalWeiCorrected) / (10 ** Number(hypeInfo.weiDecimals))} HYPE`);

  // Calculer les positions USD avec les deux méthodes
  const pxHype1e8 = await views.oraclePxHype1e8(HANDLER);
  
  const hypePos1e18Current = hypeBalWeiCurrent * BigInt(pxHype1e8.toString()) * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));
  const hypePos1e18Corrected = hypeBalWeiCorrected * BigInt(pxHype1e8.toString()) * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));
  
  console.log(`\n💵 POSITIONS USD:`);
  console.log(`  Code actuel: ${ethers.formatEther(hypePos1e18Current)} USD`);
  console.log(`  Code corrigé: ${ethers.formatEther(hypePos1e18Corrected)} USD`);
  console.log(`  Ratio: ${Number(hypePos1e18Current) / Number(hypePos1e18Corrected)}`);

  // Lire la position réelle
  const equity1e18 = await views.equitySpotUsd1e18(HANDLER);
  const usdcBalance = await l1read.spotBalance(HANDLER, await handler.usdcCoreTokenId());
  const usdcInfo = await l1read.tokenInfo(Number(await handler.usdcCoreTokenId()));
  const usdcPos1e18 = BigInt(usdcBalance.total.toString()) * (10n ** BigInt(18 - Number(usdcInfo.weiDecimals)));
  const hypePos1e18Real = equity1e18 - usdcPos1e18 - 0n;
  
  console.log(`\n💵 POSITION RÉELLE (depuis views):`);
  console.log(`  ${ethers.formatEther(hypePos1e18Real)} USD`);
  
  const ratioCurrent = Number(hypePos1e18Current) / Number(hypePos1e18Real);
  const ratioCorrected = Number(hypePos1e18Corrected) / Number(hypePos1e18Real);
  
  console.log(`\n🔍 RATIOS:`);
  console.log(`  Code actuel: ${ratioCurrent}`);
  console.log(`  Code corrigé: ${ratioCorrected}`);
  
  if (Math.abs(ratioCurrent - 1e6) < 100) {
    console.log(`  ❌ CODE ACTUEL: Facteur 1e6 détecté (double conversion)`);
  }
  if (Math.abs(ratioCorrected - 1) < 0.01) {
    console.log(`  ✅ CODE CORRIGÉ: Position correcte`);
    console.log(`  💡 Solution: spotBalance.total est déjà en weiDecimals`);
    console.log(`  💡 Il faut modifier spotBalanceInWei() pour retourner total directement`);
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


