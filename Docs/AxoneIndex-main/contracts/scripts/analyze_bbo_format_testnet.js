const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0xa7b8306307572c3ec388939A4C18931D905519a1";
  const L1READ = process.env.L1READ || "0x4F730c91A1a4C3cC4733a96eF6Ea52901164c761";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0xa51941b7744013c8BFe0b9F52A351aAe290588Dc";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 ANALYSE DU FORMAT DES PRIX BBO");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);

  const spotBTC = await handler.spotBTC();
  const spotHYPE = await handler.spotHYPE();
  const SPOT_ASSET_OFFSET = 10000;

  // Analyser HYPE
  console.log("📊 ANALYSE HYPE (Spot ID " + spotHYPE + "):");
  console.log("─".repeat(80));

  // 1. Prix oracle spot (raw)
  const spotPxRawHYPE = await l1read.spotPx(spotHYPE);
  console.log(`\n1️⃣ Prix spot brut (spotPx): ${spotPxRawHYPE.toString()}`);

  // 2. Prix oracle normalisé (via CoreInteractionViews)
  const oraclePxHYPE1e8 = await views.oraclePxHype1e8(HANDLER);
  console.log(`2️⃣ Prix oracle normalisé (1e8): ${oraclePxHYPE1e8.toString()} = ${ethers.formatUnits(oraclePxHYPE1e8, 8)} USD`);

  // 3. BBO brut
  const hypeAssetId = Number(spotHYPE) + SPOT_ASSET_OFFSET;
  const bboHYPE = await l1read.bbo(hypeAssetId);
  console.log(`\n3️⃣ BBO brut (Asset ID ${hypeAssetId}):`);
  console.log(`   Bid brut: ${bboHYPE.bid.toString()}`);
  console.log(`   Ask brut: ${bboHYPE.ask.toString()}`);

  // 4. Infos du token
  const spotInfoHYPE = await l1read.spotInfo(spotHYPE);
  const baseTokenHYPE = spotInfoHYPE.tokens[0];
  const tokenInfoHYPE = await l1read.tokenInfo(Number(baseTokenHYPE));
  console.log(`\n4️⃣ Token Info:`);
  console.log(`   Token ID: ${baseTokenHYPE.toString()}`);
  console.log(`   Name: ${tokenInfoHYPE.name}`);
  console.log(`   szDecimals: ${tokenInfoHYPE.szDecimals.toString()}`);
  console.log(`   weiDecimals: ${tokenInfoHYPE.weiDecimals.toString()}`);

  // 5. Calcul de pxDecimals selon _derivedSpotPxDecimals
  let pxDecimalsHYPE = 8;
  const szDecHYPE = Number(tokenInfoHYPE.szDecimals);
  if (szDecHYPE >= 8) {
    pxDecimalsHYPE = 0;
  } else {
    pxDecimalsHYPE = 8 - szDecHYPE;
  }
  console.log(`\n5️⃣ Price Decimals calculés (_derivedSpotPxDecimals):`);
  console.log(`   pxDecimals = ${pxDecimalsHYPE} (si szDecimals=${szDecHYPE} < 8, alors pxDecimals = 8 - ${szDecHYPE})`);

  // 6. Normalisation BBO selon le code actuel
  // scalePxTo1e8(rawPx, pxDecimals) = rawPx * 10^(8 - pxDecimals) si pxDecimals < 8
  const factor = 10n ** BigInt(8 - pxDecimalsHYPE);
  const bidHYPE1e8_current = BigInt(bboHYPE.bid.toString()) * factor;
  const askHYPE1e8_current = BigInt(bboHYPE.ask.toString()) * factor;
  console.log(`\n6️⃣ Normalisation BBO (méthode actuelle - scalePxTo1e8):`);
  console.log(`   Facteur: 10^(8 - ${pxDecimalsHYPE}) = ${factor.toString()}`);
  console.log(`   Bid normalisé: ${bboHYPE.bid.toString()} * ${factor.toString()} = ${bidHYPE1e8_current.toString()}`);
  console.log(`   Ask normalisé: ${bboHYPE.ask.toString()} * ${factor.toString()} = ${askHYPE1e8_current.toString()}`);
  console.log(`   Bid en USD: ${ethers.formatUnits(bidHYPE1e8_current, 8)} USD`);
  console.log(`   Ask en USD: ${ethers.formatUnits(askHYPE1e8_current, 8)} USD`);

  // 7. Comparaison avec le prix oracle
  console.log(`\n7️⃣ Comparaison avec le prix oracle:`);
  console.log(`   Oracle: ${ethers.formatUnits(oraclePxHYPE1e8, 8)} USD`);
  console.log(`   BBO Bid normalisé: ${ethers.formatUnits(bidHYPE1e8_current, 8)} USD`);
  console.log(`   BBO Ask normalisé: ${ethers.formatUnits(askHYPE1e8_current, 8)} USD`);
  console.log(`   Différence Oracle vs Ask: ${ethers.formatUnits(askHYPE1e8_current > oraclePxHYPE1e8 ? askHYPE1e8_current - oraclePxHYPE1e8 : oraclePxHYPE1e8 - askHYPE1e8_current, 8)} USD`);

  // 8. Si les prix BBO étaient déjà en format 1e8 ?
  const ratioOracleToBBO = Number(oraclePxHYPE1e8) / Number(bboHYPE.ask);
  console.log(`\n8️⃣ Hypothèse: Si BBO était déjà en format 1e8:`);
  console.log(`   Ratio Oracle/BBO Ask: ${ratioOracleToBBO.toFixed(6)}`);
  console.log(`   Si BBO brut était déjà 1e8, le prix serait: ${ethers.formatUnits(bboHYPE.ask, 8)} USD`);
  console.log(`   (vs oracle: ${ethers.formatUnits(oraclePxHYPE1e8, 8)} USD)`);

  // 9. Si les prix BBO utilisent la même normalisation que spotPx
  // PrecompileLib.normalizedSpotPx = spotPx * 10^szDecimals
  const normalizedSpotPxHYPE = BigInt(spotPxRawHYPE.toString()) * (10n ** BigInt(szDecHYPE));
  console.log(`\n9️⃣ Normalisation selon PrecompileLib (méthode Lib_EVM):`);
  console.log(`   normalizedSpotPx = spotPx * 10^szDecimals`);
  console.log(`   = ${spotPxRawHYPE.toString()} * 10^${szDecHYPE}`);
  console.log(`   = ${normalizedSpotPxHYPE.toString()} = ${ethers.formatUnits(normalizedSpotPxHYPE, 8)} USD`);
  console.log(`   (vs oracle: ${ethers.formatUnits(oraclePxHYPE1e8, 8)} USD)`);

  // 10. Vérifier si BBO utilise le même format que spotPx
  const ratioBBOToSpotPx = Number(bboHYPE.ask) / Number(spotPxRawHYPE);
  console.log(`\n🔟 Comparaison BBO brut vs spotPx brut:`);
  console.log(`   spotPx brut: ${spotPxRawHYPE.toString()}`);
  console.log(`   BBO Ask brut: ${bboHYPE.ask.toString()}`);
  console.log(`   Ratio BBO/spotPx: ${ratioBBOToSpotPx.toFixed(6)}`);

  // 11. Vérifier si BBO est déjà dans le format de normalizedSpotPx
  const ratioBBOToNormalized = Number(bboHYPE.ask) / Number(normalizedSpotPxHYPE);
  console.log(`\n1️⃣1️⃣ Comparaison BBO brut vs normalizedSpotPx:`);
  console.log(`   normalizedSpotPx: ${normalizedSpotPxHYPE.toString()}`);
  console.log(`   BBO Ask brut: ${bboHYPE.ask.toString()}`);
  console.log(`   Ratio BBO/normalized: ${ratioBBOToNormalized.toFixed(6)}`);

  // 12. Test avec la méthode PrecompileLib
  // PrecompileLib normalise avec * 10^szDecimals, pas * 10^(8 - szDecimals)
  // Donc si on normalise BBO de la même manière :
  const bidHYPE_libevm_style = BigInt(bboHYPE.bid.toString()) * (10n ** BigInt(szDecHYPE));
  const askHYPE_libevm_style = BigInt(bboHYPE.ask.toString()) * (10n ** BigInt(szDecHYPE));
  console.log(`\n1️⃣2️⃣ Normalisation BBO selon méthode PrecompileLib (multiplier par 10^szDecimals):`);
  console.log(`   Bid: ${bboHYPE.bid.toString()} * 10^${szDecHYPE} = ${bidHYPE_libevm_style.toString()} = ${ethers.formatUnits(bidHYPE_libevm_style, 8)} USD`);
  console.log(`   Ask: ${bboHYPE.ask.toString()} * 10^${szDecHYPE} = ${askHYPE_libevm_style.toString()} = ${ethers.formatUnits(askHYPE_libevm_style, 8)} USD`);

  // 13. Vérifier si les prix BBO sont peut-être dans un format avec moins de décimales
  // Essayons de voir si BBO est en format "sans décimales" ou avec un offset
  console.log(`\n1️⃣3️⃣ Hypothèses sur le format BBO brut:`);
  console.log(`   Si BBO brut est le prix en USD sans décimales:`);
  console.log(`   Bid: ${bboHYPE.bid.toString()} USD = ${ethers.formatUnits(bboHYPE.bid * BigInt(1e8), 8)} USD (si on ajoute 1e8)`);
  console.log(`   Ask: ${bboHYPE.ask.toString()} USD = ${ethers.formatUnits(bboHYPE.ask * BigInt(1e8), 8)} USD (si on ajoute 1e8)`);
  console.log(`   (clairement trop élevé)`);

  console.log(`\n   Si BBO brut est déjà en format 1e8:`);
  console.log(`   Bid: ${ethers.formatUnits(bboHYPE.bid, 8)} USD`);
  console.log(`   Ask: ${ethers.formatUnits(bboHYPE.ask, 8)} USD`);
  console.log(`   (vs oracle: ${ethers.formatUnits(oraclePxHYPE1e8, 8)} USD)`);

  // 14. Analyse finale
  console.log("\n" + "=".repeat(80));
  console.log("📊 CONCLUSION:");
  console.log("=".repeat(80));

  if (askHYPE1e8_current > BigInt(1e12)) {
    console.log(`\n❌ PROBLÈME IDENTIFIÉ:`);
    console.log(`   Le prix BBO normalisé (${askHYPE1e8_current.toString()}) dépasse la limite de 1e12`);
    console.log(`   Cela cause l'erreur PX_TOO_HIGH dans _assertOrder()`);
    console.log(`\n   Le problème vient probablement de:`);
    console.log(`   1. Le format des prix BBO brut est mal interprété`);
    console.log(`   2. La normalisation scalePxTo1e8 avec pxDecimals = ${pxDecimalsHYPE} est incorrecte`);
    console.log(`   3. Les prix BBO brut pourraient être déjà dans un format partiellement normalisé`);
    
    if (Math.abs(ratioBBOToNormalized - 1) < 0.01) {
      console.log(`\n💡 HYPOTHÈSE: Les prix BBO brut sont peut-être déjà normalisés (format normalizedSpotPx)`);
      console.log(`   Dans ce cas, il ne faudrait PAS les re-normaliser avec scalePxTo1e8`);
    }
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



