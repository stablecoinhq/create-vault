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
    const dai = BigNumber.from(+args.dai).mul(value1e18)
    if (chainId) {
        // prepare pot contract
        const chainlog = await ChainLog.fromEthers(chainId, ethers);
        const potAddress = await chainlog.getAddressOf("MCD_POT");
        const potContract = await ethers.getContractAt("Pot", potAddress);

        // check hope is enabled
        const vatAddress = await chainlog.getAddressOf("MCD_VAT");
        const vatContract = await ethers.getContractAt("Vat", vatAddress);
        const [myAccount] = await ethers.getSigners();
        const hopeIsAlreadyExecuted = await vatContract.can(myAccount.address, potAddress)
        console.log(`hopeIsAlreadyExecuted: ${hopeIsAlreadyExecuted}`)
        if (!parseInt(hopeIsAlreadyExecuted.toString())) {
            //required only once
            console.log(`enable hope for ${potAddress}`)
            const vatHopeResult = await submitAndWait(
                vatContract.hope(potAddress)
            );
            console.log(vatHopeResult)
        }

        // you need now === rho condition so the following two must be run in same tx.
        // the following does not work  :/
        if (false) {
            // drip once before join
            const dripReceipt = await submitAndWait(potContract.drip({ gasLimit: args.gasLimit ?? 80232 }))
            console.log(dripReceipt)

            // join after drip and hope
            const joinReceipt = await submitAndWait(potContract.join(dai))
            console.log(joinReceipt)
        }
    }
}
