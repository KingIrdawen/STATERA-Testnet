const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0xa7b8306307572c3ec388939A4C18931D905519a1";
  const L1READ = process.env.L1READ || "0x4F730c91A1a4C3cC4733a96eF6Ea52901164c761";
  const VAULT = process.env.VAULT || "0x83ec125f62521a15940857EdD19069d5cc4EAabE";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 VÉRIFICATION DU COMPTE HYPERCORE DU HANDLER");
  console.log("=".repeat(80) + "\n");

  const l1read = await ethers.getContractAt("L1Read", L1READ);
  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const vault = await ethers.getContractAt("VaultContract", VAULT);

  console.log("📍 Adresses:");
  console.log(`  Handler: ${HANDLER}`);
  console.log(`  Vault: ${VAULT}`);
  console.log(`  L1Read: ${L1READ}`);

  // Vérifier si le compte HyperCore du handler existe
  console.log("\n🔍 Vérification du compte HyperCore...");
  try {
    const coreUserExists = await l1read.coreUserExists(HANDLER);
    const exists = coreUserExists.exists;
    
    console.log(`\n  📊 Résultat:`);
    console.log(`    Compte HyperCore existe: ${exists ? "✅ OUI" : "❌ NON"}`);
    
    if (!exists) {
      console.log(`\n  ⚠️  LE COMPTE HYPERCORE N'EST PAS INITIALISÉ !`);
      console.log(`\n  📝 Pour initialiser le compte, effectuez un micro-transfert HyperCore:`);
      console.log(`     - Vers l'adresse: ${HANDLER}`);
      console.log(`     - Montant: une petite quantité de HYPE (ex: 0.0001 HYPE)`);
      console.log(`     - Depuis HyperCore (via l'interface Hyperliquid)`);
      console.log(`\n  ⚠️  SANS CETTE INITIALISATION, les dépôts avec auto-deploy échoueront`);
      console.log(`     avec l'erreur CoreAccountMissing().`);
    } else {
      console.log(`\n  ✅ Le compte HyperCore est initialisé. Les dépôts avec auto-deploy`);
      console.log(`     devraient fonctionner correctement.`);
    }
  } catch (e) {
    console.log(`\n  ❌ Erreur lors de la vérification: ${e.message}`);
    if (e.reason) {
      console.log(`  Raison: ${e.reason}`);
    }
  }

  // Vérifier les balances spot du handler si le compte existe
  try {
    const coreUserExists = await l1read.coreUserExists(HANDLER);
    if (coreUserExists.exists) {
      console.log(`\n  💰 Balances spot du handler sur HyperCore:`);
      
      const usdcTokenId = await handler.usdcCoreTokenId();
      const spotTokenBTC = await handler.spotTokenBTC();
      const spotTokenHYPE = await handler.spotTokenHYPE();
      
      try {
        const usdcBalance = await l1read.spotBalance(HANDLER, usdcTokenId);
        console.log(`    USDC (Token ID ${usdcTokenId}):`);
        console.log(`      Total: ${usdcBalance.total.toString()}`);
        console.log(`      Hold: ${usdcBalance.hold.toString()}`);
        console.log(`      Entry Notional: ${usdcBalance.entryNtl.toString()}`);
      } catch (e) {
        console.log(`    USDC: Erreur lors de la lecture - ${e.message}`);
      }

      try {
        const btcBalance = await l1read.spotBalance(HANDLER, spotTokenBTC);
        console.log(`    BTC (Token ID ${spotTokenBTC}):`);
        console.log(`      Total: ${btcBalance.total.toString()}`);
        console.log(`      Hold: ${btcBalance.hold.toString()}`);
        console.log(`      Entry Notional: ${btcBalance.entryNtl.toString()}`);
      } catch (e) {
        console.log(`    BTC: Erreur lors de la lecture - ${e.message}`);
      }

      try {
        const hypeBalance = await l1read.spotBalance(HANDLER, spotTokenHYPE);
        console.log(`    HYPE (Token ID ${spotTokenHYPE}):`);
        console.log(`      Total: ${hypeBalance.total.toString()}`);
        console.log(`      Hold: ${hypeBalance.hold.toString()}`);
        console.log(`      Entry Notional: ${hypeBalance.entryNtl.toString()}`);
      } catch (e) {
        console.log(`    HYPE: Erreur lors de la lecture - ${e.message}`);
      }
    }
  } catch (e) {
    console.log(`\n  ⚠️  Impossible de lire les balances spot: ${e.message}`);
  }

  // Vérifier aussi le vault
  try {
    const vaultExists = await l1read.coreUserExists(VAULT);
    console.log(`\n  📦 Vault compte HyperCore existe: ${vaultExists.exists ? "✅ OUI" : "❌ NON"}`);
  } catch (e) {
    console.log(`\n  ⚠️  Impossible de vérifier le vault: ${e.message}`);
  }

  // Vérifier l'auto-deploy du vault
  try {
    const autoDeployBps = await vault.autoDeployBps();
    const autoDeployPercent = Number(autoDeployBps) / 100;
    console.log(`\n  ⚙️  Auto-deploy du vault: ${autoDeployBps.toString()} bps (${autoDeployPercent.toFixed(2)}%)`);
    
    if (Number(autoDeployBps) > 0) {
      try {
        const handlerExists = await l1read.coreUserExists(HANDLER);
        if (!handlerExists.exists) {
          console.log(`\n  ⚠️  ATTENTION: Auto-deploy est activé à ${autoDeployPercent.toFixed(2)}% mais le`);
          console.log(`     compte HyperCore du handler n'est pas initialisé. Les dépôts échoueront !`);
        }
      } catch (e) {
        // Ignorer si la vérification échoue
      }
    }
  } catch (e) {
    console.log(`\n  ⚠️  Impossible de vérifier l'auto-deploy: ${e.message}`);
  }

  console.log("\n" + "=".repeat(80));
  console.log("✅ Vérification terminée");
  console.log("=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  process.exit(1);
});



