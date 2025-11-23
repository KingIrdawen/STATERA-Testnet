const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  console.log("\n" + "=".repeat(80));
  console.log("🔍 COMPARAISON VALEURS OBSERVÉES vs CALCULÉES");
  console.log("=".repeat(80) + "\n");

  // Valeurs observées du dernier rebalancing
  const observedBtcSizeSz = 53737490n;
  const observedBtcPrice1e8 = 4262500000000n; // 42,625 USD
  const observedHypeSizeSz = 49195531n;
  const observedHypePrice1e8 = 4750095000n; // 47.50 USD

  // Infos tokens (connues)
  const btcSzDecimals = 5;
  const hypeSzDecimals = 2;

  console.log("📊 ORDRES OBSERVÉS:");
  console.log(`  BTC: ${observedBtcSizeSz.toString()} (szDecimals)`);
  console.log(`    = ${Number(observedBtcSizeSz) / (10 ** btcSzDecimals)} BTC`);
  console.log(`    Prix: ${ethers.formatUnits(observedBtcPrice1e8, 8)} USD`);
  console.log(`    Notional: ${Number(observedBtcSizeSz) / (10 ** btcSzDecimals) * Number(ethers.formatUnits(observedBtcPrice1e8, 8))} USD`);
  
  console.log(`\n  HYPE: ${observedHypeSizeSz.toString()} (szDecimals)`);
  console.log(`    = ${Number(observedHypeSizeSz) / (10 ** hypeSzDecimals)} HYPE`);
  console.log(`    Prix: ${ethers.formatUnits(observedHypePrice1e8, 8)} USD`);
  console.log(`    Notional: ${Number(observedHypeSizeSz) / (10 ** hypeSzDecimals) * Number(ethers.formatUnits(observedHypePrice1e8, 8))} USD`);

  // Calculer le notional USD 1e18 des ordres observés
  // Formule inverse de toSzInSzDecimals:
  // USD1e18 = sizeSz * price1e8 * 1e10 / 10^szDecimals
  const observedBtcNotional1e18 = (observedBtcSizeSz * observedBtcPrice1e8 * 10000000000n) / (10n ** BigInt(btcSzDecimals));
  const observedHypeNotional1e18 = (observedHypeSizeSz * observedHypePrice1e8 * 10000000000n) / (10n ** BigInt(hypeSzDecimals));

  console.log(`\n💵 NOTIONAL USD (1e18) DES ORDRES OBSERVÉS:`);
  console.log(`  BTC: ${observedBtcNotional1e18.toString()}`);
  console.log(`    = ${ethers.formatEther(observedBtcNotional1e18)} USD`);
  console.log(`  HYPE: ${observedHypeNotional1e18.toString()}`);
  console.log(`    = ${ethers.formatEther(observedHypeNotional1e18)} USD`);

  // Maintenant, si on divise par 1e6
  const observedBtcNotional1e18Divided = observedBtcNotional1e18 / 1000000n;
  const observedHypeNotional1e18Divided = observedHypeNotional1e18 / 1000000n;

  console.log(`\n💵 NOTIONAL USD (1e18) DIVISÉ PAR 1e6:`);
  console.log(`  BTC: ${ethers.formatEther(observedBtcNotional1e18Divided)} USD`);
  console.log(`  HYPE: ${ethers.formatEther(observedHypeNotional1e18Divided)} USD`);

  // Calculer les tailles si on utilise ces notional divisés
  const testPriceBtc1e8 = 2750000000000n; // 27,500 USD (oracle)
  const testPriceHype1e8 = 7500000000n; // 75 USD (oracle)

  const testBtcSizeSz = (observedBtcNotional1e18Divided * (10n ** BigInt(btcSzDecimals))) / (testPriceBtc1e8 * 10000000000n);
  const testHypeSizeSz = (observedHypeNotional1e18Divided * (10n ** BigInt(hypeSzDecimals))) / (testPriceHype1e8 * 10000000000n);

  console.log(`\n📊 TAILLES SI ON UTILISE NOTIONAL / 1e6:`);
  console.log(`  BTC: ${testBtcSizeSz.toString()} (szDecimals) = ${Number(testBtcSizeSz) / (10 ** btcSzDecimals)} BTC`);
  console.log(`  HYPE: ${testHypeSizeSz.toString()} (szDecimals) = ${Number(testHypeSizeSz) / (10 ** hypeSzDecimals)} HYPE`);

  // Vérifier si le problème vient de la conversion weiDecimals → USD 1e18
  console.log("\n" + "=".repeat(80));
  console.log("🔍 HYPOTHÈSE: PROBLÈME DANS weiDecimals → USD 1e18");
  console.log("=".repeat(80));

  // Pour HYPE: szDecimals=2, weiDecimals=8
  // Si on a 616986 HYPE en szDecimals = 61698600
  // En weiDecimals: 61698600 * 10^6 = 61698600000000
  // Conversion USD: 61698600000000 * 75 * 1e8 * 10^(18-8-8) = 61698600000000 * 75 * 1e8 * 100
  // = 61698600000000 * 7500000000 * 100 = 46273950000000000000000000 (1e18)
  // = 46,273,950 USD ✅ CORRECT

  // Mais peut-être que le problème est que les balances sont lues en weiDecimals au lieu de szDecimals ?
  // Ou peut-être qu'il y a une confusion entre les formats ?

  // Test: si on multiplie par 1e6 quelque part
  const testBalanceHypeSz = 61698600n; // Balance en szDecimals
  const testBalanceHypeWei = testBalanceHypeSz * (10n ** 6n); // Conversion en weiDecimals
  console.log(`\n📊 Test avec balance HYPE:`);
  console.log(`  Balance szDecimals: ${testBalanceHypeSz.toString()} = ${Number(testBalanceHypeSz) / 100} HYPE`);
  console.log(`  Balance weiDecimals: ${testBalanceHypeWei.toString()} = ${Number(testBalanceHypeWei) / 1e8} HYPE`);

  // Conversion USD correcte
  const correctUsd1e18 = testBalanceHypeWei * 7500000000n * 100n; // 75 USD * 10^2
  console.log(`  USD 1e18 (correct): ${ethers.formatEther(correctUsd1e18)} USD`);

  // Si on multiplie par erreur par 1e6
  const wrongUsd1e18 = testBalanceHypeWei * 7500000000n * 100n * 1000000n;
  console.log(`  USD 1e18 (avec facteur 1e6): ${ethers.formatEther(wrongUsd1e18)} USD`);
  console.log(`  Ratio: ${Number(wrongUsd1e18) / Number(correctUsd1e18)}`);

  console.log("\n" + "=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  process.exit(1);
});

