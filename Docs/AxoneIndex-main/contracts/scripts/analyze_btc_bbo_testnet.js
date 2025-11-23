const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0xa7b8306307572c3ec388939A4C18931D905519a1";
  const L1READ = process.env.L1READ || "0x4F730c91A1a4C3cC4733a96eF6Ea52901164c761";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 ANALYSE DES PRIX BTC BBO");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);

  const spotBTC = await handler.spotBTC();
  const SPOT_ASSET_OFFSET = 10000;

  console.log(`📊 Données BTC:`);
  console.log(`   Spot ID: ${spotBTC}`);

  // Obtenir les infos
  const btcAssetId = Number(spotBTC) + SPOT_ASSET_OFFSET;
  const bboBTC = await l1read.bbo(btcAssetId);
  const spotInfoBTC = await l1read.spotInfo(spotBTC);
  const baseTokenBTC = spotInfoBTC.tokens[0];
  const tokenInfoBTC = await l1read.tokenInfo(Number(baseTokenBTC));
  const szDecBTC = Number(tokenInfoBTC.szDecimals);
  
  console.log(`   Asset ID: ${btcAssetId}`);
  console.log(`   szDecimals: ${szDecBTC}`);
  console.log(`   BBO Bid brut: ${bboBTC.bid.toString()}`);
  console.log(`   BBO Ask brut: ${bboBTC.ask.toString()}`);

  // Prix oracle
  const spotPxRawBTC = await l1read.spotPx(spotBTC);
  console.log(`   Prix spot brut (spotPx): ${spotPxRawBTC.toString()}`);

  // Normalisation avec la méthode actuelle
  const pxDecimalsBTC = 8 - szDecBTC;
  const factorBTC = 10n ** BigInt(8 - pxDecimalsBTC);
  const bidBTC1e8 = BigInt(bboBTC.bid.toString()) * factorBTC;
  const askBTC1e8 = BigInt(bboBTC.ask.toString()) * factorBTC;
  console.log(`\n1️⃣ Normalisation BBO (méthode actuelle - pxDecimals = ${pxDecimalsBTC}):`);
  console.log(`   Facteur: 10^(8 - ${pxDecimalsBTC}) = ${factorBTC.toString()}`);
  console.log(`   Bid normalisé: ${bidBTC1e8.toString()} = ${ethers.formatUnits(bidBTC1e8, 8)} USD`);
  console.log(`   Ask normalisé: ${askBTC1e8.toString()} = ${ethers.formatUnits(askBTC1e8, 8)} USD`);

  // Prix oracle normalisé
  const oraclePxBTC1e8 = BigInt(spotPxRawBTC.toString()) * (10n ** BigInt(szDecBTC));
  console.log(`\n2️⃣ Prix oracle normalisé:`);
  console.log(`   Oracle brut: ${spotPxRawBTC.toString()}`);
  console.log(`   Oracle normalisé: ${oraclePxBTC1e8.toString()} = ${ethers.formatUnits(oraclePxBTC1e8, 8)} USD`);

  // Calcul du prix limite avec marketLimitFromBbo
  const marketEpsilonBps = 10; // 0.1%
  const askForBuy = Number(askBTC1e8);
  const adj = (askForBuy * marketEpsilonBps) / 10000;
  const limitPx1e8_buy = askForBuy + adj;
  const limitPx1e8_buy_bigint = BigInt(limitPx1e8_buy);
  console.log(`\n3️⃣ Calcul du prix limite avec marketLimitFromBbo (marketEpsilonBps = 10):`);
  console.log(`   Ask normalisé: ${askForBuy}`);
  console.log(`   Ajustement (0.1%): ${adj}`);
  console.log(`   Prix limite BUY: ${limitPx1e8_buy_bigint.toString()} = ${ethers.formatUnits(limitPx1e8_buy_bigint, 8)} USD`);

  // Vérification si > 1e12
  const limit1e12 = BigInt(1e12);
  console.log(`\n4️⃣ Vérification si > 1e12:`);
  console.log(`   Limite 1e12: ${limit1e12.toString()}`);
  console.log(`   Prix limite: ${limitPx1e8_buy_bigint.toString()}`);
  console.log(`   Dépassement: ${limitPx1e8_buy_bigint > limit1e12 ? '❌ OUI' : '✅ NON'}`);

  if (limitPx1e8_buy_bigint > limit1e12) {
    console.log(`\n❌ PROBLÈME TROUVÉ: Le prix limite BTC (${limitPx1e8_buy_bigint.toString()}) dépasse 1e12 !`);
    console.log(`   Cela causerait l'erreur PX_TOO_HIGH dans _assertOrder()`);
    console.log(`\n   SOLUTION: Il faut peut-être détecter les spreads BBO anormalement larges`);
    console.log(`   et utiliser le prix oracle à la place, ou ajuster la normalisation.`);
  } else {
    console.log(`\n✅ Le prix limite BTC est dans les limites acceptables (< 1e12)`);
  }

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



