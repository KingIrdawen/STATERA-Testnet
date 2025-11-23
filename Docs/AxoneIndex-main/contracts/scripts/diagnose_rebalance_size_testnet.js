const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x96f2b90dDe33348F347bd95CbF3A0830c30506C0";
  const L1READ = process.env.L1READ || "0x4F730c91A1a4C3cC4733a96eF6Ea52901164c761";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0xa51941b7744013c8BFe0b9F52A351aAe290588Dc";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 DIAGNOSTIC DU PROBLÈME DE TAILLE DANS LE REBALANCE");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);

  // Récupérer les paramètres
  const usdcTokenId = await handler.usdcCoreTokenId();
  const spotTokenBTC = await handler.spotTokenBTC();
  const spotTokenHYPE = await handler.spotTokenHYPE();
  const spotBTC = await handler.spotBTC();
  const spotHYPE = await handler.spotHYPE();

  console.log("📋 Paramètres:");
  console.log(`   USDC Token ID: ${usdcTokenId.toString()}`);
  console.log(`   BTC Token ID: ${spotTokenBTC.toString()}`);
  console.log(`   HYPE Token ID: ${spotTokenHYPE.toString()}`);
  console.log(`   Spot BTC: ${spotBTC.toString()}`);
  console.log(`   Spot HYPE: ${spotHYPE.toString()}`);

  // Récupérer les balances
  const usdcBal = await l1read.spotBalance(HANDLER, usdcTokenId);
  const btcBal = await l1read.spotBalance(HANDLER, spotTokenBTC);
  const hypeBal = await l1read.spotBalance(HANDLER, spotTokenHYPE);

  console.log("\n💰 Balances sur Core:");
  console.log(`   USDC: ${usdcBal.total.toString()} wei`);
  console.log(`   BTC: ${btcBal.total.toString()} wei`);
  console.log(`   HYPE: ${hypeBal.total.toString()} wei`);

  // Obtenir les infos des tokens
  const usdcInfo = await l1read.tokenInfo(Number(usdcTokenId));
  const btcInfo = await l1read.tokenInfo(Number(spotTokenBTC));
  const hypeInfo = await l1read.tokenInfo(Number(spotTokenHYPE));

  console.log("\n📊 Token Info:");
  console.log(`   USDC:`);
  console.log(`      szDecimals: ${usdcInfo.szDecimals.toString()}`);
  console.log(`      weiDecimals: ${usdcInfo.weiDecimals.toString()}`);
  console.log(`   BTC:`);
  console.log(`      szDecimals: ${btcInfo.szDecimals.toString()}`);
  console.log(`      weiDecimals: ${btcInfo.weiDecimals.toString()}`);
  console.log(`   HYPE:`);
  console.log(`      szDecimals: ${hypeInfo.szDecimals.toString()}`);
  console.log(`      weiDecimals: ${hypeInfo.weiDecimals.toString()}`);

  // Convertir les balances en unités lisibles
  const hypeSzDecimals = Number(hypeInfo.szDecimals);
  const hypeWeiDecimals = Number(hypeInfo.weiDecimals);
  
  // Balance HYPE en szDecimals (format du spotBalance)
  const hypeBalanceSz = Number(hypeBal.total);
  // Convertir en wei (si nécessaire)
  let hypeBalanceWei = hypeBalanceSz;
  if (hypeWeiDecimals > hypeSzDecimals) {
    hypeBalanceWei = hypeBalanceSz * (10 ** (hypeWeiDecimals - hypeSzDecimals));
  }
  // Convertir en HYPE (1e18)
  const hypeBalance1e18 = hypeBalanceWei * (10 ** (18 - hypeWeiDecimals));
  
  console.log("\n📊 Balance HYPE détaillée:");
  console.log(`   Balance brute (spotBalance.total): ${hypeBalanceSz.toString()}`);
  console.log(`   En szDecimals: ${(hypeBalanceSz / (10 ** hypeSzDecimals)).toFixed(hypeSzDecimals)} HYPE`);
  console.log(`   En weiDecimals: ${hypeBalanceWei.toString()} wei`);
  console.log(`   En 1e18: ${hypeBalance1e18.toString()}`);

  // Récupérer les prix
  const pxBtc = await views.oraclePxBtc1e8(HANDLER);
  const pxHype = await views.oraclePxHype1e8(HANDLER);
  
  // Utiliser le prix oracle pour le calcul (comme dans le rebalance)
  const pxHypeBid1e8 = Number(pxHype);

  console.log("\n💵 Prix:");
  console.log(`   BTC Oracle: ${ethers.formatUnits(pxBtc, 8)} USD`);
  console.log(`   HYPE Oracle: ${ethers.formatUnits(pxHype, 8)} USD`);
  
  // Simuler le calcul du rebalance
  const equity = await views.equitySpotUsd1e18(HANDLER);
  console.log(`\n💰 Equity totale: ${ethers.formatUnits(equity, 18)} USD`);

  // Calculer les deltas (simplifié - prendre directement du dernier événement)
  // D'après l'événement Rebalanced : dBtc = +25019484.435 USD, dHype = -25524923.565 USD
  const dHypeUsd1e18 = BigInt("-2552492356500000000000000"); // -25524.923565 USD
  console.log(`\n🔄 Delta HYPE (du rebalance): ${ethers.formatUnits(dHypeUsd1e18, 18)} USD`);

  // Calculer la taille attendue avec toSzInSzDecimals
  // Formule: numerator = absUsd * 10^szDecimals, denom = price1e8 * 1e10
  const absUsd = dHypeUsd1e18 < 0n ? -dHypeUsd1e18 : dHypeUsd1e18;
  const numerator = absUsd * (10n ** BigInt(hypeSzDecimals));
  const denom = BigInt(pxHypeBid1e8) * BigInt(1e10);
  const szCalculated = numerator / denom;
  
  console.log(`\n🧮 Calcul de la taille:`);
  console.log(`   Numerator: ${absUsd.toString()} * 10^${hypeSzDecimals} = ${numerator.toString()}`);
  console.log(`   Denominateur: ${pxHypeBid1e8.toString()} * 1e10 = ${denom.toString()}`);
  console.log(`   Taille calculée: ${szCalculated.toString()} (en szDecimals)`);
  console.log(`   Taille en HYPE: ${(Number(szCalculated) / (10 ** hypeSzDecimals)).toFixed(hypeSzDecimals)} HYPE`);
  
  console.log(`\n⚠️  PROBLÈME:`);
  console.log(`   Balance disponible: ${hypeBalanceSz.toString()} (en szDecimals)`);
  console.log(`   Taille calculée: ${szCalculated.toString()} (en szDecimals)`);
  console.log(`   Différence: ${Number(szCalculated) - hypeBalanceSz} (trop grand de ${((Number(szCalculated) - hypeBalanceSz) / (10 ** hypeSzDecimals)).toFixed(hypeSzDecimals)} HYPE)`);
  
  console.log(`\n💡 Le problème:`);
  console.log(`   La fonction toSzInSzDecimals calcule la taille nécessaire pour le delta USD,`);
  console.log(`   mais ne vérifie PAS si cette taille est disponible dans le solde.`);
  console.log(`   Il faut limiter la taille de vente à la balance disponible.`);

  console.log("\n" + "=".repeat(80));
  console.log("✅ Diagnostic terminé");
  console.log("=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  process.exit(1);
});

