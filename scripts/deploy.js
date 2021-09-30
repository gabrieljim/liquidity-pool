const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const SpaceCoin = await hre.ethers.getContractFactory("SpaceCoin");
  const spaceCoin = await SpaceCoin.deploy(
    process.env.TREASURY_WALLET || "0x2f4f06d218e426344cfe1a83d53dad806994d325"
  );

  await spaceCoin.deployed();

  console.log("Space Coin deployed to:", spaceCoin.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
