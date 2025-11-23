'use strict';

const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('CoreInteractionViews', function () {
  let MockL1Read, mock;
  let MockCoreWriter, MockUSDC;
  let Handler, Views;
  let handler, views;

  beforeEach(async () => {
    MockL1Read = await ethers.getContractFactory('MockL1Read');
    mock = await MockL1Read.deploy();
    await mock.waitForDeployment();

    MockCoreWriter = await ethers.getContractFactory('MockCoreWriter');
    const writer = await MockCoreWriter.deploy();
    await writer.waitForDeployment();
    const systemCoreWriter = '0x3333333333333333333333333333333333333333';
    const writerCode = await ethers.provider.getCode(writer.target);
    await ethers.provider.send('hardhat_setCode', [systemCoreWriter, writerCode]);

    MockUSDC = await ethers.getContractFactory('MockUSDC');
    const usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();

    Handler = await ethers.getContractFactory('CoreInteractionHandler');
    handler = await Handler.deploy(
      mock.target,
      usdc.target,
      10_000_000, // maxOutbound
      5,          // epochLength
      ethers.ZeroAddress,
      0
    );
    await handler.waitForDeployment();

    Views = await ethers.getContractFactory('CoreInteractionViews');
    views = await Views.deploy();
    await views.waitForDeployment();
  });

  it('retourne le même prix oracle BTC que le handler', async () => {
    const SPOT_BTC = 1;
    const BASE_TOKEN_ID = 100;

    // Config minimale: mapping spot -> tokenId et décimales
    await handler.setSpotIds(SPOT_BTC, 0);
    await handler.setSpotTokenIds(0, BASE_TOKEN_ID, 0);
    await handler.setSpotPxDecimals(SPOT_BTC, 5);

    await mock.setTokenInfo(BASE_TOKEN_ID, 'BTC', 3, 8);
    await mock.setSpotPx(SPOT_BTC, 12_345);

    const pxHandler = await handler.oraclePxBtc1e8();
    const pxView = await views.oraclePxBtc1e8(handler.target);

    expect(pxView).to.equal(pxHandler);
  });

  it('retourne la même equitySpotUsd1e18 que le handler pour une config simple', async () => {
    // IDs arbitraires
    const USDC_ID = 1;
    const BTC_ID = 2;
    const HYPE_ID = 3;
    const SPOT_BTC = 10;
    const SPOT_HYPE = 11;

    // Config tokens / spots
    await handler.setSpotIds(SPOT_BTC, SPOT_HYPE);
    await handler.setSpotTokenIds(USDC_ID, BTC_ID, HYPE_ID);

    // Décimales simples 8/8 partout
    await mock.setTokenInfo(USDC_ID, 'USDC', 8, 8);
    await mock.setTokenInfo(BTC_ID, 'BTC', 8, 8);
    await mock.setTokenInfo(HYPE_ID, 'HYPE', 8, 8);

    // Balances Core (en szDecimals=8)
    await mock.setSpotBalance(handler.target, USDC_ID, 1_000_000_00); // 1_000 USDC
    await mock.setSpotBalance(handler.target, BTC_ID, 2_000_000_00);  // 2_000 BTC units
    await mock.setSpotBalance(handler.target, HYPE_ID, 3_000_000_00); // 3_000 HYPE units

    // Prix spots (bruts) + décimales prix (via pxDecimals)
    await handler.setSpotPxDecimals(SPOT_BTC, 8);
    await handler.setSpotPxDecimals(SPOT_HYPE, 8);
    await mock.setSpotPx(SPOT_BTC, 30_000_000_000); // 30000 * 1e6 approx
    await mock.setSpotPx(SPOT_HYPE, 50_000_000);    // 0.5 * 1e8 approx

    const eqHandler = await handler.equitySpotUsd1e18();
    const eqView = await views.equitySpotUsd1e18(handler.target);

    expect(eqView).to.equal(eqHandler);
  });
});


