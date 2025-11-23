const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0xa7b8306307572c3ec388939A4C18931D905519a1";
  const L1READ = process.env.L1READ || "0x4F730c91A1a4C3cC4733a96eF6Ea52901164c761";

  console.log("\n" + "=".repeat(80));
  console.log("🧪 TEST DE LA NORMALISATION BBO AVEC DIFFÉRENTES MÉTHODES");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);

  const spotHYPE = await handler.spotHYPE();
  const SPOT_ASSET_OFFSET = 10000;

  // Obtenir les infos
  const hypeAssetId = Number(spotHYPE) + SPOT_ASSET_OFFSET;
  const bboHYPE = await l1read.bbo(hypeAssetId);
  const spotInfoHYPE = await l1read.spotInfo(spotHYPE);
  const baseTokenHYPE = spotInfoHYPE.tokens[0];
  const tokenInfoHYPE = await l1read.tokenInfo(Number(baseTokenHYPE));
  const szDecHYPE = Number(tokenInfoHYPE.szDecimals);
  
  console.log(`📊 Données HYPE:`);
  console.log(`   Spot ID: ${spotHYPE}`);
  console.log(`   Asset ID: ${hypeAssetId}`);
  console.log(`   szDecimals: ${szDecHYPE}`);
  console.log(`   BBO Bid brut: ${bboHYPE.bid.toString()}`);
  console.log(`   BBO Ask brut: ${bboHYPE.ask.toString()}`);

  // Méthode 1: scalePxTo1e8 avec pxDecimals = 8 - szDecimals
  const pxDecimals1 = 8 - szDecHYPE;
  const factor1 = 10n ** BigInt(8 - pxDecimals1);
  const bid1e8_method1 = BigInt(bboHYPE.bid.toString()) * factor1;
  const ask1e8_method1 = BigInt(bboHYPE.ask.toString()) * factor1;
  console.log(`\n1️⃣ Méthode actuelle (scalePxTo1e8 avec pxDecimals = ${pxDecimals1}):`);
  console.log(`   Facteur: 10^(8 - ${pxDecimals1}) = ${factor1.toString()}`);
  console.log(`   Bid normalisé: ${bid1e8_method1.toString()} = ${ethers.formatUnits(bid1e8_method1, 8)} USD`);
  console.log(`   Ask normalisé: ${ask1e8_method1.toString()} = ${ethers.formatUnits(ask1e8_method1, 8)} USD`);

  // Méthode 2: Normalisation PrecompileLib (multiplier par 10^szDecimals)
  const factor2 = 10n ** BigInt(szDecHYPE);
  const bid1e8_method2 = BigInt(bboHYPE.bid.toString()) * factor2;
  const ask1e8_method2 = BigInt(bboHYPE.ask.toString()) * factor2;
  console.log(`\n2️⃣ Méthode PrecompileLib (multiplier par 10^szDecimals = 10^${szDecHYPE}):`);
  console.log(`   Facteur: ${factor2.toString()}`);
  console.log(`   Bid normalisé: ${bid1e8_method2.toString()} = ${ethers.formatUnits(bid1e8_method2, 8)} USD`);
  console.log(`   Ask normalisé: ${ask1e8_method2.toString()} = ${ethers.formatUnits(ask1e8_method2, 8)} USD`);

  // Test avec marketLimitFromBbo
  console.log(`\n3️⃣ Calcul du prix limite avec marketLimitFromBbo (marketEpsilonBps = 10):`);
  const marketEpsilonBps = 10; // 0.1%
  
  // Pour un ordre d'achat (isBuy = true), on utilise Ask
  const askForBuy = Number(ask1e8_method1);
  const adj = (askForBuy * marketEpsilonBps) / 10000;
  const limitPx1e8_buy = askForBuy + adj;
  console.log(`   Ask normalisé: ${askForBuy}`);
  console.log(`   Ajustement (0.1%): ${adj}`);
  console.log(`   Prix limite BUY: ${limitPx1e8_buy} = ${ethers.formatUnits(BigInt(limitPx1e8_buy), 8)} USD`);
  
  // Test de quantizePx1e8
  console.log(`\n4️⃣ Test de quantizePx1e8 sur le prix limite:`);
  const limitPx1e8_buy_bigint = BigInt(limitPx1e8_buy);
  const maxPxDecimals = 8 - szDecHYPE; // 6
  console.log(`   Prix limite avant quantize: ${limitPx1e8_buy_bigint.toString()}`);
  console.log(`   maxPxDecimals: ${maxPxDecimals}`);
  console.log(`   Vérification si > 1e12: ${limitPx1e8_buy_bigint > BigInt(1e12) ? '❌ OUI' : '✅ NON'}`);
  
  if (limitPx1e8_buy_bigint > BigInt(1e12)) {
    console.log(`\n❌ PROBLÈME TROUVÉ: Le prix limite (${limitPx1e8_buy_bigint.toString()}) dépasse 1e12 !`);
    console.log(`   Cela causerait l'erreur PX_TOO_HIGH dans _assertOrder()`);
  } else {
    console.log(`\n✅ Le prix limite est dans les limites acceptables (< 1e12)`);
    console.log(`   Il faut vérifier si le problème vient d'ailleurs...`);
  }

  console.log("\n" + "=".repeat(80));
  console.log("✅ Test terminé");
  console.log("=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  process.exit(1);
});



