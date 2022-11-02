import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();
import {
  balance, createVault,
  liquidate, bid, updateRate
} from "./tasks"
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction((args: TaskArguments, hre: HardhatRuntimeEnvironment) => balance(hre, args));

task("createVault", "create vault")
  .addParam("account", "The account's address")
  .setAction((args: TaskArguments, hre: HardhatRuntimeEnvironment) => createVault(hre, args));

task("liquidate", "liquidate vault")
  .addParam("urnAddress", "urnAddress to liquidate")
  .setAction((args: TaskArguments, hre: HardhatRuntimeEnvironment) => liquidate(hre, args));

task("bid", "join auction and make bid")
  .addParam("account", "The account's address")
  .setAction((args: TaskArguments, hre: HardhatRuntimeEnvironment) => bid(hre, args));

task("updateRate", "join auction and make bid")
  .addParam("ilk", "ilk to update")
  .setAction((args: TaskArguments, hre: HardhatRuntimeEnvironment) => updateRate(hre, args));


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
  typechain: {
    alwaysGenerateOverloads: true
  },
};

export default config;
