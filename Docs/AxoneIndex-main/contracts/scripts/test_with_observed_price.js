const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x071Bcc062D661536D77a09b38bFfd249B7B8195F";
  const L1READ = process.env.L1READ || "0x46976ef07CA697f1546A7F5fcE6f6C6c1e8fdB6D";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x38fCB5F1e4498b537142ca2563e355127Af68fD2";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 TEST: AVEC PRIX LIMITE OBSERVÉ (47.50 USD)");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);

  const spotTokenHYPE = await handler.spotTokenHYPE();
  const hypeInfo = await l1read.tokenInfo(Number(spotTokenHYPE));

  // Ordre observé
  const observedHypeSizeSz = 49195531n;
  const observedHypePrice1e8 = 4750095000n; // 47.50 USD
  const observedHypeNotional1e18 = (observedHypeSizeSz * observedHypePrice1e8 * 10000000000n) / (10n ** BigInt(Number(hypeInfo.szDecimals)));

  console.log("📊 ORDRE OBSERVÉ:");
  console.log(`  Taille: ${observedHypeSizeSz.toString()} (szDecimals) = ${Number(observedHypeSizeSz) / (10 ** Number(hypeInfo.szDecimals))} HYPE`);
  console.log(`  Prix: ${ethers.formatUnits(observedHypePrice1e8, 8)} USD`);
  console.log(`  Notional: ${ethers.formatEther(observedHypeNotional1e18)} USD`);

  // Calculer le delta USD qui aurait produit cette taille avec ce prix
  // Formule inverse: deltaUsd1e18 = sizeSz * price1e8 * 1e10 / 10^szDecimals
  const deltaUsd1e18FromObserved = observedHypeNotional1e18;
  
  console.log(`\n📊 DELTA USD QUI AURAIT PRODUIT CETTE TAILLE:`);
  console.log(`  ${ethers.formatEther(deltaUsd1e18FromObserved)} USD`);

  // Maintenant, calculer quelle taille on obtiendrait avec toSzInSzDecimals
  const sizeSzCalculated = (deltaUsd1e18FromObserved * (10n ** BigInt(Number(hypeInfo.szDecimals)))) / (observedHypePrice1e8 * 10000000000n);
  
  console.log(`\n📊 TAILLE CALCULÉE AVEC toSzInSzDecimals:`);
  console.log(`  ${sizeSzCalculated.toString()} (szDecimals) = ${Number(sizeSzCalculated) / (10 ** Number(hypeInfo.szDecimals))} HYPE`);
  console.log(`  Ratio avec observé: ${Number(sizeSzCalculated) / Number(observedHypeSizeSz)}`);

  // Maintenant, si on divise le delta USD par 1e6
  const deltaUsd1e18Divided = deltaUsd1e18FromObserved / 1000000n;
  const sizeSzDivided = (deltaUsd1e18Divided * (10n ** BigInt(Number(hypeInfo.szDecimals)))) / (observedHypePrice1e8 * 10000000000n);
  
  console.log(`\n📊 SI ON DIVISE LE DELTA USD PAR 1e6:`);
  console.log(`  Delta USD: ${ethers.formatEther(deltaUsd1e18Divided)} USD`);
  console.log(`  Taille: ${sizeSzDivided.toString()} (szDecimals) = ${Number(sizeSzDivided) / (10 ** Number(hypeInfo.szDecimals))} HYPE`);
  console.log(`  Ratio avec observé: ${Number(sizeSzDivided) / Number(observedHypeSizeSz)}`);

  // Vérifier si le problème vient des positions USD
  console.log(`\n📊 VÉRIFICATION: PROBLÈME DANS LES POSITIONS USD ?`);
  
  // Si les positions USD sont 1e6 trop grandes, alors les deltas seront aussi 1e6 trop grands
  // Position HYPE actuelle (avec notre code)
  const hypeBalance = await l1read.spotBalance(HANDLER, spotTokenHYPE);
  const pxHype1e8Oracle = await views.oraclePxHype1e8(HANDLER);
  const hypeBalWei = BigInt(hypeBalance.total.toString()) * (10n ** BigInt(Number(hypeInfo.weiDecimals) - Number(hypeInfo.szDecimals)));
  const hypePos1e18 = hypeBalWei * BigInt(pxHype1e8Oracle.toString()) * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));
  
  // Position HYPE si on ne convertit pas (total déjà en weiDecimals)
  const hypeBalWeiDirect = BigInt(hypeBalance.total.toString());
  const hypePos1e18Direct = hypeBalWeiDirect * BigInt(pxHype1e8Oracle.toString()) * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));
  
  console.log(`  Position USD (avec conversion): ${ethers.formatEther(hypePos1e18)} USD`);
  console.log(`  Position USD (sans conversion): ${ethers.formatEther(hypePos1e18Direct)} USD`);
  console.log(`  Ratio: ${Number(hypePos1e18) / Number(hypePos1e18Direct)}`);
  
  if (Math.abs(Number(hypePos1e18) / Number(hypePos1e18Direct) - 1e6) < 100) {
    console.log(`  ⚠️  POSITIONS USD SONT 1e6 TROP GRANDES !`);
    console.log(`  💡 spotBalance.total est probablement déjà en weiDecimals`);
    console.log(`  💡 Il faut corriger spotBalanceInWei() pour ne pas convertir`);
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


