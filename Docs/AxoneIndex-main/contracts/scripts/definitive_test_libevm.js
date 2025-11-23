const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  console.log("\n" + "=".repeat(80));
  console.log("🔍 TEST DÉFINITIF: Comment lib_EVM gère spotBalance.total");
  console.log("=".repeat(80) + "\n");

  // Dans lib_EVM CoreState.sol ligne 157:
  // _accounts[_account].spot[token] = RealL1Read.spotBalance(_account, token).total;
  
  // Dans CoreExecution.sol ligne 273:
  // amountOut = scale(action.sz, 8, baseToken.weiDecimals);
  // _accounts[sender].spot[toToken] += amountOut;
  
  // Donc spot[token] stocke en weiDecimals
  
  // Dans CoreView.sol ligne 47:
  // return PrecompileLib.SpotBalance({total: _accounts[account].spot[token], ...});
  
  // Donc spotBalance.total retourné est en weiDecimals (car spot[token] est en weiDecimals)
  
  console.log("💡 CONCLUSION DE lib_EVM:");
  console.log(`  1. _accounts[account].spot[token] stocke en weiDecimals`);
  console.log(`  2. spotBalance.total est assigné directement à spot[token]`);
  console.log(`  3. spotBalance.total retourné est en weiDecimals`);
  console.log(`  4. Donc spotBalance.total du precompile est probablement en weiDecimals`);
  
  console.log(`\n💡 MAIS:`);
  console.log(`  - Si total = 61698600 est en weiDecimals: ${61698600 / 1e8} HYPE = 0.616986 HYPE`);
  console.log(`  - Si total = 61698600 est en szDecimals: ${61698600 / 100} HYPE = 616,986 HYPE`);
  console.log(`  - Valeur attendue: ~616,986 HYPE (d'après les dépôts)`);
  
  console.log(`\n⚠️  CONTRADICTION !`);
  console.log(`  - lib_EVM suggère que total est en weiDecimals`);
  console.log(`  - Mais les valeurs suggèrent qu'il est en szDecimals`);
  
  console.log(`\n💡 HYPOTHÈSE:`);
  console.log(`  Peut-être que le precompile spotBalance retourne en szDecimals,`);
  console.log(`  mais que lib_EVM le convertit en weiDecimals avant de le stocker dans spot[token] ?`);
  console.log(`  Et notre code fait la même conversion, donc double conversion ?`);
  
  console.log(`\n💡 SOLUTION POSSIBLE:`);
  console.log(`  Vérifier si lib_EVM convertit spotBalance.total avant de le stocker`);
  console.log(`  Si oui, alors notre code fait double conversion`);
  console.log(`  Si non, alors spotBalance.total est déjà en weiDecimals`);

  console.log("\n" + "=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  process.exit(1);
});


