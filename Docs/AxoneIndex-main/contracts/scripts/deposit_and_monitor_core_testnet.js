const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  // Adresses du dernier déploiement (2025-11-21)
  const VAULT = process.env.VAULT || "0x72eEdd6cE1039E429e44F86b3DcA4A45e206a410";
  const HANDLER = process.env.HANDLER || "0x7551Ca74B5f2Cb3EF9f2e885f2fe9BF993bF570c";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x1E2B0DccE25Eeb479F83DABE24ab687C6AB64292";
  const L1READ = process.env.L1READ || "0xacE17480F4d157C48180f4ed10AB483238143e11";
  
  const DEPOSIT_AMOUNT = process.env.DEPOSIT_AMOUNT || "0.6"; // HYPE à déposer
  const gasPrice = ethers.parseUnits(process.env.GAS_PRICE_GWEI || "2", "gwei");

  const [signer] = await ethers.getSigners();
  console.log("\n" + "=".repeat(80));
  console.log("💰 DÉPÔT DE HYPE AVEC MONITORING DU TRANSFERT VERS CORE");
  console.log("=".repeat(80) + "\n");

  const vault = await ethers.getContractAt("VaultContract", VAULT);
  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);
  const l1read = await ethers.getContractAt("L1Read", L1READ);

  console.log("📝 Signer:", signer.address);
  console.log("📍 Vault:", VAULT);
  console.log("⚙️  Handler:", HANDLER);
  console.log("🔍 CoreViews:", CORE_VIEWS);
  console.log("📡 L1Read:", L1READ);

  // Vérifier la configuration
  const autoDeployBps = await vault.autoDeployBps();
  const depositFeeBps = await vault.depositFeeBps();
  console.log(`\n⚙️  Configuration:`);
  console.log(`  Auto-deploy: ${autoDeployBps.toString()} bps (${(Number(autoDeployBps) / 100).toFixed(2)}%)`);
  console.log(`  Deposit fee: ${depositFeeBps.toString()} bps (${(Number(depositFeeBps) / 100).toFixed(2)}%)`);

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
    console.log(`    Total: ${initialBtcBalance.toString()}`);
    console.log(`    Hold: ${btcBal.hold.toString()}`);
  } catch (e) {
    console.log(`  BTC: Erreur - ${e.message}`);
  }

  try {
    const hypeBal = await l1read.spotBalance(HANDLER, spotTokenHYPE);
    initialHypeBalance = hypeBal.total;
    console.log(`  HYPE (Token ID ${spotTokenHYPE}):`);
    console.log(`    Total: ${initialHypeBalance.toString()}`);
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

  // Balance HYPE du vault avant
  const vaultBalanceBefore = await ethers.provider.getBalance(VAULT);
  const signerBalanceBefore = await ethers.provider.getBalance(signer.address);
  const sharesBefore = await vault.balanceOf(signer.address);
  
  console.log(`\n  Vault HYPE balance: ${ethers.formatEther(vaultBalanceBefore)} HYPE`);
  console.log(`  Signer HYPE balance: ${ethers.formatEther(signerBalanceBefore)} HYPE`);
  console.log(`  Signer shares: ${ethers.formatEther(sharesBefore)} sAXN1`);

  // Prix oracle
  const pxHype = await views.oraclePxHype1e8(HANDLER);
  console.log(`  Prix HYPE: ${ethers.formatUnits(pxHype, 8)} USD`);

  // Calculer le montant à déployer
  const depositAmount = ethers.parseEther(DEPOSIT_AMOUNT);
  const depositFee = depositFeeBps > 0 ? (depositAmount * BigInt(depositFeeBps)) / BigInt(10000) : 0n;
  const netAmount = depositAmount - depositFee;
  const deployAmount = (netAmount * autoDeployBps) / BigInt(10000);
  
  console.log(`\n📊 Détails du dépôt:`);
  console.log(`  Montant à déposer: ${ethers.formatEther(depositAmount)} HYPE`);
  console.log(`  Frais de dépôt: ${ethers.formatEther(depositFee)} HYPE`);
  console.log(`  Montant net: ${ethers.formatEther(netAmount)} HYPE`);
  console.log(`  Montant à déployer vers Core (${(Number(autoDeployBps) / 100).toFixed(2)}%): ${ethers.formatEther(deployAmount)} HYPE`);

  // Effectuer le dépôt
  console.log("\n" + "─".repeat(80));
  console.log("📤 ENVOI DU DÉPÔT:");
  console.log("─".repeat(80));
  console.log(`\n📤 Envoi du dépôt de ${DEPOSIT_AMOUNT} HYPE...`);
  
  // Essayer d'estimer le gas d'abord pour voir s'il y a une erreur
  try {
    const gasEstimate = await vault.deposit.estimateGas({ value: depositAmount });
    console.log(`  ✅ Gas estimé: ${gasEstimate.toString()}`);
  } catch (e) {
    console.log(`  ❌ Erreur lors de l'estimation de gas: ${e.message}`);
    if (e.data) {
      console.log(`  Données d'erreur: ${e.data}`);
      // Essayer de décoder l'erreur
      try {
        const error = vault.interface.parseError(e.data);
        console.log(`  Erreur du contrat: ${error.name}`);
      } catch {
        // Ignorer si on ne peut pas décoder
      }
    }
    throw e;
  }
  
  const tx = await vault.deposit({ value: depositAmount, gasPrice });
  console.log(`  Tx hash: ${tx.hash}`);
  
  // Attendre la confirmation
  console.log(`  ⏳ Attente de la confirmation...`);
  const rcpt = await tx.wait();
  console.log(`  ✅ Transaction confirmée (block: ${rcpt.blockNumber})`);

  // Analyser les événements
  console.log("\n" + "─".repeat(80));
  console.log("📋 ANALYSE DES ÉVÉNEMENTS:");
  console.log("─".repeat(80));

  const depositEvent = rcpt.logs.find(log => {
    try {
      const parsed = vault.interface.parseLog(log);
      return parsed && parsed.name === "Deposit";
    } catch {
      return false;
    }
  });

  if (depositEvent) {
    const parsed = vault.interface.parseLog(depositEvent);
    console.log(`\n✅ Événement Deposit:`);
    console.log(`  Utilisateur: ${parsed.args.user}`);
    console.log(`  Montant HYPE: ${ethers.formatEther(parsed.args.amount1e18)} HYPE`);
    console.log(`  Shares mintées: ${ethers.formatEther(parsed.args.sharesMinted)} sAXN1`);
  }

  // Vérifier les événements du handler
  const handlerDepositEvents = rcpt.logs.filter(log => {
    try {
      const parsed = handler.interface.parseLog(log);
      return parsed && (parsed.name === "DepositSkippedOracleDeviationHype" || 
                        parsed.name === "SpotOrderPlaced" || 
                        parsed.name === "Rebalanced");
    } catch {
      return false;
    }
  });

  if (handlerDepositEvents.length > 0) {
    console.log(`\n⚙️  Événements du Handler:`);
    for (const log of handlerDepositEvents) {
      try {
        const parsed = handler.interface.parseLog(log);
        console.log(`  - ${parsed.name}`);
        if (parsed.name === "DepositSkippedOracleDeviationHype") {
          console.log(`    ⚠️  Le déploiement a été ignoré à cause d'une déviation oracle`);
          console.log(`    Prix HYPE: ${ethers.formatUnits(parsed.args.pxH1e8, 8)} USD`);
        } else if (parsed.name === "SpotOrderPlaced") {
          console.log(`    Ordre spot placé:`);
          console.log(`      Asset: ${parsed.args.asset.toString()}`);
          console.log(`      IsBuy: ${parsed.args.isBuy}`);
          console.log(`      LimitPx: ${ethers.formatUnits(parsed.args.limitPx1e8, 8)}`);
          console.log(`      Size: ${parsed.args.sizeSzDecimals.toString()}`);
        }
      } catch (e) {
        // Ignorer
      }
    }
  } else {
    console.log(`\n⚠️  Aucun événement du handler détecté dans cette transaction`);
    console.log(`    Cela peut signifier que le déploiement vers Core n'a pas été effectué`);
    console.log(`    (ex: auto-deploy à 0%, ou erreur silencieuse)`);
  }

  // Attendre quelques blocs pour que les ordres sur Core soient exécutés
  console.log("\n⏳ Attente de quelques blocs pour que les transactions Core se propagent...");
  await new Promise(resolve => setTimeout(resolve, 5000));

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
    console.log(`  USDC (Token ID ${usdcTokenId}):`);
    console.log(`    Total: ${finalUsdcBalance.toString()} (avant: ${initialUsdcBalance.toString()})`);
    console.log(`    Différence: ${(finalUsdcBalance - initialUsdcBalance).toString()}`);
    console.log(`    Hold: ${usdcBal.hold.toString()}`);
  } catch (e) {
    console.log(`  USDC: Erreur - ${e.message}`);
  }

  try {
    const btcBal = await l1read.spotBalance(HANDLER, spotTokenBTC);
    finalBtcBalance = btcBal.total;
    console.log(`  BTC (Token ID ${spotTokenBTC}):`);
    console.log(`    Total: ${finalBtcBalance.toString()} (avant: ${initialBtcBalance.toString()})`);
    console.log(`    Différence: ${(finalBtcBalance - initialBtcBalance).toString()}`);
    console.log(`    Hold: ${btcBal.hold.toString()}`);
  } catch (e) {
    console.log(`  BTC: Erreur - ${e.message}`);
  }

  try {
    const hypeBal = await l1read.spotBalance(HANDLER, spotTokenHYPE);
    finalHypeBalance = hypeBal.total;
    console.log(`  HYPE (Token ID ${spotTokenHYPE}):`);
    console.log(`    Total: ${finalHypeBalance.toString()} (avant: ${initialHypeBalance.toString()})`);
    console.log(`    Différence: ${(finalHypeBalance - initialHypeBalance).toString()}`);
    console.log(`    Hold: ${hypeBal.hold.toString()}`);
  } catch (e) {
    console.log(`  HYPE: Erreur - ${e.message}`);
  }

  try {
    finalEquity = await views.equitySpotUsd1e18(HANDLER);
    const equityDiff = finalEquity - initialEquity;
    console.log(`  Equity Core: ${ethers.formatEther(finalEquity)} USD`);
    console.log(`    (avant: ${ethers.formatEther(initialEquity)} USD)`);
    console.log(`    Différence: ${ethers.formatEther(equityDiff)} USD`);
  } catch (e) {
    console.log(`  Equity: Erreur - ${e.message}`);
  }

  // Vérifier les balances finales du vault
  const vaultBalanceAfter = await ethers.provider.getBalance(VAULT);
  const signerBalanceAfter = await ethers.provider.getBalance(signer.address);
  const sharesAfter = await vault.balanceOf(signer.address);

  console.log(`\n  Vault HYPE balance: ${ethers.formatEther(vaultBalanceAfter)} HYPE`);
  console.log(`    (avant: ${ethers.formatEther(vaultBalanceBefore)} HYPE)`);
  console.log(`    Différence: ${ethers.formatEther(vaultBalanceAfter - vaultBalanceBefore)} HYPE`);
  console.log(`  Signer shares: ${ethers.formatEther(sharesAfter)} sAXN1`);
  console.log(`    (avant: ${ethers.formatEther(sharesBefore)} sAXN1)`);
  console.log(`    Différence: ${ethers.formatEther(sharesAfter - sharesBefore)} sAXN1`);

  // Analyse finale
  console.log("\n" + "=".repeat(80));
  console.log("📊 ANALYSE DU TRANSFERT VERS CORE:");
  console.log("=".repeat(80));

  const usdcDiff = finalUsdcBalance - initialUsdcBalance;
  const btcDiff = finalBtcBalance - initialBtcBalance;
  const hypeDiff = finalHypeBalance - initialHypeBalance;
  const equityDiff = finalEquity - initialEquity;

  const expectedDeployUsd = (deployAmount * pxHype) / BigInt(1e8);
  
  console.log(`\n✅ Résumé:`);
  console.log(`  Montant déposé: ${ethers.formatEther(depositAmount)} HYPE`);
  console.log(`  Montant attendu à déployer: ${ethers.formatEther(deployAmount)} HYPE`);
  console.log(`  Valeur USD attendue: ${ethers.formatEther(expectedDeployUsd)} USD`);

  console.log(`\n📈 Changements sur Core:`);
  console.log(`  USDC: ${usdcDiff > 0 ? '+' : ''}${usdcDiff.toString()} (devrait être positif si conversion HYPE->USDC réussie)`);
  console.log(`  BTC: ${btcDiff > 0 ? '+' : ''}${btcDiff.toString()} (devrait être positif si allocation 50/50 réussie)`);
  console.log(`  HYPE: ${hypeDiff > 0 ? '+' : ''}${hypeDiff.toString()} (devrait être proche de 0 après conversion)`);
  console.log(`  Equity: ${equityDiff > 0 ? '+' : ''}${ethers.formatEther(equityDiff)} USD`);

  // Vérifier si le transfert a réussi
  const transferSucceeded = equityDiff > 0 || usdcDiff > 0 || btcDiff > 0;
  
  if (transferSucceeded) {
    console.log(`\n✅ Le transfert vers Core semble avoir réussi !`);
    console.log(`   Les fonds ont été déployés et convertis sur Core.`);
  } else if (Number(autoDeployBps) === 0) {
    console.log(`\n⚠️  L'auto-deploy est à 0%, donc aucun transfert vers Core n'a été effectué.`);
  } else {
    console.log(`\n⚠️  Aucun changement détecté sur Core.`);
    console.log(`   Possible causes:`);
    console.log(`   - Les ordres sur Core ne sont pas encore exécutés (attendre quelques blocs)`);
    console.log(`   - Une erreur oracle a empêché le déploiement`);
    console.log(`   - Le déploiement a été ignoré silencieusement`);
  }

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

