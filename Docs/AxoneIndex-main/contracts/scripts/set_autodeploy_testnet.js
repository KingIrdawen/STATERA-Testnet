const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const VAULT = process.env.VAULT || "0x83ec125f62521a15940857EdD19069d5cc4EAabE";
  const AUTO_DEPLOY_BPS = process.env.AUTO_DEPLOY_BPS || "9500"; // 95%
  const gasPrice = ethers.parseUnits(process.env.GAS_PRICE_GWEI || "2", "gwei");

  const [signer] = await ethers.getSigners();
  console.log("\n⚙️  Configuration de l'auto-deploy sur le vault\n");
  console.log("📝 Signer:", signer.address);
  console.log("📍 Vault:", VAULT);

  const vault = await ethers.getContractAt("VaultContract", VAULT);
  
  // Vérifier que le signer est le owner
  const owner = await vault.owner();
  if (signer.address.toLowerCase() !== owner.toLowerCase()) {
    throw new Error(`Le signer (${signer.address}) n'est pas le owner du vault (${owner})`);
  }

  // Récupérer les frais actuels
  const depositFeeBps = await vault.depositFeeBps();
  const withdrawFeeBps = await vault.withdrawFeeBps();
  const currentAutoDeployBps = await vault.autoDeployBps();
  
  const newAutoDeployBps = parseInt(AUTO_DEPLOY_BPS);
  if (newAutoDeployBps < 0 || newAutoDeployBps > 10000) {
    throw new Error(`Auto-deploy bps doit être entre 0 et 10000 (${newAutoDeployBps} fourni)`);
  }

  console.log("\n📊 Configuration actuelle:");
  console.log(`  Deposit fee (bps): ${depositFeeBps.toString()}`);
  console.log(`  Withdraw fee (bps): ${withdrawFeeBps.toString()}`);
  console.log(`  Auto-deploy (bps): ${currentAutoDeployBps.toString()}` + 
              ` (${(Number(currentAutoDeployBps) / 100).toFixed(2)}%)`);

  console.log(`\n🔧 Nouvelle configuration:`);
  console.log(`  Deposit fee (bps): ${depositFeeBps.toString()} (inchangé)`);
  console.log(`  Withdraw fee (bps): ${withdrawFeeBps.toString()} (inchangé)`);
  console.log(`  Auto-deploy (bps): ${newAutoDeployBps}` + 
              ` (${(newAutoDeployBps / 100).toFixed(2)}%)`);

  if (Number(currentAutoDeployBps) === newAutoDeployBps) {
    console.log("\n⚠️  L'auto-deploy est déjà à cette valeur. Aucune modification nécessaire.");
    return;
  }

  // Mettre à jour l'auto-deploy
  console.log("\n📤 Envoi de la transaction...");
  const tx = await vault.setFees(depositFeeBps, withdrawFeeBps, newAutoDeployBps, { gasPrice });
  console.log(`  Tx hash: ${tx.hash}`);
  
  const rcpt = await tx.wait();
  console.log(`  ✅ Transaction confirmée (block: ${rcpt.blockNumber})`);

  // Vérifier la nouvelle valeur
  const updatedAutoDeployBps = await vault.autoDeployBps();
  console.log(`\n✅ Auto-deploy mis à jour avec succès!`);
  console.log(`   Nouvelle valeur: ${updatedAutoDeployBps.toString()} bps (${(Number(updatedAutoDeployBps) / 100).toFixed(2)}%)`);

  if (newAutoDeployBps > 0) {
    console.log(`\n⚠️  ATTENTION: L'auto-deploy est maintenant activé à ${(newAutoDeployBps / 100).toFixed(2)}%.`);
    console.log(`   Assurez-vous que le compte HyperCore du handler est initialisé avant de faire des dépôts.`);
    console.log(`   Sinon, les dépôts échoueront avec l'erreur CoreAccountMissing().`);
  }
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  process.exit(1);
});



