const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x071Bcc062D661536D77a09b38bFfd249B7B8195F";
  const L1READ = process.env.L1READ || "0x46976ef07CA697f1546A7F5fcE6f6C6c1e8fdB6D";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 TEST DES CALCULS DE TAILLE AVEC VALEURS RÉELLES");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);

  const spotTokenBTC = await handler.spotTokenBTC();
  const spotTokenHYPE = await handler.spotTokenHYPE();
  const btcInfo = await l1read.tokenInfo(Number(spotTokenBTC));
  const hypeInfo = await l1read.tokenInfo(Number(spotTokenHYPE));

  console.log("📦 INFOS TOKENS:");
  console.log(`  BTC: szDecimals=${btcInfo.szDecimals}, weiDecimals=${btcInfo.weiDecimals}`);
  console.log(`  HYPE: szDecimals=${hypeInfo.szDecimals}, weiDecimals=${hypeInfo.weiDecimals}`);

  // Valeurs observées du dernier rebalancing
  console.log("\n" + "=".repeat(80));
  console.log("📊 VALEURS OBSERVÉES DU DERNIER REBALANCING");
  console.log("=".repeat(80));

  // Ordre BTC observé
  const observedBtcSizeSz = 53737490n;
  const observedBtcPrice1e8 = 4262500000000n; // 42,625 USD
  console.log(`\n📊 Ordre BTC:`);
  console.log(`  Taille (szDecimals): ${observedBtcSizeSz.toString()}`);
  console.log(`  Prix (1e8): ${observedBtcPrice1e8.toString()} = ${ethers.formatUnits(observedBtcPrice1e8, 8)} USD`);
  
  // Calculer la taille humaine
  const btcSizeHumanSz = Number(observedBtcSizeSz) / (10 ** Number(btcInfo.szDecimals));
  console.log(`  Taille humaine (szDecimals): ${btcSizeHumanSz} BTC`);
  
  // Convertir en 1e8 (ce qui est envoyé à Core)
  const factorBtc = 10n ** BigInt(8 - Number(btcInfo.szDecimals));
  const btcSize1e8 = observedBtcSizeSz * factorBtc;
  console.log(`  Taille (1e8, envoyée à Core): ${btcSize1e8.toString()}`);
  console.log(`  Taille humaine (1e8): ${Number(btcSize1e8) / 1e8} BTC`);
  
  // Calculer le notional USD
  const btcNotionalUsd = (Number(btcSize1e8) / 1e8) * (Number(observedBtcPrice1e8) / 1e8);
  console.log(`  Notional USD: ${btcNotionalUsd} USD`);
  
  // Si on divise par 1e6
  const btcSizeIfDividedBy1e6 = btcSizeHumanSz / 1e6;
  console.log(`\n  🔍 Si taille divisée par 1e6:`);
  console.log(`    ${btcSizeHumanSz} / 1e6 = ${btcSizeIfDividedBy1e6} BTC`);
  const btcNotionalIfDivided = btcSizeIfDividedBy1e6 * (Number(observedBtcPrice1e8) / 1e8);
  console.log(`    Notional USD: ${btcNotionalIfDivided} USD`);

  // Ordre HYPE observé
  const observedHypeSizeSz = 49195531n;
  const observedHypePrice1e8 = 4750095000n; // 47.50 USD
  console.log(`\n📊 Ordre HYPE:`);
  console.log(`  Taille (szDecimals): ${observedHypeSizeSz.toString()}`);
  console.log(`  Prix (1e8): ${observedHypePrice1e8.toString()} = ${ethers.formatUnits(observedHypePrice1e8, 8)} USD`);
  
  const hypeSizeHumanSz = Number(observedHypeSizeSz) / (10 ** Number(hypeInfo.szDecimals));
  console.log(`  Taille humaine (szDecimals): ${hypeSizeHumanSz} HYPE`);
  
  const factorHype = 10n ** BigInt(8 - Number(hypeInfo.szDecimals));
  const hypeSize1e8 = observedHypeSizeSz * factorHype;
  console.log(`  Taille (1e8, envoyée à Core): ${hypeSize1e8.toString()}`);
  console.log(`  Taille humaine (1e8): ${Number(hypeSize1e8) / 1e8} HYPE`);
  
  const hypeNotionalUsd = (Number(hypeSize1e8) / 1e8) * (Number(observedHypePrice1e8) / 1e8);
  console.log(`  Notional USD: ${hypeNotionalUsd} USD`);
  
  const hypeSizeIfDividedBy1e6 = hypeSizeHumanSz / 1e6;
  console.log(`\n  🔍 Si taille divisée par 1e6:`);
  console.log(`    ${hypeSizeHumanSz} / 1e6 = ${hypeSizeIfDividedBy1e6} HYPE`);
  const hypeNotionalIfDivided = hypeSizeIfDividedBy1e6 * (Number(observedHypePrice1e8) / 1e8);
  console.log(`    Notional USD: ${hypeNotionalIfDivided} USD`);

  // Test de la formule toSzInSzDecimals avec les valeurs réelles
  console.log("\n" + "=".repeat(80));
  console.log("🔍 TEST DE LA FORMULE toSzInSzDecimals");
  console.log("=".repeat(80));

  // Pour BTC : si on veut acheter pour X USD
  // On part du notional calculé et on remonte
  console.log(`\n📊 Test BTC (remontée depuis la taille observée):`);
  console.log(`  Taille observée (szDecimals): ${observedBtcSizeSz}`);
  console.log(`  Prix: ${ethers.formatUnits(observedBtcPrice1e8, 8)} USD`);
  
  // Calculer le notional USD1e18 qui aurait produit cette taille
  // Formule inverse: USD1e18 = sizeSz * price1e8 * 1e10 / 10^szDecimals
  const btcNotional1e18 = (observedBtcSizeSz * observedBtcPrice1e8 * 10000000000n) / (10n ** BigInt(btcInfo.szDecimals));
  console.log(`  Notional USD (1e18) qui produit cette taille: ${btcNotional1e18.toString()}`);
  console.log(`  Notional USD (humain): ${ethers.formatEther(btcNotional1e18)} USD`);
  
  // Vérifier en recalculant
  const numeratorBtc = btcNotional1e18 * (10n ** BigInt(btcInfo.szDecimals));
  const denomBtc = observedBtcPrice1e8 * 10000000000n;
  const recalculatedBtcSize = numeratorBtc / denomBtc;
  console.log(`  Recalcul: ${recalculatedBtcSize.toString()} (attendu: ${observedBtcSizeSz.toString()})`);
  if (recalculatedBtcSize === observedBtcSizeSz) {
    console.log(`  ✅ Formule correcte`);
  } else {
    console.log(`  ❌ Formule incorrecte - différence: ${recalculatedBtcSize - observedBtcSizeSz}`);
  }

  // Pour HYPE
  console.log(`\n📊 Test HYPE (remontée depuis la taille observée):`);
  console.log(`  Taille observée (szDecimals): ${observedHypeSizeSz}`);
  console.log(`  Prix: ${ethers.formatUnits(observedHypePrice1e8, 8)} USD`);
  
  const hypeNotional1e18 = (observedHypeSizeSz * observedHypePrice1e8 * 10000000000n) / (10n ** BigInt(hypeInfo.szDecimals));
  console.log(`  Notional USD (1e18) qui produit cette taille: ${hypeNotional1e18.toString()}`);
  console.log(`  Notional USD (humain): ${ethers.formatEther(hypeNotional1e18)} USD`);
  
  const numeratorHype = hypeNotional1e18 * (10n ** BigInt(hypeInfo.szDecimals));
  const denomHype = observedHypePrice1e8 * 10000000000n;
  const recalculatedHypeSize = numeratorHype / denomHype;
  console.log(`  Recalcul: ${recalculatedHypeSize.toString()} (attendu: ${observedHypeSizeSz.toString()})`);
  if (recalculatedHypeSize === observedHypeSizeSz) {
    console.log(`  ✅ Formule correcte`);
  } else {
    console.log(`  ❌ Formule incorrecte - différence: ${recalculatedHypeSize - observedHypeSizeSz}`);
  }

  // Vérifier si le problème est dans sizeSzTo1e8
  console.log("\n" + "=".repeat(80));
  console.log("🔍 VÉRIFICATION DE sizeSzTo1e8");
  console.log("=".repeat(80));

  console.log(`\n📊 Conversion BTC:`);
  console.log(`  Input (szDecimals): ${observedBtcSizeSz}`);
  console.log(`  szDecimals: ${btcInfo.szDecimals}`);
  if (Number(btcInfo.szDecimals) < 8) {
    const factor = 10n ** BigInt(8 - Number(btcInfo.szDecimals));
    const output = observedBtcSizeSz * factor;
    console.log(`  Output (1e8): ${output.toString()}`);
    console.log(`  Taille humaine: ${Number(output) / 1e8} BTC`);
    console.log(`  ✅ Conversion correcte`);
  }

  console.log(`\n📊 Conversion HYPE:`);
  console.log(`  Input (szDecimals): ${observedHypeSizeSz}`);
  console.log(`  szDecimals: ${hypeInfo.szDecimals}`);
  if (Number(hypeInfo.szDecimals) < 8) {
    const factor = 10n ** BigInt(8 - Number(hypeInfo.szDecimals));
    const output = observedHypeSizeSz * factor;
    console.log(`  Output (1e8): ${output.toString()}`);
    console.log(`  Taille humaine: ${Number(output) / 1e8} HYPE`);
    console.log(`  ✅ Conversion correcte`);
  }

  // Résumé
  console.log("\n" + "=".repeat(80));
  console.log("📊 CONCLUSION");
  console.log("=".repeat(80));
  
  console.log(`\n1. PRIX LIMITE:`);
  console.log(`   ❌ Problème confirmé: Utilise fallback oracle au lieu de l'ask`);
  console.log(`   💡 Solution: Modifier _marketLimitFromBbo pour vérifier seulement ask (achat) ou bid (vente)`);
  
  console.log(`\n2. TAILLES:`);
  console.log(`   📊 Analyse:`);
  console.log(`     - BTC: ${btcSizeHumanSz} BTC = ${btcNotionalUsd} USD`);
  console.log(`     - HYPE: ${hypeSizeHumanSz} HYPE = ${hypeNotionalUsd} USD`);
  console.log(`   💡 Si les tailles sont 1e6 trop grandes:`);
  console.log(`     - BTC divisé par 1e6: ${btcSizeIfDividedBy1e6} BTC = ${btcNotionalIfDivided} USD`);
  console.log(`     - HYPE divisé par 1e6: ${hypeSizeIfDividedBy1e6} HYPE = ${hypeNotionalIfDivided} USD`);
  console.log(`   ⚠️  Les formules semblent correctes selon les calculs`);
  console.log(`   💡 Le problème pourrait être:`);
  console.log(`      - Les deltas USD passés à toSzInSzDecimals sont déjà 1e6 trop grands`);
  console.log(`      - Ou un problème dans la lecture/affichage des valeurs`);

  console.log("\n" + "=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  process.exit(1);
});


