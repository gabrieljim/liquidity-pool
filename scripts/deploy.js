const { hardhatArguments } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const SpaceCoin = await hre.ethers.getContractFactory("SpaceCoin");
  const spaceCoin = await SpaceCoin.deploy(
    hardhatArguments.network === "localhost"
      ? "0x2f4f06d218e426344cfe1a83d53dad806994d325"
      : process.env.TREASURY_WALLET
  );
  console.log("Deploying SpaceCoin");
  await spaceCoin.deployed();
  console.log("Space Coin deployed to:", spaceCoin.address);

  const LiquidityPool = await hre.ethers.getContractFactory("LiquidityPool");
  const liquidityPool = await LiquidityPool.deploy();
  console.log("Deploying LiquidityPool");
  await liquidityPool.deployed();
  console.log("Liquidity Pool deployed to:", liquidityPool.address);

  const LPT = await hre.ethers.getContractFactory("LPT");
  const lpt = await LPT.deploy(liquidityPool.address);
  console.log("Deploying LPT");
  await lpt.deployed();
  console.log("LPT deployed to:", lpt.address);

  await liquidityPool.setSpaceCoinAddress(spaceCoin.address);
  await liquidityPool.setLPTAddress(lpt.address);

  const SpaceRouter = await hre.ethers.getContractFactory("SpaceRouter");
  const spaceRouter = await SpaceRouter.deploy(
    liquidityPool.address,
    spaceCoin.address
  );
  console.log("Deploying SpaceRouter");
  await spaceRouter.deployed();
  console.log("Space Router deployed to:", spaceRouter.address);

  await spaceCoin.setRouterAddress(spaceRouter.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
