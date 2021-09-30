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
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
