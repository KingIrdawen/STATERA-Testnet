const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  // Adresses du dernier déploiement (2025-01-XX)
  const VAULT = process.env.VAULT || "0x7659E4D1E1CAf66cCd7573Fa640c33E5e6bbd2F9";
  const HANDLER = process.env.HANDLER || "0x071Bcc062D661536D77a09b38bFfd249B7B8195F";
  const L1READ = process.env.L1READ || "0x46976ef07CA697f1546A7F5fcE6f6C6c1e8fdB6D";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || process.env.VIEWS || "";

  console.log("\n" + "=".repeat(80));
  console.log("📋 LECTURE COMPLÈTE DES PARAMÈTRES DES CONTRATS STRATEGY_1");
  console.log("=".repeat(80) + "\n");

  const vault = await ethers.getContractAt("VaultContract", VAULT);
  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);
  
  let views = null;
  if (CORE_VIEWS) {
    try {
      views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);
    } catch (e) {
      console.log("⚠️  CoreInteractionViews non trouvé à l'adresse:", CORE_VIEWS);
    }
  }

  // ========== VAULT CONTRACT ==========
  console.log("📦 VAULT CONTRACT");
  console.log("─".repeat(80));
  console.log(`  Adresse: ${VAULT}`);
  console.log(`  Owner: ${await vault.owner()}`);
  console.log(`  Handler: ${await vault.handler()}`);
  const coreViewsAddr = await vault.coreViews();
  console.log(`  CoreViews: ${coreViewsAddr}`);
  if (coreViewsAddr !== ethers.ZeroAddress && !views) {
    try {
      views = await ethers.getContractAt("CoreInteractionViews", coreViewsAddr);
      console.log(`  ✅ CoreInteractionViews trouvé via vault.coreViews()`);
    } catch (e) {
      console.log(`  ⚠️  Impossible de charger CoreInteractionViews à ${coreViewsAddr}`);
    }
  }
  console.log(`  Paused: ${await vault.paused()}`);
  console.log(`  Name: ${await vault.name()}`);
  console.log(`  Symbol: ${await vault.symbol()}`);
  console.log(`  Decimals: ${await vault.decimals()}`);
  console.log(`  Total Supply: ${ethers.formatEther(await vault.totalSupply())} ${await vault.symbol()}`);
  console.log(`  Balance HYPE (vault): ${ethers.formatEther(await ethers.provider.getBalance(VAULT))} HYPE`);
  
  console.log("\n  💰 FRAIS ET CONFIGURATION:");
  const depositFeeBps = Number(await vault.depositFeeBps());
  const withdrawFeeBps = Number(await vault.withdrawFeeBps());
  const autoDeployBps = Number(await vault.autoDeployBps());
  console.log(`    Deposit Fee (bps): ${depositFeeBps} (${(depositFeeBps / 100).toFixed(2)}%)`);
  console.log(`    Withdraw Fee (bps): ${withdrawFeeBps} (${(withdrawFeeBps / 100).toFixed(2)}%)`);
  console.log(`    Auto-Deploy (bps): ${autoDeployBps} (${(autoDeployBps / 100).toFixed(2)}%)`);
  
  let withdrawFeeTiersLength = 0;
  try {
    withdrawFeeTiersLength = await vault.withdrawFeeTiersLength();
  } catch {
    // Fonction peut ne pas exister
  }
  if (withdrawFeeTiersLength > 0) {
    console.log(`    Withdraw Fee Tiers: ${withdrawFeeTiersLength} tiers configurés`);
    for (let i = 0; i < withdrawFeeTiersLength; i++) {
      const tier = await vault.withdrawFeeTiers(i);
      console.log(`      Tier ${i}: Amount >= ${ethers.formatEther(tier.amount1e18)} HYPE, Fee: ${tier.feeBps} bps`);
    }
  } else {
    console.log(`    Withdraw Fee Tiers: Aucun (utilise withdrawFeeBps par défaut)`);
  }

  // NAV et PPS
  try {
    const nav = await vault.nav1e18();
    const pps = await vault.pps1e18();
    console.log("\n  💵 ÉTAT FINANCIER:");
    console.log(`    NAV (1e18): ${nav.toString()}`);
    console.log(`    NAV: ${ethers.formatEther(nav)} USD`);
    console.log(`    PPS (1e18): ${pps.toString()}`);
    console.log(`    Price Per Share: ${ethers.formatEther(pps)} USD per ${await vault.symbol()}`);
  } catch (e) {
    console.log("\n  ⚠️  Erreur lors du calcul NAV/PPS:", e.message);
  }

  let withdrawQueueLength = 0;
  try {
    withdrawQueueLength = await vault.withdrawQueueLength();
  } catch {
    // Fonction peut ne pas exister
  }
  console.log(`\n  📋 FILE D'ATTENTE RETRAIT: ${withdrawQueueLength} demande(s)`);

  // ========== CORE INTERACTION HANDLER ==========
  console.log("\n" + "=".repeat(80));
  console.log("⚙️  CORE INTERACTION HANDLER");
  console.log("─".repeat(80));
  console.log(`  Adresse: ${HANDLER}`);
  console.log(`  Owner: ${await handler.owner()}`);
  console.log(`  Vault: ${await handler.vault()}`);
  console.log(`  Paused: ${await handler.paused()}`);
  console.log(`  L1Read: ${await handler.l1read()}`);
  console.log(`  USDC (EVM): ${await handler.usdc()}`);
  console.log(`  Fee Vault: ${await handler.feeVault()}`);
  console.log(`  Rebalancer: ${await handler.rebalancer()}`);

  console.log("\n  🔗 CONFIGURATION CORE:");
  console.log(`    USDC Core System Address: ${await handler.usdcCoreSystemAddress()}`);
  console.log(`    USDC Core Token ID: ${(await handler.usdcCoreTokenId()).toString()}`);
  console.log(`    HYPE Core System Address: ${await handler.hypeCoreSystemAddress()}`);
  console.log(`    HYPE Core Token ID: ${(await handler.hypeCoreTokenId()).toString()}`);

  console.log("\n  📊 MARCHÉS SPOT:");
  console.log(`    Spot BTC ID: ${(await handler.spotBTC()).toString()}`);
  console.log(`    Spot HYPE ID: ${(await handler.spotHYPE()).toString()}`);
  console.log(`    Spot Token BTC ID: ${(await handler.spotTokenBTC()).toString()}`);
  console.log(`    Spot Token HYPE ID: ${(await handler.spotTokenHYPE()).toString()}`);

  console.log("\n  ⚡ PARAMÈTRES DE RATE LIMIT:");
  const maxOutboundPerEpoch = await handler.maxOutboundPerEpoch();
  const epochLength = await handler.epochLength();
  const lastEpochStart = await handler.lastEpochStart();
  const sentThisEpoch = await handler.sentThisEpoch();
  console.log(`    Max Outbound Per Epoch (1e8): ${maxOutboundPerEpoch.toString()}`);
  console.log(`    Max Outbound Per Epoch: ${ethers.formatUnits(maxOutboundPerEpoch, 8)} USD`);
  console.log(`    Epoch Length (blocs): ${epochLength.toString()}`);
  console.log(`    Last Epoch Start (block): ${lastEpochStart.toString()}`);
  console.log(`    Sent This Epoch (1e8): ${sentThisEpoch.toString()}`);
  console.log(`    Sent This Epoch: ${ethers.formatUnits(sentThisEpoch, 8)} USD`);

  console.log("\n  💰 FRAIS:");
  const feeBps = await handler.feeBps();
  console.log(`    Fee (bps): ${feeBps.toString()} (${(Number(feeBps) / 100).toFixed(2)}%)`);

  console.log("\n  📈 PARAMÈTRES DE PRIX ET ORACLE:");
  const maxSlippageBps = await handler.maxSlippageBps();
  const marketEpsilonBps = await handler.marketEpsilonBps();
  const deadbandBps = await handler.deadbandBps();
  const maxOracleDeviationBps = await handler.maxOracleDeviationBps();
  console.log(`    Max Slippage (bps): ${maxSlippageBps.toString()} (${(Number(maxSlippageBps) / 100).toFixed(2)}%)`);
  console.log(`    Market Epsilon (bps): ${marketEpsilonBps.toString()} (${(Number(marketEpsilonBps) / 100).toFixed(2)}%)`);
  console.log(`    Deadband (bps): ${deadbandBps.toString()} (${(Number(deadbandBps) / 100).toFixed(2)}%)`);
  console.log(`    Max Oracle Deviation (bps): ${maxOracleDeviationBps.toString()} (${(Number(maxOracleDeviationBps) / 100).toFixed(2)}%)`);

  const usdcReserveBps = await handler.usdcReserveBps();
  console.log(`\n  💵 RÉSERVES:`);
  console.log(`    USDC Reserve (bps): ${usdcReserveBps.toString()} (${(Number(usdcReserveBps) / 100).toFixed(2)}%)`);

  // Prix oracles via CoreInteractionViews
  if (views) {
    try {
      const pxBtc = await views.oraclePxBtc1e8(HANDLER);
      const pxHype = await views.oraclePxHype1e8(HANDLER);
      const equity = await views.equitySpotUsd1e18(HANDLER);
      console.log(`\n  📊 ORACLES (via CoreInteractionViews):`);
      console.log(`    Prix BTC (1e8): ${pxBtc.toString()}`);
      console.log(`    Prix BTC: ${ethers.formatUnits(pxBtc, 8)} USD`);
      console.log(`    Prix HYPE (1e8): ${pxHype.toString()}`);
      console.log(`    Prix HYPE: ${ethers.formatUnits(pxHype, 8)} USD`);
      console.log(`    Equity Core (1e18): ${equity.toString()}`);
      console.log(`    Equity Core: ${ethers.formatEther(equity)} USD`);
    } catch (e) {
      console.log(`\n  ⚠️  Erreur lors de la récupération des oracles: ${e.message}`);
    }
  } else {
    console.log(`\n  ⚠️  CoreInteractionViews non disponible pour lire les oracles`);
  }

  // Prix initiaux
  try {
    const lastPxBtc1e8 = await handler.lastPxBtc1e8();
    const lastPxHype1e8 = await handler.lastPxHype1e8();
    const pxInitB = await handler.pxInitB();
    const pxInitH = await handler.pxInitH();
    console.log(`\n  🔄 ÉTAT DES PRIX INITIAUX:`);
    console.log(`    Last Price BTC (1e8): ${lastPxBtc1e8.toString()}`);
    console.log(`    Last Price HYPE (1e8): ${lastPxHype1e8.toString()}`);
    console.log(`    Price BTC Initialized: ${pxInitB}`);
    console.log(`    Price HYPE Initialized: ${pxInitH}`);
  } catch (e) {
    console.log(`\n  ⚠️  Erreur lors de la lecture des prix initiaux: ${e.message}`);
  }

  // ========== L1READ ==========
  console.log("\n" + "=".repeat(80));
  console.log("📡 L1READ");
  console.log("─".repeat(80));
  console.log(`  Adresse: ${L1READ}`);

  // ========== CORE INTERACTION VIEWS ==========
  if (views) {
    console.log("\n" + "=".repeat(80));
    console.log("👁️  CORE INTERACTION VIEWS");
    console.log("─".repeat(80));
    console.log(`  Adresse: ${await views.getAddress()}`);
  }

  // ========== ADRESSES SYSTÈME ==========
  console.log("\n" + "=".repeat(80));
  console.log("🔧 ADRESSES SYSTÈME");
  console.log("─".repeat(80));
  console.log(`  CoreWriter (système): 0x3333333333333333333333333333333333333333`);
  console.log(`  USDC (EVM): 0x0B80659a4076E9E93C7DbE0f10675A16a3e5C206`);

  // ========== RÉSUMÉ ==========
  console.log("\n" + "=".repeat(80));
  console.log("📝 RÉSUMÉ DES CONFIGURATIONS CRITIQUES");
  console.log("─".repeat(80));
  
  const handlerPaused = await handler.paused();
  const vaultPaused = await vault.paused();
  const handlerVault = await handler.vault();
  const vaultHandler = await vault.handler();
  const vaultCoreViews = await vault.coreViews();

  console.log(`\n  ✅ Vault ↔ Handler:`);
  console.log(`     Handler.vault() == Vault address: ${handlerVault.toLowerCase() === VAULT.toLowerCase()}`);
  console.log(`     Vault.handler() == Handler address: ${vaultHandler.toLowerCase() === HANDLER.toLowerCase()}`);
  if (views) {
    console.log(`     Vault.coreViews() == Views address: ${vaultCoreViews.toLowerCase() === (await views.getAddress()).toLowerCase()}`);
  } else {
    console.log(`     Vault.coreViews(): ${vaultCoreViews}`);
  }
  
  console.log(`\n  ⚠️  États:`);
  console.log(`     Handler paused: ${handlerPaused}`);
  console.log(`     Vault paused: ${vaultPaused}`);
  console.log(`     Auto-deploy enabled: ${(await vault.autoDeployBps()) > 0}`);
  
  const usdcCoreAddr = await handler.usdcCoreSystemAddress();
  const hypeCoreAddr = await handler.hypeCoreSystemAddress();
  const usdcCoreTokenId = await handler.usdcCoreTokenId();
  const hypeCoreTokenId = await handler.hypeCoreTokenId();
  
  console.log(`\n  🔗 Core Links:`);
  console.log(`     USDC Core: ${usdcCoreAddr} (Token ID: ${usdcCoreTokenId.toString()})`);
  console.log(`     HYPE Core: ${hypeCoreAddr} (Token ID: ${hypeCoreTokenId.toString()})`);
  
  console.log(`\n  📊 Spot Markets:`);
  const spotBTC = await handler.spotBTC();
  const spotHYPE = await handler.spotHYPE();
  console.log(`     BTC Spot ID: ${spotBTC.toString()}`);
  console.log(`     HYPE Spot ID: ${spotHYPE.toString()}`);

  console.log("\n" + "=".repeat(80));
  console.log("✅ Lecture complète des paramètres terminée");
  console.log("=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  process.exit(1);
});


