const hre = require("hardhat");

async function main() {
  const { ethers } = hre;

  // Dernières adresses déployées (correction bbo+CoreWriter)
  const HANDLER = "0x2D4998056b6672eEc2E2f671c96aC0863c242779";
  const VAULT = "0xfE516927432E52Cb9704272D3b8Bb1b844E4aABE";
  const CORE_VIEWS = "0x02c7e2E10e5B4995975BCd3fD2cD1799d05781C8";
  const FEE_VAULT = "0xa47C0aC4Fe9ee497a54bF323BA0c5F6d1B49111A";

  const [signer] = await ethers.getSigners();
  const who = await signer.getAddress();

  console.log("Deployer:", who);
  console.log("Handler:", HANDLER);
  console.log("Vault:", VAULT);

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const vault = await ethers.getContractAt("VaultContract", VAULT);

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

  console.log("\n📝 Configuration du Vault...");

  await (await vault.setHandler(HANDLER)).wait();
  console.log("✅ setHandler");

  await (await vault.setCoreViews(CORE_VIEWS)).wait();
  console.log("✅ setCoreViews");

  await (await vault.setFees(50, 50, 1000)).wait();
  console.log("✅ setFees (autoDeployBps=1000)");

  console.log("\n🎉 Configuration terminée.");
  console.log("⚠️ Micro-transfert Core requis vers:", HANDLER);
}

main().catch((err) => {
  console.error("❌ Erreur:", err);
  process.exit(1);
});

