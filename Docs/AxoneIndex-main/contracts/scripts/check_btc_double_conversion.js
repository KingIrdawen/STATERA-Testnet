const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x071Bcc062D661536D77a09b38bFfd249B7B8195F";
  const L1READ = process.env.L1READ || "0x46976ef07CA697f1546A7F5fcE6f6C6c1e8fdB6D";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x38fCB5F1e4498b537142ca2563e355127Af68fD2";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 VÉRIFICATION: Double conversion avec BTC");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);

  const spotTokenBTC = await handler.spotTokenBTC();
  const btcInfo = await l1read.tokenInfo(Number(spotTokenBTC));
  const btcBalance = await l1read.spotBalance(HANDLER, spotTokenBTC);

  console.log("📦 BTC:");
  console.log(`  spotBalance.total: ${btcBalance.total.toString()}`);
  console.log(`  szDecimals: ${btcInfo.szDecimals}, weiDecimals: ${btcInfo.weiDecimals}`);
  console.log(`  Différence: ${Number(btcInfo.weiDecimals) - Number(btcInfo.szDecimals)}`);

  // Calculer le facteur de conversion
  const diff = Number(btcInfo.weiDecimals) - Number(btcInfo.szDecimals);
  const conversionFactor = 10 ** diff;
  
  console.log(`\n📊 FACTEUR DE CONVERSION:`);
  console.log(`  Facteur: 10^${diff} = ${conversionFactor}`);

  // Avec l'ancien code (double conversion)
  const btcBalWeiOld = BigInt(btcBalance.total.toString()) * BigInt(conversionFactor);
  const btcHumanOld = Number(btcBalWeiOld) / (10 ** Number(btcInfo.weiDecimals));
  
  console.log(`\n❌ AVEC ANCIEN CODE (double conversion):`);
  console.log(`  Balance wei: ${btcBalWeiOld.toString()}`);
  console.log(`  Balance humaine: ${btcHumanOld} BTC`);

  // Avec le nouveau code (pas de conversion)
  const btcBalWeiNew = BigInt(btcBalance.total.toString());
  const btcHumanNew = Number(btcBalWeiNew) / (10 ** Number(btcInfo.weiDecimals));
  
  console.log(`\n✅ AVEC NOUVEAU CODE (pas de conversion):`);
  console.log(`  Balance wei: ${btcBalWeiNew.toString()}`);
  console.log(`  Balance humaine: ${btcHumanNew} BTC`);

  // Calculer les positions USD avec les deux méthodes
  const pxBtc1e8 = await views.oraclePxBtc1e8(HANDLER);
  
  const btcPos1e18Old = btcBalWeiOld * BigInt(pxBtc1e8.toString()) * (10n ** BigInt(18 - Number(btcInfo.weiDecimals) - 8));
  const btcPos1e18New = btcBalWeiNew * BigInt(pxBtc1e8.toString()) * (10n ** BigInt(18 - Number(btcInfo.weiDecimals) - 8));
  
  console.log(`\n💵 POSITIONS USD:`);
  console.log(`  Ancien code (double conversion): ${ethers.formatEther(btcPos1e18Old)} USD`);
  console.log(`  Nouveau code (correct): ${ethers.formatEther(btcPos1e18New)} USD`);
  console.log(`  Ratio: ${Number(btcPos1e18Old) / Number(btcPos1e18New)}`);
  
  if (diff > 0) {
    console.log(`\n⚠️  BTC AUSSI AFFECTÉ PAR LA DOUBLE CONVERSION !`);
    console.log(`  Facteur d'erreur: ${conversionFactor}`);
    console.log(`  Les positions BTC USD seraient ${conversionFactor}x trop grandes avec l'ancien code`);
  } else {
    console.log(`\n✅ BTC N'EST PAS AFFECTÉ (pas de différence entre szDecimals et weiDecimals)`);
  }

  // Comparer avec HYPE pour référence
  const spotTokenHYPE = await handler.spotTokenHYPE();
  const hypeInfo = await l1read.tokenInfo(Number(spotTokenHYPE));
  const hypeDiff = Number(hypeInfo.weiDecimals) - Number(hypeInfo.szDecimals);
  
  console.log(`\n📊 COMPARAISON:`);
  console.log(`  HYPE: szDecimals=${hypeInfo.szDecimals}, weiDecimals=${hypeInfo.weiDecimals}, diff=${hypeDiff}, facteur=${10 ** hypeDiff}`);
  console.log(`  BTC: szDecimals=${btcInfo.szDecimals}, weiDecimals=${btcInfo.weiDecimals}, diff=${diff}, facteur=${conversionFactor}`);

  console.log("\n" + "=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  process.exit(1);
});


