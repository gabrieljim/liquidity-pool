const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

describe.only("Liquidity Pool Contract", function () {
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

    //Donate from 20 different address
    for (let i = 0; i < 20; i++) {
      await spaceCoin
        .connect(addrs[i])
        .contribute({ value: parseEther("1000") });
      await spaceCoin.connect(addrs[i]).claimTokens();
    }

    await liquidityPool.setSpaceCoinAddress(spaceCoin.address);
    await liquidityPool.setLPTAddress(lpToken.address);
  });

  describe("Depositing", () => {
    it("Sends all contributed ETH and that amount multiplied by 5 of SPC to LP", async () => {
      await spaceCoin.sendLiquidityToLPContract(liquidityPool.address);

      const provider = ethers.provider;

      const liquidityPoolSPCBalance = await spaceCoin.balanceOf(
        liquidityPool.address
      );
      const liquidityPoolETHBalance = await provider.getBalance(
        liquidityPool.address
      );

      expect(liquidityPoolSPCBalance).to.be.equal(parseEther("100000"));
      expect(liquidityPoolETHBalance).to.be.equal(parseEther("20000"));
    });

    it("Can add extra liquidity after the first deposit", async () => {
      await spaceCoin.sendLiquidityToLPContract(liquidityPool.address);

      //await liquidityPool.connect(addrs[0]).deposit()
    });
  });
});
