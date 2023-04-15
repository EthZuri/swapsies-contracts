import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const GOERLI_RPC = process.env.GOERLI_RPC!;
const DEPLOYER_PRIV_KEY = process.env.DEPLOYER_PRIV_KEY!;

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    goerli: {
      url: GOERLI_RPC,
      accounts: [DEPLOYER_PRIV_KEY]
    }
  }
};

export default config;
