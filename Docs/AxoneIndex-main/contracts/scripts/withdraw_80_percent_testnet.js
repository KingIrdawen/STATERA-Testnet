const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const VAULT = process.env.VAULT || "0x83ec125f62521a15940857EdD19069d5cc4EAabE";
  const HANDLER = process.env.HANDLER || "0xa7b8306307572c3ec388939A4C18931D905519a1";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0xa51941b7744013c8BFe0b9F52A351aAe290588Dc";
  const PERCENTAGE = parseFloat(process.env.PERCENTAGE || "80"); // 80% par défaut
  const gasPrice = ethers.parseUnits(process.env.GAS_PRICE_GWEI || "2", "gwei");

  const [signer] = await ethers.getSigners();
  console.log("\n" + "=".repeat(80));
  console.log("💰 RETRAIT DE HYPE DU VAULT");
  console.log("=".repeat(80) + "\n");

  const vault = await ethers.getContractAt("VaultContract", VAULT);
  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);

  console.log("📝 Signer:", signer.address);
  console.log("📍 Vault:", VAULT);

  // Vérifier la balance HYPE du vault
  const vaultBalance = await ethers.provider.getBalance(VAULT);
  console.log("\n💰 Balance HYPE du vault:", ethers.formatEther(vaultBalance), "HYPE");

  // Calculer le montant à retirer (80% de la balance)
  const withdrawPercentage = PERCENTAGE / 100;
  const targetHypeAmount = vaultBalance * BigInt(Math.floor(withdrawPercentage * 10000)) / BigInt(10000);
  
  console.log(`📊 Montant cible à retirer (${PERCENTAGE}%):`, ethers.formatEther(targetHypeAmount), "HYPE");

  // Obtenir le PPS (Price Per Share) actuel
  const pps = await vault.pps1e18();
  const ppsDecimal = Number(pps) / 1e18;
  console.log("📈 Price Per Share (PPS):", ppsDecimal.toFixed(18), "USD per share");

  // Obtenir le prix HYPE en USD (1e8)
  const pxHype = await views.oraclePxHype1e8(HANDLER);
  const pxHypeDecimal = Number(pxHype) / 1e8;
  console.log("💵 Prix HYPE:", pxHypeDecimal.toFixed(8), "USD");

  // Convertir le montant HYPE en USD (1e18)
  const targetUsd1e18 = (targetHypeAmount * pxHype) / BigInt(1e8);
  console.log("💵 Montant USD équivalent:", ethers.formatEther(targetUsd1e18), "USD");

  // Calculer le nombre de shares nécessaire
  // shares = (targetUsd1e18 * 1e18) / pps
  const sharesNeeded = (targetUsd1e18 * BigInt(1e18)) / pps;
  console.log("🎫 Nombre de shares nécessaires:", ethers.formatEther(sharesNeeded), "sAXN1");

  // Vérifier combien de shares le signer détient
  const signerShares = await vault.balanceOf(signer.address);
  console.log("🎫 Shares détenues par le signer:", ethers.formatEther(signerShares), "sAXN1");

  if (signerShares < sharesNeeded) {
    console.log("\n⚠️  ATTENTION: Le signer n'a pas assez de shares !");
    console.log(`   Shares nécessaires: ${ethers.formatEther(sharesNeeded)} sAXN1`);
    console.log(`   Shares détenues: ${ethers.formatEther(signerShares)} sAXN1`);
    console.log(`   Différence: ${ethers.formatEther(sharesNeeded - signerShares)} sAXN1`);
    
    // Si le signer a moins de shares, retirer tout ce qu'il a
    if (signerShares > 0n) {
      console.log("\n💡 Ajustement: retirer toutes les shares disponibles du signer");
      const adjustedShares = signerShares;
      
      // Calculer le montant HYPE réel qui sera retiré
      const actualUsd1e18 = (adjustedShares * pps) / BigInt(1e18);
      const actualHype1e18 = (actualUsd1e18 * BigInt(1e8)) / pxHype;
      
      console.log("\n📊 Ajustement du retrait:");
      console.log(`   Shares à retirer: ${ethers.formatEther(adjustedShares)} sAXN1`);
      console.log(`   Montant HYPE estimé: ${ethers.formatEther(actualHype1e18)} HYPE`);
      
      // Vérifier les frais de retrait
      const grossHype1e18 = actualHype1e18;
      const withdrawFeeBps = await vault.getWithdrawFeeBpsForAmount(grossHype1e18);
      const feeHype1e18 = withdrawFeeBps > 0 
        ? (grossHype1e18 * BigInt(withdrawFeeBps)) / BigInt(10000)
        : BigInt(0);
      const netHype1e18 = grossHype1e18 - feeHype1e18;
      
      console.log(`   Frais de retrait (${withdrawFeeBps} bps): ${ethers.formatEther(feeHype1e18)} HYPE`);
      console.log(`   Montant net à recevoir: ${ethers.formatEther(netHype1e18)} HYPE`);

      // Vérifier si le vault a assez de cash
      const cash = await ethers.provider.getBalance(VAULT);
      console.log(`   Cash disponible dans le vault: ${ethers.formatEther(cash)} HYPE`);
      
      if (cash < netHype1e18) {
        console.log("\n⚠️  Le vault n'a pas assez de cash. Le retrait sera ajouté à la file d'attente.");
        console.log("   Le handler tentera de rappeler des fonds de Core si nécessaire.");
      }

      // Effectuer le retrait
      console.log("\n📤 Envoi de la transaction de retrait...");
      const tx = await vault.withdraw(adjustedShares, { gasPrice });
      console.log(`   Tx hash: ${tx.hash}`);
      
      const rcpt = await tx.wait();
      console.log(`   ✅ Transaction confirmée (block: ${rcpt.blockNumber})`);

      // Vérifier les événements
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
        console.log("\n✅ Retrait effectué immédiatement:");
        console.log(`   Montant retiré: ${ethers.formatEther(parsed.args.amount1e18)} HYPE`);
        console.log(`   Destinataire: ${parsed.args.to}`);
      } else if (withdrawRequestedEvent) {
        const parsed = vault.interface.parseLog(withdrawRequestedEvent);
        console.log("\n📋 Retrait ajouté à la file d'attente:");
        console.log(`   ID de la demande: ${parsed.args.id.toString()}`);
        console.log(`   Shares: ${ethers.formatEther(parsed.args.shares)} sAXN1`);
        console.log(`   Utilisateur: ${parsed.args.user}`);
      }

      // Vérifier la nouvelle balance
      const newVaultBalance = await ethers.provider.getBalance(VAULT);
      const newSignerShares = await vault.balanceOf(signer.address);
      const signerBalance = await ethers.provider.getBalance(signer.address);
      
      console.log("\n📊 État après retrait:");
      console.log(`   Vault balance: ${ethers.formatEther(newVaultBalance)} HYPE`);
      console.log(`   Shares restantes: ${ethers.formatEther(newSignerShares)} sAXN1`);
      console.log(`   Balance signer: ${ethers.formatEther(signerBalance)} HYPE`);

      return;
    } else {
      throw new Error("Le signer n'a pas de shares à retirer");
    }
  }

  // Si le signer a assez de shares, retirer le montant calculé
  console.log("\n📊 Détails du retrait:");
  console.log(`   Shares à retirer: ${ethers.formatEther(sharesNeeded)} sAXN1`);
  
  // Calculer les frais de retrait
  const grossHype1e18 = targetHypeAmount;
  const withdrawFeeBps = await vault.getWithdrawFeeBpsForAmount(grossHype1e18);
  const feeHype1e18 = withdrawFeeBps > 0 
    ? (grossHype1e18 * BigInt(withdrawFeeBps)) / BigInt(10000)
    : BigInt(0);
  const netHype1e18 = grossHype1e18 - feeHype1e18;
  
  console.log(`   Montant HYPE brut: ${ethers.formatEther(grossHype1e18)} HYPE`);
  console.log(`   Frais de retrait (${withdrawFeeBps} bps): ${ethers.formatEther(feeHype1e18)} HYPE`);
  console.log(`   Montant net à recevoir: ${ethers.formatEther(netHype1e18)} HYPE`);

  // Vérifier si le vault a assez de cash
  const cash = await ethers.provider.getBalance(VAULT);
  console.log(`   Cash disponible dans le vault: ${ethers.formatEther(cash)} HYPE`);
  
  if (cash < netHype1e18) {
    console.log("\n⚠️  Le vault n'a pas assez de cash. Le retrait sera ajouté à la file d'attente.");
    console.log("   Le handler tentera de rappeler des fonds de Core si nécessaire.");
  }

  // Effectuer le retrait
  console.log("\n📤 Envoi de la transaction de retrait...");
  const tx = await vault.withdraw(sharesNeeded, { gasPrice });
  console.log(`   Tx hash: ${tx.hash}`);
  
  const rcpt = await tx.wait();
  console.log(`   ✅ Transaction confirmée (block: ${rcpt.blockNumber})`);

  // Vérifier les événements
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
    console.log("\n✅ Retrait effectué immédiatement:");
    console.log(`   Montant retiré: ${ethers.formatEther(parsed.args.amount1e18)} HYPE`);
    console.log(`   Destinataire: ${parsed.args.to}`);
  } else if (withdrawRequestedEvent) {
    const parsed = vault.interface.parseLog(withdrawRequestedEvent);
    console.log("\n📋 Retrait ajouté à la file d'attente:");
    console.log(`   ID de la demande: ${parsed.args.id.toString()}`);
    console.log(`   Shares: ${ethers.formatEther(parsed.args.shares)} sAXN1`);
    console.log(`   Utilisateur: ${parsed.args.user}`);
  }

  // Vérifier la nouvelle balance
  const newVaultBalance = await ethers.provider.getBalance(VAULT);
  const newSignerShares = await vault.balanceOf(signer.address);
  const signerBalance = await ethers.provider.getBalance(signer.address);
  
  console.log("\n📊 État après retrait:");
  console.log(`   Vault balance: ${ethers.formatEther(newVaultBalance)} HYPE`);
  console.log(`   Shares restantes: ${ethers.formatEther(newSignerShares)} sAXN1`);
  console.log(`   Balance signer: ${ethers.formatEther(signerBalance)} HYPE`);

  console.log("\n" + "=".repeat(80));
  console.log("✅ Retrait terminé avec succès");
  console.log("=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  process.exit(1);
});

