const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  console.log("\n" + "=".repeat(80));
  console.log("🔍 COMPARAISON: Notre code vs lib_EVM scale()");
  console.log("=".repeat(80) + "\n");

  // Dans lib_EVM CoreExecution.sol:
  // action.sz est en format 1e8 (human-readable * 1e8)
  // amountOut = scale(action.sz, 8, baseToken.weiDecimals)
  // scale() convertit de 8 décimales vers weiDecimals
  
  // Pour HYPE avec weiDecimals=8:
  // scale(1e8, 8, 8) = 1e8 (pas de changement)
  
  // Dans notre code:
  // toSzInSzDecimals() retourne en szDecimals
  // sizeSzTo1e8() convertit de szDecimals vers 1e8
  
  // Pour HYPE avec szDecimals=2:
  // toSzInSzDecimals() retourne en szDecimals (ex: 100 pour 1 HYPE)
  // sizeSzTo1e8() convertit: 100 * 10^(8-2) = 100 * 10^6 = 100000000 (1e8) ✅

  console.log("📊 COMPARAISON:");
  console.log(`\n  lib_EVM:`);
  console.log(`    action.sz est en format 1e8`);
  console.log(`    amountOut = scale(action.sz, 8, weiDecimals)`);
  console.log(`    Pour HYPE (weiDecimals=8): scale(1e8, 8, 8) = 1e8`);
  
  console.log(`\n  Notre code:`);
  console.log(`    toSzInSzDecimals() retourne en szDecimals`);
  console.log(`    sizeSzTo1e8() convertit szDecimals → 1e8`);
  console.log(`    Pour HYPE (szDecimals=2): 100 * 10^(8-2) = 100 * 10^6 = 1e8 ✅`);
  
  console.log(`\n  ✅ Les deux approches produisent le même résultat final (1e8)`);
  
  // Mais peut-être que le problème est que nous calculons les tailles en szDecimals
  // alors que lib_EVM utilise directement le format 1e8 ?
  
  // Test: Si on a un delta USD de 23,368,344 USD
  const deltaUsd1e18 = ethers.parseEther("23368344.5825445");
  const price1e8 = 4750095000n; // 47.50 USD
  const szDecimals = 2;
  
  // Notre méthode
  const numerator = deltaUsd1e18 * (10n ** BigInt(szDecimals));
  const denom = BigInt(price1e8.toString()) * 10000000000n;
  const sizeSz = numerator / denom;
  const size1e8 = sizeSz * (10n ** BigInt(8 - szDecimals));
  
  console.log(`\n📊 TEST AVEC DELTA USD RÉEL:`);
  console.log(`  Delta USD: ${ethers.formatEther(deltaUsd1e18)} USD`);
  console.log(`  Prix: ${ethers.formatUnits(price1e8, 8)} USD`);
  console.log(`  Taille (szDecimals): ${sizeSz.toString()}`);
  console.log(`  Taille (1e8): ${size1e8.toString()}`);
  console.log(`  Taille humaine: ${Number(size1e8) / 1e8} HYPE`);
  
  // Comparer avec ordre observé
  const observedSize1e8 = 49195531n * (10n ** BigInt(8 - szDecimals));
  console.log(`\n  Taille observée (1e8): ${observedSize1e8.toString()}`);
  console.log(`  Taille observée humaine: ${Number(observedSize1e8) / 1e8} HYPE`);
  console.log(`  Ratio: ${Number(size1e8) / Number(observedSize1e8)}`);
  
  if (Math.abs(Number(size1e8) / Number(observedSize1e8) - 1e6) < 100) {
    console.log(`  ⚠️  FACTEUR 1e6 DÉTECTÉ !`);
    console.log(`  💡 Le problème est dans toSzInSzDecimals() ou dans les deltas USD`);
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


