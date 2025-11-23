const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0xa7b8306307572c3ec388939A4C18931D905519a1";
  const L1READ = process.env.L1READ || "0x4F730c91A1a4C3cC4733a96eF6Ea52901164c761";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0xa51941b7744013c8BFe0b9F52A351aAe290588Dc";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 DIAGNOSTIC: POURQUOI LE PRIX EST TROP ÉLEVÉ");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);

  // Obtenir les paramètres du handler
  const spotBTC = await handler.spotBTC();
  const spotHYPE = await handler.spotHYPE();
  const spotTokenBTC = await handler.spotTokenBTC();
  const spotTokenHYPE = await handler.spotTokenHYPE();
  const marketEpsilonBps = await handler.marketEpsilonBps();
  const maxSlippageBps = await handler.maxSlippageBps();

  console.log("📊 Paramètres du Handler:");
  console.log(`  Spot BTC ID: ${spotBTC.toString()}`);
  console.log(`  Spot HYPE ID: ${spotHYPE.toString()}`);
  console.log(`  Spot Token BTC ID: ${spotTokenBTC.toString()}`);
  console.log(`  Spot Token HYPE ID: ${spotTokenHYPE.toString()}`);
  console.log(`  Market Epsilon (bps): ${marketEpsilonBps.toString()} (${(Number(marketEpsilonBps) / 100).toFixed(2)}%)`);
  console.log(`  Max Slippage (bps): ${maxSlippageBps.toString()} (${(Number(maxSlippageBps) / 100).toFixed(2)}%)`);

  // Vérifier les prix oracles
  console.log("\n" + "─".repeat(80));
  console.log("📈 PRIX ORACLES:");
  console.log("─".repeat(80));

  let oracleBtc1e8 = 0n;
  let oracleHype1e8 = 0n;

  try {
    oracleBtc1e8 = await views.oraclePxBtc1e8(HANDLER);
    console.log(`  BTC Oracle (1e8): ${oracleBtc1e8.toString()} = ${ethers.formatUnits(oracleBtc1e8, 8)} USD`);
  } catch (e) {
    console.log(`  BTC Oracle: Erreur - ${e.message}`);
  }

  try {
    oracleHype1e8 = await views.oraclePxHype1e8(HANDLER);
    console.log(`  HYPE Oracle (1e8): ${oracleHype1e8.toString()} = ${ethers.formatUnits(oracleHype1e8, 8)} USD`);
  } catch (e) {
    console.log(`  HYPE Oracle: Erreur - ${e.message}`);
  }

  // Vérifier les BBO bruts
  console.log("\n" + "─".repeat(80));
  console.log("📊 BBO (BEST BID/OFFER) BRUTS:");
  console.log("─".repeat(80));

  const SPOT_ASSET_OFFSET = 10000; // HLConstants.SPOT_ASSET_OFFSET
  
  try {
    const btcAssetId = Number(spotBTC) + Number(SPOT_ASSET_OFFSET);
    const bboBTC = await l1read.bbo(btcAssetId);
    console.log(`\n  BTC Spot (Asset ID ${btcAssetId}):`);
    console.log(`    Bid brut: ${bboBTC.bid.toString()}`);
    console.log(`    Ask brut: ${bboBTC.ask.toString()}`);
    
    // Vérifier le spotInfo pour comprendre les décimales
    const spotInfoBTC = await l1read.spotInfo(spotBTC);
    console.log(`    Spot Info:`);
    console.log(`      Name: ${spotInfoBTC.name}`);
    console.log(`      Tokens: [${spotInfoBTC.tokens[0].toString()}, ${spotInfoBTC.tokens[1].toString()}]`);
    
    // Obtenir les infos du token de base
    const baseTokenBTC = spotInfoBTC.tokens[0];
    const tokenInfoBTC = await l1read.tokenInfo(Number(baseTokenBTC));
    console.log(`    Token de base (ID ${baseTokenBTC}):`);
    console.log(`      Name: ${tokenInfoBTC.name}`);
    console.log(`      szDecimals: ${tokenInfoBTC.szDecimals.toString()}`);
    console.log(`      weiDecimals: ${tokenInfoBTC.weiDecimals.toString()}`);
    
    // Calculer les prix décimaux attendus
    // Prix décimal = 8 - szDecimals (si szDecimals < 8)
    let priceDecimals = 0;
    const szDecBTC = Number(tokenInfoBTC.szDecimals);
    if (szDecBTC < 8) {
      priceDecimals = 8 - szDecBTC;
    }
    console.log(`    Price Decimals attendus: ${priceDecimals}`);
    
    // Normaliser le prix BBO brut vers 1e8
    // scalePxTo1e8(rawPx, pxDec) multiplie par 10^(pxDec)
    const bidBTCRaw = BigInt(bboBTC.bid.toString());
    const askBTCRaw = BigInt(bboBTC.ask.toString());
    const factorBTC = 10n ** BigInt(priceDecimals);
    const bidBTC1e8 = bidBTCRaw * factorBTC;
    const askBTC1e8 = askBTCRaw * factorBTC;
    
    console.log(`    Bid normalisé (1e8): ${bidBTC1e8.toString()} = ${ethers.formatUnits(bidBTC1e8, 8)} USD`);
    console.log(`    Ask normalisé (1e8): ${askBTC1e8.toString()} = ${ethers.formatUnits(askBTC1e8, 8)} USD`);
    
    // Vérifier si les prix normalisés sont raisonnables
    if (bidBTC1e8 > BigInt(1e12)) {
      console.log(`    ⚠️  ATTENTION: Bid normalisé dépasse 1e12 !`);
    }
    if (askBTC1e8 > BigInt(1e12)) {
      console.log(`    ⚠️  ATTENTION: Ask normalisé dépasse 1e12 !`);
    }
    
    // Calculer le prix limite pour un achat
    const marketEpsilon = BigInt(marketEpsilonBps);
    const adjBTC = (askBTC1e8 * marketEpsilon) / 10000n;
    const limitPxBTC1e8 = askBTC1e8 + adjBTC;
    console.log(`    Prix limite ACHAT calculé: ${limitPxBTC1e8.toString()} = ${ethers.formatUnits(limitPxBTC1e8, 8)} USD`);
    console.log(`      (Ask ${ethers.formatUnits(askBTC1e8, 8)} + epsilon ${(Number(marketEpsilonBps) / 100).toFixed(2)}% = ${ethers.formatUnits(adjBTC, 8)})`);
    
    if (limitPxBTC1e8 > BigInt(1e12)) {
      console.log(`    ❌ ERREUR: Le prix limite BTC dépasse 1e12 !`);
      console.log(`       Valeur: ${limitPxBTC1e8.toString()}`);
      console.log(`       Limite: ${BigInt(1e12).toString()}`);
    }
    
  } catch (e) {
    console.log(`  BTC BBO: Erreur - ${e.message}`);
    if (e.reason) console.log(`    Raison: ${e.reason}`);
  }

  try {
    const hypeAssetId = Number(spotHYPE) + Number(SPOT_ASSET_OFFSET);
    const bboHYPE = await l1read.bbo(hypeAssetId);
    console.log(`\n  HYPE Spot (Asset ID ${hypeAssetId}):`);
    console.log(`    Bid brut: ${bboHYPE.bid.toString()}`);
    console.log(`    Ask brut: ${bboHYPE.ask.toString()}`);
    
    // Vérifier le spotInfo
    const spotInfoHYPE = await l1read.spotInfo(spotHYPE);
    console.log(`    Spot Info:`);
    console.log(`      Name: ${spotInfoHYPE.name}`);
    console.log(`      Tokens: [${spotInfoHYPE.tokens[0].toString()}, ${spotInfoHYPE.tokens[1].toString()}]`);
    
    // Obtenir les infos du token de base
    const baseTokenHYPE = spotInfoHYPE.tokens[0];
    const tokenInfoHYPE = await l1read.tokenInfo(Number(baseTokenHYPE));
    console.log(`    Token de base (ID ${baseTokenHYPE}):`);
    console.log(`      Name: ${tokenInfoHYPE.name}`);
    console.log(`      szDecimals: ${tokenInfoHYPE.szDecimals.toString()}`);
    console.log(`      weiDecimals: ${tokenInfoHYPE.weiDecimals.toString()}`);
    
    // Calculer les prix décimaux attendus
    let priceDecimals = 0;
    const szDecHYPE = Number(tokenInfoHYPE.szDecimals);
    if (szDecHYPE < 8) {
      priceDecimals = 8 - szDecHYPE;
    }
    console.log(`    Price Decimals attendus: ${priceDecimals}`);
    
    // Normaliser le prix BBO brut vers 1e8
    const bidHYPERaw = BigInt(bboHYPE.bid.toString());
    const askHYPERaw = BigInt(bboHYPE.ask.toString());
    const factorHYPE = 10n ** BigInt(priceDecimals);
    const bidHYPE1e8 = bidHYPERaw * factorHYPE;
    const askHYPE1e8 = askHYPERaw * factorHYPE;
    
    console.log(`    Bid normalisé (1e8): ${bidHYPE1e8.toString()} = ${ethers.formatUnits(bidHYPE1e8, 8)} USD`);
    console.log(`    Ask normalisé (1e8): ${askHYPE1e8.toString()} = ${ethers.formatUnits(askHYPE1e8, 8)} USD`);
    
    // Vérifier si les prix normalisés sont raisonnables
    if (bidHYPE1e8 > BigInt(1e12)) {
      console.log(`    ⚠️  ATTENTION: Bid normalisé dépasse 1e12 !`);
    }
    if (askHYPE1e8 > BigInt(1e12)) {
      console.log(`    ⚠️  ATTENTION: Ask normalisé dépasse 1e12 !`);
    }
    
    // Calculer le prix limite pour un achat
    const marketEpsilon = BigInt(marketEpsilonBps);
    const adjHYPE = (askHYPE1e8 * marketEpsilon) / 10000n;
    const limitPxHYPE1e8 = askHYPE1e8 + adjHYPE;
    console.log(`    Prix limite ACHAT calculé: ${limitPxHYPE1e8.toString()} = ${ethers.formatUnits(limitPxHYPE1e8, 8)} USD`);
    console.log(`      (Ask ${ethers.formatUnits(askHYPE1e8, 8)} + epsilon ${(Number(marketEpsilonBps) / 100).toFixed(2)}% = ${ethers.formatUnits(adjHYPE, 8)})`);
    
    if (limitPxHYPE1e8 > BigInt(1e12)) {
      console.log(`    ❌ ERREUR: Le prix limite HYPE dépasse 1e12 !`);
      console.log(`       Valeur: ${limitPxHYPE1e8.toString()}`);
      console.log(`       Limite: ${BigInt(1e12).toString()}`);
    }
    
  } catch (e) {
    console.log(`  HYPE BBO: Erreur - ${e.message}`);
    if (e.reason) console.log(`    Raison: ${e.reason}`);
  }

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

