const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x071Bcc062D661536D77a09b38bFfd249B7B8195F";
  const L1READ = process.env.L1READ || "0x46976ef07CA697f1546A7F5fcE6f6C6c1e8fdB6D";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0x38fCB5F1e4498b537142ca2563e355127Af68fD2";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 TRACE DU CALCUL DES TAILLES DEPUIS LES DELTAS");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);
  const views = await ethers.getContractAt("CoreInteractionViews", CORE_VIEWS);

  const spotBTC = await handler.spotBTC();
  const spotHYPE = await handler.spotHYPE();
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

  // Lire les prix oracles
  const pxBtc1e8 = await views.oraclePxBtc1e8(HANDLER);
  const pxHype1e8 = await views.oraclePxHype1e8(HANDLER);
  
  console.log(`\n📊 PRIX ORACLES:`);
  console.log(`  BTC: ${ethers.formatUnits(pxBtc1e8, 8)} USD`);
  console.log(`  HYPE: ${ethers.formatUnits(pxHype1e8, 8)} USD`);

  // Lire les balances
  const btcBalance = await l1read.spotBalance(HANDLER, spotTokenBTC);
  const hypeBalance = await l1read.spotBalance(HANDLER, spotTokenHYPE);
  const usdcBalance = await l1read.spotBalance(HANDLER, usdcCoreTokenId);

  console.log(`\n💰 BALANCES (szDecimals):`);
  console.log(`  BTC: ${btcBalance.total.toString()}`);
  console.log(`  HYPE: ${hypeBalance.total.toString()}`);
  console.log(`  USDC: ${usdcBalance.total.toString()}`);

  // Convertir les balances en weiDecimals
  const btcBalanceWei = BigInt(btcBalance.total.toString()) * (10n ** BigInt(Number(btcInfo.weiDecimals) - Number(btcInfo.szDecimals)));
  const hypeBalanceWei = BigInt(hypeBalance.total.toString()) * (10n ** BigInt(Number(hypeInfo.weiDecimals) - Number(hypeInfo.szDecimals)));
  const usdcBalanceWei = BigInt(usdcBalance.total.toString()) * (10n ** BigInt(Number(usdcInfo.weiDecimals) - 0)); // USDC szDecimals = 0

  console.log(`\n💰 BALANCES (weiDecimals):`);
  console.log(`  BTC: ${btcBalanceWei.toString()}`);
  console.log(`  HYPE: ${hypeBalanceWei.toString()}`);
  console.log(`  USDC: ${usdcBalanceWei.toString()}`);

  // Calculer les positions USD 1e18 (comme dans _usdPositions)
  // USDC
  const usdc1e18 = usdcBalanceWei * (10n ** BigInt(18 - Number(usdcInfo.weiDecimals)));
  console.log(`\n💵 POSITIONS USD (1e18):`);
  console.log(`  USDC: ${ethers.formatEther(usdc1e18)} USD`);

  // BTC
  const btcPos1e18 = btcBalanceWei * BigInt(pxBtc1e8.toString()) * (10n ** BigInt(18 - Number(btcInfo.weiDecimals) - 8));
  console.log(`  BTC: ${ethers.formatEther(btcPos1e18)} USD`);

  // HYPE
  const hypePos1e18 = hypeBalanceWei * BigInt(pxHype1e8.toString()) * (10n ** BigInt(18 - Number(hypeInfo.weiDecimals) - 8));
  console.log(`  HYPE: ${ethers.formatEther(hypePos1e18)} USD`);

  const equity1e18 = usdc1e18 + btcPos1e18 + hypePos1e18;
  console.log(`  EQUITY TOTAL: ${ethers.formatEther(equity1e18)} USD`);

  // Calculer les deltas (simuler computeDeltasWithPositions)
  const usdcReserveBps = await handler.usdcReserveBps();
  const deadbandBps = await handler.deadbandBps();
  
  const targetEquity1e18 = (equity1e18 * (10000n - BigInt(usdcReserveBps.toString()))) / 10000n;
  const targetPerAsset = targetEquity1e18 / 2n;
  
  const dBtc1e18 = targetPerAsset - btcPos1e18;
  const dHype1e18 = targetPerAsset - hypePos1e18;

  console.log(`\n📊 DELTAS CALCULÉS (USD 1e18):`);
  console.log(`  Target per asset: ${ethers.formatEther(targetPerAsset)} USD`);
  console.log(`  Delta BTC: ${ethers.formatEther(dBtc1e18)} USD`);
  console.log(`  Delta HYPE: ${ethers.formatEther(dHype1e18)} USD`);

  // Simuler toSzInSzDecimals pour BTC
  if (dBtc1e18 > 0n) {
    console.log(`\n🔍 TRACE CONVERSION BTC:`);
    console.log(`  1. Delta USD (1e18): ${ethers.formatEther(dBtc1e18)} USD`);
    console.log(`  2. Prix (1e8): ${ethers.formatUnits(pxBtc1e8, 8)} USD`);
    
    const numeratorBtc = dBtc1e18 * (10n ** BigInt(Number(btcInfo.szDecimals)));
    const denomBtc = BigInt(pxBtc1e8.toString()) * 10000000000n; // 1e10
    const sizeSzBtc = numeratorBtc / denomBtc;
    
    console.log(`  3. toSzInSzDecimals:`);
    console.log(`     numerator = ${ethers.formatEther(dBtc1e18)} * 10^${btcInfo.szDecimals} = ${numeratorBtc.toString()}`);
    console.log(`     denom = ${pxBtc1e8} * 1e10 = ${denomBtc.toString()}`);
    console.log(`     sizeSz = ${sizeSzBtc.toString()}`);
    console.log(`     Taille humaine: ${Number(sizeSzBtc) / (10 ** Number(btcInfo.szDecimals))} BTC`);
    
    // sizeSzTo1e8
    const factorBtc = 10n ** BigInt(8 - Number(btcInfo.szDecimals));
    const sz1e8Btc = sizeSzBtc * factorBtc;
    console.log(`  4. sizeSzTo1e8:`);
    console.log(`     factor = 10^(8-${btcInfo.szDecimals}) = ${factorBtc.toString()}`);
    console.log(`     sz1e8 = ${sizeSzBtc} * ${factorBtc} = ${sz1e8Btc.toString()}`);
    console.log(`     Taille humaine finale: ${Number(sz1e8Btc) / 1e8} BTC`);
    
    // Vérifier le notional
    const notionalBtc = (Number(sz1e8Btc) / 1e8) * (Number(pxBtc1e8.toString()) / 1e8);
    console.log(`  5. Notional USD: ${notionalBtc} USD`);
    console.log(`     Delta attendu: ${ethers.formatEther(dBtc1e18)} USD`);
    const diffBtc = Math.abs(notionalBtc - Number(ethers.formatEther(dBtc1e18)));
    if (diffBtc < 0.01) {
      console.log(`     ✅ CORRECT (diff: ${diffBtc} USD)`);
    } else {
      console.log(`     ❌ ERREUR (diff: ${diffBtc} USD)`);
    }
  }

  // Simuler toSzInSzDecimals pour HYPE
  if (dHype1e18 > 0n) {
    console.log(`\n🔍 TRACE CONVERSION HYPE:`);
    console.log(`  1. Delta USD (1e18): ${ethers.formatEther(dHype1e18)} USD`);
    console.log(`  2. Prix (1e8): ${ethers.formatUnits(pxHype1e8, 8)} USD`);
    
    const numeratorHype = dHype1e18 * (10n ** BigInt(Number(hypeInfo.szDecimals)));
    const denomHype = BigInt(pxHype1e8.toString()) * 10000000000n; // 1e10
    const sizeSzHype = numeratorHype / denomHype;
    
    console.log(`  3. toSzInSzDecimals:`);
    console.log(`     numerator = ${ethers.formatEther(dHype1e18)} * 10^${hypeInfo.szDecimals} = ${numeratorHype.toString()}`);
    console.log(`     denom = ${pxHype1e8} * 1e10 = ${denomHype.toString()}`);
    console.log(`     sizeSz = ${sizeSzHype.toString()}`);
    console.log(`     Taille humaine: ${Number(sizeSzHype) / (10 ** Number(hypeInfo.szDecimals))} HYPE`);
    
    // sizeSzTo1e8
    const factorHype = 10n ** BigInt(8 - Number(hypeInfo.szDecimals));
    const sz1e8Hype = sizeSzHype * factorHype;
    console.log(`  4. sizeSzTo1e8:`);
    console.log(`     factor = 10^(8-${hypeInfo.szDecimals}) = ${factorHype.toString()}`);
    console.log(`     sz1e8 = ${sizeSzHype} * ${factorHype} = ${sz1e8Hype.toString()}`);
    console.log(`     Taille humaine finale: ${Number(sz1e8Hype) / 1e8} HYPE`);
    
    // Vérifier le notional
    const notionalHype = (Number(sz1e8Hype) / 1e8) * (Number(pxHype1e8.toString()) / 1e8);
    console.log(`  5. Notional USD: ${notionalHype} USD`);
    console.log(`     Delta attendu: ${ethers.formatEther(dHype1e18)} USD`);
    const diffHype = Math.abs(notionalHype - Number(ethers.formatEther(dHype1e18)));
    if (diffHype < 0.01) {
      console.log(`     ✅ CORRECT (diff: ${diffHype} USD)`);
    } else {
      console.log(`     ❌ ERREUR (diff: ${diffHype} USD)`);
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

