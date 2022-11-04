import { toHex, submitAndWait } from "./utils";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types"
require("dotenv").config();
const mcdClipFauAAddress = `0xc45A29d6B2585B270a4A2221A94d44254C8FE756`
const VAT_ADDRESS = "0x1b1FE236166eD0Ac829fa230afE38E61bC281C5e";

const value1e18 = BigNumber.from("10").pow(18);
const value1e27 = BigNumber.from("10").pow(27);

const confirmationHeight = process.env.CONFIRMATION_HEIGHT ? parseInt(process.env.CONFIRMATION_HEIGHT!) : 0;

async function submitTx(tx: Promise<ContractTransaction>): Promise<ContractReceipt> {
    return submitAndWait(tx, confirmationHeight);
}

export const viewAuction = async function (hre: HardhatRuntimeEnvironment, args: TaskArguments) {
    const ethers = hre.ethers
    const [myAccount] = await ethers.getSigners();

    const auctionId = args.auctionId ?? 1; // change it accordingly.

    const vatContract = await ethers.getContractAt("Vat", VAT_ADDRESS);
    const hopeIsAlreadyExecuted = await vatContract.can(myAccount.address, mcdClipFauAAddress)
    const mcdClipFauAContract = await ethers.getContractAt("Clipper", mcdClipFauAAddress);
    const { needsRedo, price, lot, tab } = await mcdClipFauAContract.getStatus(auctionId);
    const { pos, usr, tic, top } = await mcdClipFauAContract.sales(auctionId);
    const buf = await mcdClipFauAContract.buf();
    const tail = await mcdClipFauAContract.tail();
    const cusp = await mcdClipFauAContract.cusp();
    const chip = await mcdClipFauAContract.chip();
    const tip = await mcdClipFauAContract.tip();
    const chost = await mcdClipFauAContract.chost();
    const list = await mcdClipFauAContract.list();
    const stopped = await mcdClipFauAContract.stopped();
    // const status = await mcdClipFauAContract.status(tic, top);
    console.log(JSON.stringify({
        // id specific params
        hopeIsAlreadyExecuted: hopeIsAlreadyExecuted.toString(),
        needsRedo,
        price: price.toString(),
        lot: lot.toString(),
        tab: tab.toString(),
        pos: pos.toString(),
        usr: usr.toString(),
        tic: tic.toString(),
        top: top.toString(),
        // global params
        buf: buf.toString(),
        tail: tail.toString(),
        cusp: cusp.toString(),
        chip: chip.toString(),
        tip: tip.toString(),
        chost: chost.toString(),
        list: Array.from(list),
        stopped: stopped.toString(),
    }, null, 2))

}
