const hre = require("hardhat");

async function main() {
  const { ethers } = hre;

  // Nouvelles adresses déployées
  const HANDLER = "0xDEfFFa2c15a653A0a817fbA4886407a129C04451";
  const VAULT = "0xBB8d288488565BEbFe0d35028667bADbc3Cea897";
  const CORE_VIEWS = "0x02c7e2E10e5B4995975BCd3fD2cD1799d05781C8"; // existant
  const FEE_VAULT = "0xa47C0aC4Fe9ee497a54bF323BA0c5F6d1B49111A"; // existant

  const [signer] = await ethers.getSigners();
  const who = await signer.getAddress();

  console.log("Deployer:", who);
  console.log("Handler:", HANDLER);
  console.log("Vault:", VAULT);

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const vault = await ethers.getContractAt("VaultContract", VAULT);

  // Config Handler
  console.log("\n📝 Configuration du Handler...");
  
  await (await handler.setVault(VAULT)).wait();
  console.log("✅ setVault");

  await (await handler.setHypeCoreLink("0x2222222222222222222222222222222222222222", 1105)).wait();
  console.log("✅ setHypeCoreLink");

  await (await handler.setUsdcCoreLink("0x2000000000000000000000000000000000000000", 0)).wait();
  console.log("✅ setUsdcCoreLink");

  await (await handler.setSpotIds(1054, 1035)).wait();
  console.log("✅ setSpotIds (BTC=1054, HYPE=1035)");

  await (await handler.setSpotTokenIds(0, 1129, 1105)).wait();
  console.log("✅ setSpotTokenIds (USDC=0, BTC=1129, HYPE=1105)");

  await (await handler.setRebalancer(who)).wait();
  console.log("✅ setRebalancer");

  // Config Vault
  console.log("\n📝 Configuration du Vault...");

  await (await vault.setHandler(HANDLER)).wait();
  console.log("✅ setHandler");

  await (await vault.setCoreViews(CORE_VIEWS)).wait();
  console.log("✅ setCoreViews");

  // Frais: depositFeeBps=50 (0.5%), withdrawFeeBps=50 (0.5%), autoDeployBps=1000 (10% pour tester)
  await (await vault.setFees(50, 50, 1000)).wait();
  console.log("✅ setFees (autoDeployBps=1000 pour test)");

  console.log("\n🎉 Configuration terminée.");
  console.log("⚠️ N'oublie pas de faire un micro-transfert Core vers le handler avant de tester un dépôt:");
  console.log(`   Handler: ${HANDLER}`);
}

main().catch((err) => {
  console.error("❌ Erreur configuration:", err);
  process.exit(1);
});

