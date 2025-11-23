const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  // Adresses du dernier déploiement (2025-11-21)
  const VAULT = process.env.VAULT || "0x72eEdd6cE1039E429e44F86b3DcA4A45e206a410";
  const HANDLER = process.env.HANDLER || "0x7551Ca74B5f2Cb3EF9f2e885f2fe9BF993bF570c";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x1E2B0DccE25Eeb479F83DABE24ab687C6AB64292";
  const L1READ = process.env.L1READ || "0xacE17480F4d157C48180f4ed10AB483238143e11";

  console.log("\n" + "=".repeat(80));
  console.log("📊 RÉSUMÉ COMPLET DE LA SITUATION DU RETRAIT");
  console.log("=".repeat(80) + "\n");

  const vault = await ethers.getContractAt("VaultContract", VAULT);
  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);
  const l1read = await ethers.getContractAt("L1Read", L1READ);

  // Balances EVM
  const vaultBalance = await ethers.provider.getBalance(VAULT);
  const handlerBalance = await ethers.provider.getBalance(HANDLER);
  
  // Balances Core
  const usdcTokenId = await handler.usdcCoreTokenId();
  const spotTokenBTC = await handler.spotTokenBTC();
  const spotTokenHYPE = await handler.spotTokenHYPE();
  
  const usdcBal = await l1read.spotBalance(HANDLER, usdcTokenId);
  const btcBal = await l1read.spotBalance(HANDLER, spotTokenBTC);
  const hypeBal = await l1read.spotBalance(HANDLER, spotTokenHYPE);
  const equity = await views.equitySpotUsd1e18(HANDLER);
  
  // File d'attente
  let queueLength = 0;
  const queueItems = [];
  try {
    while (true) {
      const request = await vault.withdrawQueue(queueLength);
      queueItems.push({ 
        id: queueLength, 
        user: request.user,
        shares: request.shares,
        feeBpsSnapshot: request.feeBpsSnapshot,
        settled: request.settled
      });
      queueLength++;
    }
  } catch {
    // Fin du tableau
  }

  // NAV et PPS
  const nav = await vault.nav1e18();
  const pps = await vault.pps1e18();
  const totalSupply = await vault.totalSupply();
  const pxHype = await views.oraclePxHype1e8(HANDLER);

  console.log("💰 BALANCES EVM:");
  console.log(`  Vault HYPE: ${ethers.formatEther(vaultBalance)} HYPE`);
  console.log(`  Handler HYPE: ${ethers.formatEther(handlerBalance)} HYPE`);
  
  console.log("\n💼 BALANCES SUR CORE:");
  console.log(`  USDC: ${ethers.formatUnits(usdcBal.total, 8)} USD`);
  console.log(`  BTC: ${btcBal.total.toString()}`);
  console.log(`  HYPE: ${hypeBal.total.toString()}`);
  console.log(`  Equity totale: ${ethers.formatEther(equity)} USD`);
  
  console.log("\n📊 ÉTAT DU VAULT:");
  console.log(`  NAV: ${ethers.formatEther(nav)} USD`);
  console.log(`  PPS: ${ethers.formatEther(pps)} USD`);
  console.log(`  Total Supply: ${ethers.formatEther(totalSupply)} sAXN1`);
  console.log(`  Prix HYPE: ${ethers.formatUnits(pxHype, 8)} USD`);
  
  console.log("\n📋 FILE D'ATTENTE:");
  console.log(`  Nombre de retraits en attente: ${queueLength}`);
  
  if (queueLength > 0) {
    for (const item of queueItems) {
      if (!item.settled) {
        const dueUsd1e18 = (BigInt(item.shares.toString()) * BigInt(pps.toString())) / BigInt(1e18);
        const grossHype1e18 = (dueUsd1e18 * BigInt(1e8)) / BigInt(pxHype.toString());
        const feeBps = BigInt(item.feeBpsSnapshot.toString());
        const feeHype1e18 = (feeBps > 0n && grossHype1e18 > 0n)
          ? (grossHype1e18 * feeBps) / BigInt(10000)
          : 0n;
        const netHype1e18 = grossHype1e18 - feeHype1e18;
        
        console.log(`\n  Retrait #${item.id}:`);
        console.log(`    Utilisateur: ${item.user}`);
        console.log(`    Shares: ${ethers.formatEther(item.shares)} sAXN1`);
        console.log(`    Montant HYPE brut dû: ${ethers.formatEther(grossHype1e18)} HYPE`);
        console.log(`    Frais: ${ethers.formatEther(feeHype1e18)} HYPE`);
        console.log(`    Montant net dû: ${ethers.formatEther(netHype1e18)} HYPE`);
        console.log(`    Cash disponible: ${ethers.formatEther(vaultBalance)} HYPE`);
        console.log(`    Déficit: ${ethers.formatEther(netHype1e18 - vaultBalance)} HYPE`);
      }
    }
  }

  // Analyse du problème
  console.log("\n" + "=".repeat(80));
  console.log("🔍 ANALYSE DU PROBLÈME:");
  console.log("=".repeat(80));
  
  if (queueLength > 0 && vaultBalance === 0n) {
    const firstRequest = queueItems.find(r => !r.settled);
    if (firstRequest) {
      const dueUsd1e18 = (BigInt(firstRequest.shares.toString()) * BigInt(pps.toString())) / BigInt(1e18);
      const grossHype1e18 = (dueUsd1e18 * BigInt(1e8)) / BigInt(pxHype.toString());
      const feeBps2 = BigInt(firstRequest.feeBpsSnapshot.toString());
      const feeHype1e18 = (feeBps2 > 0n && grossHype1e18 > 0n)
        ? (grossHype1e18 * feeBps2) / BigInt(10000)
        : 0n;
      const netHype1e18 = grossHype1e18 - feeHype1e18;
      
      console.log(`\n❌ PROBLÈME IDENTIFIÉ:`);
      console.log(`  Le vault n'a pas assez de cash (0.0 HYPE) pour régler le retrait.`);
      console.log(`  Montant nécessaire: ${ethers.formatEther(netHype1e18)} HYPE`);
      
      console.log(`\n💡 TENTATIVES DE RAPPEL:`);
      console.log(`  1. Lors du retrait initial, le vault a tenté d'appeler:`);
      console.log(`     handler.pullHypeFromCoreToEvm() → ÉCHEC (ordres spot ne fonctionnent pas)`);
      console.log(`  2. Tentative manuelle recallFromCoreAndSweep() → ÉCHEC (erreur BAL())`);
      console.log(`     Raison: pullHypeFromCoreToEvm() échoue car les ordres spot pour acheter`);
      console.log(`     du HYPE ne s'exécutent pas, donc le handler n'a jamais de HYPE natif.`);
      
      console.log(`\n📈 FONDS DISPONIBLES SUR CORE:`);
      console.log(`  Equity totale: ${ethers.formatEther(equity)} USD`);
      console.log(`  USDC: ${ethers.formatUnits(usdcBal.total, 8)} USD`);
      console.log(`  BTC: ${btcBal.total.toString()}`);
      console.log(`  HYPE: ${hypeBal.total.toString()}`);
      console.log(`  → Les fonds sont sur Core mais ne peuvent pas être rappelés car les`);
      console.log(`    ordres spot ne fonctionnent pas correctement.`);
      
      console.log(`\n🔧 SOLUTIONS POSSIBLES:`);
      console.log(`  1. Attendre que les ordres spot fonctionnent (problème technique à résoudre)`);
      console.log(`  2. Utiliser une autre méthode pour transférer les fonds (si disponible)`);
      console.log(`  3. Annuler le retrait et attendre une solution`);
      console.log(`  4. Vérifier si le problème des ordres spot est résolu et réessayer`);
    }
  } else if (queueLength === 0) {
    console.log(`\n✅ Aucun problème: pas de retrait en attente.`);
  } else {
    console.log(`\n✅ Le vault a assez de cash pour régler les retraits.`);
  }

  console.log("\n" + "=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  process.exit(1);
});

