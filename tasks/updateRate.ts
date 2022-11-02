import { toHex, submitAndWait } from "./utils";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types"
require("dotenv").config();
const JUG_ADDRESS = '0xDC1De048663D0B9861AB145335B30b6A779904c2'
const confirmationHeight = process.env.CONFIRMATION_HEIGHT ? parseInt(process.env.CONFIRMATION_HEIGHT!) : 0;

async function submitTx(tx: Promise<ContractTransaction>): Promise<ContractReceipt> {
    return submitAndWait(tx, confirmationHeight);
}

export const updateRate = async function (hre: HardhatRuntimeEnvironment, args: TaskArguments) {
    const ethers = hre.ethers
    const FAU_A = toHex(args.ilk ?? "FAU-A");

    const [myAccount] = await ethers.getSigners();
    const jugContract = await ethers.getContractAt("Jug", JUG_ADDRESS);
    console.log(`update rate for ilk`)
    const result = await submitTx(
        jugContract.drip(
            FAU_A
        )
    );
    console.log(result)
}
