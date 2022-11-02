import { toHex, submitAndWait } from "./utils";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types"
require("dotenv").config();
const mcdClipFauAAddress = `0xc45A29d6B2585B270a4A2221A94d44254C8FE756`
const VAT_ADDRESS = "0x1b1FE236166eD0Ac829fa230afE38E61bC281C5e";

const FAU_A = toHex("FAU-A");
const auctionId = 1; // change it accordingly.
const value1e18 = BigNumber.from("10").pow(18);
const value1e27 = BigNumber.from("10").pow(27);
const amountToTake = BigNumber.from(200).mul(value1e18)
const maxPrice = BigNumber.from(150).mul(value1e27) // price for FAU token

const confirmationHeight = process.env.CONFIRMATION_HEIGHT ? parseInt(process.env.CONFIRMATION_HEIGHT!) : 0;

async function submitTx(tx: Promise<ContractTransaction>): Promise<ContractReceipt> {
    return submitAndWait(tx, confirmationHeight);
}

// 精算の実行
export const bid = async function (hre: HardhatRuntimeEnvironment, args: TaskArguments) {
    const ethers = hre.ethers

    const [myAccount] = await ethers.getSigners();
    const vat = await ethers.getContractAt("Vat", VAT_ADDRESS);
    console.log(`approve to participate as bidder in vat contract`)
    //required only once
    // const vatHopeResult = await submitTx(
    //     vat.hope(mcdClipFauAAddress)
    // );
    // console.log(vatHopeResult)

    console.log(`bid auction`)
    const mcdClipFauAContract = await ethers.getContractAt("Clipper", mcdClipFauAAddress);
    const result = await submitTx(
        mcdClipFauAContract.take(
            auctionId,
            amountToTake,
            maxPrice,
            myAccount.address,
            Buffer.from([]),
            // { nonce: 19 }
        )
    );
    console.log(result)
}
