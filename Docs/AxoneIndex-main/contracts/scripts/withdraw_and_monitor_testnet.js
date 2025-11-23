const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  // Adresses du dernier déploiement (2025-11-21)
  const VAULT = process.env.VAULT || "0x72eEdd6cE1039E429e44F86b3DcA4A45e206a410";
  const HANDLER = process.env.HANDLER || "0x7551Ca74B5f2Cb3EF9f2e885f2fe9BF993bF570c";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x1E2B0DccE25Eeb479F83DABE24ab687C6AB64292";
  const L1READ = process.env.L1READ || "0xacE17480F4d157C48180f4ed10AB483238143e11";
  const WITHDRAW_PERCENTAGE = parseFloat(process.env.WITHDRAW_PERCENTAGE || "50"); // 50% par défaut
  const gasPrice = ethers.parseUnits(process.env.GAS_PRICE_GWEI || "2", "gwei");

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  const waitForReceipt = async (hash, retries = 90, intervalMs = 1500) => {
    for (let i = 0; i < retries; i++) {
      try {
        const rcpt = await ethers.provider.getTransactionReceipt(hash);
        if (rcpt) return rcpt;
      } catch (e) {
        // Ignorer erreurs transitoires
      }
      await delay(intervalMs);
    }
    throw new Error(`Timeout en attente du receipt: ${hash}`);
  };

  console.log("\n" + "=".repeat(80));
  console.log("💰 RETRAIT DE HYPE AVEC MONITORING COMPLET");
  console.log("=".repeat(80) + "\n");

  const [signer] = await ethers.getSigners();
  const vault = await ethers.getContractAt("VaultContract", VAULT);
  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);
  const l1read = await ethers.getContractAt("L1Read", L1READ);

  console.log("📝 Signer:", signer.address);
  console.log("📍 Vault:", VAULT);
  console.log("⚙️  Handler:", HANDLER);
  console.log("🔍 CoreViews:", CORE_VIEWS);

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
  } catch (e) {
    console.log(`  USDC: Erreur - ${e.message}`);
  }

  try {
    const btcBal = await l1read.spotBalance(HANDLER, spotTokenBTC);
    initialBtcBalance = btcBal.total;
    console.log(`  BTC (Token ID ${spotTokenBTC}):`);
    console.log(`    Total: ${btcBal.total.toString()}`);
    console.log(`    Hold: ${btcBal.hold.toString()}`);
  } catch (e) {
    console.log(`  BTC: Erreur - ${e.message}`);
  }

  try {
    const hypeBal = await l1read.spotBalance(HANDLER, spotTokenHYPE);
    initialHypeBalance = hypeBal.total;
    console.log(`  HYPE (Token ID ${spotTokenHYPE}):`);
    console.log(`    Total: ${hypeBal.total.toString()}`);
    console.log(`    Hold: ${hypeBal.hold.toString()}`);
  } catch (e) {
    console.log(`  HYPE: Erreur - ${e.message}`);
  }

  try {
    initialEquity = await views.equitySpotUsd1e18(HANDLER);
    console.log(`  Equity Core: ${ethers.formatEther(initialEquity)} USD`);
  } catch (e) {
    console.log(`  Equity: Erreur - ${e.message}`);
  }

  // Balances EVM initiales
  const vaultBalanceBefore = await ethers.provider.getBalance(VAULT);
  const signerBalanceBefore = await ethers.provider.getBalance(signer.address);
  const signerSharesBefore = await vault.balanceOf(signer.address);
  const navBefore = await vault.nav1e18();
  const ppsBefore = await vault.pps1e18();
  const totalSupplyBefore = await vault.totalSupply();
  // Obtenir la longueur de la file d'attente en essayant de lire jusqu'à erreur
  let queueLengthBefore = 0;
  try {
    while (true) {
      await vault.withdrawQueue(queueLengthBefore);
      queueLengthBefore++;
    }
  } catch {
    // Fin du tableau atteinte
  }
  
  console.log(`\n  Vault HYPE balance: ${ethers.formatEther(vaultBalanceBefore)} HYPE`);
  console.log(`  Signer HYPE balance: ${ethers.formatEther(signerBalanceBefore)} HYPE`);
  console.log(`  Signer shares: ${ethers.formatEther(signerSharesBefore)} sAXN1`);
  console.log(`  NAV: ${ethers.formatEther(navBefore)} USD`);
  console.log(`  PPS: ${ethers.formatEther(ppsBefore)} USD`);
  console.log(`  Total Supply: ${ethers.formatEther(totalSupplyBefore)} sAXN1`);
  console.log(`  File d'attente: ${queueLengthBefore.toString()} demande(s)`);

  // Prix oracle
  const pxHype = await views.oraclePxHype1e8(HANDLER);
  console.log(`  Prix HYPE: ${ethers.formatUnits(pxHype, 8)} USD`);

  // Calculer le montant à retirer
  if (signerSharesBefore === 0n) {
    throw new Error("Le signer n'a pas de shares à retirer");
  }

  const withdrawPercentage = WITHDRAW_PERCENTAGE / 100;
  const sharesToWithdraw = signerSharesBefore * BigInt(Math.floor(withdrawPercentage * 10000)) / BigInt(10000);
  
  // Calculer le montant HYPE estimé
  const estimatedUsd1e18 = (sharesToWithdraw * ppsBefore) / BigInt(1e18);
  const estimatedHype1e18 = (estimatedUsd1e18 * BigInt(1e8)) / pxHype;
  
  // Frais de retrait
  const grossHype1e18 = estimatedHype1e18;
  const withdrawFeeBps = await vault.getWithdrawFeeBpsForAmount(grossHype1e18);
  const feeHype1e18 = withdrawFeeBps > 0 
    ? (grossHype1e18 * BigInt(withdrawFeeBps)) / BigInt(10000)
    : BigInt(0);
  const netHype1e18 = grossHype1e18 - feeHype1e18;
  
  console.log(`\n📊 Détails du retrait:`);
  console.log(`  Pourcentage: ${WITHDRAW_PERCENTAGE}%`);
  console.log(`  Shares à retirer: ${ethers.formatEther(sharesToWithdraw)} sAXN1`);
  console.log(`  Montant HYPE brut estimé: ${ethers.formatEther(grossHype1e18)} HYPE`);
  console.log(`  Frais de retrait (${withdrawFeeBps} bps): ${ethers.formatEther(feeHype1e18)} HYPE`);
  console.log(`  Montant net estimé: ${ethers.formatEther(netHype1e18)} HYPE`);
  console.log(`  Cash disponible dans le vault: ${ethers.formatEther(vaultBalanceBefore)} HYPE`);
  
  const willBeQueued = vaultBalanceBefore < netHype1e18;
  if (willBeQueued) {
    console.log(`\n⚠️  Le vault n'a pas assez de cash. Le retrait sera ajouté à la file d'attente.`);
    console.log(`    Le handler devra rappeler des fonds de Core si nécessaire.`);
  } else {
    console.log(`\n✅ Le vault a assez de cash. Le retrait devrait être effectué immédiatement.`);
  }

  // Effectuer le retrait
  console.log("\n" + "─".repeat(80));
  console.log("📤 ENVOI DU RETRAIT:");
  console.log("─".repeat(80));
  console.log(`\n📤 Envoi de la transaction de retrait...`);
  
  const tx = await vault.withdraw(sharesToWithdraw, { gasPrice });
  console.log(`  Tx hash: ${tx.hash}`);
  
  console.log(`  ⏳ Attente de la confirmation...`);
  const rcpt = await waitForReceipt(tx.hash);
  console.log(`  ✅ Transaction confirmée (block: ${rcpt.blockNumber})`);

  // Analyser les événements
  console.log("\n" + "─".repeat(80));
  console.log("📋 ANALYSE DES ÉVÉNEMENTS:");
  console.log("─".repeat(80));

  // Événements du vault
  const withdrawRequestedEvent = rcpt.logs.find(log => {
    try {
      const parsed = vault.interface.parseLog(log);
      return parsed && parsed.name === "WithdrawRequested";
    } catch {
      return false;
    }
  });

  const withdrawPaidEvent = rcpt.logs.find(log => {
    try {
      const parsed = vault.interface.parseLog(log);
      return parsed && parsed.name === "WithdrawPaid";
    } catch {
      return false;
    }
  });

  if (withdrawPaidEvent) {
    const parsed = vault.interface.parseLog(withdrawPaidEvent);
    console.log(`\n✅ Événement WithdrawPaid:`);
    console.log(`  Montant retiré: ${ethers.formatEther(parsed.args.amount1e18)} HYPE`);
    console.log(`  Destinataire: ${parsed.args.to}`);
    console.log(`  ✅ Retrait effectué immédiatement (cash disponible)`);
  } else if (withdrawRequestedEvent) {
    const parsed = vault.interface.parseLog(withdrawRequestedEvent);
    console.log(`\n📋 Événement WithdrawRequested:`);
    console.log(`  ID de la demande: ${parsed.args.id.toString()}`);
    console.log(`  Shares: ${ethers.formatEther(parsed.args.shares)} sAXN1`);
    console.log(`  Utilisateur: ${parsed.args.user}`);
    console.log(`  ⚠️  Retrait ajouté à la file d'attente (cash insuffisant)`);
  }

  // Événements du handler
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
    console.log(`\n⚙️  Événements du Handler:`);
    for (const event of handlerEvents) {
      console.log(`  - ${event.name}`);
      if (event.name === "InboundFromCore") {
        console.log(`    Transfert depuis Core: ${ethers.formatUnits(event.args.amount1e8, 8)} USD`);
      } else if (event.name === "SpotOrderPlaced") {
        console.log(`    Ordre spot placé:`);
        console.log(`      Asset: ${event.args.asset.toString()}`);
        console.log(`      IsBuy: ${event.args.isBuy}`);
        console.log(`      LimitPx: ${ethers.formatUnits(event.args.limitPx1e8, 8)} USD`);
      } else if (event.name === "Rebalanced") {
        console.log(`    Rééquilibrage effectué`);
      }
    }
  }

  // Attendre quelques blocs pour que les transactions Core se propagent
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
    console.log(`  USDC (Token ID ${usdcTokenId}):`);
    console.log(`    Total: ${finalUsdcBalance.toString()} (avant: ${initialUsdcBalance.toString()})`);
    console.log(`    Différence: ${usdcDiff > 0 ? '+' : ''}${usdcDiff.toString()}`);
    console.log(`    Hold: ${usdcBal.hold.toString()}`);
  } catch (e) {
    console.log(`  USDC: Erreur - ${e.message}`);
  }

  try {
    const btcBal = await l1read.spotBalance(HANDLER, spotTokenBTC);
    finalBtcBalance = btcBal.total;
    const btcDiff = finalBtcBalance - initialBtcBalance;
    console.log(`  BTC (Token ID ${spotTokenBTC}):`);
    console.log(`    Total: ${finalBtcBalance.toString()} (avant: ${initialBtcBalance.toString()})`);
    console.log(`    Différence: ${btcDiff > 0 ? '+' : ''}${btcDiff.toString()}`);
    console.log(`    Hold: ${btcBal.hold.toString()}`);
  } catch (e) {
    console.log(`  BTC: Erreur - ${e.message}`);
  }

  try {
    const hypeBal = await l1read.spotBalance(HANDLER, spotTokenHYPE);
    finalHypeBalance = hypeBal.total;
    const hypeDiff = finalHypeBalance - initialHypeBalance;
    console.log(`  HYPE (Token ID ${spotTokenHYPE}):`);
    console.log(`    Total: ${finalHypeBalance.toString()} (avant: ${initialHypeBalance.toString()})`);
    console.log(`    Différence: ${hypeDiff > 0 ? '+' : ''}${hypeDiff.toString()}`);
    console.log(`    Hold: ${hypeBal.hold.toString()}`);
  } catch (e) {
    console.log(`  HYPE: Erreur - ${e.message}`);
  }

  try {
    finalEquity = await views.equitySpotUsd1e18(HANDLER);
    const equityDiff = finalEquity - initialEquity;
    console.log(`  Equity Core: ${ethers.formatEther(finalEquity)} USD`);
    console.log(`    (avant: ${ethers.formatEther(initialEquity)} USD)`);
    console.log(`    Différence: ${equityDiff > 0 ? '+' : ''}${ethers.formatEther(equityDiff)} USD`);
  } catch (e) {
    console.log(`  Equity: Erreur - ${e.message}`);
  }

  // Vérifier les balances finales EVM
  const vaultBalanceAfter = await ethers.provider.getBalance(VAULT);
  const signerBalanceAfter = await ethers.provider.getBalance(signer.address);
  const signerSharesAfter = await vault.balanceOf(signer.address);
  const navAfter = await vault.nav1e18();
  const ppsAfter = await vault.pps1e18();
  const totalSupplyAfter = await vault.totalSupply();
  // Obtenir la longueur de la file d'attente en essayant de lire jusqu'à erreur
  let queueLengthAfter = 0;
  try {
    while (true) {
      await vault.withdrawQueue(queueLengthAfter);
      queueLengthAfter++;
    }
  } catch {
    // Fin du tableau atteinte
  }

  console.log(`\n  Vault HYPE balance: ${ethers.formatEther(vaultBalanceAfter)} HYPE`);
  console.log(`    (avant: ${ethers.formatEther(vaultBalanceBefore)} HYPE)`);
  console.log(`    Différence: ${ethers.formatEther(vaultBalanceAfter - vaultBalanceBefore)} HYPE`);
  console.log(`  Signer HYPE balance: ${ethers.formatEther(signerBalanceAfter)} HYPE`);
  console.log(`    (avant: ${ethers.formatEther(signerBalanceBefore)} HYPE)`);
  console.log(`    Différence: ${ethers.formatEther(signerBalanceAfter - signerBalanceBefore)} HYPE`);
  console.log(`  Signer shares: ${ethers.formatEther(signerSharesAfter)} sAXN1`);
  console.log(`    (avant: ${ethers.formatEther(signerSharesBefore)} sAXN1)`);
  console.log(`    Différence: ${ethers.formatEther(signerSharesAfter - signerSharesBefore)} sAXN1`);
  console.log(`  NAV: ${ethers.formatEther(navAfter)} USD`);
  console.log(`    (avant: ${ethers.formatEther(navBefore)} USD)`);
  console.log(`    Différence: ${ethers.formatEther(navAfter - navBefore)} USD`);
  console.log(`  PPS: ${ethers.formatEther(ppsAfter)} USD`);
  console.log(`    (avant: ${ethers.formatEther(ppsBefore)} USD)`);
  console.log(`  Total Supply: ${ethers.formatEther(totalSupplyAfter)} sAXN1`);
  console.log(`    (avant: ${ethers.formatEther(totalSupplyBefore)} sAXN1)`);
  console.log(`  File d'attente: ${queueLengthAfter} demande(s)`);
  console.log(`    (avant: ${queueLengthBefore} demande(s))`);

  // Vérifier la file d'attente si nécessaire
  if (queueLengthAfter > 0) {
    console.log("\n" + "─".repeat(80));
    console.log("📋 FILE D'ATTENTE DES RETRAITS:");
    console.log("─".repeat(80));
    
    for (let i = 0; i < queueLengthAfter; i++) {
      const request = await vault.withdrawQueue(i);
      console.log(`\n  Retrait #${i}:`);
      console.log(`    Utilisateur: ${request.user}`);
      console.log(`    Shares: ${ethers.formatEther(request.shares)} sAXN1`);
      console.log(`    Frais (bps): ${request.feeBpsSnapshot.toString()}`);
      console.log(`    Statut: ${request.settled ? "✅ Règlementé" : "⏳ En attente"}`);
    }
  }

  // Résumé final
  console.log("\n" + "=".repeat(80));
  console.log("📊 RÉSUMÉ COMPLET DU RETRAIT:");
  console.log("=".repeat(80));
  
  console.log(`\n✅ Transaction: ${tx.hash}`);
  console.log(`   Bloc: ${rcpt.blockNumber}`);
  
  const actualHypeReceived = signerBalanceAfter - signerBalanceBefore;
  const actualSharesBurned = signerSharesBefore - signerSharesAfter;
  
  console.log(`\n💰 RETRAIT EFFECTUÉ:`);
  console.log(`   Shares retirées: ${ethers.formatEther(actualSharesBurned)} sAXN1`);
  console.log(`   HYPE reçu: ${ethers.formatEther(actualHypeReceived)} HYPE`);
  console.log(`   HYPE attendu (net): ${ethers.formatEther(netHype1e18)} HYPE`);
  
  if (withdrawPaidEvent) {
    console.log(`\n✅ MODE: Retrait immédiat (cash disponible)`);
  } else if (withdrawRequestedEvent) {
    console.log(`\n⏳ MODE: Retrait en file d'attente (cash insuffisant)`);
  }
  
  console.log(`\n📈 CHANGEMENTS SUR CORE:`);
  const usdcDiff = finalUsdcBalance - initialUsdcBalance;
  const btcDiff = finalBtcBalance - initialBtcBalance;
  const hypeDiff = finalHypeBalance - initialHypeBalance;
  const equityDiff = finalEquity - initialEquity;
  
  console.log(`   USDC: ${usdcDiff > 0 ? '+' : ''}${usdcDiff.toString()}`);
  console.log(`   BTC: ${btcDiff > 0 ? '+' : ''}${btcDiff.toString()}`);
  console.log(`   HYPE: ${hypeDiff > 0 ? '+' : ''}${hypeDiff.toString()}`);
  console.log(`   Equity: ${equityDiff > 0 ? '+' : ''}${ethers.formatEther(equityDiff)} USD`);
  
  console.log(`\n💵 CHANGEMENTS EVM:`);
  console.log(`   Vault HYPE: ${ethers.formatEther(vaultBalanceAfter - vaultBalanceBefore)} HYPE`);
  console.log(`   Signer HYPE: ${ethers.formatEther(actualHypeReceived)} HYPE`);
  console.log(`   NAV: ${ethers.formatEther(navAfter - navBefore)} USD`);
  console.log(`   Total Supply: ${ethers.formatEther(totalSupplyAfter - totalSupplyBefore)} sAXN1`);

  console.log("\n" + "=".repeat(80));
  console.log("✅ Monitoring terminé");
  console.log("=".repeat(80) + "\n");
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

