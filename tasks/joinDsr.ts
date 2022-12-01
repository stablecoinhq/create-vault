import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { ChainLog, submitAndWait } from "./utils";
import { BigNumber } from "ethers";

const value1e18 = BigNumber.from("10").pow(18);

export async function joinDsr(hre: HardhatRuntimeEnvironment, args: TaskArguments) {
    const { ethers } = hre;
    const { chainId } = hre.network.config;
    if (! +args.dai) {
        throw new Error("Please specify valid dai amount");
    }
    const daiAmount = BigNumber.from(+args.dai).mul(value1e18)
    const [myAccount] = await ethers.getSigners();
    if (chainId) {
        // prepare proxy contract
        const chainlog = await ChainLog.fromEthers(chainId, ethers);
        const proxyAddress = await chainlog.getAddressOf("PROXY_ACTIONS_DSR");
        const proxyContract = await ethers.getContractAt("DssProxyActionsDsr", proxyAddress);

        const daiJoinAddress = await chainlog.getAddressOf("MCD_JOIN_DAI");
        const potAddress = await chainlog.getAddressOf("MCD_POT");

        // approve token
        const daiAddress = await chainlog.getAddressOf("MCD_DAI");
        const daiContract = await ethers.getContractAt("Dai", daiAddress);

        // check allowance
        const allowance = await daiContract.allowance(myAccount.address, proxyAddress)
        console.log(`checking allowance: ${allowance}, needed: ${daiAmount}`)
        if (BigNumber.from(allowance).lt(daiAmount)) {
            console.log(`approve token for MCD_DAI (approve)`)
            const approveReceipt = await submitAndWait(daiContract.approve(proxyAddress, daiAmount));
            console.log(approveReceipt)
        }

        // run proxy
        const proxyJoinReceipt = await submitAndWait(
            proxyContract.join(
                daiJoinAddress, potAddress, daiAmount,
            )
        )
        console.log(proxyJoinReceipt)
    }
}
