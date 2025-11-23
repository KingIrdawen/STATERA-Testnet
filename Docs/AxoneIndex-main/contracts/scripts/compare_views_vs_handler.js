const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x071Bcc062D661536D77a09b38bFfd249B7B8195F";
  const L1READ = process.env.L1READ || "0x46976ef07CA697f1546A7F5fcE6f6C6c1e8fdB6D";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x38fCB5F1e4498b537142ca2563e355127Af68fD2";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 COMPARAISON: Views vs Handler (comment ils calculent)");
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

  // Comment CoreInteractionViews calcule (ligne 93-102)
  // _assetUsd1e18 utilise CoreHandlerLib.spotBalanceInWei() puis:
  // balWei * px1e8 * 10^(18 - weiDecimals - 8)
  
  // Comment CoreHandlerLogicLib calcule (ligne 156-177)
  // _usdPositions utilise CoreHandlerLib.spotBalanceInWei() puis:
  // hypeBalWei * pxH1e8 * 10^(18 - hypeInfo.weiDecimals - 8)

  // Les deux utilisent spotBalanceInWei() !
  // Donc si spotBalanceInWei() est incorrect, les deux seront incorrects de la même manière

  // Test: Calculer manuellement avec les deux hypothèses
  const pxHype1e8 = await views.oraclePxHype1e8(HANDLER);
  
  console.log(`\n📊 CALCUL MANUEL:`);
  
  // Hypothèse 1: total en szDecimals → converti en weiDecimals
  const hypeWeiFromSz = BigInt(hypeBalance.total.toString()) * (10n ** BigInt(Number(hypeInfo.weiDecimals) - Number(hypeInfo.szDecimals)));
  const hypePos1e18FromSz = hypeWeiFromSz * BigInt(pxHype1e8.toString()) * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));
  console.log(`\n  Hypothèse 1 (total en szDecimals):`);
  console.log(`    Balance wei: ${hypeWeiFromSz.toString()}`);
  console.log(`    Position USD: ${ethers.formatEther(hypePos1e18FromSz)} USD`);

  // Hypothèse 2: total déjà en weiDecimals
  const hypeWeiDirect = BigInt(hypeBalance.total.toString());
  const hypePos1e18FromWei = hypeWeiDirect * BigInt(pxHype1e8.toString()) * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));
  console.log(`\n  Hypothèse 2 (total en weiDecimals):`);
  console.log(`    Balance wei: ${hypeWeiDirect.toString()}`);
  console.log(`    Position USD: ${ethers.formatEther(hypePos1e18FromWei)} USD`);

  // Lire depuis views
  const equity1e18 = await views.equitySpotUsd1e18(HANDLER);
  const usdcBalance = await l1read.spotBalance(HANDLER, await handler.usdcCoreTokenId());
  const usdcInfo = await l1read.tokenInfo(Number(await handler.usdcCoreTokenId()));
  const usdcPos1e18 = BigInt(usdcBalance.total.toString()) * (10n ** BigInt(18 - Number(usdcInfo.weiDecimals)));
  const hypePos1e18FromViews = equity1e18 - usdcPos1e18 - 0n;
  
  console.log(`\n  Position USD depuis views: ${ethers.formatEther(hypePos1e18FromViews)} USD`);
  
  const ratio1 = Number(hypePos1e18FromSz) / Number(hypePos1e18FromViews);
  const ratio2 = Number(hypePos1e18FromWei) / Number(hypePos1e18FromViews);
  
  console.log(`\n🔍 RATIOS:`);
  console.log(`  Hypothèse 1 (szDecimals): ${ratio1}`);
  console.log(`  Hypothèse 2 (weiDecimals): ${ratio2}`);
  
  if (Math.abs(ratio1 - 1) < 0.01) {
    console.log(`  ✅ spotBalance.total est en szDecimals`);
    console.log(`  ⚠️  Mais alors pourquoi les tailles sont 1e6 trop grandes ?`);
  } else if (Math.abs(ratio2 - 1) < 0.01) {
    console.log(`  ✅ spotBalance.total est en weiDecimals`);
    console.log(`  ❌ spotBalanceInWei() applique une double conversion`);
    console.log(`  💡 Il faut corriger spotBalanceInWei() pour retourner total directement`);
  } else {
    console.log(`  ⚠️  Aucune hypothèse ne correspond exactement`);
    console.log(`  💡 Il y a peut-être un autre problème`);
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


