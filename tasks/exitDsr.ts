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
    const daiAmount = BigNumber.from(+args.dai).mul(value1e18)
    if (chainId) {
        // prepare proxy contract
        const chainlog = await ChainLog.fromEthers(chainId, ethers);
        const proxyAddress = await chainlog.getAddressOf("PROXY_ACTIONS_DSR");
        const proxyContract = await ethers.getContractAt("DssProxyActionsDsr", proxyAddress);

        const daiJoinAddress = await chainlog.getAddressOf("MCD_JOIN_DAI");
        const potAddress = await chainlog.getAddressOf("MCD_POT");

        // run proxy
        const proxyExitReceipt = await submitAndWait(
            proxyContract.exitAll(
                daiJoinAddress, potAddress,
            )
            // proxyContract.exit(
            //     daiJoinAddress, potAddress, daiAmount,
            // )
        )
        console.log(proxyExitReceipt)
    }
}
