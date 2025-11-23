const hre = require("hardhat");

async function main() {
  const { ethers } = hre;

  const VAULT = process.env.VAULT;
  if (!VAULT) {
    throw new Error("Merci de fournir VAULT dans l'environnement");
  }

  const amount1e18 = process.env.DEPOSIT_HYPE_1E18
    ? BigInt(process.env.DEPOSIT_HYPE_1E18)
    : 10n ** 17n; // 0.1 HYPE par défaut

  const gasPrice = ethers.parseUnits(process.env.GAS_PRICE_GWEI || "3", "gwei");
  const gasLimit = BigInt(process.env.GAS_LIMIT || "8000000");

  const signer = (await ethers.getSigners())[0];
  const who = await signer.getAddress();

  console.log("Deployer:", who);
  console.log("Vault:   ", VAULT);
  console.log("Amount:  ", amount1e18.toString(), "wei");
  console.log("GasPrice:", gasPrice.toString());
  console.log("GasLimit:", gasLimit.toString());

  const vault = await ethers.getContractAt("VaultContract", VAULT, signer);

  // 1) Tentative avec estimateGas (pour comparer)
  try {
    const est = await vault.deposit.estimateGas({ value: amount1e18, gasPrice });
    console.log("estimateGas(deposit) OK:", est.toString());
  } catch (err) {
    console.error(
      "estimateGas(deposit) reverted:",
      err?.error?.message || err?.message || String(err)
    );
  }

  // 2) Envoi brut en fixant gasLimit pour contourner estimateGas
  const data = vault.interface.encodeFunctionData("deposit");

  try {
    const tx = await signer.sendTransaction({
      to: VAULT,
      data,
      value: amount1e18,
      gasPrice,
      gasLimit,
    });
    console.log("tx sent:", tx.hash);
    const rcpt = await tx.wait();
    console.log("tx mined in block", rcpt.blockNumber, "status:", rcpt.status);
  } catch (err) {
    console.error(
      "sendTransaction(deposit) reverted:",
      err?.error?.message || err?.message || String(err)
    );
  }
}

main().catch((e) => {
  console.error("❌ debug_deposit_force_testnet error:", e);
  process.exit(1);
});


