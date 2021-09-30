require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: "./frontend/src/artifacts",
  },
  networks: {
    hardhat: {
      chainId: 8545,
      accounts: {
        count: 40,
      },
    },
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/aCr1deQtvZ1WaKYni9rqiRg0_3OrksSp",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
