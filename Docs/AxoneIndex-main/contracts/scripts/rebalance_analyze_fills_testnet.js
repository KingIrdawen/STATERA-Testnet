const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  // Adresses du dernier déploiement (2025-11-21)
  const VAULT = process.env.VAULT || "0x72eEdd6cE1039E429e44F86b3DcA4A45e206a410";
  const HANDLER = process.env.HANDLER || "0x7551Ca74B5f2Cb3EF9f2e885f2fe9BF993bF570c";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x1E2B0DccE25Eeb479F83DABE24ab687C6AB64292";
  const L1READ = process.env.L1READ || "0xacE17480F4d157C48180f4ed10AB483238143e11";
  const gasPrice = ethers.parseUnits(process.env.GAS_PRICE_GWEI || "3", "gwei");

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  const errorMessage = (err) => err?.error?.message || err?.message || String(err);
  const isRateLimitError = (err) => /rate limited/i.test(errorMessage(err)) || err?.code === 429;
  const waitForReceipt = async (hash, retries = 90, intervalMs = 1500) => {
    for (let i = 0; i < retries; i++) {
      try {
        const rcpt = await ethers.provider.getTransactionReceipt(hash);
        if (rcpt) return rcpt;
      } catch (e) {
        if (!isRateLimitError(e) && e.code !== 429) throw e;
      }
      await delay(intervalMs);
    }
    throw new Error(`Timeout en attente du receipt: ${hash}`);
  };
  const sendWithRetry = async (fn, label, attempts = 5, baseWaitMs = 1500) => {
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (err) {
        if (isRateLimitError(err) && i < attempts - 1) {
          const waitMs = baseWaitMs * (i + 1);
          console.warn(`⚠️ Rate limit lors de "${label}" (tentative ${i + 1}/${attempts}), nouvel essai dans ${waitMs}ms`);
          await delay(waitMs);
          continue;
        }
        throw err;
      }
    }
  };

  console.log("\n" + "=".repeat(80));
  console.log("🔍 REBALANCING AVEC ANALYSE DES FILLS");
  console.log("=".repeat(80) + "\n");

  const vault = await ethers.getContractAt("VaultContract", VAULT);
  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);
  const l1read = await ethers.getContractAt("L1Read", L1READ);
  const signer = (await ethers.getSigners())[0];
  const who = await signer.getAddress();

  console.log("📝 Rebalancer:", who);
  console.log("⚙️  Handler:", HANDLER);

  // Obtenir les IDs
  const spotBTC = await handler.spotBTC();
  const spotHYPE = await handler.spotHYPE();
  const spotTokenBTC = await handler.spotTokenBTC();
  const spotTokenHYPE = await handler.spotTokenHYPE();
  const usdcTokenId = await handler.usdcCoreTokenId();

  console.log("\n📊 CONFIGURATION:");
  console.log(`  Spot BTC ID: ${spotBTC}`);
  console.log(`  Spot HYPE ID: ${spotHYPE}`);
  console.log(`  Spot Token BTC ID: ${spotTokenBTC}`);
  console.log(`  Spot Token HYPE ID: ${spotTokenHYPE}`);

  // Obtenir les infos des tokens
  const btcInfo = await l1read.tokenInfo(Number(spotTokenBTC));
  const hypeInfo = await l1read.tokenInfo(Number(spotTokenHYPE));
  
  console.log(`\n📦 INFOS TOKENS:`);
  console.log(`  BTC: szDecimals=${btcInfo.szDecimals}, weiDecimals=${btcInfo.weiDecimals}`);
  console.log(`  HYPE: szDecimals=${hypeInfo.szDecimals}, weiDecimals=${hypeInfo.weiDecimals}`);

  // Prix oracles avant
  console.log("\n" + "─".repeat(80));
  console.log("📈 PRIX ORACLES ET BBO AVANT REBALANCING:");
  console.log("─".repeat(80));

  let pxBtcOracle = 0n;
  let pxHypeOracle = 0n;
  let bboBtcBid = 0n, bboBtcAsk = 0n;
  let bboHypeBid = 0n, bboHypeAsk = 0n;

  try {
    pxBtcOracle = await views.oraclePxBtc1e8(HANDLER);
    console.log(`\n  Prix Oracle BTC: ${ethers.formatUnits(pxBtcOracle, 8)} USD`);
  } catch (e) {
    console.log(`  Erreur prix BTC oracle: ${e.message}`);
  }

  try {
    pxHypeOracle = await views.oraclePxHype1e8(HANDLER);
    console.log(`  Prix Oracle HYPE: ${ethers.formatUnits(pxHypeOracle, 8)} USD`);
  } catch (e) {
    console.log(`  Erreur prix HYPE oracle: ${e.message}`);
  }

  // BBO BTC
  try {
    const assetIdBtc = Number(spotBTC) + 10000;
    const bboBtc = await l1read.bbo(assetIdBtc);
    bboBtcBid = bboBtc.bid;
    bboBtcAsk = bboBtc.ask;
    console.log(`\n  BBO BTC (raw):`);
    console.log(`    Bid: ${bboBtcBid.toString()}`);
    console.log(`    Ask: ${bboBtcAsk.toString()}`);
    
    // Convertir en prix normalisé
    // Note: _derivedSpotPxDecimals est internal, on doit calculer manuellement
    const btcInfoForPx = await l1read.tokenInfo(Number(spotTokenBTC));
    const pxDecBtc = Number(btcInfoForPx.szDecimals) >= 8 ? 0 : (8 - Number(btcInfoForPx.szDecimals));
    const factorBtc = pxDecBtc === 0 ? 1n : (10n ** BigInt(8 - pxDecBtc));
    const bidBtc1e8 = BigInt(bboBtcBid.toString()) * factorBtc;
    const askBtc1e8 = BigInt(bboBtcAsk.toString()) * factorBtc;
    console.log(`    Bid (1e8): ${ethers.formatUnits(bidBtc1e8, 8)} USD`);
    console.log(`    Ask (1e8): ${ethers.formatUnits(askBtc1e8, 8)} USD`);
    console.log(`    Spread: ${ethers.formatUnits(askBtc1e8 - bidBtc1e8, 8)} USD`);
  } catch (e) {
    console.log(`  Erreur BBO BTC: ${e.message}`);
  }

  // BBO HYPE
  try {
    const assetIdHype = Number(spotHYPE) + 10000;
    const bboHype = await l1read.bbo(assetIdHype);
    bboHypeBid = bboHype.bid;
    bboHypeAsk = bboHype.ask;
    console.log(`\n  BBO HYPE (raw):`);
    console.log(`    Bid: ${bboHype.bid.toString()}`);
    console.log(`    Ask: ${bboHype.ask.toString()}`);
    
    // Convertir en prix normalisé
    const hypeInfoForPx = await l1read.tokenInfo(Number(spotTokenHYPE));
    const pxDecHype = Number(hypeInfoForPx.szDecimals) >= 8 ? 0 : (8 - Number(hypeInfoForPx.szDecimals));
    const factorHype = pxDecHype === 0 ? 1n : (10n ** BigInt(8 - pxDecHype));
    const bidHype1e8 = BigInt(bboHypeBid.toString()) * factorHype;
    const askHype1e8 = BigInt(bboHypeAsk.toString()) * factorHype;
    console.log(`    Bid (1e8): ${ethers.formatUnits(bidHype1e8, 8)} USD`);
    console.log(`    Ask (1e8): ${ethers.formatUnits(askHype1e8, 8)} USD`);
    console.log(`    Spread: ${ethers.formatUnits(askHype1e8 - bidHype1e8, 8)} USD`);
  } catch (e) {
    console.log(`  Erreur BBO HYPE: ${e.message}`);
  }

  // Paramètres du handler
  const marketEpsilonBps = await handler.marketEpsilonBps();
  const maxSlippageBps = await handler.maxSlippageBps();
  console.log(`\n  Paramètres:`);
  console.log(`    Market Epsilon: ${marketEpsilonBps.toString()} bps (${(Number(marketEpsilonBps) / 100).toFixed(2)}%)`);
  console.log(`    Max Slippage: ${maxSlippageBps.toString()} bps (${(Number(maxSlippageBps) / 100).toFixed(2)}%)`);

  // Lancer le rebalancing
  console.log("\n" + "─".repeat(80));
  console.log("⚖️  LANCEMENT DU REBALANCING:");
  console.log("─".repeat(80));
  
  const tx = await sendWithRetry(
    () => handler.connect(signer).rebalancePortfolio(0, 0, { gasPrice }),
    "handler.rebalancePortfolio()"
  );
  console.log(`\n  ✅ Transaction envoyée: ${tx.hash}`);
  
  const rcpt = await waitForReceipt(tx.hash);
  console.log(`  ✅ Transaction confirmée dans le bloc ${rcpt.blockNumber}`);

  // Analyser les événements
  console.log("\n" + "─".repeat(80));
  console.log("📋 ANALYSE DES ORDRES PLACÉS:");
  console.log("─".repeat(80));

  const handlerEvents = rcpt.logs.filter(log => {
    try {
      const parsed = handler.interface.parseLog(log);
      return parsed !== null;
    } catch {
      return false;
    }
  }).map(log => {
    try {
      return handler.interface.parseLog(log);
    } catch {
      return null;
    }
  }).filter(e => e !== null);

  const orders = [];
  for (const event of handlerEvents) {
    if (event.name === "SpotOrderPlaced") {
      orders.push({
        asset: event.args.asset.toString(),
        isBuy: event.args.isBuy,
        limitPx1e8: event.args.limitPx1e8.toString(),
        sizeSzDecimals: event.args.sizeSzDecimals.toString(),
        cloid: event.args.cloid.toString()
      });
      
      const assetName = event.args.asset.toString() === spotBTC.toString() ? "BTC" : "HYPE";
      const assetInfo = assetName === "BTC" ? btcInfo : hypeInfo;
      
      console.log(`\n  📌 Ordre ${assetName} (${event.args.isBuy ? "ACHAT" : "VENTE"}):`);
      console.log(`    Asset ID: ${event.args.asset.toString()}`);
      console.log(`    Prix limite (1e8): ${event.args.limitPx1e8.toString()}`);
      console.log(`    Prix limite: ${ethers.formatUnits(event.args.limitPx1e8, 8)} USD`);
      console.log(`    Taille (szDecimals): ${event.args.sizeSzDecimals.toString()}`);
      
      // Convertir la taille en format humain
      const sizeHuman = Number(event.args.sizeSzDecimals) / (10 ** Number(assetInfo.szDecimals));
      console.log(`    Taille (humaine): ${sizeHuman.toFixed(Number(assetInfo.szDecimals))} ${assetName}`);
      
      // Analyser si le prix est marketable
      if (assetName === "BTC") {
        const pxDecBtc = Number(btcInfo.szDecimals) >= 8 ? 0 : (8 - Number(btcInfo.szDecimals));
        const factorBtc = pxDecBtc === 0 ? 1n : (10n ** BigInt(8 - pxDecBtc));
        const askBtc1e8 = BigInt(bboBtcAsk.toString()) * factorBtc;
        const bidBtc1e8 = BigInt(bboBtcBid.toString()) * factorBtc;
        
        if (event.args.isBuy) {
          console.log(`    📊 Analyse ACHAT:`);
          console.log(`      Ask du marché: ${ethers.formatUnits(askBtc1e8, 8)} USD`);
          console.log(`      Prix limite ordre: ${ethers.formatUnits(event.args.limitPx1e8, 8)} USD`);
          const isMarketable = BigInt(event.args.limitPx1e8) >= askBtc1e8;
          console.log(`      Marketable: ${isMarketable ? "✅ OUI" : "❌ NON"}`);
          if (!isMarketable) {
            const diff = askBtc1e8 - BigInt(event.args.limitPx1e8);
            const diffBps = (Number(diff) * 10000) / Number(askBtc1e8);
            console.log(`      ⚠️  Prix trop bas de ${ethers.formatUnits(diff, 8)} USD (${diffBps.toFixed(2)} bps)`);
          }
        } else {
          console.log(`    📊 Analyse VENTE:`);
          console.log(`      Bid du marché: ${ethers.formatUnits(bidBtc1e8, 8)} USD`);
          console.log(`      Prix limite ordre: ${ethers.formatUnits(event.args.limitPx1e8, 8)} USD`);
          const isMarketable = BigInt(event.args.limitPx1e8) <= bidBtc1e8;
          console.log(`      Marketable: ${isMarketable ? "✅ OUI" : "❌ NON"}`);
          if (!isMarketable) {
            const diff = BigInt(event.args.limitPx1e8) - bidBtc1e8;
            const diffBps = (Number(diff) * 10000) / Number(bidBtc1e8);
            console.log(`      ⚠️  Prix trop haut de ${ethers.formatUnits(diff, 8)} USD (${diffBps.toFixed(2)} bps)`);
          }
        }
      } else {
        const pxDecHype = Number(hypeInfo.szDecimals) >= 8 ? 0 : (8 - Number(hypeInfo.szDecimals));
        const factorHype = pxDecHype === 0 ? 1n : (10n ** BigInt(8 - pxDecHype));
        const askHype1e8 = BigInt(bboHypeAsk.toString()) * factorHype;
        const bidHype1e8 = BigInt(bboHypeBid.toString()) * factorHype;
        
        if (event.args.isBuy) {
          console.log(`    📊 Analyse ACHAT:`);
          console.log(`      Ask du marché: ${ethers.formatUnits(askHype1e8, 8)} USD`);
          console.log(`      Prix limite ordre: ${ethers.formatUnits(event.args.limitPx1e8, 8)} USD`);
          const isMarketable = BigInt(event.args.limitPx1e8) >= askHype1e8;
          console.log(`      Marketable: ${isMarketable ? "✅ OUI" : "❌ NON"}`);
          if (!isMarketable) {
            const diff = askHype1e8 - BigInt(event.args.limitPx1e8);
            const diffBps = (Number(diff) * 10000) / Number(askHype1e8);
            console.log(`      ⚠️  Prix trop bas de ${ethers.formatUnits(diff, 8)} USD (${diffBps.toFixed(2)} bps)`);
          }
        } else {
          console.log(`    📊 Analyse VENTE:`);
          console.log(`      Bid du marché: ${ethers.formatUnits(bidHype1e8, 8)} USD`);
          console.log(`      Prix limite ordre: ${ethers.formatUnits(event.args.limitPx1e8, 8)} USD`);
          const isMarketable = BigInt(event.args.limitPx1e8) <= bidHype1e8;
          console.log(`      Marketable: ${isMarketable ? "✅ OUI" : "❌ NON"}`);
          if (!isMarketable) {
            const diff = BigInt(event.args.limitPx1e8) - bidHype1e8;
            const diffBps = (Number(diff) * 10000) / Number(bidHype1e8);
            console.log(`      ⚠️  Prix trop haut de ${ethers.formatUnits(diff, 8)} USD (${diffBps.toFixed(2)} bps)`);
          }
        }
      }
    }
  }

  // Attendre et vérifier les BBO après
  console.log("\n⏳ Attente de 10 secondes pour vérifier les BBO après...");
  await delay(10000);

  console.log("\n" + "─".repeat(80));
  console.log("📈 BBO APRÈS REBALANCING:");
  console.log("─".repeat(80));

  try {
    const assetIdBtc = Number(spotBTC) + 10000;
    const bboBtcAfter = await l1read.bbo(assetIdBtc);
    const pxDecBtc = Number(btcInfo.szDecimals) >= 8 ? 0 : (8 - Number(btcInfo.szDecimals));
    const factorBtc = pxDecBtc === 0 ? 1n : (10n ** BigInt(8 - pxDecBtc));
    const bidBtc1e8After = BigInt(bboBtcAfter.bid.toString()) * factorBtc;
    const askBtc1e8After = BigInt(bboBtcAfter.ask.toString()) * factorBtc;
    const bidBtc1e8Before = BigInt(bboBtcBid.toString()) * factorBtc;
    const askBtc1e8Before = BigInt(bboBtcAsk.toString()) * factorBtc;
    console.log(`\n  BTC:`);
    console.log(`    Bid: ${ethers.formatUnits(bidBtc1e8After, 8)} USD (avant: ${ethers.formatUnits(bidBtc1e8Before, 8)} USD)`);
    console.log(`    Ask: ${ethers.formatUnits(askBtc1e8After, 8)} USD (avant: ${ethers.formatUnits(askBtc1e8Before, 8)} USD)`);
  } catch (e) {
    console.log(`  Erreur BBO BTC après: ${e.message}`);
  }

  try {
    const assetIdHype = Number(spotHYPE) + 10000;
    const bboHypeAfter = await l1read.bbo(assetIdHype);
    const pxDecHype = Number(hypeInfo.szDecimals) >= 8 ? 0 : (8 - Number(hypeInfo.szDecimals));
    const factorHype = pxDecHype === 0 ? 1n : (10n ** BigInt(8 - pxDecHype));
    const bidHype1e8After = BigInt(bboHypeAfter.bid.toString()) * factorHype;
    const askHype1e8After = BigInt(bboHypeAfter.ask.toString()) * factorHype;
    const bidHype1e8Before = BigInt(bboHypeBid.toString()) * factorHype;
    const askHype1e8Before = BigInt(bboHypeAsk.toString()) * factorHype;
    console.log(`\n  HYPE:`);
    console.log(`    Bid: ${ethers.formatUnits(bidHype1e8After, 8)} USD (avant: ${ethers.formatUnits(bidHype1e8Before, 8)} USD)`);
    console.log(`    Ask: ${ethers.formatUnits(askHype1e8After, 8)} USD (avant: ${ethers.formatUnits(askHype1e8Before, 8)} USD)`);
  } catch (e) {
    console.log(`  Erreur BBO HYPE après: ${e.message}`);
  }

  // Résumé
  console.log("\n" + "=".repeat(80));
  console.log("📊 RÉSUMÉ DE L'ANALYSE:");
  console.log("=".repeat(80));
  
  console.log(`\n✅ Transaction: ${tx.hash}`);
  console.log(`   Bloc: ${rcpt.blockNumber}`);
  console.log(`\n📋 Ordres placés: ${orders.length}`);
  
  for (const order of orders) {
    const assetName = order.asset === spotBTC.toString() ? "BTC" : "HYPE";
    console.log(`   - ${assetName} ${order.isBuy ? "ACHAT" : "VENTE"}: ${ethers.formatUnits(order.limitPx1e8, 8)} USD, taille: ${order.sizeSzDecimals}`);
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

