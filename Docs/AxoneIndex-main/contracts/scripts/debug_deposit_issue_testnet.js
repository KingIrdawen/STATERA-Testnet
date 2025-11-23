const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const VAULT = process.env.VAULT || "0x83ec125f62521a15940857EdD19069d5cc4EAabE";
  const HANDLER = process.env.HANDLER || "0xa7b8306307572c3ec388939A4C18931D905519a1";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0xa51941b7744013c8BFe0b9F52A351aAe290588Dc";

  const vault = await ethers.getContractAt("VaultContract", VAULT);
  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);

  console.log("\n🔍 Diagnostic du problème de dépôt...\n");

  // Vérifier les prérequis
  try {
    const handlerAddr = await vault.handler();
    console.log(`✅ Handler configuré: ${handlerAddr}`);
    
    const viewsAddr = await vault.coreViews();
    console.log(`✅ CoreViews configuré: ${viewsAddr}`);
    
    const paused = await vault.paused();
    console.log(`✅ Vault paused: ${paused}`);
    
    const handlerPaused = await handler.paused();
    console.log(`✅ Handler paused: ${handlerPaused}`);
  } catch (e) {
    console.log(`❌ Erreur lors de la vérification: ${e.message}`);
  }

  // Vérifier nav1e18
  try {
    console.log("\n🔍 Test de nav1e18()...");
    const nav = await vault.nav1e18();
    console.log(`✅ NAV: ${ethers.formatEther(nav)} USD`);
    
    const pps = await vault.pps1e18();
    console.log(`✅ PPS: ${ethers.formatEther(pps)} USD per share`);
  } catch (e) {
    console.log(`❌ Erreur nav1e18(): ${e.message}`);
    if (e.data) {
      console.log(`  Données: ${e.data}`);
    }
  }

  // Vérifier oracle
  try {
    console.log("\n🔍 Test de l'oracle...");
    const pxHype = await views.oraclePxHype1e8(HANDLER);
    console.log(`✅ Prix HYPE: ${ethers.formatUnits(pxHype, 8)} USD`);
  } catch (e) {
    console.log(`❌ Erreur oracle: ${e.message}`);
  }

  // Vérifier equity
  try {
    console.log("\n🔍 Test de equitySpotUsd1e18()...");
    const equity = await views.equitySpotUsd1e18(HANDLER);
    console.log(`✅ Equity: ${ethers.formatEther(equity)} USD`);
  } catch (e) {
    console.log(`❌ Erreur equity: ${e.message}`);
  }

  // Simuler un petit dépôt
  const depositAmount = ethers.parseEther("0.01");
  console.log(`\n🔍 Test de l'estimation de gas pour un dépôt de 0.01 HYPE...`);
  
  try {
    const gasEstimate = await vault.deposit.estimateGas({ value: depositAmount });
    console.log(`✅ Gas estimé: ${gasEstimate.toString()}`);
  } catch (e) {
    console.log(`❌ Erreur estimation gas: ${e.message}`);
    if (e.data) {
      console.log(`  Données: ${e.data}`);
      try {
        const error = vault.interface.parseError(e.data);
        console.log(`  Erreur décodée: ${error.name}`);
      } catch {
        console.log(`  Impossible de décoder l'erreur`);
      }
    }
    if (e.reason) {
      console.log(`  Raison: ${e.reason}`);
    }
  }

  console.log("\n✅ Diagnostic terminé\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  process.exit(1);
});



