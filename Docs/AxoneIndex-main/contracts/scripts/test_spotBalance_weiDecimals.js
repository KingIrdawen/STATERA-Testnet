const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x071Bcc062D661536D77a09b38bFfd249B7B8195F";
  const L1READ = process.env.L1READ || "0x46976ef07CA697f1546A7F5fcE6f6C6c1e8fdB6D";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x38fCB5F1e4498b537142ca2563e355127Af68fD2";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 TEST: spotBalance.total EST EN weiDecimals (selon lib_EVM)");
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
  console.log(`  spotBalance.total: ${hypeBalance.total.toString()}`);

  // Si spotBalance.total est en weiDecimals
  const hypeWei = Number(hypeBalance.total.toString()) / (10 ** Number(hypeInfo.weiDecimals));
  console.log(`\n📊 Si total est en weiDecimals:`);
  console.log(`  Balance: ${hypeWei} HYPE`);

  // Si on applique spotBalanceInWei (notre code actuel - ERREUR)
  const hypeWeiDouble = BigInt(hypeBalance.total.toString()) * (10n ** BigInt(Number(hypeInfo.weiDecimals) - Number(hypeInfo.szDecimals)));
  const hypeWeiDoubleHuman = Number(hypeWeiDouble) / (10 ** Number(hypeInfo.weiDecimals));
  console.log(`\n❌ Après spotBalanceInWei (DOUBLE CONVERSION):`);
  console.log(`  Balance: ${hypeWeiDoubleHuman} HYPE`);
  console.log(`  Facteur d'erreur: ${hypeWeiDoubleHuman / hypeWei} (devrait être 1)`);
  console.log(`  Facteur attendu: 10^(${hypeInfo.weiDecimals}-${hypeInfo.szDecimals}) = 10^${Number(hypeInfo.weiDecimals) - Number(hypeInfo.szDecimals)} = ${10 ** (Number(hypeInfo.weiDecimals) - Number(hypeInfo.szDecimals))}`);

  // Calculer la position USD avec les deux méthodes
  const pxHype1e8 = await views.oraclePxHype1e8(HANDLER);
  
  // Méthode correcte (si total est en weiDecimals, utiliser directement)
  const hypePos1e18Correct = BigInt(hypeBalance.total.toString()) * BigInt(pxHype1e8.toString()) * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));
  console.log(`\n💵 Position USD (CORRECTE - total en weiDecimals):`);
  console.log(`  ${ethers.formatEther(hypePos1e18Correct)} USD`);

  // Méthode actuelle (double conversion)
  const hypePos1e18Wrong = hypeWeiDouble * BigInt(pxHype1e8.toString()) * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));
  console.log(`\n💵 Position USD (ACTUELLE - double conversion):`);
  console.log(`  ${ethers.formatEther(hypePos1e18Wrong)} USD`);
  console.log(`  Ratio: ${Number(hypePos1e18Wrong) / Number(hypePos1e18Correct)}`);

  // Lire la position réelle depuis views
  try {
    const equity1e18 = await views.equitySpotUsd1e18(HANDLER);
    const usdcBalance = await l1read.spotBalance(HANDLER, await handler.usdcCoreTokenId());
    const usdcInfo = await l1read.tokenInfo(Number(await handler.usdcCoreTokenId()));
    const usdcPos1e18 = BigInt(usdcBalance.total.toString()) * (10n ** BigInt(18 - Number(usdcInfo.weiDecimals)));
    const hypePos1e18Real = equity1e18 - usdcPos1e18 - 0n; // BTC = 0
    
    console.log(`\n💵 Position USD RÉELLE (depuis views):`);
    console.log(`  ${ethers.formatEther(hypePos1e18Real)} USD`);
    
    const ratioCorrect = Number(hypePos1e18Correct) / Number(hypePos1e18Real);
    const ratioWrong = Number(hypePos1e18Wrong) / Number(hypePos1e18Real);
    
    console.log(`\n🔍 COMPARAISON:`);
    console.log(`  Ratio (correct): ${ratioCorrect}`);
    console.log(`  Ratio (actuel/double conversion): ${ratioWrong}`);
    
    if (Math.abs(ratioCorrect - 1) < 0.01) {
      console.log(`  ✅ CONFIRMÉ: spotBalance.total est en weiDecimals`);
      console.log(`  ❌ Notre code applique une double conversion`);
      console.log(`  💡 Solution: Ne pas convertir dans spotBalanceInWei() si total est déjà en weiDecimals`);
    } else if (Math.abs(ratioWrong - 1) < 0.01) {
      console.log(`  ⚠️  Notre code actuel est correct (total en szDecimals)`);
    } else if (Math.abs(ratioWrong - 1e6) < 100) {
      console.log(`  ❌ DOUBLE CONVERSION CONFIRMÉE !`);
      console.log(`  💡 Facteur: ${ratioWrong}`);
    }
  } catch (e) {
    console.log(`  ⚠️  Erreur: ${e.message}`);
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


