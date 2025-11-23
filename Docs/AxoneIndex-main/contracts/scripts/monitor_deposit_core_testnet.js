const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  // Adresses du dernier déploiement
  const VAULT = process.env.VAULT || "0x7659E4D1E1CAf66cCd7573Fa640c33E5e6bbd2F9";
  const HANDLER = process.env.HANDLER || "0x071Bcc062D661536D77a09b38bFfd249B7B8195F";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x38fCB5F1e4498b537142ca2563e355127Af68fD2";
  const L1READ = process.env.L1READ || "0x46976ef07CA697f1546A7F5fcE6f6C6c1e8fdB6D";
  const TX_HASH = process.env.TX_HASH || "0xea7342b0ceaaf9d507d10a3933458101de3bcb5fd293a135a2957b95a16c7135";
  
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  const waitForReceipt = async (hash, retries = 90, intervalMs = 1500) => {
    for (let i = 0; i < retries; i++) {
      try {
        const rcpt = await ethers.provider.getTransactionReceipt(hash);
        if (rcpt) return rcpt;
      } catch (e) {
        if (e.code !== 429) throw e;
      }
      await delay(intervalMs);
    }
    throw new Error(`Timeout en attente du receipt: ${hash}`);
  };

  console.log("\n" + "=".repeat(80));
  console.log("📊 MONITORING DU DÉPÔT SUR CORE");
  console.log("=".repeat(80) + "\n");

  const vault = await ethers.getContractAt("VaultContract", VAULT);
  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);
  const l1read = await ethers.getContractAt("L1Read", L1READ);

  console.log("📍 Vault:", VAULT);
  console.log("⚙️  Handler:", HANDLER);
  console.log("🔍 CoreViews:", CORE_VIEWS);
  console.log("📡 L1Read:", L1READ);
  console.log("🔗 Transaction:", TX_HASH);

  // Récupérer le receipt de la transaction
  console.log("\n" + "─".repeat(80));
  console.log("📋 ANALYSE DE LA TRANSACTION:");
  console.log("─".repeat(80));
  
  let rcpt;
  try {
    rcpt = await waitForReceipt(TX_HASH);
    console.log(`✅ Transaction trouvée dans le bloc ${rcpt.blockNumber}`);
  } catch (e) {
    console.error(`❌ Impossible de récupérer la transaction: ${e.message}`);
    process.exit(1);
  }

  // Analyser les événements du vault
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
  } else {
    console.log(`\n⚠️  Aucun événement Deposit trouvé`);
  }

  // Analyser les événements du handler
  console.log("\n" + "─".repeat(80));
  console.log("⚙️  ÉVÉNEMENTS DU HANDLER:");
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
    console.log(`\n✅ ${handlerEvents.length} événement(s) du handler détecté(s):`);
    for (const event of handlerEvents) {
      console.log(`\n  📌 ${event.name}:`);
      if (event.name === "DepositSkippedOracleDeviationHype") {
        console.log(`    ⚠️  Le déploiement a été ignoré à cause d'une déviation oracle`);
        console.log(`    Prix HYPE: ${ethers.formatUnits(event.args.pxH1e8, 8)} USD`);
        console.log(`    Déviation max: ${Number(event.args.maxDevBps)} bps`);
      } else if (event.name === "SpotOrderPlaced") {
        console.log(`    Ordre spot placé:`);
        console.log(`      Asset: ${event.args.asset.toString()}`);
        console.log(`      IsBuy: ${event.args.isBuy}`);
        console.log(`      LimitPx: ${ethers.formatUnits(event.args.limitPx1e8, 8)} USD`);
        console.log(`      Size (szDecimals): ${event.args.sizeSzDecimals.toString()}`);
      } else if (event.name === "Rebalanced") {
        console.log(`    Rééquilibrage effectué:`);
        console.log(`      Delta BTC: ${event.args.dBtc1e18.toString()}`);
        console.log(`      Delta HYPE: ${event.args.dHype1e18.toString()}`);
      } else if (event.name === "HypeCreditedToCore") {
        console.log(`    HYPE crédité sur Core:`);
        console.log(`      Montant: ${ethers.formatEther(event.args.amount1e18)} HYPE`);
      } else {
        console.log(`    Args:`, event.args);
      }
    }
  } else {
    console.log(`\n⚠️  Aucun événement du handler détecté dans cette transaction`);
    console.log(`    Cela peut signifier que le déploiement vers Core n'a pas été déclenché`);
  }

  // Vérifier les balances actuelles sur Core
  console.log("\n" + "─".repeat(80));
  console.log("📊 BALANCES ACTUELLES SUR CORE:");
  console.log("─".repeat(80));
  
  const usdcTokenId = await handler.usdcCoreTokenId();
  const spotTokenBTC = await handler.spotTokenBTC();
  const spotTokenHYPE = await handler.spotTokenHYPE();
  
  let usdcBalance = 0n;
  let btcBalance = 0n;
  let hypeBalance = 0n;
  let equity = 0n;
  
  try {
    const usdcBal = await l1read.spotBalance(HANDLER, usdcTokenId);
    usdcBalance = usdcBal.total;
    console.log(`\n  USDC (Token ID ${usdcTokenId}):`);
    console.log(`    Total: ${usdcBalance.toString()}`);
    console.log(`    Hold: ${usdcBal.hold.toString()}`);
    console.log(`    Available: ${(usdcBal.total - usdcBal.hold).toString()}`);
  } catch (e) {
    console.log(`  USDC: Erreur - ${e.message}`);
  }

  try {
    const btcBal = await l1read.spotBalance(HANDLER, spotTokenBTC);
    btcBalance = btcBal.total;
    console.log(`\n  BTC (Token ID ${spotTokenBTC}):`);
    console.log(`    Total: ${btcBal.total.toString()}`);
    console.log(`    Hold: ${btcBal.hold.toString()}`);
    console.log(`    Available: ${(btcBal.total - btcBal.hold).toString()}`);
  } catch (e) {
    console.log(`  BTC: Erreur - ${e.message}`);
  }

  try {
    const hypeBal = await l1read.spotBalance(HANDLER, spotTokenHYPE);
    hypeBalance = hypeBal.total;
    console.log(`\n  HYPE (Token ID ${spotTokenHYPE}):`);
    console.log(`    Total: ${hypeBal.total.toString()}`);
    console.log(`    Hold: ${hypeBal.hold.toString()}`);
    console.log(`    Available: ${(hypeBal.total - hypeBal.hold).toString()}`);
  } catch (e) {
    console.log(`  HYPE: Erreur - ${e.message}`);
  }

  try {
    equity = await views.equitySpotUsd1e18(HANDLER);
    console.log(`\n  Equity Core: ${ethers.formatEther(equity)} USD`);
  } catch (e) {
    console.log(`  Equity: Erreur - ${e.message}`);
  }

  // Vérifier les prix oracles
  console.log("\n" + "─".repeat(80));
  console.log("📈 PRIX ORACLES:");
  console.log("─".repeat(80));
  
  try {
    const pxBtc = await views.oraclePxBtc1e8(HANDLER);
    const pxHype = await views.oraclePxHype1e8(HANDLER);
    console.log(`  Prix BTC: ${ethers.formatUnits(pxBtc, 8)} USD`);
    console.log(`  Prix HYPE: ${ethers.formatUnits(pxHype, 8)} USD`);
  } catch (e) {
    console.log(`  Erreur lors de la récupération des prix: ${e.message}`);
  }

  // Vérifier l'état du vault
  console.log("\n" + "─".repeat(80));
  console.log("💵 ÉTAT DU VAULT:");
  console.log("─".repeat(80));
  
  const vaultBalance = await ethers.provider.getBalance(VAULT);
  const nav = await vault.nav1e18();
  const pps = await vault.pps1e18();
  const totalSupply = await vault.totalSupply();
  
  console.log(`  Balance HYPE: ${ethers.formatEther(vaultBalance)} HYPE`);
  console.log(`  NAV: ${ethers.formatEther(nav)} USD`);
  console.log(`  PPS: ${ethers.formatEther(pps)} USD`);
  console.log(`  Total Supply: ${ethers.formatEther(totalSupply)} sAXN1`);

  // Vérifier la configuration
  const autoDeployBps = await vault.autoDeployBps();
  const depositFeeBps = await vault.depositFeeBps();
  
  console.log(`\n  Auto-deploy: ${autoDeployBps.toString()} bps (${(Number(autoDeployBps) / 100).toFixed(2)}%)`);
  console.log(`  Deposit fee: ${depositFeeBps.toString()} bps (${(Number(depositFeeBps) / 100).toFixed(2)}%)`);

  // Résumé
  console.log("\n" + "=".repeat(80));
  console.log("📊 RÉSUMÉ:");
  console.log("=".repeat(80));
  
  console.log(`\n✅ Transaction analysée: ${TX_HASH}`);
  console.log(`   Bloc: ${rcpt.blockNumber}`);
  
  if (depositEvent) {
    const parsed = vault.interface.parseLog(depositEvent);
    console.log(`\n💰 Dépôt effectué:`);
    console.log(`   Montant: ${ethers.formatEther(parsed.args.amount1e18)} HYPE`);
    console.log(`   Shares: ${ethers.formatEther(parsed.args.sharesMinted)} sAXN1`);
  }
  
  console.log(`\n📊 État Core actuel:`);
  console.log(`   USDC: ${usdcBalance.toString()}`);
  console.log(`   BTC: ${btcBalance.toString()}`);
  console.log(`   HYPE: ${hypeBalance.toString()}`);
  console.log(`   Equity: ${ethers.formatEther(equity)} USD`);
  
  console.log(`\n💵 État Vault:`);
  console.log(`   Balance HYPE: ${ethers.formatEther(vaultBalance)} HYPE`);
  console.log(`   NAV: ${ethers.formatEther(nav)} USD`);
  console.log(`   PPS: ${ethers.formatEther(pps)} USD`);
  
  if (handlerEvents.length === 0) {
    console.log(`\n⚠️  Aucun événement handler détecté - le déploiement vers Core n'a peut-être pas été déclenché`);
  } else {
    console.log(`\n✅ ${handlerEvents.length} événement(s) handler détecté(s) - le déploiement a été traité`);
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


