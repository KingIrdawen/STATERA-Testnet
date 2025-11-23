const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x96f2b90dDe33348F347bd95CbF3A0830c30506C0";
  const VAULT = process.env.VAULT || "0x83ec125f62521a15940857EdD19069d5cc4EAabE";
  const CORE_VIEWS = process.env.CORE_VIEWS_ADDRESS || "0xa51941b7744013c8BFe0b9F52A351aAe290588Dc";
  const L1READ = process.env.L1READ || "0x4F730c91A1a4C3cC4733a96eF6Ea52901164c761";
  
  const gasPrice = ethers.parseUnits(process.env.GAS_PRICE_GWEI || "3", "gwei");

  console.log("\n" + "=".repeat(80));
  console.log("🔄 OBSERVATION DU REBALANCE");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("src/ERA_2/CoreInteractionHandler.sol:CoreInteractionHandler", HANDLER);
  const views = await ethers.getContractAt("src/ERA_2/CoreInteractionViews.sol:CoreInteractionViews", CORE_VIEWS);
  const l1read = await ethers.getContractAt("src/ERA_2/interfaces/L1Read.sol:L1Read", L1READ);
  const vault = await ethers.getContractAt("src/ERA_2/VaultContract.sol:VaultContract", VAULT);

  const [signer] = await ethers.getSigners();
  console.log("📝 Signer:", signer.address);
  console.log("⚙️  Handler:", HANDLER);
  console.log("📍 Vault:", VAULT);

  // Helper pour gérer le rate limiting
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  const isRateLimitError = (err) => /rate limited/i.test(err?.message || String(err)) || err?.code === 429;
  const withRetry = async (fn, label, maxRetries = 5) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (isRateLimitError(error) && attempt < maxRetries) {
          const waitMs = 2000 * attempt;
          console.log(`   ⚠️  Rate limit lors de "${label}" (tentative ${attempt}/${maxRetries}), attente de ${waitMs}ms...`);
          await delay(waitMs);
          continue;
        }
        throw error;
      }
    }
  };

  // Récupérer les token IDs avec retry
  console.log(`\n⏳ Récupération des paramètres du handler...`);
  const usdcTokenId = await withRetry(() => handler.usdcCoreTokenId(), "usdcCoreTokenId");
  const spotTokenTOKEN1 = await withRetry(() => handler.spotTokenTOKEN1(), "spotTokenTOKEN1");
  const spotTokenHYPE = await withRetry(() => handler.spotTokenHYPE(), "spotTokenHYPE");

  // Fonction helper pour obtenir les balances avec retry
  const getBalances = async () => {
    const usdcBal = await withRetry(() => l1read.spotBalance(HANDLER, usdcTokenId), "spotBalance USDC");
    const token1Bal = await withRetry(() => l1read.spotBalance(HANDLER, spotTokenTOKEN1), "spotBalance TOKEN1");
    const hypeBal = await withRetry(() => l1read.spotBalance(HANDLER, spotTokenHYPE), "spotBalance HYPE");
    const equity = await withRetry(() => views.equitySpotUsd1e18(HANDLER), "equitySpotUsd1e18");
    
    return {
      usdc: usdcBal.total,
      token1: token1Bal.total,
      hype: hypeBal.total,
      equity: equity
    };
  };

  // Obtenir les prix oracles avec retry
  const getPrices = async () => {
    const pxToken1 = await withRetry(() => views.oraclePxToken11e8(HANDLER), "oraclePxToken11e8");
    const pxHype = await withRetry(() => views.oraclePxHype1e8(HANDLER), "oraclePxHype1e8");
    return { token1: pxToken1, hype: pxHype };
  };

  console.log("\n" + "─".repeat(80));
  console.log("📊 ÉTAT AVANT LE REBALANCE:");
  console.log("─".repeat(80));

  const balancesBefore = await getBalances();
  const pricesBefore = await getPrices();

  // Convertir les balances en USD pour affichage (avec retry)
  const usdcInfo = await withRetry(() => l1read.tokenInfo(Number(usdcTokenId)), "tokenInfo USDC");
  const token1Info = await withRetry(() => l1read.tokenInfo(Number(spotTokenTOKEN1)), "tokenInfo TOKEN1");
  const hypeInfo = await withRetry(() => l1read.tokenInfo(Number(spotTokenHYPE)), "tokenInfo HYPE");

  const usdcWei = balancesBefore.usdc;
  const token1Wei = balancesBefore.token1;
  const hypeWei = balancesBefore.hype;

  const usdcUsd = Number(usdcWei) / (10 ** Number(usdcInfo.weiDecimals));
  const token1Usd = (Number(token1Wei) / (10 ** Number(token1Info.weiDecimals))) * (Number(pricesBefore.token1) / 1e8);
  const hypeUsd = (Number(hypeWei) / (10 ** Number(hypeInfo.weiDecimals))) * (Number(pricesBefore.hype) / 1e8);

  console.log(`\n💰 Balances sur Core:`);
  console.log(`   USDC: ${usdcUsd.toFixed(6)} USD (${usdcWei.toString()} wei)`);
  console.log(`   TOKEN1: ${token1Usd.toFixed(6)} USD (${token1Wei.toString()} wei)`);
  console.log(`   HYPE: ${hypeUsd.toFixed(6)} USD (${hypeWei.toString()} wei)`);
  console.log(`   Equity totale: ${ethers.formatUnits(balancesBefore.equity, 18)} USD`);

  console.log(`\n💵 Prix oracles:`);
  console.log(`   TOKEN1: ${ethers.formatUnits(pricesBefore.token1, 8)} USD`);
  console.log(`   HYPE: ${ethers.formatUnits(pricesBefore.hype, 8)} USD`);

  // Calculer la répartition actuelle
  const totalValue = usdcUsd + token1Usd + hypeUsd;
  if (totalValue > 0) {
    const usdcPct = (usdcUsd / totalValue) * 100;
    const token1Pct = (token1Usd / totalValue) * 100;
    const hypePct = (hypeUsd / totalValue) * 100;
    console.log(`\n📊 Répartition actuelle:`);
    console.log(`   USDC: ${usdcPct.toFixed(2)}%`);
    console.log(`   TOKEN1: ${token1Pct.toFixed(2)}%`);
    console.log(`   HYPE: ${hypePct.toFixed(2)}%`);
    console.log(`   Total: ${totalValue.toFixed(6)} USD`);
  }

  // Paramètres de rebalance (avec retry)
  const deadbandBps = await withRetry(() => handler.deadbandBps(), "deadbandBps");
  console.log(`\n⚙️  Paramètres:`);
  console.log(`   Deadband: ${deadbandBps.toString()} bps (${(Number(deadbandBps) / 100).toFixed(2)}%)`);

  console.log("\n" + "─".repeat(80));
  console.log("🔄 EXÉCUTION DU REBALANCE:");
  console.log("─".repeat(80));

  // Vérifier que le signer est le rebalancer (avec retry)
  const rebalancer = await withRetry(() => handler.rebalancer(), "rebalancer");
  if (signer.address.toLowerCase() !== rebalancer.toLowerCase()) {
    console.log(`\n⚠️  ATTENTION: Le signer (${signer.address}) n'est pas le rebalancer configuré (${rebalancer})`);
    console.log(`   Le rebalance peut échouer.`);
  }

  // Exécuter le rebalance avec retry en cas de rate limiting
  console.log(`\n📤 Exécution du rebalance...`);
  
  let tx;
  try {
    tx = await withRetry(
      () => handler.rebalancePortfolio(0, 0, { gasPrice }),
      "rebalancePortfolio",
      5
    );
    console.log(`   ✅ Transaction envoyée: ${tx.hash}`);
  } catch (error) {
    console.error(`\n❌ Erreur lors de l'envoi du rebalance:`, error.message || error);
    if (error.reason) {
      console.error(`   Raison: ${error.reason}`);
    }
    process.exit(1);
  }
  
  try {
    
    console.log(`   ⏳ Attente de la confirmation...`);
    const receipt = await tx.wait();
    console.log(`   ✅ Transaction confirmée dans le bloc: ${receipt.blockNumber}`);
    
    // Analyser les événements
    console.log(`\n📋 Analyse des événements (${receipt.logs.length} logs):`);
    
    let rebalancedFound = false;
    let ordersPlaced = 0;
    
    for (const log of receipt.logs) {
      try {
        // Essayer de parser avec l'interface du handler
        const parsed = handler.interface.parseLog({ topics: log.topics, data: log.data });
        if (parsed) {
          if (parsed.name === "Rebalanced") {
            const [dToken1, dHype] = parsed.args;
            console.log(`   ✅ Événement Rebalanced:`);
            console.log(`      dToken1: ${ethers.formatUnits(dToken1, 18)} USD`);
            console.log(`      dHype: ${ethers.formatUnits(dHype, 18)} USD`);
            rebalancedFound = true;
          } else if (parsed.name === "SpotOrderPlaced") {
            const [asset, isBuy, limitPx, size, cloid] = parsed.args;
            const assetName = Number(asset) === 1035 ? "HYPE" : asset.toString();
            const side = isBuy ? "BUY" : "SELL";
            console.log(`   📊 Ordre spot ${++ordersPlaced}: ${assetName} ${side}`);
            console.log(`      Asset ID: ${asset.toString()}`);
            console.log(`      Prix limite: ${ethers.formatUnits(limitPx, 8)} USD`);
            console.log(`      Taille: ${size.toString()}`);
            console.log(`      Cloid: ${cloid.toString()}`);
          } else {
            console.log(`   📄 Autre événement: ${parsed.name}`);
          }
        }
      } catch (e) {
        // Essayer de voir si c'est un événement d'un autre contrat
        try {
          const vaultParsed = vault.interface.parseLog({ topics: log.topics, data: log.data });
          if (vaultParsed) {
            console.log(`   📄 Événement Vault: ${vaultParsed.name}`);
          }
        } catch (e2) {
          // Ce n'est pas un événement parsable, ignorer
        }
      }
    }
    
    if (!rebalancedFound && ordersPlaced === 0) {
      console.log(`   ⚠️  Aucun événement Rebalanced ou SpotOrderPlaced détecté.`);
      console.log(`   Le rebalance n'a peut-être pas été nécessaire (deadband pas dépassé).`);
    } else {
      console.log(`\n   📊 Résumé: ${ordersPlaced} ordre(s) placé(s)`);
    }
  } catch (error) {
    console.error(`\n❌ Erreur lors du rebalance:`, error.message || error);
    if (error.reason) {
      console.error(`   Raison: ${error.reason}`);
    }
    process.exit(1);
  }

  // Attendre plusieurs blocs pour que les ordres IOC s'exécutent
  console.log(`\n⏳ Attente de plusieurs blocs pour que les ordres IOC s'exécutent...`);
  const currentBlock = await ethers.provider.getBlockNumber();
  console.log(`   Bloc actuel: ${currentBlock}`);
  console.log(`   Attente de ~15 secondes (environ 1-2 blocs HyperEVM)...`);
  await new Promise(resolve => setTimeout(resolve, 15000));
  const newBlock = await ethers.provider.getBlockNumber();
  console.log(`   Nouveau bloc: ${newBlock} (+${newBlock - currentBlock} blocs)`);

  console.log("\n" + "─".repeat(80));
  console.log("📊 ÉTAT APRÈS LE REBALANCE:");
  console.log("─".repeat(80));

  const balancesAfter = await getBalances();
  const pricesAfter = await getPrices();

  const usdcWeiAfter = balancesAfter.usdc;
  const token1WeiAfter = balancesAfter.token1;
  const hypeWeiAfter = balancesAfter.hype;

  const usdcUsdAfter = Number(usdcWeiAfter) / (10 ** Number(usdcInfo.weiDecimals));
  const token1UsdAfter = (Number(token1WeiAfter) / (10 ** Number(token1Info.weiDecimals))) * (Number(pricesAfter.token1) / 1e8);
  const hypeUsdAfter = (Number(hypeWeiAfter) / (10 ** Number(hypeInfo.weiDecimals))) * (Number(pricesAfter.hype) / 1e8);

  console.log(`\n💰 Balances sur Core:`);
  console.log(`   USDC: ${usdcUsdAfter.toFixed(6)} USD (${usdcWeiAfter.toString()} wei)`);
  console.log(`   TOKEN1: ${token1UsdAfter.toFixed(6)} USD (${token1WeiAfter.toString()} wei)`);
  console.log(`   HYPE: ${hypeUsdAfter.toFixed(6)} USD (${hypeWeiAfter.toString()} wei)`);
  console.log(`   Equity totale: ${ethers.formatUnits(balancesAfter.equity, 18)} USD`);

  // Calculer les différences
  const usdcDiff = usdcUsdAfter - usdcUsd;
  const token1Diff = token1UsdAfter - token1Usd;
  const hypeDiff = hypeUsdAfter - hypeUsd;
  const equityDiff = Number(balancesAfter.equity) - Number(balancesBefore.equity);

  console.log(`\n📈 Changements:`);
  console.log(`   USDC: ${usdcDiff >= 0 ? '+' : ''}${usdcDiff.toFixed(6)} USD`);
  console.log(`   TOKEN1: ${token1Diff >= 0 ? '+' : ''}${token1Diff.toFixed(6)} USD`);
  console.log(`   HYPE: ${hypeDiff >= 0 ? '+' : ''}${hypeDiff.toFixed(6)} USD`);
  console.log(`   Equity: ${equityDiff >= 0 ? '+' : ''}${ethers.formatUnits(BigInt(Math.abs(equityDiff)), 18)} USD`);

  // Calculer la nouvelle répartition
  const totalValueAfter = usdcUsdAfter + token1UsdAfter + hypeUsdAfter;
  if (totalValueAfter > 0) {
    const usdcPctAfter = (usdcUsdAfter / totalValueAfter) * 100;
    const token1PctAfter = (token1UsdAfter / totalValueAfter) * 100;
    const hypePctAfter = (hypeUsdAfter / totalValueAfter) * 100;
    console.log(`\n📊 Nouvelle répartition:`);
    console.log(`   USDC: ${usdcPctAfter.toFixed(2)}% (avant: ${((usdcUsd / (totalValue || 1)) * 100).toFixed(2)}%)`);
    console.log(`   TOKEN1: ${token1PctAfter.toFixed(2)}% (avant: ${((token1Usd / (totalValue || 1)) * 100).toFixed(2)}%)`);
    console.log(`   HYPE: ${hypePctAfter.toFixed(2)}% (avant: ${((hypeUsd / (totalValue || 1)) * 100).toFixed(2)}%)`);
    console.log(`   Total: ${totalValueAfter.toFixed(6)} USD`);
  }

  console.log("\n" + "=".repeat(80));
  console.log("✅ Observation terminée");
  console.log("=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  process.exit(1);
});

