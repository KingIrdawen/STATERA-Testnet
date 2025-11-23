const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  console.log("\n🚀 Redéploiement du CoreInteractionHandler sur HyperEVM Testnet\n");

  if (!process.env.TESTNET_RPC_URL || !process.env.PRIVATE_KEY) {
    throw new Error("Variables d'environnement TESTNET_RPC_URL ou PRIVATE_KEY manquantes (voir contracts/env)");
  }

  // Adresses existantes (à mettre à jour après déploiement)
  const OLD_HANDLER = process.env.OLD_HANDLER || "0xa7b8306307572c3ec388939A4C18931D905519a1";
  const VAULT = process.env.VAULT || "0x83ec125f62521a15940857EdD19069d5cc4EAabE";
  const L1READ = process.env.L1READ || "0x4F730c91A1a4C3cC4733a96eF6Ea52901164c761";
  const CORE_HANDLER_LOGIC_LIB = process.env.CORE_HANDLER_LOGIC_LIB || "0xF2E413D3F9F3582e8A39BEb962f60aeee6683701";
  const CORE_VIEWS = process.env.CORE_VIEWS || "0xa51941b7744013c8BFe0b9F52A351aAe290588Dc";

  const [deployer] = await ethers.getSigners();
  console.log("📝 Déployeur:", deployer.address);
  console.log("📍 Handler actuel:", OLD_HANDLER);
  console.log("📍 Vault:", VAULT);
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

  // Récupérer les paramètres du handler actuel
  console.log("\n📋 Récupération des paramètres du handler actuel...");
  const oldHandler = await ethers.getContractAt("CoreInteractionHandler", OLD_HANDLER);
  
  const l1readAddress = await oldHandler.l1read();
  const usdcEvmAddress = await oldHandler.usdc();
  const maxOutboundPerEpoch = await oldHandler.maxOutboundPerEpoch();
  const epochLen = await oldHandler.epochLength();
  const feeVault = await oldHandler.feeVault();
  const feeBps = await oldHandler.feeBps();
  
  console.log("   l1read:", l1readAddress);
  console.log("   usdcEvm:", usdcEvmAddress);
  console.log("   maxOutboundPerEpoch:", maxOutboundPerEpoch.toString());
  console.log("   epochLen:", epochLen.toString());
  console.log("   feeVault:", feeVault);
  console.log("   feeBps:", feeBps.toString());

  // Récupérer les autres paramètres
  const spotBTC = await oldHandler.spotBTC();
  const spotHYPE = await oldHandler.spotHYPE();
  const spotTokenBTC = await oldHandler.spotTokenBTC();
  const spotTokenHYPE = await oldHandler.spotTokenHYPE();
  const usdcCoreTokenId = await oldHandler.usdcCoreTokenId();
  const usdcCoreSystemAddress = await oldHandler.usdcCoreSystemAddress();
  const hypeCoreTokenId = await oldHandler.hypeCoreTokenId();
  const hypeCoreSystemAddress = await oldHandler.hypeCoreSystemAddress();
  const maxSlippageBps = await oldHandler.maxSlippageBps();
  const marketEpsilonBps = await oldHandler.marketEpsilonBps();
  const deadbandBps = await oldHandler.deadbandBps();
  const maxOracleDeviationBps = await oldHandler.maxOracleDeviationBps();
  const rebalancer = await oldHandler.rebalancer();

  console.log("\n📋 Paramètres du handler:");
  console.log("   spotBTC:", spotBTC.toString());
  console.log("   spotHYPE:", spotHYPE.toString());
  console.log("   spotTokenBTC:", spotTokenBTC.toString());
  console.log("   spotTokenHYPE:", spotTokenHYPE.toString());
  console.log("   usdcCoreTokenId:", usdcCoreTokenId.toString());
  console.log("   usdcCoreSystemAddress:", usdcCoreSystemAddress);
  console.log("   hypeCoreTokenId:", hypeCoreTokenId.toString());
  console.log("   hypeCoreSystemAddress:", hypeCoreSystemAddress);
  console.log("   maxSlippageBps:", maxSlippageBps.toString());
  console.log("   marketEpsilonBps:", marketEpsilonBps.toString());
  console.log("   deadbandBps:", deadbandBps.toString());
  console.log("   maxOracleDeviationBps:", maxOracleDeviationBps.toString());
  console.log("   rebalancer:", rebalancer);

  // Déployer le nouveau handler
  console.log("\n🔧 Déploiement du nouveau CoreInteractionHandler...");
  const CoreInteractionHandler = await ethers.getContractFactory("CoreInteractionHandler", {
    libraries: {
      CoreHandlerLogicLib: CORE_HANDLER_LOGIC_LIB,
    },
  });

  const handler = await CoreInteractionHandler.deploy(
    l1readAddress,
    usdcEvmAddress,
    maxOutboundPerEpoch,
    epochLen,
    feeVault,
    feeBps,
    { gasPrice }
  );
  await handler.waitForDeployment();
  const newHandlerAddress = await handler.getAddress();
  console.log("✅ Nouveau CoreInteractionHandler:", newHandlerAddress);
  await delay(1500);

  // Configurer le nouveau handler
  console.log("\n📝 Configuration du nouveau handler...");
  await send(handler.setSpotIds(spotBTC, spotHYPE, { gasPrice }));
  await send(handler.setSpotTokenIds(usdcCoreTokenId, spotTokenBTC, spotTokenHYPE, { gasPrice }));
  await send(handler.setUsdcCoreLink(usdcCoreSystemAddress, usdcCoreTokenId, { gasPrice }));
  await send(handler.setHypeCoreLink(hypeCoreSystemAddress, hypeCoreTokenId, { gasPrice }));
  await send(handler.setParams(maxSlippageBps, marketEpsilonBps, deadbandBps, { gasPrice }));
  await send(handler.setMaxOracleDeviationBps(maxOracleDeviationBps, { gasPrice }));
  await send(handler.setRebalancer(rebalancer, { gasPrice }));
  await send(handler.setVault(VAULT, { gasPrice }));

  // Mettre à jour le vault pour pointer vers le nouveau handler
  console.log("\n📝 Mise à jour du VaultContract...");
  const vault = await ethers.getContractAt("VaultContract", VAULT);
  await send(vault.setHandler(newHandlerAddress, { gasPrice }));

  console.log("\n✅ Redéploiement terminé !");
  console.log("\n📋 Résumé:");
  console.log("   Ancien Handler:", OLD_HANDLER);
  console.log("   Nouveau Handler:", newHandlerAddress);
  console.log("   Vault mis à jour:", VAULT);
  console.log("\n⚠️  IMPORTANT:");
  console.log("   1. Vérifiez que le nouveau handler fonctionne correctement");
  console.log("   2. Mettez à jour la documentation avec la nouvelle adresse");
  console.log("   3. Le compte Core du handler doit rester le même (adresse non changée)");
}

main().catch((err) => {
  console.error("\n❌ Erreur:", err);
  if (err.reason) {
    console.error("Raison:", err.reason);
  }
  process.exit(1);
});

