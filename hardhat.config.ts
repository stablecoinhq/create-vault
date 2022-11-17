import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();
import {
  balance,
  createVault,
  liquidate,
  bid,
  updateRate,
  viewVaultState,
  resetAuction,
  viewAuction,
  viewParams,
  lockForVote,
  freeForVote,
  voteForAddressList,
} from "./tasks";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction((args: TaskArguments, hre: HardhatRuntimeEnvironment) =>
    balance(hre, args)
  );

task("createVault", "create vault")
  .addOptionalParam("amount", "collateral amount", "100")
  .setAction((args: TaskArguments, hre: HardhatRuntimeEnvironment) =>
    createVault(hre, args)
  );

task("liquidate", "liquidate vault")
  .addParam("urnAddress", "urnAddress to liquidate")
  .setAction((args: TaskArguments, hre: HardhatRuntimeEnvironment) =>
    liquidate(hre, args)
  );

task("bid", "join auction and make bid")
  .addOptionalParam("gasLimit", "gas limit", undefined)
  .addOptionalParam("nonce", "nonce value", undefined)
  .addParam("auctionId", "auction id to take")
  .addParam("amountToTake", "amount to take")
  .addParam("maxPrice", "max price to take")
  .addParam("receiver", "receiver of collateral")
  .setAction((args: TaskArguments, hre: HardhatRuntimeEnvironment) =>
    bid(hre, args)
  );

task("updateRate", "update rate to start auction")
  .addParam("ilk", "ilk to update")
  .setAction((args: TaskArguments, hre: HardhatRuntimeEnvironment) =>
    updateRate(hre, args)
  );

task(
  "viewVaultState",
  "view vault state to check condition before/after auction"
)
  .addParam("urnAddress", "urnAddress to watch")
  .setAction((args: TaskArguments, hre: HardhatRuntimeEnvironment) =>
    viewVaultState(hre, args)
  );

task("resetAuction", "view vault state to check condition before/after auction")
  .addOptionalParam("nonce", "nonce value", undefined)
  .addParam("auctionId", "auction id to reset")
  .addParam("receiver", "receiver of collateral")
  .setAction((args: TaskArguments, hre: HardhatRuntimeEnvironment) =>
    resetAuction(hre, args)
  );

task("viewAuction", "view auction state to check condition")
  .addParam("auctionId", "auction id to view")
  .setAction((args: TaskArguments, hre: HardhatRuntimeEnvironment) =>
    viewAuction(hre, args)
  );

task("viewParams", "view each contract's parameters").setAction(
  (_args: TaskArguments, hre: HardhatRuntimeEnvironment) => viewParams(hre)
);

task("lockForVote", "lock some maker token for voting")
  .addParam("amount", "amount to lock maker token")
  .setAction((args: TaskArguments, hre: HardhatRuntimeEnvironment) =>
    lockForVote(hre, args)
  );

task("freeForVote", "unlock some maker token for voting")
  .addParam("amount", "amount to unlock maker token")
  .setAction((args: TaskArguments, hre: HardhatRuntimeEnvironment) =>
    freeForVote(hre, args)
  );

task(
  "voteForAddressList",
  "vote for address list. create set of candidates if it does not exists. ")
  .addParam("addressList", 'comma-separated address list to vote. list will be sorted when given to contract.')
  .setAction((args: TaskArguments, hre: HardhatRuntimeEnvironment) =>
    voteForAddressList(hre, args)
  );


const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      { version: "0.5.12" },
      { version: "0.5.5" },
      { version: "0.6.12" },
    ],
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
      chainId: 5,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY!}`,
      accounts: [`0x${process.env.PRIVATE_KEY!}`],
      chainId: 1,
    },
  },
  typechain: {
    alwaysGenerateOverloads: true,
  },
};

export default config;
