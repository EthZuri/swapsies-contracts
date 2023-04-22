import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const GOERLI_RPC = process.env.GOERLI_RPC!;
const DEPLOYER_PRIV_KEY = process.env.DEPLOYER_PRIV_KEY!;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY!;

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    goerli: {
      url: GOERLI_RPC,
      accounts: [DEPLOYER_PRIV_KEY],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true" ? true : false,
  },
};

export default config;
