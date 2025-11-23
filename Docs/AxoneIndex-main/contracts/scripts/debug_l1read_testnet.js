const hre = require("hardhat");

async function main() {
  const { ethers } = hre;

  const L1READ =
    process.env.L1READ ||
    "0xAd7B0Ff09f9d737B7D6a0E78a11c5F01A3fBFE70"; // depuis handler.l1read

  const l1 = await ethers.getContractAt("L1Read", L1READ);

  console.log("L1Read:", L1READ);

  const HANDLER =
    process.env.HANDLER ||
    "0x06533bC79FCB68f15F8B61C26C35975B83873B26";

  // 1) Block number L1
  try {
    const bn = await l1.l1BlockNumber();
    console.log("l1BlockNumber:", Number(bn));
  } catch (err) {
    console.error(
      "l1BlockNumber revert:",
      err?.error?.message || err?.message || String(err)
    );
  }

  // IDs repérés dans le handler
  const spotBTC = 1054;
  const spotHYPE = 1035;
  const hypeTokenId = 1105;
  const btcTokenId = 1129;

  // 2) spotInfo
  for (const id of [spotBTC, spotHYPE]) {
    try {
      const info = await l1.spotInfo(id);
      console.log(`spotInfo(${id}):`, {
        name: info.name,
        tokens: info.tokens.map((t) => Number(t)),
      });
    } catch (err) {
      console.error(
        `spotInfo(${id}) revert:`,
        err?.error?.message || err?.message || String(err)
      );
    }
  }

  // 3) tokenInfo
  for (const id of [hypeTokenId, btcTokenId]) {
    try {
      const info = await l1.tokenInfo(id);
      console.log(`tokenInfo(${id}):`, {
        name: info.name,
        szDecimals: info.szDecimals,
        weiDecimals: info.weiDecimals,
        evmContract: info.evmContract,
      });
    } catch (err) {
      console.error(
        `tokenInfo(${id}) revert:`,
        err?.error?.message || err?.message || String(err)
      );
    }
  }

  // 4) spotPx
  for (const id of [spotBTC, spotHYPE]) {
    try {
      const px = await l1.spotPx(id);
      console.log(`spotPx(${id}):`, px.toString());
    } catch (err) {
      console.error(
        `spotPx(${id}) revert:`,
        err?.error?.message || err?.message || String(err)
      );
    }
  }

  // 5) coreUserExists(handler)
  try {
    const exists = await l1.coreUserExists(HANDLER);
    console.log("coreUserExists(handler):", exists.exists);
  } catch (err) {
    console.error(
      "coreUserExists(handler) revert:",
      err?.error?.message || err?.message || String(err)
    );
  }
}

main().catch((e) => {
  console.error("❌ debug_l1read_testnet error:", e);
  process.exit(1);
});


