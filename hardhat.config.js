require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const INFURA_ENDPOINT = process.env.INFURA_ENDPOINT;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.18",
    networks: {
        hardhat: {},
        sepolia: {
            url: INFURA_ENDPOINT,
            accounts: [PRIVATE_KEY],
        },
    },
};
