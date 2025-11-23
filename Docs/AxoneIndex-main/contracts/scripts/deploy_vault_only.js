const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  const Vault = await ethers.getContractFactory("VaultContract");
  const vault = await Vault.deploy();
  await vault.waitForDeployment();
  console.log("✅ VaultContract:", await vault.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

