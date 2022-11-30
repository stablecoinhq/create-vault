import { toHex, submitAndWait } from "./utils";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types"
require("dotenv").config();
// all for goerli
const ADM_ADDRESS = "0x8c7FAeFDCE1438cF99B6654C3c3De3816eC0e879";
const DS_TOKEN_ADDRESS = "0xa1A07333CAfDFCaF5767961B2e2ac1d108e0e7A3";
const MCD_IOU_ADDRESS = `0x8ea93C73830148844c7493628b50B039C99A6109`

const confirmationHeight = process.env.CONFIRMATION_HEIGHT ? parseInt(process.env.CONFIRMATION_HEIGHT!) : 0;

async function submitTx(tx: Promise<ContractTransaction>): Promise<ContractReceipt> {
  return submitAndWait(tx, confirmationHeight);
}

// add more funds for voting
export const freeForVote = async function (hre: HardhatRuntimeEnvironment, args: TaskArguments) {
  const ethers = hre.ethers
  const amount = +args.amount
  const [myAccount] = await ethers.getSigners();

  const chiefContract = await ethers.getContractAt("DSChief", ADM_ADDRESS);
  const dsToken = await ethers.getContractAt("DSToken", DS_TOKEN_ADDRESS);
  const dsTokenIou = await ethers.getContractAt("DSToken", MCD_IOU_ADDRESS);

  console.log(`approve token for dsTokenIou.address (approve)`)
  const approveResult = await submitTx(dsTokenIou['approve(address,uint256)'](chiefContract.address, amount));
  console.log(approveResult)

  const balance = await dsToken.balanceOf(myAccount.address)
  const allowance = await dsToken.allowance(myAccount.address, chiefContract.address)
  console.log(`allowance balance: ${allowance}, current balance: ${balance}`)

  const balanceIou = await dsTokenIou.balanceOf(myAccount.address)
  const allowanceIou = await dsToken.allowance(myAccount.address, chiefContract.address)
  console.log(`iou allowance balance: ${allowanceIou}, current balance: ${balanceIou}`)

  console.log(`unlock token for vote`)
  const result = await submitTx(
    chiefContract.free(+amount)
  );
  console.log(result)
}
