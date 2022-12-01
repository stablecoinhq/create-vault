import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { ChainLog, submitAndWait } from "./utils";
import { BigNumber } from "ethers";

const value1e18 = BigNumber.from("10").pow(18);

export async function exitDsr(hre: HardhatRuntimeEnvironment, args: TaskArguments) {
    const { ethers } = hre;
    const { chainId } = hre.network.config;
    if (! +args.dai) {
        throw new Error("Please specify valid dai amount");
    }
    const dai = BigNumber.from(+args.dai).mul(value1e18)
    if (chainId) {
        const chainlog = await ChainLog.fromEthers(chainId, ethers);
        const potAddress = await chainlog.getAddressOf("MCD_POT");
        const potContract = await ethers.getContractAt("Pot", potAddress);
        const dripReceipt = await submitAndWait(potContract.drip())
        console.log(dripReceipt)
        const exitReceipt = await submitAndWait(potContract.exit(dai))
        console.log(exitReceipt)
    }
}
