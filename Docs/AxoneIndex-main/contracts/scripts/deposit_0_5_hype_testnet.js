const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  // Adresses du dernier déploiement
  const VAULT = process.env.VAULT || "0x83ec125f62521a15940857EdD19069d5cc4EAabE";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0xa51941b7744013c8BFe0b9F52A351aAe290588Dc";
  const HANDLER = process.env.HANDLER || "0xa7b8306307572c3ec388939A4C18931D905519a1";
  
  const gasPrice = ethers.parseUnits(process.env.GAS_PRICE_GWEI || "2", "gwei");

  const [signer] = await ethers.getSigners();
  console.log("\n💰 Dépôt de 0.5 HYPE sur le vault\n");
  console.log("📝 Signer:", signer.address);
  console.log("📍 Vault:", VAULT);
  console.log("🔍 CoreViews:", CORE_VIEWS);
  console.log("⚙️  Handler:", HANDLER);

  const vault = await ethers.getContractAt("VaultContract", VAULT);
  const coreViews = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);

  // Vérifier la configuration du vault
  console.log("\n🔍 Vérification de la configuration du vault...");
  const vaultOwner = await vault.owner();
  const vaultHandler = await vault.handler();
  const vaultCoreViews = await vault.coreViews();
  const vaultPaused = await vault.paused();
  const depositFeeBps = await vault.depositFeeBps();
  const autoDeployBps = await vault.autoDeployBps();

  console.log("  Owner:", vaultOwner);
  console.log("  Handler configuré:", vaultHandler);
  console.log("  CoreViews configuré:", vaultCoreViews);
  console.log("  Paused:", vaultPaused);
  console.log("  Deposit fee (bps):", depositFeeBps.toString());
  console.log("  Auto-deploy (bps):", autoDeployBps.toString());

  // Vérifier si coreViews est configuré
  if (vaultCoreViews === ethers.ZeroAddress || vaultCoreViews.toLowerCase() !== CORE_VIEWS.toLowerCase()) {
    console.log("\n⚠️  CoreViews n'est pas configuré. Configuration en cours...");
    if (signer.address.toLowerCase() !== vaultOwner.toLowerCase()) {
      throw new Error(`Le signer (${signer.address}) n'est pas le owner du vault (${vaultOwner})`);
    }
    const txSetViews = await vault.setCoreViews(coreViews.target, { gasPrice });
    console.log("  Tx hash (setCoreViews):", txSetViews.hash);
    await txSetViews.wait();
    console.log("  ✅ CoreViews configuré");
  }

  // Vérifier si le vault est en pause
  if (vaultPaused) {
    throw new Error("Le vault est en pause. Déposez-le d'abord avec unpause()");
  }

  // Vérifier le prix oracle HYPE avant le dépôt
  try {
    const pxHype = await coreViews.oraclePxHype1e8(HANDLER);
    console.log("\n📊 Prix oracle HYPE:", ethers.formatUnits(pxHype, 8), "USD");
    if (pxHype === 0n) {
      throw new Error("Prix oracle HYPE est zéro - impossible de calculer le NAV");
    }
  } catch (e) {
    console.warn("  ⚠️  Impossible de récupérer le prix oracle:", e.message);
  }

  // Balance avant le dépôt
  const balanceBefore = await ethers.provider.getBalance(signer.address);
  console.log("\n💵 Balance HYPE avant:", ethers.formatEther(balanceBefore), "HYPE");

  // Faire le dépôt de 0.5 HYPE
  const amount = ethers.parseEther("0.5"); // 0.5 HYPE en wei
  console.log("\n📤 Envoi du dépôt de 0.5 HYPE...");
  
  const tx = await vault.deposit({ value: amount, gasPrice });
  console.log("  Tx hash:", tx.hash);
  
  const rcpt = await tx.wait();
  console.log("  ✅ Transaction confirmée (block:", rcpt.blockNumber, ")");
  
  // Vérifier les événements
  const depositEvent = rcpt.logs.find(log => {
    try {
      const parsed = vault.interface.parseLog(log);
      return parsed && parsed.name === "Deposit";
    } catch {
      return false;
    }
  });
  
  if (depositEvent) {
    const parsed = vault.interface.parseLog(depositEvent);
    console.log("\n📊 Détails du dépôt:");
    console.log("  Utilisateur:", parsed.args.user);
    console.log("  Montant HYPE:", ethers.formatEther(parsed.args.amount1e18), "HYPE");
    console.log("  Shares mintées:", ethers.formatEther(parsed.args.sharesMinted), "sAXN1");
  }

  // Balance après le dépôt
  const balanceAfter = await ethers.provider.getBalance(signer.address);
  const sharesBalance = await vault.balanceOf(signer.address);
  const totalDeposits = await vault.deposits(signer.address);
  
  console.log("\n💵 Balance HYPE après:", ethers.formatEther(balanceAfter), "HYPE");
  console.log("🎫 Shares détenues:", ethers.formatEther(sharesBalance), "sAXN1");
  console.log("📈 Dépôts cumulés:", ethers.formatEther(totalDeposits), "HYPE");
  
  console.log("\n✅ Dépôt de 0.5 HYPE terminé avec succès!");
}

main().catch((e) => {
  console.error("\n❌ Erreur lors du dépôt:", e);
  process.exit(1);
});



