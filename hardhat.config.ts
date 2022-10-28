import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [{ version: "0.5.12" }, { version: "0.5.5" }],
  },
  // ここにローカル追加
  networks: {
    hardhat: {
      forking: {
        url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY!}`,
      },
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY!}`,
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
};

export default config;
