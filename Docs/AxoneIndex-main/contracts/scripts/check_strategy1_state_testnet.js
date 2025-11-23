const hre = require("hardhat");

async function main() {
  const { ethers } = hre;

  const VAULT = process.env.VAULT;
  const HANDLER = process.env.HANDLER;
  if (!VAULT || !HANDLER) {
    throw new Error("Merci de fournir VAULT et HANDLER dans l'environnement");
  }

  const vault = await ethers.getContractAt("VaultContract", VAULT);
  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const viewsAddr = process.env.CORE_VIEWS_ADDRESS;
  const views = viewsAddr ? await ethers.getContractAt("CoreInteractionViews", viewsAddr) : null;

  const vaultCoreViews = await vault.coreViews().catch(
    () => "0x0000000000000000000000000000000000000000"
  );
  const handlerVault = await handler.vault().catch(
    () => "0x0000000000000000000000000000000000000000"
  );
  const handlerPaused = await handler.paused().catch(() => false);
  const spotBTC = await handler.spotBTC().catch(() => 0);
  const spotHYPE = await handler.spotHYPE().catch(() => 0);
  const spotTokenBTC = await handler.spotTokenBTC().catch(() => 0n);
  const spotTokenHYPE = await handler.spotTokenHYPE().catch(() => 0n);
  const l1readAddr = await handler.l1read().catch(
    () => "0x0000000000000000000000000000000000000000"
  );
  const usdcAddr = await handler.usdc().catch(
    () => "0x0000000000000000000000000000000000000000"
  );

  const paused = await vault.paused();
  const totalSupply = await vault.totalSupply();
  const nav = await vault.nav1e18().catch(() => 0n);
  const vaultHandler = await vault.handler().catch(() => "0x0000000000000000000000000000000000000000");
  const oraclePx = views
    ? await views.oraclePxHype1e8(HANDLER).catch((err) => {
        console.error("Erreur oraclePxHype1e8 (views):", err?.error?.message || err?.message || err);
        return 0n;
      })
    : 0n;
  const feeVault = await handler.feeVault();
  const usdcCoreSystemAddress = await handler.usdcCoreSystemAddress();
  const hypeCoreSystemAddress = await handler.hypeCoreSystemAddress();
  const usdcCoreTokenId = await handler.usdcCoreTokenId();
  const hypeCoreTokenId = await handler.hypeCoreTokenId();
  const autoDeploy = await vault.autoDeployBps();
  const depositFee = await vault.depositFeeBps();
  const maxOutboundPerEpoch = await handler.maxOutboundPerEpoch();
  const epochLength = await handler.epochLength();
  const sentThisEpoch = await handler.sentThisEpoch();
  const lastEpochStart = await handler.lastEpochStart();

  console.log("Vault status:", {
    paused,
    coreViews: vaultCoreViews,
    totalSupply: totalSupply.toString(),
    nav1e18: nav.toString(),
    depositFeeBps: Number(depositFee),
    autoDeployBps: Number(autoDeploy),
    handler: vaultHandler,
  });
  console.log("Handler status:", {
    paused: handlerPaused,
    vault: handlerVault,
    l1read: l1readAddr,
    usdc: usdcAddr,
    feeVault,
    oraclePxHype1e8: oraclePx.toString(),
    usdcCoreSystemAddress,
    hypeCoreSystemAddress,
    usdcCoreTokenId: Number(usdcCoreTokenId),
    hypeCoreTokenId: Number(hypeCoreTokenId),
    spotBTC: Number(spotBTC),
    spotHYPE: Number(spotHYPE),
    spotTokenBTC: Number(spotTokenBTC),
    spotTokenHYPE: Number(spotTokenHYPE),
    maxOutboundPerEpoch: maxOutboundPerEpoch.toString(),
    epochLength: Number(epochLength),
    sentThisEpoch: sentThisEpoch.toString(),
    lastEpochStart: Number(lastEpochStart),
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

