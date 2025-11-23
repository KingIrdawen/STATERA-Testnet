const hre = require("hardhat");
const axios = require("axios");

async function main() {
  const { ethers } = hre;
  
  // Adresses du dernier déploiement (2025-11-21)
  const HANDLER = process.env.HANDLER || "0x7551Ca74B5f2Cb3EF9f2e885f2fe9BF993bF570c";
  const L1READ = process.env.L1READ || "0xacE17480F4d157C48180f4ed10AB483238143e11";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x1E2B0DccE25Eeb479F83DABE24ab687C6AB64292";
  const HL_API_URL = process.env.HL_API_URL || "https://api.hyperliquid-testnet.xyz";
  const LOOKBACK_BLOCKS = Number(process.env.LOOKBACK_BLOCKS || 1000);
  const MAX_BLOCK_RANGE = 900; // Limite du RPC

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  const isRateLimitError = (e) => e?.message?.includes("rate limited") || e?.code === 429;
  
  const callWithRetry = async (fn, label, retries = 5, baseWaitMs = 2000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (isRateLimitError(err) && i < retries - 1) {
          const waitMs = baseWaitMs * (i + 1);
          console.warn(`    ⚠️ Rate limit lors de "${label}" (tentative ${i + 1}/${retries}), attente ${waitMs}ms...`);
          await delay(waitMs);
          continue;
        }
        throw err;
      }
    }
  };

  console.log("\n" + "=".repeat(80));
  console.log("🔍 ANALYSE COMPLÈTE DES ORDRES ET FILLS");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);

  console.log("📝 Handler:", HANDLER);
  console.log("📡 API HyperLiquid:", HL_API_URL);

  // Obtenir les IDs avec retry
  const spotBTC = await callWithRetry(() => handler.spotBTC(), "spotBTC()");
  const spotHYPE = await callWithRetry(() => handler.spotHYPE(), "spotHYPE()");
  const spotTokenBTC = await callWithRetry(() => handler.spotTokenBTC(), "spotTokenBTC()");
  const spotTokenHYPE = await callWithRetry(() => handler.spotTokenHYPE(), "spotTokenHYPE()");

  console.log("\n📊 CONFIGURATION:");
  console.log(`  Spot BTC ID: ${spotBTC}`);
  console.log(`  Spot HYPE ID: ${spotHYPE}`);
  console.log(`  Spot Token BTC ID: ${spotTokenBTC}`);
  console.log(`  Spot Token HYPE ID: ${spotTokenHYPE}`);

  // Obtenir les infos des tokens avec retry
  const btcInfo = await callWithRetry(() => l1read.tokenInfo(Number(spotTokenBTC)), "tokenInfo(BTC)");
  const hypeInfo = await callWithRetry(() => l1read.tokenInfo(Number(spotTokenHYPE)), "tokenInfo(HYPE)");
  
  console.log(`\n📦 INFOS TOKENS:`);
  console.log(`  BTC: szDecimals=${btcInfo.szDecimals}, weiDecimals=${btcInfo.weiDecimals}`);
  console.log(`  HYPE: szDecimals=${hypeInfo.szDecimals}, weiDecimals=${hypeInfo.weiDecimals}`);

  // Récupérer tous les événements SpotOrderPlaced récents (par lots pour éviter la limite)
  console.log("\n" + "─".repeat(80));
  console.log("📋 RÉCUPÉRATION DES ÉVÉNEMENTS EVM:");
  console.log("─".repeat(80));

  const latest = await ethers.provider.getBlockNumber();
  const fromBlock = latest > LOOKBACK_BLOCKS ? latest - LOOKBACK_BLOCKS : 0;

  console.log(`\n  Blocs à analyser: ${fromBlock} → ${latest} (${latest - fromBlock} blocs)`);
  console.log(`  Requêtes par lots de ${MAX_BLOCK_RANGE} blocs...`);

  const orderEvents = [];
  let currentFrom = fromBlock;
  while (currentFrom < latest) {
    const currentTo = Math.min(currentFrom + MAX_BLOCK_RANGE, latest);
    try {
      const events = await handler.queryFilter(handler.filters.SpotOrderPlaced(), currentFrom, currentTo);
      orderEvents.push(...events);
      console.log(`    Blocs ${currentFrom}-${currentTo}: ${events.length} événement(s)`);
    } catch (e) {
      console.warn(`    ⚠️  Erreur pour blocs ${currentFrom}-${currentTo}: ${e.message}`);
    }
    currentFrom = currentTo + 1;
  }

  console.log(`  ✅ Total: ${orderEvents.length} événement(s) SpotOrderPlaced trouvé(s)`);

  // Récupérer les fills via l'API HyperLiquid
  console.log("\n" + "─".repeat(80));
  console.log("📡 RÉCUPÉRATION DES FILLS VIA API HYPERLIQUID:");
  console.log("─".repeat(80));

  const post = async (type, payload = {}) => {
    try {
      const { data } = await axios.post(`${HL_API_URL}/info`, { type, ...payload }, { timeout: 15000 });
      return data;
    } catch (e) {
      console.error(`  ❌ Erreur API ${type}:`, e.response?.data || e.message);
      return null;
    }
  };

  const handlerLower = HANDLER.toLowerCase();
  const fills = await post("userFills", { user: handlerLower });
  const spotState = await post("spotClearinghouseState", { user: handlerLower });

  console.log(`\n  ✅ Fills récupérés: ${Array.isArray(fills) ? fills.length : 0}`);
  if (spotState && spotState.openOrders) {
    console.log(`  ✅ Ordres ouverts: ${spotState.openOrders.length}`);
  }

  // Analyser chaque ordre
  console.log("\n" + "─".repeat(80));
  console.log("🔍 ANALYSE DÉTAILLÉE DES ORDRES:");
  console.log("─".repeat(80));

  const getBlockWithRetry = async (blockNumber) => {
    return await callWithRetry(() => ethers.provider.getBlock(blockNumber), `getBlock(${blockNumber})`, 3, 1500);
  };

  const orders = [];
  for (let i = 0; i < orderEvents.length; i++) {
    const event = orderEvents[i];
    let block;
    try {
      block = await getBlockWithRetry(event.blockNumber);
      if (i < orderEvents.length - 1) await delay(500); // Délai entre les requêtes
    } catch (e) {
      console.warn(`    ⚠️  Erreur récupération bloc ${event.blockNumber}: ${e.message}`);
      block = null;
    }
    const timestamp = block?.timestamp || 0;
    
    const assetId = Number(event.args.asset);
    const assetName = assetId === Number(spotBTC) ? "BTC" : assetId === Number(spotHYPE) ? "HYPE" : `Asset${assetId}`;
    const assetInfo = assetName === "BTC" ? btcInfo : hypeInfo;
    
    const order = {
      txHash: event.transactionHash,
      blockNumber: event.blockNumber,
      timestamp,
      asset: assetId,
      assetName,
      isBuy: event.args.isBuy,
      limitPx1e8: event.args.limitPx1e8.toString(),
      sizeSzDecimals: event.args.sizeSzDecimals.toString(),
      cloid: event.args.cloid.toString(),
      sizeHuman: Number(event.args.sizeSzDecimals) / (10 ** Number(assetInfo.szDecimals)),
      limitPxHuman: Number(event.args.limitPx1e8) / 1e8,
      filled: false,
      fillData: null,
      reason: null
    };

    // Chercher un fill correspondant
    if (Array.isArray(fills)) {
      // Chercher par cloid ou par timestamp/asset
      const matchingFill = fills.find(f => {
        // Vérifier le cloid si disponible
        if (f.cloid && f.cloid !== "0" && f.cloid === order.cloid) {
          return true;
        }
        // Sinon, vérifier par timestamp et asset
        const fillTime = Number(f.time || f.timestamp || 0);
        const timeDiff = Math.abs(fillTime - timestamp);
        if (timeDiff <= 300 && f.asset && Number(f.asset) === assetId) { // 5 minutes de tolérance
          return true;
        }
        return false;
      });

      if (matchingFill) {
        order.filled = true;
        order.fillData = matchingFill;
        order.filledSize = matchingFill.sz || matchingFill.size || "0";
        order.filledPx = matchingFill.px || matchingFill.price || "0";
      }
    }

    // Vérifier aussi dans spotState.openOrders si l'ordre est encore ouvert
    if (!order.filled && spotState && spotState.openOrders) {
      const openOrder = spotState.openOrders.find(o => {
        if (o.cloid && o.cloid === order.cloid) return true;
        if (o.asset && Number(o.asset) === assetId && o.side === (order.isBuy ? "B" : "A")) {
          return true;
        }
        return false;
      });
      if (openOrder) {
        order.reason = "Ordre encore ouvert dans le carnet d'ordres";
      }
    }

    // Analyser pourquoi l'ordre n'a pas été exécuté si nécessaire
    if (!order.filled && !order.reason) {
      try {
        await delay(500); // Délai avant la requête BBO
        // Obtenir le BBO actuel pour analyser
        const assetIdForBbo = assetId + 10000;
        const bbo = await l1read.bbo(assetIdForBbo);
        
        const pxDec = Number(assetInfo.szDecimals) >= 8 ? 0 : (8 - Number(assetInfo.szDecimals));
        const factor = pxDec === 0 ? 1n : (10n ** BigInt(8 - pxDec));
        const bid1e8 = BigInt(bbo.bid.toString()) * factor;
        const ask1e8 = BigInt(bbo.ask.toString()) * factor;
        const limitPx = BigInt(order.limitPx1e8);

        if (order.isBuy) {
          // Pour un achat, le prix limite doit être >= ask
          if (limitPx < ask1e8) {
            const diff = ask1e8 - limitPx;
            const diffBps = (Number(diff) * 10000) / Number(ask1e8);
            order.reason = `Prix limite trop bas: ${ethers.formatUnits(limitPx, 8)} USD < Ask ${ethers.formatUnits(ask1e8, 8)} USD (écart: ${diffBps.toFixed(2)} bps)`;
          } else {
            order.reason = "Prix marketable mais pas de fill trouvé (peut-être exécuté mais non détecté, ou problème de liquidité)";
          }
        } else {
          // Pour une vente, le prix limite doit être <= bid
          if (limitPx > bid1e8) {
            const diff = limitPx - bid1e8;
            const diffBps = (Number(diff) * 10000) / Number(bid1e8);
            order.reason = `Prix limite trop haut: ${ethers.formatUnits(limitPx, 8)} USD > Bid ${ethers.formatUnits(bid1e8, 8)} USD (écart: ${diffBps.toFixed(2)} bps)`;
          } else {
            order.reason = "Prix marketable mais pas de fill trouvé (peut-être exécuté mais non détecté, ou problème de liquidité)";
          }
        }
      } catch (e) {
        order.reason = `Erreur lors de l'analyse: ${e.message}`;
      }
    }

    orders.push(order);
  }

  // Afficher l'analyse détaillée
  for (const order of orders) {
    console.log(`\n  📌 Ordre ${order.assetName} (${order.isBuy ? "ACHAT" : "VENTE"}):`);
    console.log(`    Tx Hash: ${order.txHash}`);
    console.log(`    Block: ${order.blockNumber} (${new Date(order.timestamp * 1000).toISOString()})`);
    console.log(`    Prix limite: ${order.limitPxHuman.toFixed(8)} USD`);
    console.log(`    Taille: ${order.sizeHuman.toFixed(Number(order.assetName === "BTC" ? btcInfo.szDecimals : hypeInfo.szDecimals))} ${order.assetName}`);
    console.log(`    Cloid: ${order.cloid}`);
    
    if (order.filled) {
      console.log(`    ✅ STATUT: EXÉCUTÉ`);
      if (order.fillData) {
        console.log(`    📊 Fill:`);
        console.log(`      Taille exécutée: ${order.filledSize}`);
        console.log(`      Prix exécuté: ${order.filledPx}`);
        if (order.fillData.time) {
          console.log(`      Timestamp: ${new Date(Number(order.fillData.time) * 1000).toISOString()}`);
        }
      }
    } else {
      console.log(`    ❌ STATUT: NON EXÉCUTÉ`);
      if (order.reason) {
        console.log(`    ⚠️  Raison: ${order.reason}`);
      }
    }
  }

  // Bilan complet
  console.log("\n" + "=".repeat(80));
  console.log("📊 BILAN COMPLET:");
  console.log("=".repeat(80));

  const totalOrders = orders.length;
  const filledOrders = orders.filter(o => o.filled).length;
  const unfilledOrders = totalOrders - filledOrders;

  console.log(`\n📈 STATISTIQUES GLOBALES:`);
  console.log(`  Total d'ordres placés: ${totalOrders}`);
  console.log(`  Ordres exécutés: ${filledOrders} (${((filledOrders / totalOrders) * 100).toFixed(1)}%)`);
  console.log(`  Ordres non exécutés: ${unfilledOrders} (${((unfilledOrders / totalOrders) * 100).toFixed(1)}%)`);

  // Par type d'actif
  const btcOrders = orders.filter(o => o.assetName === "BTC");
  const hypeOrders = orders.filter(o => o.assetName === "HYPE");
  
  console.log(`\n📊 PAR ACTIF:`);
  console.log(`  BTC: ${btcOrders.length} ordre(s) - ${btcOrders.filter(o => o.filled).length} exécuté(s)`);
  console.log(`  HYPE: ${hypeOrders.length} ordre(s) - ${hypeOrders.filter(o => o.filled).length} exécuté(s)`);

  // Par direction
  const buyOrders = orders.filter(o => o.isBuy);
  const sellOrders = orders.filter(o => !o.isBuy);
  
  console.log(`\n📊 PAR DIRECTION:`);
  console.log(`  Achats: ${buyOrders.length} ordre(s) - ${buyOrders.filter(o => o.filled).length} exécuté(s)`);
  console.log(`  Ventes: ${sellOrders.length} ordre(s) - ${sellOrders.filter(o => o.filled).length} exécuté(s)`);

  // Raisons des non-exécutions
  const reasons = {};
  orders.filter(o => !o.filled && o.reason).forEach(o => {
    const reasonKey = o.reason.split(":")[0];
    reasons[reasonKey] = (reasons[reasonKey] || 0) + 1;
  });

  if (Object.keys(reasons).length > 0) {
    console.log(`\n⚠️  RAISONS DES NON-EXÉCUTIONS:`);
    for (const [reason, count] of Object.entries(reasons)) {
      console.log(`  ${reason}: ${count} ordre(s)`);
    }
  }

  // Détails des ordres non exécutés
  const unfilled = orders.filter(o => !o.filled);
  if (unfilled.length > 0) {
    console.log(`\n❌ ORDRES NON EXÉCUTÉS (${unfilled.length}):`);
    for (const order of unfilled) {
      console.log(`  - ${order.assetName} ${order.isBuy ? "ACHAT" : "VENTE"} @ ${order.limitPxHuman.toFixed(8)} USD (Block ${order.blockNumber})`);
      if (order.reason) {
        console.log(`    → ${order.reason}`);
      }
    }
  }

  // Détails des ordres exécutés
  const filled = orders.filter(o => o.filled);
  if (filled.length > 0) {
    console.log(`\n✅ ORDRES EXÉCUTÉS (${filled.length}):`);
    for (const order of filled) {
      console.log(`  - ${order.assetName} ${order.isBuy ? "ACHAT" : "VENTE"} @ ${order.limitPxHuman.toFixed(8)} USD (Block ${order.blockNumber})`);
    }
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

