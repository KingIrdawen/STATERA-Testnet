const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  // Adresses ERA_2 du dernier déploiement (2025-11-21)
  const VAULT = process.env.VAULT || "0x3F60ff8c0838965A981B115E86E1d2567266b021";
  const HANDLER = process.env.HANDLER || "0xb0e110f9236a6c48BE31E0EEaa26272e5973Bc5b";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x71a2B85dD822782A8031549f9B35629a5759F81B";
  const L1READ = process.env.L1READ || "0x2021BFd4D98ffE9fB1AC5B757a50005fEbF684D3";
  const gasPrice = ethers.parseUnits(process.env.GAS_PRICE_GWEI || "2", "gwei");

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
  console.log("⚖️  REBALANCING ERA_2 ET MONITORING");
  console.log("=".repeat(80) + "\n");

  const vault = await ethers.getContractAt("src/ERA_2/VaultContract.sol:VaultContract", VAULT);
  const handler = await ethers.getContractAt("src/ERA_2/CoreInteractionHandler.sol:CoreInteractionHandler", HANDLER);
  const views = await ethers.getContractAt("src/ERA_2/CoreInteractionViews.sol:CoreInteractionViews", CORE_VIEWS);
  const l1read = await ethers.getContractAt("src/ERA_2/interfaces/L1Read.sol:L1Read", L1READ);
  const signer = (await ethers.getSigners())[0];
  const who = await signer.getAddress();

  console.log("📝 Rebalancer:", who);
  console.log("⚙️  Handler:", HANDLER);
  console.log("📍 Vault ERA_2:", VAULT);
  console.log("🔍 CoreViews:", CORE_VIEWS);

  // Vérifier que le signer est le rebalancer
  const rebalancer = await handler.rebalancer();
  console.log("🔐 Rebalancer configuré:", rebalancer);
  if (who.toLowerCase() !== rebalancer.toLowerCase()) {
    console.warn(`⚠️  Le signer (${who}) n'est pas le rebalancer configuré (${rebalancer})`);
    console.warn(`   Le rebalance peut échouer si le signer n'est pas autorisé.`);
  }

  // Obtenir les balances initiales sur Core
  console.log("\n" + "─".repeat(80));
  console.log("📊 BALANCES INITIALES SUR CORE:");
  console.log("─".repeat(80));
  
  const usdcTokenId = await handler.usdcCoreTokenId();
  const spotTokenTOKEN1 = await handler.spotTokenTOKEN1();
  const spotTokenHYPE = await handler.spotTokenHYPE();
  
  let initialUsdcBalance = 0n;
  let initialToken1Balance = 0n;
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
    const token1Bal = await l1read.spotBalance(HANDLER, spotTokenTOKEN1);
    initialToken1Balance = token1Bal.total;
    console.log(`  TOKEN1 (Token ID ${spotTokenTOKEN1}):`);
    console.log(`    Total: ${token1Bal.total.toString()}`);
    console.log(`    Hold: ${token1Bal.hold.toString()}`);
    console.log(`    Available: ${(token1Bal.total - token1Bal.hold).toString()}`);
  } catch (e) {
    console.log(`  TOKEN1: Erreur - ${e.message}`);
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
    initialEquity = await views.equitySpotUsd1e18(handler);
    console.log(`\n  Equity Core: ${ethers.formatEther(initialEquity)} USD`);
  } catch (e) {
    console.log(`  Equity: Erreur - ${e.message}`);
  }

  // Prix oracles avant
  let pxToken1Before = 0n;
  let pxHypeBefore = 0n;
  try {
    pxToken1Before = await views.oraclePxToken11e8(handler);
    pxHypeBefore = await views.oraclePxHype1e8(handler);
    console.log(`\n  Prix TOKEN1: ${ethers.formatUnits(pxToken1Before, 8)} USD`);
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
        const dToken1 = event.args.dToken11e18 || event.args[0];
        const dHype = event.args.dHype1e18 || event.args[1];
        console.log(`      Delta TOKEN1 (1e18): ${dToken1.toString()}`);
        console.log(`      Delta HYPE (1e18): ${dHype.toString()}`);
        const dT1 = Number(dToken1) / 1e18;
        const dH = Number(dHype) / 1e18;
        console.log(`      Delta TOKEN1: ${dT1 >= 0 ? '+' : ''}${dT1.toFixed(6)}`);
        console.log(`      Delta HYPE: ${dH >= 0 ? '+' : ''}${dH.toFixed(6)}`);
      } else if (event.name === "SpotOrderPlaced") {
        console.log(`    Ordre spot placé:`);
        console.log(`      Asset: ${event.args.asset.toString()}`);
        console.log(`      IsBuy: ${event.args.isBuy}`);
        console.log(`      LimitPx: ${ethers.formatUnits(event.args.limitPx1e8, 8)} USD`);
        console.log(`      Size (szDecimals): ${event.args.sizeSzDecimals.toString()}`);
      } else if (event.name === "OutboundToCore") {
        console.log(`    Transfert vers Core détecté`);
      } else if (event.name === "RebalanceSkippedOracleDeviation") {
        console.log(`    ⚠️  Rééquilibrage ignoré à cause d'une déviation oracle`);
        console.log(`      Prix TOKEN1: ${ethers.formatUnits(event.args.pxT1 || event.args[0], 8)} USD`);
        console.log(`      Prix HYPE: ${ethers.formatUnits(event.args.pxH || event.args[1], 8)} USD`);
      } else {
        console.log(`    Args:`, event.args);
      }
    }
  } else {
    console.log(`\n⚠️  Aucun événement du handler détecté`);
  }

  // Attendre quelques blocs pour que les ordres soient exécutés
  console.log("\n⏳ Attente de quelques blocs pour que les transactions Core se propagent...");
  await delay(8000);

  // Vérifier les balances finales sur Core
  console.log("\n" + "─".repeat(80));
  console.log("📊 BALANCES FINALES SUR CORE:");
  console.log("─".repeat(80));

  let finalUsdcBalance = 0n;
  let finalToken1Balance = 0n;
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
    const token1Bal = await l1read.spotBalance(HANDLER, spotTokenTOKEN1);
    finalToken1Balance = token1Bal.total;
    const token1Diff = finalToken1Balance - initialToken1Balance;
    console.log(`\n  TOKEN1 (Token ID ${spotTokenTOKEN1}):`);
    console.log(`    Total: ${finalToken1Balance.toString()} (avant: ${initialToken1Balance.toString()})`);
    console.log(`    Différence: ${token1Diff > 0 ? '+' : ''}${token1Diff.toString()}`);
    console.log(`    Hold: ${token1Bal.hold.toString()}`);
    console.log(`    Available: ${(token1Bal.total - token1Bal.hold).toString()}`);
  } catch (e) {
    console.log(`  TOKEN1: Erreur - ${e.message}`);
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
    finalEquity = await views.equitySpotUsd1e18(handler);
    const equityDiff = finalEquity - initialEquity;
    console.log(`\n  Equity Core: ${ethers.formatEther(finalEquity)} USD`);
    console.log(`    (avant: ${ethers.formatEther(initialEquity)} USD)`);
    console.log(`    Différence: ${equityDiff > 0 ? '+' : ''}${ethers.formatEther(equityDiff)} USD`);
  } catch (e) {
    console.log(`  Equity: Erreur - ${e.message}`);
  }

  // Prix oracles après
  try {
    const pxToken1After = await views.oraclePxToken11e8(handler);
    const pxHypeAfter = await views.oraclePxHype1e8(handler);
    console.log(`\n  Prix TOKEN1: ${ethers.formatUnits(pxToken1After, 8)} USD`);
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
  const token1Diff = finalToken1Balance - initialToken1Balance;
  const hypeDiff = finalHypeBalance - initialHypeBalance;
  const equityDiff = finalEquity - initialEquity;
  
  console.log(`\n📈 Changements sur Core:`);
  console.log(`   USDC: ${usdcDiff > 0 ? '+' : ''}${usdcDiff.toString()}`);
  console.log(`   TOKEN1: ${token1Diff > 0 ? '+' : ''}${token1Diff.toString()}`);
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
    console.log(`   (ex: deadband pas dépassé, déviation oracle, etc.)`);
  }

  console.log("\n" + "=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  if (e.data) {
    console.error("Données:", e.data);
  }
  process.exit(1);
});


