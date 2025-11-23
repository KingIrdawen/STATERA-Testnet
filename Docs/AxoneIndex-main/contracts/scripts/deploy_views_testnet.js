const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  console.log("\n🚀 Déploiement CoreInteractionViews sur HyperEVM Testnet\n");

  if (!process.env.TESTNET_RPC_URL || !process.env.PRIVATE_KEY) {
    throw new Error("Variables d'environnement TESTNET_RPC_URL ou PRIVATE_KEY manquantes (voir contracts/env)");
  }

  const [deployer] = await ethers.getSigners();
  console.log("📝 Déployeur:", deployer.address);
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
  const send = async (txPromise) => {
    const tx = await txPromise;
    const rcpt = await waitForReceipt(tx.hash);
    await delay(800);
    return rcpt;
  };

  // Adresses des contrats déployés
  const VAULT = process.env.VAULT || "0x7659E4D1E1CAf66cCd7573Fa640c33E5e6bbd2F9";

  console.log("\n🔧 Déploiement CoreInteractionViews...");
  const CoreInteractionViews = await ethers.getContractFactory("CoreInteractionViews");
  const views = await CoreInteractionViews.deploy({ gasPrice });
  await views.waitForDeployment();
  await delay(1000);
  const viewsAddress = await views.getAddress();
  console.log("✅ CoreInteractionViews:", viewsAddress);

  console.log("\n🔧 Configuration du VaultContract...");
  const vault = await ethers.getContractAt("VaultContract", VAULT);
  await send(vault.setCoreViews(viewsAddress, { gasPrice }));
  console.log("✅ Vault.coreViews() configuré avec:", viewsAddress);

  console.log("\n📋 Adresses:");
  console.log("CoreInteractionViews:", viewsAddress);
  console.log("VaultContract:", VAULT);
  console.log("\n🎉 Déploiement et configuration terminés.");
}

main().catch((e) => {
  console.error("❌ Erreur:", e);
  process.exit(1);
});


