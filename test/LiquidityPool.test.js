const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

describe("Liquidity Pool Contract", function () {
  let owner,
    addr1,
    addr2,
    addrs,
    spaceCoin,
    treasury,
    liquidityPool,
    lpToken,
    spaceRouter;

  beforeEach(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    treasury = addrs[35];

    const SpaceCoin = await ethers.getContractFactory("SpaceCoin");
    spaceCoin = await SpaceCoin.deploy(treasury.address);

    const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
    liquidityPool = await LiquidityPool.deploy();

    const LPT = await ethers.getContractFactory("LPT");
    lpToken = await LPT.deploy(liquidityPool.address);

    const SpaceRouter = await ethers.getContractFactory("SpaceRouter");
    spaceRouter = await SpaceRouter.deploy(
      liquidityPool.address,
      spaceCoin.address
    );
    await spaceCoin.setRouterAddress(spaceRouter.address);

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

    await spaceCoin.sendLiquidityToLPContract(liquidityPool.address);
  });

  describe("Depositing", () => {
    it("Sends all contributed ETH and that amount multiplied by 5 of SPC to LP", async () => {
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

    it("Mints initial LP tokens and assigns to SpaceCoin contract", async () => {
      const lpOfSpaceCoin = await lpToken.balanceOf(spaceCoin.address);

      /*
       * SpaceCoin contract sent 20k eth and 100k tokens, so it should have
       * sqrt(20,000 * 100,000), around 44,721.35 LP tokens
       */
      expect(lpOfSpaceCoin).to.be.within(
        parseEther("44721"),
        parseEther("44722")
      );
    });

    it("Transfers ETH to LP", async () => {
      await expect(() =>
        spaceRouter
          .connect(addrs[0])
          .addLiquidity(parseEther("1"), { value: parseEther("0.2") })
      ).to.changeEtherBalances(
        [addrs[0], liquidityPool],
        [parseEther("-0.2"), parseEther("0.2")]
      );
    });

    it("Gives router contract SPC allowance and transfers them to LP", async () => {
      await expect(() =>
        spaceRouter
          .connect(addrs[0])
          .addLiquidity(parseEther("1"), { value: parseEther("0.2") })
      ).to.changeTokenBalances(
        spaceCoin,
        [addrs[0], liquidityPool],
        [parseEther("-1"), parseEther("1")]
      );
    });

    it("Mints and assigns LP tokens", async () => {
      await spaceRouter
        .connect(addrs[0])
        .addLiquidity(parseEther("1"), { value: parseEther("0.2") });

      const lpBalance = await lpToken.balanceOf(addrs[0].address);

      /*
       * Address sent 0.2 eth and 1 token, math is:
       *
       *  liquidity = Math.min(
       *    (ethAmount * totalSupply) / ethReserve,
       *    (spcAmount * totalSupply) / spcReserve
       *  );
       *
       *  Total LP supply right now is around 44,721.35 LP tokens, ETH reserve is 20k, and SPC reserve is 100k so
       *
       *  (0.2 * 44,721.35) / 20,000 = ~ 0.44 tokens
       *  (  1 * 44,721.35) / 20,000 = ~ 2.23 tokens
       *
       *  Math.min() gets the smaller value, so user should have 0.44 tokens
       *
       */
      expect(lpBalance).to.be.within(parseEther("0.44"), parseEther("0.45"));
    });
  });

  describe("Withdrawing", () => {
    // it.only("Deposits and withdraws the same amount", async () => {
    //   await spaceRouter
    //     .connect(addrs[0])
    //     .addLiquidity(parseEther("1"), { value: parseEther("0.2") });
    //   await spaceRouter.connect(addrs[0]).pullLiquidity();
    // });
  });
});
