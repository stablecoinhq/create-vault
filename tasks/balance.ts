import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types"
export const balance = async (hre: HardhatRuntimeEnvironment, args: TaskArguments) => {
    const balance = await hre.ethers.provider.getBalance(args.account);

    console.log(hre.ethers.utils.formatEther(balance), "ETH");
}