const hre = require("hardhat");

async function main() {
  const { ethers } = hre;

  const L1READ = "0xAd7B0Ff09f9d737B7D6a0E78a11c5F01A3fBFE70";
  const l1read = await ethers.getContractAt("L1Read", L1READ);

  const spotBTC = 1054;
  const spotHYPE = 1035;

  console.log("Test bbo() avec différents IDs pour spotBTC=1054 et spotHYPE=1035\n");

  // Test 1: index brut
  console.log("1. bbo(1054) [index brut]:");
  try {
    const b1 = await l1read.bbo(spotBTC);
    console.log("   ✅ bid:", b1.bid.toString(), "ask:", b1.ask.toString());
  } catch (e) {
    console.log("   ❌", e.message.split("\n")[0]);
  }

  // Test 2: +10000 offset
  console.log("2. bbo(11054) [index + 10000]:");
  try {
    const b2 = await l1read.bbo(spotBTC + 10000);
    console.log("   ✅ bid:", b2.bid.toString(), "ask:", b2.ask.toString());
  } catch (e) {
    console.log("   ❌", e.message.split("\n")[0]);
  }

  // Test 3: HYPE index brut
  console.log("3. bbo(1035) [HYPE index brut]:");
  try {
    const b3 = await l1read.bbo(spotHYPE);
    console.log("   ✅ bid:", b3.bid.toString(), "ask:", b3.ask.toString());
  } catch (e) {
    console.log("   ❌", e.message.split("\n")[0]);
  }

  // Test 4: HYPE +10000
  console.log("4. bbo(11035) [HYPE + 10000]:");
  try {
    const b4 = await l1read.bbo(spotHYPE + 10000);
    console.log("   ✅ bid:", b4.bid.toString(), "ask:", b4.ask.toString());
  } catch (e) {
    console.log("   ❌", e.message.split("\n")[0]);
  }
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});

