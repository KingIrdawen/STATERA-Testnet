const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x071Bcc062D661536D77a09b38bFfd249B7B8195F";
  const L1READ = process.env.L1READ || "0x46976ef07CA697f1546A7F5fcE6f6C6c1e8fdB6D";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x38fCB5F1e4498b537142ca2563e355127Af68fD2";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 ANALYSE FINALE: OÙ EST LE FACTEUR 1e6 ?");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);

  // Ordre observé
  const observedHypeSizeSz = 49195531n;
  const observedHypePrice1e8 = 4750095000n; // 47.50 USD
  const observedHypeNotional1e18 = (observedHypeSizeSz * observedHypePrice1e8 * 10000000000n) / (10n ** 2n);

  console.log("📊 ORDRE OBSERVÉ:");
  console.log(`  Taille: ${observedHypeSizeSz.toString()} (szDecimals) = ${Number(observedHypeSizeSz) / 100} HYPE`);
  console.log(`  Prix: ${ethers.formatUnits(observedHypePrice1e8, 8)} USD`);
  console.log(`  Notional: ${ethers.formatEther(observedHypeNotional1e18)} USD`);

  // Si on divise le notional par 1e6
  const observedHypeNotional1e18Divided = observedHypeNotional1e18 / 1000000n;
  console.log(`\n  Notional / 1e6: ${ethers.formatEther(observedHypeNotional1e18Divided)} USD`);

  // Calculer quelle taille on obtiendrait avec ce notional divisé
  const spotTokenHYPE = await handler.spotTokenHYPE();
  const hypeInfo = await l1read.tokenInfo(Number(spotTokenHYPE));
  const sizeSzDivided = (observedHypeNotional1e18Divided * (10n ** BigInt(Number(hypeInfo.szDecimals)))) / (observedHypePrice1e8 * 10000000000n);
  
  console.log(`  Taille avec notional / 1e6: ${sizeSzDivided.toString()} (szDecimals) = ${Number(sizeSzDivided) / 100} HYPE`);
  console.log(`  Cela semble-t-il raisonnable ?`);

  // Maintenant, vérifier les positions USD
  const hypeBalance = await l1read.spotBalance(HANDLER, spotTokenHYPE);
  const pxHype1e8 = await views.oraclePxHype1e8(HANDLER);
  
  // Position avec code actuel
  const hypeBalWei = BigInt(hypeBalance.total.toString()) * (10n ** BigInt(Number(hypeInfo.weiDecimals) - Number(hypeInfo.szDecimals)));
  const hypePos1e18 = hypeBalWei * BigInt(pxHype1e8.toString()) * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));
  
  console.log(`\n📊 POSITION HYPE USD (code actuel):`);
  console.log(`  ${ethers.formatEther(hypePos1e18)} USD`);
  
  // Si on divise par 1e6
  const hypePos1e18Divided = hypePos1e18 / 1000000n;
  console.log(`  Position / 1e6: ${ethers.formatEther(hypePos1e18Divided)} USD`);
  
  // Calculer les deltas avec position divisée
  const usdcCoreTokenId = await handler.usdcCoreTokenId();
  const usdcBalance = await l1read.spotBalance(HANDLER, usdcCoreTokenId);
  const usdcInfo = await l1read.tokenInfo(Number(usdcCoreTokenId));
  const usdcBalWei = BigInt(usdcBalance.total.toString()) * (10n ** BigInt(Number(usdcInfo.weiDecimals) - 0));
  const usdc1e18 = usdcBalWei * (10n ** BigInt(18 - Number(usdcInfo.weiDecimals)));
  
  const equity1e18Divided = usdc1e18 + hypePos1e18Divided + 0n;
  const usdcReserveBps = await handler.usdcReserveBps();
  const targetEquity1e18Divided = (equity1e18Divided * (10000n - BigInt(usdcReserveBps.toString()))) / 10000n;
  const targetPerAssetDivided = targetEquity1e18Divided / 2n;
  const dHype1e18Divided = targetPerAssetDivided - hypePos1e18Divided;
  
  console.log(`\n📊 DELTAS AVEC POSITION / 1e6:`);
  console.log(`  Delta HYPE: ${ethers.formatEther(dHype1e18Divided)} USD`);
  
  // Calculer la taille avec ce delta
  const sizeSzFromDivided = (dHype1e18Divided > 0n ? dHype1e18Divided : -dHype1e18Divided) * (10n ** BigInt(Number(hypeInfo.szDecimals))) / (observedHypePrice1e8 * 10000000000n);
  console.log(`  Taille calculée: ${sizeSzFromDivided.toString()} (szDecimals) = ${Number(sizeSzFromDivided) / 100} HYPE`);
  console.log(`  Taille observée: ${observedHypeSizeSz.toString()} (szDecimals) = ${Number(observedHypeSizeSz) / 100} HYPE`);
  console.log(`  Ratio: ${Number(sizeSzFromDivided) / Number(observedHypeSizeSz)}`);

  console.log("\n" + "=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  process.exit(1);
});


