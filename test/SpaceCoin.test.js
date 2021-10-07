const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

describe("Space Coin Contract", function () {
  let owner, addr1, addr2, addrs, spaceCoin, treasury, liquidityPool;

  beforeEach(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const SpaceCoin = await ethers.getContractFactory("SpaceCoin");
    treasury = addrs[35];
    spaceCoin = await SpaceCoin.deploy(treasury.address);

    const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
    liquidityPool = await LiquidityPool.deploy();
  });

  describe("Deployment", () => {
    it("Creates 500,000 available tokens", async () => {
      const supply = await spaceCoin.totalSupply();
      expect(supply).to.be.equal("500000000000000000000000");
    });

    it("Assigns the owner correctly", async () => {
      const currentOwner = await spaceCoin.owner();
      expect(currentOwner).to.be.equal(owner.address);
    });

    it("Assigns the symbol of the token correctly", async () => {
      const symbol = await spaceCoin.symbol();
      expect(symbol).to.be.equal("SC");
    });

    it("Assigns the symbol of the token correctly", async () => {
      const name = await spaceCoin.name();
      expect(name).to.be.equal("Space Coin");
    });

    it("Adds owner to whitelist", async () => {
      const isOwnerWhitelisted = await spaceCoin.isWhitelisted(owner.address);
      expect(isOwnerWhitelisted).to.be.true;
    });
  });

  describe("Only owner", () => {
    it("Only owner can advance phase", async () => {
      await expect(spaceCoin.connect(addr1).advancePhase()).to.be.revertedWith(
        "OWNER_ONLY"
      );
    });

    it("Only owner can pause contract", async () => {
      await expect(
        spaceCoin.connect(addr1).togglePauseContract()
      ).to.be.revertedWith("OWNER_ONLY");
    });

    it("Only owner can toggle tax", async () => {
      await expect(spaceCoin.connect(addr1).toggleTax()).to.be.revertedWith(
        "OWNER_ONLY"
      );
    });

    it("Only owner can mint", async () => {
      await expect(
        spaceCoin.connect(addr1).mint(addr1.address, 1000)
      ).to.be.revertedWith("OWNER_ONLY");
    });

    it("Only owner can burn", async () => {
      await expect(
        spaceCoin.connect(addr1).burn(spaceCoin.address, 1000)
      ).to.be.revertedWith("OWNER_ONLY");
    });

    it("Only owner can add an address to whitelist", async () => {
      await expect(
        spaceCoin.connect(addr1).addToWhitelist(addr1.address)
      ).to.be.revertedWith("OWNER_ONLY");
    });

    it("Only owner can send fund to LP", async () => {
      await expect(
        spaceCoin
          .connect(addr1)
          .sendLiquidityToLPContract(liquidityPool.address)
      ).to.be.revertedWith("OWNER_ONLY");
    });
  });

  describe("Contributing", () => {
    it("Assigns 5 times the value contributed", async () => {
      await spaceCoin.contribute({ value: parseEther("0.25") });

      const assignedBalance = await spaceCoin.balancesToClaim(owner.address);
      expect(assignedBalance).to.be.equal(parseEther("1.25"));
    });
  });

  describe("Minting and burning", () => {
    it("Reverts mint if it would go above the maximum allowed supply", async () => {
      await expect(spaceCoin.mint(owner.address, 100)).to.be.revertedWith(
        "ABOVE_MAX_SUPPLY"
      );
    });

    it("Burns correctly", async () => {
      await spaceCoin.burn(spaceCoin.address, 100);

      const newSupply = await spaceCoin.totalSupply();
      expect(newSupply).to.be.equal(parseEther("499900"));
    });

    it("Mints and assigns correctly", async () => {
      await spaceCoin.burn(spaceCoin.address, 100);

      const supply = await spaceCoin.totalSupply();
      expect(supply).to.be.equal(parseEther("499900"));

      await spaceCoin.mint(owner.address, 100);

      const newSupply = await spaceCoin.totalSupply();
      const newOwnerBalance = await spaceCoin.balanceOf(owner.address);

      expect(newSupply).to.be.equal(parseEther("500000"));
      expect(newOwnerBalance).to.be.equal(parseEther("100"));
    });
  });

  describe("Taxing", () => {
    it("Pauses taxing", async () => {
      let balanceOfTreasury, balanceOfUser;

      await spaceCoin.contribute({ value: parseEther("1") });
      await spaceCoin.advancePhase();
      await spaceCoin.advancePhase();
      await spaceCoin.claimTokens();

      // TAX OFF
      await spaceCoin.toggleTax();
      await spaceCoin.transfer(addr1.address, parseEther("1"));
      balanceOfTreasury = await spaceCoin.balanceOf(treasury.address);
      balanceOfUser = await spaceCoin.balanceOf(addr1.address);

      expect(balanceOfTreasury).to.be.equal(parseEther("0"));
      expect(balanceOfUser).to.be.equal(parseEther("1"));

      // TAX ON
      await spaceCoin.toggleTax();
      await spaceCoin.transfer(addr2.address, parseEther("1"));
      balanceOfTreasury = await spaceCoin.balanceOf(treasury.address);
      balanceOfUser = await spaceCoin.balanceOf(addr2.address);

      expect(balanceOfTreasury).to.be.equal(parseEther("0.02"));
      expect(balanceOfUser).to.be.equal(parseEther("0.98"));
    });
  });

  describe("Pausing", () => {
    it("Pauses on SEED", async () => {
      await spaceCoin.contribute({ value: parseEther("0.25") });

      await spaceCoin.togglePauseContract();

      await expect(
        spaceCoin.contribute({ value: parseEther("0.25") })
      ).to.be.revertedWith("CONTRACT_PAUSED");

      await expect(spaceCoin.claimTokens()).to.be.revertedWith(
        "CONTRACT_PAUSED"
      );
    });

    it("Pauses on GENERAL", async () => {
      await spaceCoin.advancePhase();
      await spaceCoin.contribute({ value: parseEther("0.25") });

      await spaceCoin.togglePauseContract();

      await expect(
        spaceCoin.contribute({ value: parseEther("0.25") })
      ).to.be.revertedWith("CONTRACT_PAUSED");

      await expect(spaceCoin.claimTokens()).to.be.revertedWith(
        "CONTRACT_PAUSED"
      );
    });

    it("Pauses on OPEN", async () => {
      await spaceCoin.advancePhase();
      await spaceCoin.advancePhase();

      await spaceCoin.contribute({ value: parseEther("0.25") });

      await spaceCoin.togglePauseContract();

      await expect(
        spaceCoin.contribute({ value: parseEther("0.25") })
      ).to.be.revertedWith("CONTRACT_PAUSED");

      await expect(spaceCoin.claimTokens()).to.be.revertedWith(
        "CONTRACT_PAUSED"
      );
    });
  });

  describe("Phases", () => {
    it("Increases phases correctly", async () => {
      await spaceCoin.advancePhase();
      await spaceCoin.advancePhase();

      const phase = await spaceCoin.currentPhase();
      expect(phase).to.be.equal(2);
    });

    it("Reverts increasing phase if it's the last one", async () => {
      await spaceCoin.advancePhase();
      await spaceCoin.advancePhase();

      await expect(spaceCoin.advancePhase()).to.be.revertedWith("LAST_PHASE");
    });

    describe("SEED phase", () => {
      it("Reverts if individual total above 1500 ether", async () => {
        await spaceCoin.contribute({ value: parseEther("1400") });
        await expect(
          spaceCoin.contribute({ value: parseEther("200") })
        ).to.be.revertedWith("ABOVE_MAX_INDIVIDUAL_CONTRIBUTION");
      });

      it("Reverts if total contributions above 15,000 ether", async () => {
        //Donate maximum from 10 different address
        for (let i = 0; i < 10; i++) {
          await spaceCoin.addToWhitelist(addrs[i].address);
          await spaceCoin
            .connect(addrs[i])
            .contribute({ value: parseEther("1500") });
        }

        //Current total contributions: 15,000
        await spaceCoin.addToWhitelist(addrs[10].address);
        await expect(
          spaceCoin.connect(addrs[10]).contribute({ value: parseEther("1") })
        ).to.be.revertedWith("ABOVE_MAX_CONTRIBUTION");
      });
    });

    describe("GENERAL phase", () => {
      beforeEach(async () => {
        await spaceCoin.advancePhase();
      });

      it("Reverts if individual total above 1000 ether", async () => {
        await spaceCoin.contribute({ value: parseEther("1000") });
        await expect(
          spaceCoin.contribute({ value: parseEther("1") })
        ).to.be.revertedWith("ABOVE_MAX_INDIVIDUAL_CONTRIBUTION");
      });

      it("Reverts if total contributions above 30,000 ether", async () => {
        //Donate maximum from 30 different address
        for (let i = 0; i < 30; i++) {
          await spaceCoin
            .connect(addrs[i])
            .contribute({ value: parseEther("1000") });
        }

        //Current total contributions: 30,000
        await expect(
          spaceCoin.connect(addrs[30]).contribute({ value: parseEther("1") })
        ).to.be.revertedWith("ABOVE_MAX_CONTRIBUTION");
      });
    });

    describe("OPEN phase", () => {
      it("Reverts if total contributions above 30,000 ether", async () => {
        await spaceCoin.advancePhase();
        await spaceCoin.advancePhase();

        //Donate maximum from 30 different address
        for (let i = 0; i < 30; i++) {
          await spaceCoin
            .connect(addrs[i])
            .contribute({ value: parseEther("1000") });
        }

        //Current total contributions: 29,400
        await expect(
          spaceCoin.connect(addrs[30]).contribute({ value: parseEther("700") })
        ).to.be.revertedWith("ABOVE_MAX_CONTRIBUTION");
      });

      it("Reverts if claiming not allowed yet", async () => {
        await spaceCoin.contribute({ value: parseEther("10") });

        await expect(spaceCoin.claimTokens()).to.be.revertedWith(
          "NOT_LAST_PHASE"
        );
      });

      it("Allows user to claim tokens assigned to them", async () => {
        await spaceCoin.advancePhase();
        await spaceCoin.connect(addr1).contribute({ value: parseEther("0.5") });
        await spaceCoin.advancePhase();

        await spaceCoin.connect(addr1).claimTokens();

        const balanceOf = await spaceCoin.balanceOf(addr1.address);

        expect(balanceOf).to.be.equal(parseEther("2.5"));
      });

      it("Can only send funds on the OPEN phase", async () => {
        await expect(
          spaceCoin.sendLiquidityToLPContract(liquidityPool.address)
        ).to.be.revertedWith("NOT_LAST_PHASE");
      });
    });
  });

  describe("Token transfering", () => {
    it("Transfers tokens and takes 2%", async () => {
      await spaceCoin.contribute({ value: parseEther("1") });
      await spaceCoin.advancePhase();
      await spaceCoin.advancePhase();

      await spaceCoin.claimTokens();

      await spaceCoin.transfer(addr1.address, parseEther("1"));

      const balanceOf = await spaceCoin.balanceOf(addr1.address);

      expect(balanceOf).to.be.equal(parseEther("0.98"));
    });

    it("Sends 2% of a transaction to the treasury wallet", async () => {
      await spaceCoin.contribute({ value: parseEther("1") });
      await spaceCoin.advancePhase();
      await spaceCoin.advancePhase();
      await spaceCoin.claimTokens();
      await spaceCoin.transfer(addr1.address, parseEther("1"));

      const balanceOf = await spaceCoin.balanceOf(treasury.address);

      expect(balanceOf).to.be.equal(parseEther("0.02"));
    });
  });

  describe("Sending funds to liquidity pool", () => {});
});
