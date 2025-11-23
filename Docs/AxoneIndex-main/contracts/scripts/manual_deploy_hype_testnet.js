const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const VAULT = process.env.VAULT || "0x83ec125f62521a15940857EdD19069d5cc4EAabE";
  const HANDLER = process.env.HANDLER || "0xa7b8306307572c3ec388939A4C18931D905519a1";
  const AMOUNT_HYPE = process.env.AMOUNT_HYPE || "0.1"; // HYPE à déployer
  const gasPrice = ethers.parseUnits(process.env.GAS_PRICE_GWEI || "2", "gwei");

  const [signer] = await ethers.getSigners();
  console.log("\n" + "=".repeat(80));
  console.log("📤 DÉPLOIEMENT MANUEL DE HYPE DU VAULT VERS CORE");
  console.log("=".repeat(80) + "\n");

  const vault = await ethers.getContractAt("VaultContract", VAULT);
  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);

  console.log("📝 Signer:", signer.address);
  console.log("📍 Vault:", VAULT);
  console.log("⚙️  Handler:", HANDLER);

  // Vérifier que le signer est le owner
  const owner = await vault.owner();
  if (signer.address.toLowerCase() !== owner.toLowerCase()) {
    throw new Error(`Le signer (${signer.address}) n'est pas le owner du vault (${owner})`);
  }

  // Vérifier la balance HYPE du vault
  const vaultBalance = await ethers.provider.getBalance(VAULT);
  const amountToDeploy = ethers.parseEther(AMOUNT_HYPE);

  console.log("\n💰 Balances:");
  console.log(`  Vault HYPE balance: ${ethers.formatEther(vaultBalance)} HYPE`);
  console.log(`  Montant à déployer: ${ethers.formatEther(amountToDeploy)} HYPE`);

  if (vaultBalance < amountToDeploy) {
    throw new Error(`Le vault n'a pas assez de HYPE. Balance: ${ethers.formatEther(vaultBalance)} HYPE, Demandé: ${ethers.formatEther(amountToDeploy)} HYPE`);
  }

  console.log("\n⚠️  IMPORTANT: Le VaultContract n'a pas de fonction publique pour déployer manuellement");
  console.log("   les HYPE existants vers Core.");
  console.log("\n   Mécanismes disponibles:");
  console.log("   1. Auto-deploy: Les nouveaux dépôts déclenchent automatiquement");
  console.log("      le déploiement si autoDeployBps > 0 (actuellement: 95%)");
  console.log("   2. Fonction dans le handler: executeDepositHype(bool)");
  console.log("      - Est 'onlyVault' (seul le vault peut l'appeler)");
  console.log("      - Est 'payable' (reçoit du HYPE natif)");
  console.log("\n   Pour déployer manuellement, vous devez:");
  console.log("   - Soit attendre un nouveau dépôt (qui déclenchera l'auto-deploy)");
  console.log("   - Soit créer une fonction dans le vault pour appeler le handler");
  console.log("   - Soit utiliser un contrat proxy/relay qui peut transférer les fonds");

  console.log("\n" + "=".repeat(80));
  console.log("📋 FONCTIONNEMENT DE executeDepositHype:");
  console.log("=".repeat(80));
  console.log(`
La fonction executeDepositHype dans CoreInteractionHandler fait:
1. Reçoit du HYPE natif (via msg.value)
2. Envoie le HYPE vers Core via l'adresse système HYPE Core
3. Convertit HYPE -> USDC sur Core via un ordre IOC
4. Alloue 50/50 de l'USDC en BTC/HYPE sur Core
5. Effectue un rebalance si forceRebalance = true

Signature:
  function executeDepositHype(bool forceRebalance) external payable onlyVault whenNotPaused

Limitations:
  - Seul le vault peut appeler cette fonction (modifier onlyVault)
  - Le vault doit envoyer du HYPE natif avec l'appel
  - Nécessite que le compte HyperCore soit initialisé
  `);

  // Vérifier l'état actuel
  const autoDeployBps = await vault.autoDeployBps();
  const handlerPaused = await handler.paused();
  const vaultPaused = await vault.paused();

  console.log("\n" + "=".repeat(80));
  console.log("📊 ÉTAT ACTUEL:");
  console.log("=".repeat(80));
  console.log(`  Auto-deploy (bps): ${autoDeployBps.toString()} (${(Number(autoDeployBps) / 100).toFixed(2)}%)`);
  console.log(`  Vault paused: ${vaultPaused}`);
  console.log(`  Handler paused: ${handlerPaused}`);
  console.log(`  Vault balance: ${ethers.formatEther(vaultBalance)} HYPE`);

  if (vaultBalance > 0 && Number(autoDeployBps) === 0) {
    console.log("\n⚠️  Il y a des HYPE sur le vault mais l'auto-deploy est à 0%.");
    console.log("   Ces fonds resteront sur le vault jusqu'à ce qu'ils soient:");
    console.log("   - Retirés par les utilisateurs");
    console.log("   - Déployés manuellement (nécessite une fonction dans le vault)");
    console.log("   - Déployés lors d'un futur dépôt si auto-deploy est réactivé");
  }

  console.log("\n" + "=".repeat(80));
  console.log("💡 SOLUTION PROPOSÉE:");
  console.log("=".repeat(80));
  console.log(`
Pour déployer manuellement les HYPE existants, vous pourriez:
1. Créer une fonction dans VaultContract:
   
   function deployHypeToCore(uint256 amount1e18, bool forceRebalance) 
       external onlyOwner nonReentrant {
       require(amount1e18 > 0, "amount=0");
       require(amount1e18 <= address(this).balance, "insufficient balance");
       handler.executeDepositHype{value: amount1e18}(forceRebalance);
       emit NavUpdated(nav1e18());
   }

2. Ou utiliser un contrat helper/intermédiaire qui peut:
   - Recevoir des HYPE du vault
   - Appeler handler.executeDepositHype pour le vault
   
3. Ou attendre les prochains dépôts qui déclencheront l'auto-deploy
  `);

  console.log("\n" + "=".repeat(80));
  console.log("✅ Analyse terminée");
  console.log("=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  process.exit(1);
});



