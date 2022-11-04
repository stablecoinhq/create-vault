import { toHex, submitAndWait } from "./utils";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types"
require("dotenv").config();
const VAT_ADDRESS = "0x1b1FE236166eD0Ac829fa230afE38E61bC281C5e"; // goerli
// const VAT_ADDRESS = "0x35D1b3F3D7966A1DFe207aa4514C12a259A0492B" // mainnet
const FLIP_ADDRESS = "0xc0692b4f3888f0a989beacc65e4ef093b37b17c8"; // goerli flip_fab
// const FLIP_ADDRESS = "0x4ACdbe9dd0d00b36eC2050E805012b8Fc9974f2b"; // mainnet flip_fab
const mcdClipFauAAddress = `0xc45A29d6B2585B270a4A2221A94d44254C8FE756`

// const FLIP_ADDRESS = "0x32246220af07d5912276EED8b9eB9A233970D685";
const FAU_A = toHex("FAU-A");

const confirmationHeight = process.env.CONFIRMATION_HEIGHT ? parseInt(process.env.CONFIRMATION_HEIGHT!) : 0;

async function submitTx(tx: Promise<ContractTransaction>): Promise<ContractReceipt> {
    return submitAndWait(tx, confirmationHeight);
}

export const viewVaultState = async function (hre: HardhatRuntimeEnvironment, args: TaskArguments) {
    const ethers = hre.ethers
    const urnAddress = args.urnAddress ?? `0xb983d5aa571a29da7270ba366ff60163171e3044`

    const vatContract = await ethers.getContractAt("Vat", VAT_ADDRESS);

    const ilkInfoFromVat = await vatContract.ilks(FAU_A);
    const { rate, spot, dust } = ilkInfoFromVat
    const urnInfoFromVat = await vatContract.urns(FAU_A, urnAddress);
    const { ink, art } = urnInfoFromVat

    const mcdClipFauAContract = await ethers.getContractAt("Clipper", mcdClipFauAAddress);
    const cusp = await mcdClipFauAContract.cusp();
    const tail = await mcdClipFauAContract.tail();

    console.log(JSON.stringify({
        rate: rate.toString(),
        spot: spot.toString(),
        dust: dust.toString(),
        ink: ink.toString(),
        art: art.toString(),
        cusp: cusp.toString(),
        tail: tail.toString(),
    }, null, 2))
}
