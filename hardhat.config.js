require("@nomiclabs/hardhat-waffle");

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
  },
};
