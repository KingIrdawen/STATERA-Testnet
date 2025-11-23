const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x071Bcc062D661536D77a09b38bFfd249B7B8195F";
  const L1READ = process.env.L1READ || "0x46976ef07CA697f1546A7F5fcE6f6C6c1e8fdB6D";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 VÉRIFICATION DU FORMAT DE spotBalance.total");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);

  const spotTokenBTC = await handler.spotTokenBTC();
  const spotTokenHYPE = await handler.spotTokenHYPE();
  const usdcCoreTokenId = await handler.usdcCoreTokenId();

  // Infos tokens
  const btcInfo = await l1read.tokenInfo(Number(spotTokenBTC));
  const hypeInfo = await l1read.tokenInfo(Number(spotTokenHYPE));
  const usdcInfo = await l1read.tokenInfo(Number(usdcCoreTokenId));

  console.log("📦 INFOS TOKENS:");
  console.log(`  BTC: szDecimals=${btcInfo.szDecimals}, weiDecimals=${btcInfo.weiDecimals}`);
  console.log(`  HYPE: szDecimals=${hypeInfo.szDecimals}, weiDecimals=${hypeInfo.weiDecimals}`);
  console.log(`  USDC: weiDecimals=${usdcInfo.weiDecimals}`);

  // Lire les balances brutes
  const btcBalance = await l1read.spotBalance(HANDLER, spotTokenBTC);
  const hypeBalance = await l1read.spotBalance(HANDLER, spotTokenHYPE);
  const usdcBalance = await l1read.spotBalance(HANDLER, usdcCoreTokenId);

  console.log(`\n📊 BALANCES BRUTES (spotBalance.total):`);
  console.log(`  BTC: ${btcBalance.total.toString()}`);
  console.log(`  HYPE: ${hypeBalance.total.toString()}`);
  console.log(`  USDC: ${usdcBalance.total.toString()}`);

  // Interprétation 1: spotBalance.total est en szDecimals (selon la doc)
  const btcSz = Number(btcBalance.total.toString()) / (10 ** Number(btcInfo.szDecimals));
  const hypeSz = Number(hypeBalance.total.toString()) / (10 ** Number(hypeInfo.szDecimals));
  const usdcSz = Number(usdcBalance.total.toString()) / (10 ** 0); // USDC szDecimals = 0

  console.log(`\n📊 INTERPRÉTATION 1: spotBalance.total en szDecimals`);
  console.log(`  BTC: ${btcSz} BTC`);
  console.log(`  HYPE: ${hypeSz} HYPE`);
  console.log(`  USDC: ${usdcSz} USDC`);

  // Interprétation 2: spotBalance.total est en weiDecimals (hypothèse du bug)
  const btcWei = Number(btcBalance.total.toString()) / (10 ** Number(btcInfo.weiDecimals));
  const hypeWei = Number(hypeBalance.total.toString()) / (10 ** Number(hypeInfo.weiDecimals));
  const usdcWei = Number(usdcBalance.total.toString()) / (10 ** Number(usdcInfo.weiDecimals));

  console.log(`\n📊 INTERPRÉTATION 2: spotBalance.total en weiDecimals (HYPOTHÈSE BUG)`);
  console.log(`  BTC: ${btcWei} BTC`);
  console.log(`  HYPE: ${hypeWei} HYPE`);
  console.log(`  USDC: ${usdcWei} USDC`);

  // Vérifier spotBalanceInWei
  console.log(`\n📊 VÉRIFICATION: spotBalanceInWei()`);
  
  // Simuler spotBalanceInWei avec interprétation 1 (szDecimals)
  const btcWeiFromSz = BigInt(btcBalance.total.toString()) * (10n ** BigInt(Number(btcInfo.weiDecimals) - Number(btcInfo.szDecimals)));
  const hypeWeiFromSz = BigInt(hypeBalance.total.toString()) * (10n ** BigInt(Number(hypeInfo.weiDecimals) - Number(hypeInfo.szDecimals)));
  const usdcWeiFromSz = BigInt(usdcBalance.total.toString()) * (10n ** BigInt(Number(usdcInfo.weiDecimals) - 0));

  console.log(`  Si total est en szDecimals:`);
  console.log(`    BTC wei: ${btcWeiFromSz.toString()} = ${Number(btcWeiFromSz) / (10 ** Number(btcInfo.weiDecimals))} BTC`);
  console.log(`    HYPE wei: ${hypeWeiFromSz.toString()} = ${Number(hypeWeiFromSz) / (10 ** Number(hypeInfo.weiDecimals))} HYPE`);
  console.log(`    USDC wei: ${usdcWeiFromSz.toString()} = ${Number(usdcWeiFromSz) / (10 ** Number(usdcInfo.weiDecimals))} USDC`);

  // Si total est déjà en weiDecimals, spotBalanceInWei ne devrait rien faire
  console.log(`\n  Si total est déjà en weiDecimals:`);
  console.log(`    BTC wei: ${btcBalance.total.toString()} = ${btcWei} BTC`);
  console.log(`    HYPE wei: ${hypeBalance.total.toString()} = ${hypeWei} HYPE`);
  console.log(`    USDC wei: ${usdcBalance.total.toString()} = ${usdcWei} USDC`);

  // Calculer les positions USD avec les deux interprétations
  const pxBtc1e8 = 2750000000000n; // 27,500 USD
  const pxHype1e8 = 7500000000n; // 75 USD

  // Interprétation 1: total en szDecimals → converti en weiDecimals → USD 1e18
  const btcPos1e18FromSz = btcWeiFromSz * pxBtc1e8 * (10n ** BigInt(18 - Number(btcInfo.weiDecimals) - 8));
  const hypePos1e18FromSz = hypeWeiFromSz * pxHype1e8 * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));

  console.log(`\n💵 POSITIONS USD (interprétation 1: total en szDecimals):`);
  console.log(`  BTC: ${ethers.formatEther(btcPos1e18FromSz)} USD`);
  console.log(`  HYPE: ${ethers.formatEther(hypePos1e18FromSz)} USD`);

  // Interprétation 2: total déjà en weiDecimals → USD 1e18 (sans conversion)
  const btcWeiDirect = BigInt(btcBalance.total.toString());
  const hypeWeiDirect = BigInt(hypeBalance.total.toString());
  const btcPos1e18FromWei = btcWeiDirect * pxBtc1e8 * (10n ** BigInt(18 - Number(btcInfo.weiDecimals) - 8));
  const hypePos1e18FromWei = hypeWeiDirect * pxHype1e8 * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));

  console.log(`\n💵 POSITIONS USD (interprétation 2: total déjà en weiDecimals):`);
  console.log(`  BTC: ${ethers.formatEther(btcPos1e18FromWei)} USD`);
  console.log(`  HYPE: ${ethers.formatEther(hypePos1e18FromWei)} USD`);

  // Comparer les ratios
  if (btcPos1e18FromWei > 0n) {
    const ratioBtc = Number(btcPos1e18FromSz) / Number(btcPos1e18FromWei);
    console.log(`\n🔍 RATIO BTC (szDecimals / weiDecimals): ${ratioBtc}`);
    if (Math.abs(ratioBtc - 1e6) < 100) {
      console.log(`  ⚠️  FACTEUR 1e6 DÉTECTÉ !`);
      console.log(`  💡 Si spotBalance.total est déjà en weiDecimals, alors spotBalanceInWei() multiplie par erreur par 10^(weiDecimals-szDecimals)`);
      console.log(`  💡 Pour HYPE: 10^(8-2) = 10^6 = 1,000,000`);
    }
  }

  if (hypePos1e18FromWei > 0n) {
    const ratioHype = Number(hypePos1e18FromSz) / Number(hypePos1e18FromWei);
    console.log(`\n🔍 RATIO HYPE (szDecimals / weiDecimals): ${ratioHype}`);
    if (Math.abs(ratioHype - 1e6) < 100) {
      console.log(`  ⚠️  FACTEUR 1e6 DÉTECTÉ !`);
      console.log(`  💡 Si spotBalance.total est déjà en weiDecimals, alors spotBalanceInWei() multiplie par erreur par 10^(weiDecimals-szDecimals)`);
      console.log(`  💡 Pour HYPE: 10^(8-2) = 10^6 = 1,000,000`);
    }
  }

  console.log("\n" + "=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  process.exit(1);
});


