import { ethers } from "hardhat";
import { toHex, submitAndWait } from "./utils";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
require("dotenv").config();
const DOG_ADDRESS = "0x85D5AFA199d212189fb4ed397245f93fA4514D27";
const urnAddress = `0x1E75748a5B1c756D2517d03f059Fd63446bb311a`

const FAU_A = toHex("FAU-A");

const confirmationHeight = process.env.CONFIRMATION_HEIGHT ? parseInt(process.env.CONFIRMATION_HEIGHT!) : 0;

async function submitTx(tx: Promise<ContractTransaction>): Promise<ContractReceipt> {
    return submitAndWait(tx, confirmationHeight);
}

// 精算の実行
async function main() {

    const [myAccount] = await ethers.getSigners();
    const dogContract = await ethers.getContractAt("Dog", DOG_ADDRESS);
    const result = await submitTx(
        dogContract.bark(FAU_A, urnAddress, myAccount.address)
    );
    console.log(result)
}

main().then((e) => {
    console.log(e);
    process.exit(1);
});
