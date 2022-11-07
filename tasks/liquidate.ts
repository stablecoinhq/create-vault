import { toHex, submitAndWait } from "./utils";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types"
require("dotenv").config();
const DOG_ADDRESS = "0x85D5AFA199d212189fb4ed397245f93fA4514D27";
const VAT_ADDRESS = "0x1b1FE236166eD0Ac829fa230afE38E61bC281C5e";

const FAU_A = toHex("FAU-A");

const confirmationHeight = process.env.CONFIRMATION_HEIGHT ? parseInt(process.env.CONFIRMATION_HEIGHT!) : 0;

async function submitTx(tx: Promise<ContractTransaction>): Promise<ContractReceipt> {
    return submitAndWait(tx, confirmationHeight);
}

// 精算の実行
export const liquidate = async function (hre: HardhatRuntimeEnvironment, args: TaskArguments) {
    const ethers = hre.ethers
    const urnAddress = args.urnAddress ?? `0xb983d5aa571a29da7270ba366ff60163171e3044`

    const [myAccount] = await ethers.getSigners();
    const vatContract = await ethers.getContractAt("Vat", VAT_ADDRESS);
    const dogContract = await ethers.getContractAt("Dog", DOG_ADDRESS);

    const ilkInfoFromVat = await vatContract.ilks(FAU_A);
    const { rate, spot, dust } = ilkInfoFromVat
    const urnInfoFromVat = await vatContract.urns(FAU_A, urnAddress);
    const { ink, art } = urnInfoFromVat

    const isUnsafe = ink.mul(spot).lt(art.mul(rate));
    console.log(JSON.stringify({
        isUnsafe,
        ink: ink.toString(),
        art: art.toString(),
        spot: spot.toString(),
        rate: rate.toString(),
        inkSpot: ink.mul(spot).toString(),
        artRate: art.mul(rate).toString(),
    }, null, 2))

    if (isUnsafe) {
        const result = await submitTx(
            dogContract.bark(FAU_A, urnAddress, myAccount.address)
        );
        console.log(result)
    }
}
