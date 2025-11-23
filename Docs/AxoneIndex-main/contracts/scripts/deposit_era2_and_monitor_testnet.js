const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  // Adresses ERA_2 du dernier déploiement (2025-11-21)
  const VAULT = process.env.VAULT || "0x3F60ff8c0838965A981B115E86E1d2567266b021";
  const HANDLER = process.env.HANDLER || "0xb0e110f9236a6c48BE31E0EEaa26272e5973Bc5b";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x71a2B85dD822782A8031549f9B35629a5759F81B";
  const L1READ = process.env.L1READ || "0x2021BFd4D98ffE9fB1AC5B757a50005fEbF684D3";
  
  const DEPOSIT_AMOUNT = process.env.DEPOSIT_AMOUNT || "0.5"; // HYPE à déposer
  const gasPrice = ethers.parseUnits(process.env.GAS_PRICE_GWEI || "2", "gwei");

  const [signer] = await ethers.getSigners();
  console.log("\n" + "=".repeat(80));
  console.log("💰 DÉPÔT SUR VAULT ERA_2 AVEC MONITORING");
  console.log("=".repeat(80) + "\n");

  const vault = await ethers.getContractAt("src/ERA_2/VaultContract.sol:VaultContract", VAULT);
  const handler = await ethers.getContractAt("src/ERA_2/CoreInteractionHandler.sol:CoreInteractionHandler", HANDLER);
  const views = await ethers.getContractAt("src/ERA_2/CoreInteractionViews.sol:CoreInteractionViews", CORE_VIEWS);
  const l1read = await ethers.getContractAt("src/ERA_2/interfaces/L1Read.sol:L1Read", L1READ);

  console.log("📝 Signer:", signer.address);
  console.log("📍 Vault ERA_2:", VAULT);
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
    console.log(`  Equity Core: ${ethers.formatEther(initialEquity)} USD`);
  } catch (e) {
    console.log(`  Equity: Erreur - ${e.message}`);
  }

  // Balance HYPE du vault avant
  const vaultBalanceBefore = await ethers.provider.getBalance(VAULT);
  const signerBalanceBefore = await ethers.provider.getBalance(signer.address);
  const sharesBefore = await vault.balanceOf(signer.address);
  const navBefore = await vault.nav1e18();
  const totalSupplyBefore = await vault.totalSupply();
  
  console.log(`\n  Vault HYPE balance: ${ethers.formatEther(vaultBalanceBefore)} HYPE`);
  console.log(`  Signer HYPE balance: ${ethers.formatEther(signerBalanceBefore)} HYPE`);
  console.log(`  Signer shares: ${ethers.formatEther(sharesBefore)} ERA2`);
  console.log(`  NAV: ${ethers.formatEther(navBefore)} USD`);
  console.log(`  Total Supply: ${ethers.formatEther(totalSupplyBefore)} ERA2`);

  // Prix oracle
  const pxHype = await views.oraclePxHype1e8(handler);
  const pxToken1 = await views.oraclePxToken11e8(handler);
  console.log(`  Prix HYPE: ${ethers.formatUnits(pxHype, 8)} USD`);
  console.log(`  Prix TOKEN1: ${ethers.formatUnits(pxToken1, 8)} USD`);

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
    console.log(`  Shares mintées: ${ethers.formatEther(parsed.args.sharesMinted)} ERA2`);
  }

  // Vérifier les événements du handler
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
      if (event.name === "DepositSkippedOracleDeviationHype") {
        console.log(`    ⚠️  Le déploiement a été ignoré à cause d'une déviation oracle`);
        console.log(`    Prix HYPE: ${ethers.formatUnits(event.args.pxH1e8, 8)} USD`);
        console.log(`    Déviation max: ${Number(event.args.maxDevBps)} bps`);
      } else if (event.name === "DepositSkippedOracleDeviationUsdc") {
        console.log(`    ⚠️  Le déploiement a été ignoré à cause d'une déviation oracle`);
        console.log(`    Prix TOKEN1: ${ethers.formatUnits(event.args.pxT1, 8)} USD`);
        console.log(`    Prix HYPE: ${ethers.formatUnits(event.args.pxH, 8)} USD`);
      } else if (event.name === "SpotOrderPlaced") {
        console.log(`    Ordre spot placé:`);
        console.log(`      Asset: ${event.args.asset.toString()}`);
        console.log(`      IsBuy: ${event.args.isBuy}`);
        console.log(`      LimitPx: ${ethers.formatUnits(event.args.limitPx1e8, 8)} USD`);
        console.log(`      Size (szDecimals): ${event.args.sizeSzDecimals.toString()}`);
      } else if (event.name === "Rebalanced") {
        console.log(`    Rééquilibrage effectué:`);
        console.log(`      Delta TOKEN1: ${event.args.dToken11e18?.toString() || 'N/A'}`);
        console.log(`      Delta HYPE: ${event.args.dHype1e18?.toString() || 'N/A'}`);
      } else if (event.name === "HypeCreditedToCore") {
        console.log(`    HYPE crédité sur Core:`);
        console.log(`      Montant: ${ethers.formatEther(event.args.amount1e18)} HYPE`);
      } else if (event.name === "OutboundToCore") {
        console.log(`    Outbound vers Core détecté`);
      } else if (event.name === "InboundFromCore") {
        console.log(`    Inbound depuis Core:`);
        console.log(`      Montant: ${ethers.formatUnits(event.args.amount1e8 || event.args[0], 8)}`);
      } else {
        console.log(`    Args:`, event.args);
      }
    }
  } else {
    console.log(`\n⚠️  Aucun événement du handler détecté dans cette transaction`);
    console.log(`    Cela peut signifier que le déploiement vers Core n'a pas été effectué`);
    console.log(`    (ex: auto-deploy à 0%, ou erreur silencieuse)`);
  }

  // Attendre quelques blocs pour que les ordres sur Core soient exécutés
  console.log("\n⏳ Attente de quelques blocs pour que les transactions Core se propagent...");
  await new Promise(resolve => setTimeout(resolve, 8000));

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
    console.log(`  USDC (Token ID ${usdcTokenId}):`);
    console.log(`    Total: ${finalUsdcBalance.toString()} (avant: ${initialUsdcBalance.toString()})`);
    console.log(`    Différence: ${(finalUsdcBalance - initialUsdcBalance).toString()}`);
    console.log(`    Hold: ${usdcBal.hold.toString()}`);
  } catch (e) {
    console.log(`  USDC: Erreur - ${e.message}`);
  }

  try {
    const token1Bal = await l1read.spotBalance(HANDLER, spotTokenTOKEN1);
    finalToken1Balance = token1Bal.total;
    console.log(`  TOKEN1 (Token ID ${spotTokenTOKEN1}):`);
    console.log(`    Total: ${finalToken1Balance.toString()} (avant: ${initialToken1Balance.toString()})`);
    console.log(`    Différence: ${(finalToken1Balance - initialToken1Balance).toString()}`);
    console.log(`    Hold: ${token1Bal.hold.toString()}`);
  } catch (e) {
    console.log(`  TOKEN1: Erreur - ${e.message}`);
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
    finalEquity = await views.equitySpotUsd1e18(handler);
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
  const navAfter = await vault.nav1e18();
  const totalSupplyAfter = await vault.totalSupply();

  console.log(`\n  Vault HYPE balance: ${ethers.formatEther(vaultBalanceAfter)} HYPE`);
  console.log(`    (avant: ${ethers.formatEther(vaultBalanceBefore)} HYPE)`);
  console.log(`    Différence: ${ethers.formatEther(vaultBalanceAfter - vaultBalanceBefore)} HYPE`);
  console.log(`  Signer shares: ${ethers.formatEther(sharesAfter)} ERA2`);
  console.log(`    (avant: ${ethers.formatEther(sharesBefore)} ERA2)`);
  console.log(`    Différence: ${ethers.formatEther(sharesAfter - sharesBefore)} ERA2`);
  console.log(`  NAV: ${ethers.formatEther(navAfter)} USD`);
  console.log(`    (avant: ${ethers.formatEther(navBefore)} USD)`);
  console.log(`  Total Supply: ${ethers.formatEther(totalSupplyAfter)} ERA2`);

  // Analyse finale
  console.log("\n" + "=".repeat(80));
  console.log("📊 ANALYSE DU TRANSFERT VERS CORE:");
  console.log("=".repeat(80));

  const usdcDiff = finalUsdcBalance - initialUsdcBalance;
  const token1Diff = finalToken1Balance - initialToken1Balance;
  const hypeDiff = finalHypeBalance - initialHypeBalance;
  const equityDiff = finalEquity - initialEquity;

  const expectedDeployUsd = (deployAmount * pxHype) / BigInt(1e8);
  
  console.log(`\n✅ Résumé:`);
  console.log(`  Montant déposé: ${ethers.formatEther(depositAmount)} HYPE`);
  console.log(`  Montant attendu à déployer: ${ethers.formatEther(deployAmount)} HYPE`);
  console.log(`  Valeur USD attendue: ${ethers.formatEther(expectedDeployUsd)} USD`);

  console.log(`\n📈 Changements sur Core:`);
  console.log(`  USDC: ${usdcDiff > 0 ? '+' : ''}${usdcDiff.toString()} (devrait être positif si conversion HYPE->USDC réussie)`);
  console.log(`  TOKEN1: ${token1Diff > 0 ? '+' : ''}${token1Diff.toString()} (devrait être positif si allocation 50/50 réussie)`);
  console.log(`  HYPE: ${hypeDiff > 0 ? '+' : ''}${hypeDiff.toString()} (devrait être proche de 0 après conversion)`);
  console.log(`  Equity: ${equityDiff > 0 ? '+' : ''}${ethers.formatEther(equityDiff)} USD`);

  // Vérifier si le transfert a réussi
  const transferSucceeded = equityDiff > 0 || usdcDiff > 0 || token1Diff > 0;
  
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
  console.log(`📝 Transaction hash: ${tx.hash}`);
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

