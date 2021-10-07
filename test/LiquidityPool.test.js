const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

describe("Space Coin Contract", function () {
  let owner, addr1, addr2, addrs, spaceCoin, treasury, liquidityPool, lpToken;

  beforeEach(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    treasury = addrs[35];

    const SpaceCoin = await ethers.getContractFactory("SpaceCoin");
    spaceCoin = await SpaceCoin.deploy(treasury.address);

    const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
    liquidityPool = await LiquidityPool.deploy();

    const LPT = await ethers.getContractFactory("LPT");
    lpToken = await LPT.deploy(liquidityPool.address);

    await spaceCoin.advancePhase();
    await spaceCoin.advancePhase();

    //Donate maximum from 30 different address
    for (let i = 0; i < 30; i++) {
      await spaceCoin
        .connect(addrs[i])
        .contribute({ value: parseEther("1000") });
    }

    await liquidityPool.setSpaceCoinAddress(spaceCoin.address);
    await liquidityPool.setLPTAddress(lpToken.address);
  });
});