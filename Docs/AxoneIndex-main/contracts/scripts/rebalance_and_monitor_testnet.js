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
  console.log("⚖️  REBALANCING ET MONITORING");
  console.log("=".repeat(80) + "\n");

  const vault = await ethers.getContractAt("VaultContract", VAULT);
  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);
  const l1read = await ethers.getContractAt("L1Read", L1READ);
  const signer = (await ethers.getSigners())[0];
  const who = await signer.getAddress();

  console.log("📝 Rebalancer:", who);
  console.log("⚙️  Handler:", HANDLER);
  console.log("📍 Vault:", VAULT);
  console.log("🔍 CoreViews:", CORE_VIEWS);

  // Vérifier que le signer est le rebalancer
  const rebalancer = await handler.rebalancer();
  console.log("🔐 Rebalancer configuré:", rebalancer);
  if (who.toLowerCase() !== rebalancer.toLowerCase()) {
    console.warn(`⚠️  Le signer (${who}) n'est pas le rebalancer configuré (${rebalancer})`);
  }

  // Obtenir les balances initiales sur Core
  console.log("\n" + "─".repeat(80));
  console.log("📊 BALANCES INITIALES SUR CORE:");
  console.log("─".repeat(80));
  
  const usdcTokenId = await handler.usdcCoreTokenId();
  const spotTokenBTC = await handler.spotTokenBTC();
  const spotTokenHYPE = await handler.spotTokenHYPE();
  
  let initialUsdcBalance = 0n;
  let initialBtcBalance = 0n;
  let initialHypeBalance = 0n;
  let initialEquity = 0n;
  
  try {
    const usdcBal = await l1read.spotBalance(HANDLER, usdcTokenId);
    initialUsdcBalance = usdcBal.total;
    console.log(`  USDC (Token ID ${usdcTokenId}):`);
    console.log(`    Total: ${initialUsdcBalance.toString()}`);
    console.log(`    Hold: ${usdcBal.hold.toString()}`);
    console.log(`    Available: ${(usdcBal.total - usdcBal.hold).toString()}`);
  } catch (e) {
    console.log(`  USDC: Erreur - ${e.message}`);
  }

  try {
    const btcBal = await l1read.spotBalance(HANDLER, spotTokenBTC);
    initialBtcBalance = btcBal.total;
    console.log(`  BTC (Token ID ${spotTokenBTC}):`);
    console.log(`    Total: ${btcBal.total.toString()}`);
    console.log(`    Hold: ${btcBal.hold.toString()}`);
    console.log(`    Available: ${(btcBal.total - btcBal.hold).toString()}`);
  } catch (e) {
    console.log(`  BTC: Erreur - ${e.message}`);
  }

  try {
    const hypeBal = await l1read.spotBalance(HANDLER, spotTokenHYPE);
    initialHypeBalance = hypeBal.total;
    console.log(`  HYPE (Token ID ${spotTokenHYPE}):`);
    console.log(`    Total: ${hypeBal.total.toString()}`);
    console.log(`    Hold: ${hypeBal.hold.toString()}`);
    console.log(`    Available: ${(hypeBal.total - hypeBal.hold).toString()}`);
  } catch (e) {
    console.log(`  HYPE: Erreur - ${e.message}`);
  }

  try {
    initialEquity = await views.equitySpotUsd1e18(HANDLER);
    console.log(`\n  Equity Core: ${ethers.formatEther(initialEquity)} USD`);
  } catch (e) {
    console.log(`  Equity: Erreur - ${e.message}`);
  }

  // Prix oracles avant
  let pxBtcBefore = 0n;
  let pxHypeBefore = 0n;
  try {
    pxBtcBefore = await views.oraclePxBtc1e8(HANDLER);
    pxHypeBefore = await views.oraclePxHype1e8(HANDLER);
    console.log(`\n  Prix BTC: ${ethers.formatUnits(pxBtcBefore, 8)} USD`);
    console.log(`  Prix HYPE: ${ethers.formatUnits(pxHypeBefore, 8)} USD`);
  } catch (e) {
    console.log(`  Erreur prix: ${e.message}`);
  }

  // NAV avant
  const navBefore = await vault.nav1e18();
  console.log(`  NAV: ${ethers.formatEther(navBefore)} USD`);

  // Lancer le rebalancing
  console.log("\n" + "─".repeat(80));
  console.log("⚖️  LANCEMENT DU REBALANCING:");
  console.log("─".repeat(80));
  
  console.log("\n📤 Envoi de la transaction rebalancePortfolio...");
  
  const tx = await sendWithRetry(
    () => handler.connect(signer).rebalancePortfolio(0, 0, { gasPrice }),
    "handler.rebalancePortfolio()"
  );
  console.log(`  ✅ Transaction envoyée: ${tx.hash}`);
  
  console.log(`  ⏳ Attente de la confirmation...`);
  const rcpt = await waitForReceipt(tx.hash);
  console.log(`  ✅ Transaction confirmée dans le bloc ${rcpt.blockNumber}`);

  // Analyser les événements
  console.log("\n" + "─".repeat(80));
  console.log("📋 ANALYSE DES ÉVÉNEMENTS:");
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

  if (handlerEvents.length > 0) {
    console.log(`\n✅ ${handlerEvents.length} événement(s) détecté(s):`);
    for (const event of handlerEvents) {
      console.log(`\n  📌 ${event.name}:`);
      if (event.name === "Rebalanced") {
        console.log(`    Rééquilibrage effectué:`);
        console.log(`      Delta BTC (1e18): ${event.args.dBtc1e18.toString()}`);
        console.log(`      Delta HYPE (1e18): ${event.args.dHype1e18.toString()}`);
        const dBtc = Number(event.args.dBtc1e18) / 1e18;
        const dHype = Number(event.args.dHype1e18) / 1e18;
        console.log(`      Delta BTC: ${dBtc >= 0 ? '+' : ''}${dBtc.toFixed(6)}`);
        console.log(`      Delta HYPE: ${dHype >= 0 ? '+' : ''}${dHype.toFixed(6)}`);
      } else if (event.name === "SpotOrderPlaced") {
        console.log(`    Ordre spot placé:`);
        console.log(`      Asset: ${event.args.asset.toString()}`);
        console.log(`      IsBuy: ${event.args.isBuy}`);
        console.log(`      LimitPx: ${ethers.formatUnits(event.args.limitPx1e8, 8)} USD`);
        console.log(`      Size (szDecimals): ${event.args.sizeSzDecimals.toString()}`);
      } else if (event.name === "OutboundToCore") {
        console.log(`    Transfert vers Core détecté`);
      } else if (event.name === "RebalanceSkipped") {
        console.log(`    ⚠️  Rééquilibrage ignoré: ${event.args.reason || 'raison inconnue'}`);
      } else {
        console.log(`    Args:`, event.args);
      }
    }
  } else {
    console.log(`\n⚠️  Aucun événement du handler détecté`);
  }

  // Attendre quelques blocs pour que les ordres soient exécutés
  console.log("\n⏳ Attente de quelques blocs pour que les transactions Core se propagent...");
  await delay(5000);

  // Vérifier les balances finales sur Core
  console.log("\n" + "─".repeat(80));
  console.log("📊 BALANCES FINALES SUR CORE:");
  console.log("─".repeat(80));

  let finalUsdcBalance = 0n;
  let finalBtcBalance = 0n;
  let finalHypeBalance = 0n;
  let finalEquity = 0n;

  try {
    const usdcBal = await l1read.spotBalance(HANDLER, usdcTokenId);
    finalUsdcBalance = usdcBal.total;
    const usdcDiff = finalUsdcBalance - initialUsdcBalance;
    console.log(`\n  USDC (Token ID ${usdcTokenId}):`);
    console.log(`    Total: ${finalUsdcBalance.toString()} (avant: ${initialUsdcBalance.toString()})`);
    console.log(`    Différence: ${usdcDiff > 0 ? '+' : ''}${usdcDiff.toString()}`);
    console.log(`    Hold: ${usdcBal.hold.toString()}`);
    console.log(`    Available: ${(usdcBal.total - usdcBal.hold).toString()}`);
  } catch (e) {
    console.log(`  USDC: Erreur - ${e.message}`);
  }

  try {
    const btcBal = await l1read.spotBalance(HANDLER, spotTokenBTC);
    finalBtcBalance = btcBal.total;
    const btcDiff = finalBtcBalance - initialBtcBalance;
    console.log(`\n  BTC (Token ID ${spotTokenBTC}):`);
    console.log(`    Total: ${finalBtcBalance.toString()} (avant: ${initialBtcBalance.toString()})`);
    console.log(`    Différence: ${btcDiff > 0 ? '+' : ''}${btcDiff.toString()}`);
    console.log(`    Hold: ${btcBal.hold.toString()}`);
    console.log(`    Available: ${(btcBal.total - btcBal.hold).toString()}`);
  } catch (e) {
    console.log(`  BTC: Erreur - ${e.message}`);
  }

  try {
    const hypeBal = await l1read.spotBalance(HANDLER, spotTokenHYPE);
    finalHypeBalance = hypeBal.total;
    const hypeDiff = finalHypeBalance - initialHypeBalance;
    console.log(`\n  HYPE (Token ID ${spotTokenHYPE}):`);
    console.log(`    Total: ${finalHypeBalance.toString()} (avant: ${initialHypeBalance.toString()})`);
    console.log(`    Différence: ${hypeDiff > 0 ? '+' : ''}${hypeDiff.toString()}`);
    console.log(`    Hold: ${hypeBal.hold.toString()}`);
    console.log(`    Available: ${(hypeBal.total - hypeBal.hold).toString()}`);
  } catch (e) {
    console.log(`  HYPE: Erreur - ${e.message}`);
  }

  try {
    finalEquity = await views.equitySpotUsd1e18(HANDLER);
    const equityDiff = finalEquity - initialEquity;
    console.log(`\n  Equity Core: ${ethers.formatEther(finalEquity)} USD`);
    console.log(`    (avant: ${ethers.formatEther(initialEquity)} USD)`);
    console.log(`    Différence: ${equityDiff > 0 ? '+' : ''}${ethers.formatEther(equityDiff)} USD`);
  } catch (e) {
    console.log(`  Equity: Erreur - ${e.message}`);
  }

  // Prix oracles après
  try {
    const pxBtcAfter = await views.oraclePxBtc1e8(HANDLER);
    const pxHypeAfter = await views.oraclePxHype1e8(HANDLER);
    console.log(`\n  Prix BTC: ${ethers.formatUnits(pxBtcAfter, 8)} USD`);
    console.log(`  Prix HYPE: ${ethers.formatUnits(pxHypeAfter, 8)} USD`);
  } catch (e) {
    console.log(`  Erreur prix: ${e.message}`);
  }

  // NAV après
  const navAfter = await vault.nav1e18();
  const navDiff = navAfter - navBefore;
  console.log(`  NAV: ${ethers.formatEther(navAfter)} USD`);
  console.log(`    (avant: ${ethers.formatEther(navBefore)} USD)`);
  console.log(`    Différence: ${navDiff > 0 ? '+' : ''}${ethers.formatEther(navDiff)} USD`);

  // Résumé
  console.log("\n" + "=".repeat(80));
  console.log("📊 RÉSUMÉ DU REBALANCING:");
  console.log("=".repeat(80));
  
  console.log(`\n✅ Transaction: ${tx.hash}`);
  console.log(`   Bloc: ${rcpt.blockNumber}`);
  
  const usdcDiff = finalUsdcBalance - initialUsdcBalance;
  const btcDiff = finalBtcBalance - initialBtcBalance;
  const hypeDiff = finalHypeBalance - initialHypeBalance;
  const equityDiff = finalEquity - initialEquity;
  
  console.log(`\n📈 Changements sur Core:`);
  console.log(`   USDC: ${usdcDiff > 0 ? '+' : ''}${usdcDiff.toString()}`);
  console.log(`   BTC: ${btcDiff > 0 ? '+' : ''}${btcDiff.toString()}`);
  console.log(`   HYPE: ${hypeDiff > 0 ? '+' : ''}${hypeDiff.toString()}`);
  console.log(`   Equity: ${equityDiff > 0 ? '+' : ''}${ethers.formatEther(equityDiff)} USD`);
  
  console.log(`\n💵 NAV:`);
  console.log(`   Avant: ${ethers.formatEther(navBefore)} USD`);
  console.log(`   Après: ${ethers.formatEther(navAfter)} USD`);
  console.log(`   Différence: ${navDiff > 0 ? '+' : ''}${ethers.formatEther(navDiff)} USD`);
  
  if (handlerEvents.some(e => e.name === "Rebalanced")) {
    console.log(`\n✅ Rééquilibrage effectué avec succès !`);
  } else {
    console.log(`\n⚠️  Aucun événement Rebalanced détecté - le rééquilibrage a peut-être été ignoré`);
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

