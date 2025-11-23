const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x071Bcc062D661536D77a09b38bFfd249B7B8195F";
  const L1READ = process.env.L1READ || "0x46976ef07CA697f1546A7F5fcE6f6C6c1e8fdB6D";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x38fCB5F1e4498b537142ca2563e355127Af68fD2";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 TEST: APRÈS CORRECTION spotBalanceInWei()");
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

  // Avec la correction: spotBalanceInWei() retourne total directement
  const hypeBalWei = BigInt(hypeBalance.total.toString()); // Pas de conversion
  console.log(`\n📊 APRÈS CORRECTION (spotBalanceInWei retourne total directement):`);
  console.log(`  Balance wei: ${hypeBalWei.toString()}`);
  console.log(`  Balance humaine: ${Number(hypeBalWei) / (10 ** Number(hypeInfo.weiDecimals))} HYPE`);

  // Calculer la position USD
  const pxHype1e8 = await views.oraclePxHype1e8(HANDLER);
  const hypePos1e18 = hypeBalWei * BigInt(pxHype1e8.toString()) * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));
  
  console.log(`\n💵 POSITION USD:`);
  console.log(`  ${ethers.formatEther(hypePos1e18)} USD`);

  // Calculer les deltas
  const usdcCoreTokenId = await handler.usdcCoreTokenId();
  const usdcBalance = await l1read.spotBalance(HANDLER, usdcCoreTokenId);
  const usdcInfo = await l1read.tokenInfo(Number(usdcCoreTokenId));
  const usdcBalWei = BigInt(usdcBalance.total.toString()); // Pas de conversion non plus
  const usdc1e18 = usdcBalWei * (10n ** BigInt(18 - Number(usdcInfo.weiDecimals)));
  
  const equity1e18 = usdc1e18 + hypePos1e18 + 0n; // BTC = 0
  const usdcReserveBps = await handler.usdcReserveBps();
  const targetEquity1e18 = (equity1e18 * (10000n - BigInt(usdcReserveBps.toString()))) / 10000n;
  const targetPerAsset = targetEquity1e18 / 2n;
  const dHype1e18 = targetPerAsset - hypePos1e18;
  
  console.log(`\n📊 DELTAS:`);
  console.log(`  Equity: ${ethers.formatEther(equity1e18)} USD`);
  console.log(`  Target per asset: ${ethers.formatEther(targetPerAsset)} USD`);
  console.log(`  Delta HYPE: ${ethers.formatEther(dHype1e18)} USD`);

  // Calculer la taille avec toSzInSzDecimals
  const absUsd = dHype1e18 > 0n ? dHype1e18 : -dHype1e18;
  const numerator = absUsd * (10n ** BigInt(Number(hypeInfo.szDecimals)));
  const denom = BigInt(pxHype1e8.toString()) * 10000000000n;
  const sizeSz = numerator / denom;
  
  console.log(`\n📊 TAILLE CALCULÉE:`);
  console.log(`  sizeSz: ${sizeSz.toString()} (szDecimals)`);
  console.log(`  Taille humaine: ${Number(sizeSz) / (10 ** Number(hypeInfo.szDecimals))} HYPE`);

  // Comparer avec l'ordre observé
  const observedHypeSizeSz = 49195531n;
  console.log(`\n📊 COMPARAISON:`);
  console.log(`  Taille calculée: ${sizeSz.toString()}`);
  console.log(`  Taille observée: ${observedHypeSizeSz.toString()}`);
  console.log(`  Ratio: ${Number(sizeSz) / Number(observedHypeSizeSz)}`);
  
  if (Math.abs(Number(sizeSz) / Number(observedHypeSizeSz) - 1) < 0.1) {
    console.log(`  ✅ TAILLES CORRESPONDENT !`);
  } else if (Math.abs(Number(sizeSz) / Number(observedHypeSizeSz) - 1e6) < 100) {
    console.log(`  ❌ Toujours un facteur 1e6`);
  } else {
    console.log(`  ⚠️  Ratio différent: ${Number(sizeSz) / Number(observedHypeSizeSz)}`);
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


