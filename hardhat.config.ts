import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [{ version: "0.5.12" }, { version: "0.5.5" }, { version: "0.6.12" }],
  },
  defaultNetwork: "goerli",
  networks: {
    hardhat: {
      forking: {
        url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY!}`,
      },
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY!}`,
      accounts: [`0x${process.env.PRIVATE_KEY!}`],
      chainId: 5
    },
  },
};

export default config;
