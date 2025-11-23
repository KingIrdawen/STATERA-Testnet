const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  // Adresses du dernier déploiement (2025-11-21)
  const VAULT = process.env.VAULT || "0x72eEdd6cE1039E429e44F86b3DcA4A45e206a410";
  const HANDLER = process.env.HANDLER || "0x7551Ca74B5f2Cb3EF9f2e885f2fe9BF993bF570c";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x1E2B0DccE25Eeb479F83DABE24ab687C6AB64292";
  const L1READ = process.env.L1READ || "0xacE17480F4d157C48180f4ed10AB483238143e11";
  const RECALL_AMOUNT_HYPE = process.env.RECALL_AMOUNT_HYPE || "0.5"; // 0.5 HYPE par défaut, ou "all" pour tout
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
  console.log("🔄 RAPPEL DES FONDS DE CORE VERS LE VAULT");
  console.log("=".repeat(80) + "\n");

  const [signer] = await ethers.getSigners();
  const vault = await ethers.getContractAt("VaultContract", VAULT);
  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);
  const l1read = await ethers.getContractAt("L1Read", L1READ);

  console.log("📝 Signer:", signer.address);
  console.log("📍 Vault:", VAULT);
  console.log("⚙️  Handler:", HANDLER);

  // Vérifier que le signer est le owner
  const vaultOwner = await vault.owner();
  if (signer.address.toLowerCase() !== vaultOwner.toLowerCase()) {
    throw new Error(`Le signer (${signer.address}) n'est pas le owner du vault (${vaultOwner})`);
  }
  console.log("✅ Signer est le owner du vault");

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
  const handlerBalanceBefore = await ethers.provider.getBalance(HANDLER);
  
  console.log(`\n  Vault HYPE balance: ${ethers.formatEther(vaultBalanceBefore)} HYPE`);
  console.log(`  Handler HYPE balance: ${ethers.formatEther(handlerBalanceBefore)} HYPE`);

  // Prix oracle HYPE
  const pxHype = await views.oraclePxHype1e8(HANDLER);
  console.log(`  Prix HYPE: ${ethers.formatUnits(pxHype, 8)} USD`);

  // Vérifier la réserve USDC
  const usdcReserveBps = await handler.usdcReserveBps();
  console.log(`  Réserve USDC: ${usdcReserveBps.toString()} bps (${(Number(usdcReserveBps) / 100).toFixed(2)}%)`);

  // Calculer le montant maximum qu'on peut rappeler sans violer la réserve
  // Réserve requise = equity * usdcReserveBps / 10000
  const reserveRequired1e8 = (initialEquity * BigInt(usdcReserveBps)) / BigInt(10000) / BigInt(1e10);
  const availableUsdc1e8 = initialUsdcBalance > reserveRequired1e8 ? initialUsdcBalance - reserveRequired1e8 : 0n;
  const maxHypeRecallable1e18 = (availableUsdc1e8 * BigInt(1e10) * BigInt(1e8)) / pxHype;
  // Arrondir au multiple de 1e10
  const maxHypeRecallableRounded = (maxHypeRecallable1e18 / BigInt(1e10)) * BigInt(1e10);
  
  console.log(`\n📊 Calcul du montant maximum rappelable:`);
  console.log(`  Réserve USDC requise: ${ethers.formatUnits(reserveRequired1e8, 8)} USD`);
  console.log(`  USDC disponible (après réserve): ${ethers.formatUnits(availableUsdc1e8, 8)} USD`);
  console.log(`  HYPE maximum rappelable: ${ethers.formatEther(maxHypeRecallableRounded)} HYPE`);

  // Calculer le montant à rappeler
  let recallAmount1e18;
  if (RECALL_AMOUNT_HYPE.toLowerCase() === "all") {
    // Rappeler tout l'equity en HYPE
    const equityInHype1e18 = (initialEquity * BigInt(1e8)) / pxHype;
    // Arrondir au multiple de 1e10 le plus proche
    recallAmount1e18 = (equityInHype1e18 / BigInt(1e10)) * BigInt(1e10);
    console.log(`\n📊 Calcul du montant à rappeler (tout l'equity):`);
    console.log(`  Equity: ${ethers.formatEther(initialEquity)} USD`);
    console.log(`  Équivalent HYPE: ${ethers.formatEther(equityInHype1e18)} HYPE`);
    console.log(`  Montant arrondi (multiple de 1e10): ${ethers.formatEther(recallAmount1e18)} HYPE`);
  } else {
    recallAmount1e18 = ethers.parseEther(RECALL_AMOUNT_HYPE);
    // Arrondir au multiple de 1e10 le plus proche
    recallAmount1e18 = (recallAmount1e18 / BigInt(1e10)) * BigInt(1e10);
    console.log(`\n📊 Montant demandé: ${ethers.formatEther(recallAmount1e18)} HYPE`);
    
    // Vérifier que le montant ne dépasse pas le maximum
    if (recallAmount1e18 > maxHypeRecallableRounded) {
      console.log(`\n⚠️  Le montant demandé dépasse le maximum rappelable.`);
      console.log(`   Utilisation du maximum: ${ethers.formatEther(maxHypeRecallableRounded)} HYPE`);
      recallAmount1e18 = maxHypeRecallableRounded;
    }
    
    console.log(`   Montant final à rappeler: ${ethers.formatEther(recallAmount1e18)} HYPE`);
  }

  if (recallAmount1e18 === 0n) {
    throw new Error("Montant à rappeler est zéro (probablement à cause de la réserve USDC)");
  }

  // Vérifier que le montant est un multiple de 1e10
  if (recallAmount1e18 % BigInt(1e10) !== 0n) {
    throw new Error(`Le montant doit être un multiple de 1e10. Montant: ${recallAmount1e18.toString()}`);
  }

  // Effectuer le rappel
  console.log("\n" + "─".repeat(80));
  console.log("📤 ENVOI DU RAPPEL:");
  console.log("─".repeat(80));
  console.log(`\n📤 Envoi de la transaction recallFromCoreAndSweep...`);
  console.log(`  Montant: ${ethers.formatEther(recallAmount1e18)} HYPE`);
  
  const tx = await vault.recallFromCoreAndSweep(recallAmount1e18, { gasPrice });
  console.log(`  Tx hash: ${tx.hash}`);
  
  console.log(`  ⏳ Attente de la confirmation...`);
  const rcpt = await waitForReceipt(tx.hash);
  console.log(`  ✅ Transaction confirmée (block: ${rcpt.blockNumber})`);

  // Analyser les événements
  console.log("\n" + "─".repeat(80));
  console.log("📋 ANALYSE DES ÉVÉNEMENTS:");
  console.log("─".repeat(80));

  // Événements du vault
  const recallEvent = rcpt.logs.find(log => {
    try {
      const parsed = vault.interface.parseLog(log);
      return parsed && parsed.name === "RecallAndSweep";
    } catch {
      return false;
    }
  });

  if (recallEvent) {
    const parsed = vault.interface.parseLog(recallEvent);
    console.log(`\n✅ Événement RecallAndSweep:`);
    console.log(`  Montant rappelé: ${ethers.formatEther(parsed.args.amount1e18)} HYPE`);
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
      if (event.name === "SweepWithFee") {
        console.log(`    Montant brut: ${ethers.formatUnits(event.args.gross1e8, 8)} HYPE`);
        console.log(`    Frais: ${ethers.formatUnits(event.args.fee1e8, 8)} HYPE`);
        console.log(`    Montant net: ${ethers.formatUnits(event.args.net1e8, 8)} HYPE`);
      } else if (event.name === "SpotOrderPlaced") {
        console.log(`    Ordre spot placé:`);
        console.log(`      Asset: ${event.args.asset.toString()}`);
        console.log(`      IsBuy: ${event.args.isBuy}`);
        console.log(`      LimitPx: ${ethers.formatUnits(event.args.limitPx1e8, 8)} USD`);
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
  const handlerBalanceAfter = await ethers.provider.getBalance(HANDLER);

  console.log(`\n  Vault HYPE balance: ${ethers.formatEther(vaultBalanceAfter)} HYPE`);
  console.log(`    (avant: ${ethers.formatEther(vaultBalanceBefore)} HYPE)`);
  console.log(`    Différence: ${ethers.formatEther(vaultBalanceAfter - vaultBalanceBefore)} HYPE`);
  console.log(`  Handler HYPE balance: ${ethers.formatEther(handlerBalanceAfter)} HYPE`);
  console.log(`    (avant: ${ethers.formatEther(handlerBalanceBefore)} HYPE)`);
  console.log(`    Différence: ${ethers.formatEther(handlerBalanceAfter - handlerBalanceBefore)} HYPE`);

  // Résumé final
  console.log("\n" + "=".repeat(80));
  console.log("📊 RÉSUMÉ COMPLET DU RAPPEL:");
  console.log("=".repeat(80));
  
  console.log(`\n✅ Transaction: ${tx.hash}`);
  console.log(`   Bloc: ${rcpt.blockNumber}`);
  
  const actualHypeReceived = vaultBalanceAfter - vaultBalanceBefore;
  
  console.log(`\n💰 RAPPEL EFFECTUÉ:`);
  console.log(`   Montant demandé: ${ethers.formatEther(recallAmount1e18)} HYPE`);
  console.log(`   HYPE reçu par le vault: ${ethers.formatEther(actualHypeReceived)} HYPE`);
  
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
  console.log(`   Vault HYPE: ${ethers.formatEther(actualHypeReceived)} HYPE`);
  console.log(`   Handler HYPE: ${ethers.formatEther(handlerBalanceAfter - handlerBalanceBefore)} HYPE`);

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

