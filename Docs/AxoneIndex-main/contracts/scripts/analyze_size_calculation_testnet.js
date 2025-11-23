const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x96f2b90dDe33348F347bd95CbF3A0830c30506C0";
  const L1READ = process.env.L1READ || "0x4F730c91A1a4C3cC4733a96eF6Ea52901164c761";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 ANALYSE DU CALCUL DE TAILLE");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);

  const spotTokenHYPE = await handler.spotTokenHYPE();
  const hypeInfo = await l1read.tokenInfo(Number(spotTokenHYPE));
  const hypeBal = await l1read.spotBalance(HANDLER, spotTokenHYPE);

  console.log("📊 Données HYPE:");
  console.log(`   Balance totale: ${hypeBal.total.toString()}`);
  console.log(`   szDecimals: ${hypeInfo.szDecimals.toString()}`);
  console.log(`   weiDecimals: ${hypeInfo.weiDecimals.toString()}`);

  // D'après CoreExecution.sol, action.sz est en format 1e8
  // Et on le convertit avec scale(action.sz, 8, baseToken.weiDecimals)
  // Donc action.sz en 1e8 = taille humaine * 1e8
  
  // Si on veut vendre 0.53735606 HYPE:
  const hypeToSell = 0.53735606;
  console.log(`\n💡 Si on veut vendre ${hypeToSell} HYPE:`);
  
  // En format 1e8 (pour l'ordre):
  const size1e8 = Math.floor(hypeToSell * 1e8);
  console.log(`   En format 1e8: ${size1e8}`);
  
  // En szDecimals (szDecimals=2):
  const sizeSz = Math.floor(hypeToSell * (10 ** Number(hypeInfo.szDecimals)));
  console.log(`   En szDecimals (szDecimals=${hypeInfo.szDecimals}): ${sizeSz}`);
  
  // En weiDecimals (weiDecimals=8):
  const sizeWei = Math.floor(hypeToSell * (10 ** Number(hypeInfo.weiDecimals)));
  console.log(`   En weiDecimals (weiDecimals=${hypeInfo.weiDecimals}): ${sizeWei}`);

  // Le problème: toSzInSzDecimals calcule en szDecimals
  // Mais peut-être que la balance est en weiDecimals ?
  
  // Si la balance est 56715000 en weiDecimals:
  const balanceWei = Number(hypeBal.total);
  const balanceInHype = balanceWei / (10 ** Number(hypeInfo.weiDecimals));
  console.log(`\n📊 Si la balance est en weiDecimals:`);
  console.log(`   Balance: ${balanceWei} (weiDecimals)`);
  console.log(`   En HYPE: ${balanceInHype.toFixed(8)} HYPE`);
  
  // Si la balance est 56715000 en szDecimals:
  const balanceSz2 = Number(hypeBal.total);
  const balanceInHypeSz = balanceSz2 / (10 ** Number(hypeInfo.szDecimals));
  console.log(`\n📊 Si la balance est en szDecimals:`);
  console.log(`   Balance: ${balanceSz2} (szDecimals)`);
  console.log(`   En HYPE: ${balanceInHypeSz.toFixed(2)} HYPE`);

  // Calculer ce que toSzInSzDecimals devrait retourner
  // Delta USD: -25524.923565 USD en 1e18
  const deltaUsd1e18 = BigInt("-2552492356500000000000000");
  const absUsd = -deltaUsd1e18;
  const price1e8 = BigInt("4750095000"); // Prix de vente (bid)
  
  // Formule actuelle:
  const numerator = absUsd * (10n ** BigInt(hypeInfo.szDecimals));
  const denom = price1e8 * BigInt(1e10);
  const szCalculated = numerator / denom;
  
  console.log(`\n🧮 Calcul actuel de toSzInSzDecimals:`);
  console.log(`   Delta USD: ${ethers.formatUnits(absUsd, 18)} USD`);
  console.log(`   Prix: ${ethers.formatUnits(price1e8, 8)} USD`);
  console.log(`   Numerator: ${absUsd.toString()} * 10^${hypeInfo.szDecimals} = ${numerator.toString()}`);
  console.log(`   Denominateur: ${price1e8.toString()} * 1e10 = ${denom.toString()}`);
  console.log(`   Taille calculée: ${szCalculated.toString()} (en szDecimals)`);
  console.log(`   Taille en HYPE: ${(Number(szCalculated) / (10 ** Number(hypeInfo.szDecimals))).toFixed(Number(hypeInfo.szDecimals))} HYPE`);

  // Le problème: si la balance est en weiDecimals (56715000 = 0.56715 HYPE)
  // mais toSzInSzDecimals retourne en szDecimals (53735606 = 537356.06 HYPE)
  // alors il y a un facteur 10^6 de différence (weiDecimals - szDecimals = 8 - 2 = 6)
  
  console.log(`\n⚠️  PROBLÈME IDENTIFIÉ:`);
  console.log(`   Si spotBalance.total est en weiDecimals (comme dans CoreExecution),`);
  console.log(`   alors il faut convertir la balance de weiDecimals vers szDecimals avant de comparer.`);
  console.log(`   Facteur de conversion: 10^(weiDecimals - szDecimals) = 10^${Number(hypeInfo.weiDecimals) - Number(hypeInfo.szDecimals)}`);

  console.log("\n" + "=".repeat(80));
  console.log("✅ Analyse terminée");
  console.log("=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  process.exit(1);
});



