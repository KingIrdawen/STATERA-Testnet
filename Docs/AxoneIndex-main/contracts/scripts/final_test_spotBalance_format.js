const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  const HANDLER = process.env.HANDLER || "0x071Bcc062D661536D77a09b38bFfd249B7B8195F";
  const L1READ = process.env.L1READ || "0x46976ef07CA697f1546A7F5fcE6f6C6c1e8fdB6D";

  console.log("\n" + "=".repeat(80));
  console.log("🔍 TEST FINAL: DÉTERMINER LE FORMAT RÉEL DE spotBalance.total");
  console.log("=".repeat(80) + "\n");

  const handler = await ethers.getContractAt("CoreInteractionHandler", HANDLER);
  const l1read = await ethers.getContractAt("L1Read", L1READ);

  const spotTokenHYPE = await handler.spotTokenHYPE();
  const hypeInfo = await l1read.tokenInfo(Number(spotTokenHYPE));
  const hypeBalance = await l1read.spotBalance(HANDLER, spotTokenHYPE);

  console.log("📦 HYPE:");
  console.log(`  spotBalance.total: ${hypeBalance.total.toString()}`);
  console.log(`  szDecimals: ${hypeInfo.szDecimals}, weiDecimals: ${hypeInfo.weiDecimals}`);

  // Test: Si on sait qu'on a environ 616,986 HYPE (d'après les dépôts précédents)
  // Et que spotBalance.total = 61698600
  // Alors:
  // - Si en szDecimals: 61698600 / 10^2 = 616,986 HYPE ✅
  // - Si en weiDecimals: 61698600 / 10^8 = 0.616986 HYPE ❌

  console.log(`\n📊 INTERPRÉTATION:`);
  const asSzDecimals = Number(hypeBalance.total.toString()) / (10 ** Number(hypeInfo.szDecimals));
  const asWeiDecimals = Number(hypeBalance.total.toString()) / (10 ** Number(hypeInfo.weiDecimals));
  
  console.log(`  En szDecimals: ${asSzDecimals} HYPE`);
  console.log(`  En weiDecimals: ${asWeiDecimals} HYPE`);
  console.log(`  Valeur attendue: ~616,986 HYPE`);
  
  if (Math.abs(asSzDecimals - 616986) < 1000) {
    console.log(`  ✅ spotBalance.total est en szDecimals`);
  } else if (Math.abs(asWeiDecimals - 616986) < 1000) {
    console.log(`  ✅ spotBalance.total est en weiDecimals`);
  }

  // Mais le problème est que les positions USD sont 1e6 trop grandes
  // Cela suggère que quelque part, on multiplie par 10^6
  
  // Hypothèse: Peut-être que spotBalance.total est en szDecimals,
  // mais que quelque part dans le calcul des positions USD,
  // on applique une conversion supplémentaire
  
  // Ou peut-être que le problème est que les positions sont correctes,
  // mais que les deltas sont calculés avec un facteur 1e6 quelque part

  console.log("\n" + "=".repeat(80) + "\n");
}

main().catch((e) => {
  console.error("\n❌ Erreur:", e);
  if (e.reason) {
    console.error("Raison:", e.reason);
  }
  process.exit(1);
});


