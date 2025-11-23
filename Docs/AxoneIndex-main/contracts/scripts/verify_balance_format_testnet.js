const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x96f2b90dDe33348F347bd95CbF3A0830c30506C0";
  const L1READ = process.env.L1READ || "0x4F730c91A1a4C3cC4733a96eF6Ea52901164c761";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 VÉRIFICATION DU FORMAT DE LA BALANCE");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);

  const spotTokenHYPE = await handler.spotTokenHYPE();
  const hypeBal = await l1read.spotBalance(HANDLER, spotTokenHYPE);
  const hypeInfo = await l1read.tokenInfo(Number(spotTokenHYPE));

  console.log("📊 Balance HYPE brute:");
  console.log(`   spotBalance.total: ${hypeBal.total.toString()}`);
  console.log(`   szDecimals: ${hypeInfo.szDecimals.toString()}`);
  console.log(`   weiDecimals: ${hypeInfo.weiDecimals.toString()}`);

  // Interprétation 1: spotBalance.total est en szDecimals
  const balanceSz = Number(hypeBal.total);
  const balanceInHypeSz = balanceSz / (10 ** Number(hypeInfo.szDecimals));
  console.log(`\n📊 Interprétation 1 (en szDecimals):`);
  console.log(`   Balance: ${balanceSz} (szDecimals)`);
  console.log(`   En HYPE: ${balanceInHypeSz.toFixed(Number(hypeInfo.szDecimals))} HYPE`);

  // Interprétation 2: spotBalance.total est en weiDecimals
  const balanceWei = Number(hypeBal.total);
  const balanceInHypeWei = balanceWei / (10 ** Number(hypeInfo.weiDecimals));
  console.log(`\n📊 Interprétation 2 (en weiDecimals):`);
  console.log(`   Balance: ${balanceWei} (weiDecimals)`);
  console.log(`   En HYPE: ${balanceInHypeWei.toFixed(Number(hypeInfo.weiDecimals))} HYPE`);

  // Utiliser spotBalanceInWei pour voir la conversion
  // Cette fonction convertit de szDecimals vers weiDecimals
  const balanceInWei = await handler.callStatic.spotBalanceInWei(HANDLER, spotTokenHYPE).catch(() => null);
  if (balanceInWei) {
    console.log(`\n📊 Conversion avec spotBalanceInWei:`);
    console.log(`   Balance en wei: ${balanceInWei.toString()}`);
    console.log(`   En HYPE: ${ethers.formatUnits(balanceInWei, Number(hypeInfo.weiDecimals))} HYPE`);
  }

  // Vérifier avec un exemple concret
  // Si on a 0.56715 HYPE avec szDecimals=2:
  // - En szDecimals: 56715 (0.56715 * 10^2)
  // - En weiDecimals: 56715000 (0.56715 * 10^8)
  
  console.log(`\n💡 Exemple de conversion:`);
  console.log(`   Si on a 0.56715 HYPE:`);
  console.log(`   - En szDecimals (szDecimals=2): ${Math.floor(0.56715 * 100)}`);
  console.log(`   - En weiDecimals (weiDecimals=8): ${Math.floor(0.56715 * 1e8)}`);
  console.log(`   - Balance actuelle: ${hypeBal.total.toString()}`);

  // Calculer ce que devrait être la taille de vente
  // Si on veut vendre pour 25.5 USD de HYPE à 47.5 USD
  const targetUsd = 25.5;
  const priceUsd = 47.5;
  const hypeToSell = targetUsd / priceUsd; // ~0.537 HYPE
  
  console.log(`\n🧮 Calcul attendu:`);
  console.log(`   Target USD: ${targetUsd} USD`);
  console.log(`   Price: ${priceUsd} USD`);
  console.log(`   HYPE à vendre: ${hypeToSell.toFixed(6)} HYPE`);
  console.log(`   En szDecimals (szDecimals=2): ${Math.floor(hypeToSell * 100)}`);
  console.log(`   En weiDecimals (weiDecimals=8): ${Math.floor(hypeToSell * 1e8)}`);
  console.log(`   Taille calculée par toSzInSzDecimals: 53735606`);

  console.log("\n" + "=".repeat(80));
  console.log("✅ Vérification terminée");
  console.log("=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  process.exit(1);
});



