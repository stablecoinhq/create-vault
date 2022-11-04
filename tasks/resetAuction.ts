import { toHex, submitAndWait } from "./utils";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types"
require("dotenv").config();
const mcdClipFauAAddress = `0xc45A29d6B2585B270a4A2221A94d44254C8FE756`
const VAT_ADDRESS = "0x1b1FE236166eD0Ac829fa230afE38E61bC281C5e";

const confirmationHeight = process.env.CONFIRMATION_HEIGHT ? parseInt(process.env.CONFIRMATION_HEIGHT!) : 0;

async function submitTx(tx: Promise<ContractTransaction>): Promise<ContractReceipt> {
    return submitAndWait(tx, confirmationHeight);
}

export const resetAuction = async function (hre: HardhatRuntimeEnvironment, args: TaskArguments) {
    const ethers = hre.ethers
    const [myAccount] = await ethers.getSigners();

    const auctionId = args.auctionId ?? 1; // change it accordingly.
    const receiver = args.receiver ?? myAccount.address

    const vatContract = await ethers.getContractAt("Vat", VAT_ADDRESS);
    const hopeIsAlreadyExecuted = await vatContract.can(myAccount.address, mcdClipFauAAddress)
    // console.log(`hopeIsAlreadyExecuted: ${hopeIsAlreadyExecuted}`)
    if (!parseInt(hopeIsAlreadyExecuted.toString())) {
        //required only once
        console.log(`enable hope for ${mcdClipFauAAddress}`)
        const vatHopeResult = await submitTx(
            vatContract.hope(mcdClipFauAAddress)
        );
        console.log(vatHopeResult)
    }

    const mcdClipFauAContract = await ethers.getContractAt("Clipper", mcdClipFauAAddress);
    const { needsRedo, price, lot, tab } = await mcdClipFauAContract.getStatus(auctionId);
    console.log(JSON.stringify({
        needsRedo,
        price: price.toString(),
        lot: lot.toString(),
        tab: tab.toString()
    }, null, 2))

    let txOption: { [key: string]: any } = {}
    if (args.nonce !== undefined) {
        txOption.nonce = args.nonce
    }

    if (needsRedo) {
        console.log(`reset auction`)
        const result = await submitTx(
            mcdClipFauAContract.redo(
                auctionId,
                receiver,
                txOption,
            )
        );
        console.log(result)
    }
}
