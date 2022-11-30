import { toHex, submitAndWait } from "./utils";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types"
require("dotenv").config();
const ADM_ADDRESS = "0x8c7FAeFDCE1438cF99B6654C3c3De3816eC0e879";

const confirmationHeight = process.env.CONFIRMATION_HEIGHT ? parseInt(process.env.CONFIRMATION_HEIGHT!) : 0;

async function submitTx(tx: Promise<ContractTransaction>): Promise<ContractReceipt> {
    return submitAndWait(tx, confirmationHeight);
}

// execute approve voting to given list of addresses
export const moveVoteToSetOfCandidates = async function (hre: HardhatRuntimeEnvironment, args: TaskArguments) {
    const ethers = hre.ethers
    const slate: string = args.slate

    if (slate) {
        const chiefContract = await ethers.getContractAt("DSChief", ADM_ADDRESS);

        // console.log(addressList, chiefContract)
        const result = await submitTx(
            chiefContract["vote(bytes32)"](slate)
        );
        console.log(result)
    }
}
