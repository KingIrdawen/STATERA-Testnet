const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  // Adresses du dernier déploiement (2025-11-21)
  const VAULT = process.env.VAULT || "0x72eEdd6cE1039E429e44F86b3DcA4A45e206a410";
  const HANDLER = process.env.HANDLER || "0x7551Ca74B5f2Cb3EF9f2e885f2fe9BF993bF570c";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x1E2B0DccE25Eeb479F83DABE24ab687C6AB64292";
  const L1READ = process.env.L1READ || "0xacE17480F4d157C48180f4ed10AB483238143e11";
  const WITHDRAW_ID = process.env.WITHDRAW_ID || "0"; // ID du retrait à régler
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
  console.log("💰 RÈGLEMENT DU RETRAIT EN ATTENTE");
  console.log("=".repeat(80) + "\n");

  const [signer] = await ethers.getSigners();
  const vault = await ethers.getContractAt("VaultContract", VAULT);
  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);
  const l1read = await ethers.getContractAt("L1Read", L1READ);

  console.log("📝 Signer:", signer.address);
  console.log("📍 Vault:", VAULT);
  console.log("⚙️  Handler:", HANDLER);

  // Vérifier la file d'attente
  let queueLength = 0;
  try {
    while (true) {
      await vault.withdrawQueue(queueLength);
      queueLength++;
    }
  } catch {
    // Fin du tableau atteinte
  }

  console.log(`\n📋 File d'attente: ${queueLength} demande(s)`);

  if (queueLength === 0) {
    console.log("✅ Aucun retrait en attente.");
    return;
  }

  // Afficher les retraits en attente
  console.log("\n" + "─".repeat(80));
  console.log("📋 RETRAITS EN ATTENTE:");
  console.log("─".repeat(80));
  
  for (let i = 0; i < queueLength; i++) {
    const request = await vault.withdrawQueue(i);
    console.log(`\n  Retrait #${i}:`);
    console.log(`    Utilisateur: ${request.user}`);
    console.log(`    Shares: ${ethers.formatEther(request.shares)} sAXN1`);
    console.log(`    Frais (bps): ${request.feeBpsSnapshot.toString()}`);
    console.log(`    Statut: ${request.settled ? "✅ Règlementé" : "⏳ En attente"}`);
  }

  const withdrawId = Number(WITHDRAW_ID);
  if (withdrawId >= queueLength) {
    throw new Error(`ID de retrait invalide: ${withdrawId} (max: ${queueLength - 1})`);
  }

  const request = await vault.withdrawQueue(withdrawId);
  if (request.settled) {
    throw new Error(`Le retrait #${withdrawId} est déjà réglé`);
  }

  // Obtenir les balances initiales
  const vaultBalanceBefore = await ethers.provider.getBalance(VAULT);
  const signerBalanceBefore = await ethers.provider.getBalance(signer.address);
  const navBefore = await vault.nav1e18();
  const ppsBefore = await vault.pps1e18();
  const pxHype = await views.oraclePxHype1e8(HANDLER);

  // Calculer le montant dû
  const dueUsd1e18 = (request.shares * ppsBefore) / BigInt(1e18);
  const grossHype1e18 = (dueUsd1e18 * BigInt(1e8)) / pxHype;
  const feeHype1e18 = (request.feeBpsSnapshot > 0 && grossHype1e18 > 0)
    ? (grossHype1e18 * BigInt(request.feeBpsSnapshot)) / BigInt(10000)
    : 0n;
  const payHype1e18 = grossHype1e18 - feeHype1e18;

  console.log(`\n📊 Détails du retrait #${withdrawId}:`);
  console.log(`  Shares: ${ethers.formatEther(request.shares)} sAXN1`);
  console.log(`  Montant HYPE brut: ${ethers.formatEther(grossHype1e18)} HYPE`);
  console.log(`  Frais: ${ethers.formatEther(feeHype1e18)} HYPE`);
  console.log(`  Montant net à payer: ${ethers.formatEther(payHype1e18)} HYPE`);
  console.log(`  Cash disponible: ${ethers.formatEther(vaultBalanceBefore)} HYPE`);

  if (vaultBalanceBefore < payHype1e18) {
    console.log(`\n⚠️  Le vault n'a pas assez de cash.`);
    console.log(`   Le handler devrait rappeler des fonds automatiquement lors du retrait initial.`);
    console.log(`   Tentative de règlement quand même...`);
  }

  // Règler le retrait
  console.log("\n" + "─".repeat(80));
  console.log("📤 RÈGLEMENT DU RETRAIT:");
  console.log("─".repeat(80));
  console.log(`\n📤 Envoi de la transaction settleWithdraw...`);
  console.log(`  ID: ${withdrawId}`);
  console.log(`  Destinataire: ${request.user}`);
  
  const tx = await vault.settleWithdraw(withdrawId, request.user, { gasPrice });
  console.log(`  Tx hash: ${tx.hash}`);
  
  console.log(`  ⏳ Attente de la confirmation...`);
  const rcpt = await waitForReceipt(tx.hash);
  console.log(`  ✅ Transaction confirmée (block: ${rcpt.blockNumber})`);

  // Analyser les événements
  console.log("\n" + "─".repeat(80));
  console.log("📋 ANALYSE DES ÉVÉNEMENTS:");
  console.log("─".repeat(80));

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
    console.log(`  ID: ${parsed.args.id.toString()}`);
    console.log(`  Destinataire: ${parsed.args.to}`);
    console.log(`  Montant: ${ethers.formatEther(parsed.args.amount1e18)} HYPE`);
  }

  // Attendre quelques blocs
  await delay(3000);

  // Vérifier les balances finales
  const vaultBalanceAfter = await ethers.provider.getBalance(VAULT);
  const signerBalanceAfter = await ethers.provider.getBalance(signer.address);
  const navAfter = await vault.nav1e18();
  const ppsAfter = await vault.pps1e18();

  console.log(`\n📊 État après règlement:`);
  console.log(`  Vault HYPE balance: ${ethers.formatEther(vaultBalanceAfter)} HYPE`);
  console.log(`    (avant: ${ethers.formatEther(vaultBalanceBefore)} HYPE)`);
  console.log(`    Différence: ${ethers.formatEther(vaultBalanceAfter - vaultBalanceBefore)} HYPE`);
  console.log(`  NAV: ${ethers.formatEther(navAfter)} USD`);
  console.log(`    (avant: ${ethers.formatEther(navBefore)} USD)`);
  console.log(`  PPS: ${ethers.formatEther(ppsAfter)} USD`);
  console.log(`    (avant: ${ethers.formatEther(ppsBefore)} USD)`);

  // Vérifier que le retrait est réglé
  const requestAfter = await vault.withdrawQueue(withdrawId);
  console.log(`  Statut du retrait: ${requestAfter.settled ? "✅ Règlementé" : "❌ Toujours en attente"}`);

  console.log("\n" + "=".repeat(80));
  console.log("✅ Règlement terminé");
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


