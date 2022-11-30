import { toHex, submitAndWait } from "./utils";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types"
require("dotenv").config();
const ADM_ADDRESS = "0x8c7FAeFDCE1438cF99B6654C3c3De3816eC0e879";
const DS_TOKEN_ADDRESS = "0xa1A07333CAfDFCaF5767961B2e2ac1d108e0e7A3";

const confirmationHeight = process.env.CONFIRMATION_HEIGHT ? parseInt(process.env.CONFIRMATION_HEIGHT!) : 0;

async function submitTx(tx: Promise<ContractTransaction>): Promise<ContractReceipt> {
  return submitAndWait(tx, confirmationHeight);
}

// add more funds for voting
export const lockForVote = async function (hre: HardhatRuntimeEnvironment, args: TaskArguments) {
  const ethers = hre.ethers
  const amount = +args.amount
  const [myAccount] = await ethers.getSigners();

  const chiefContract = await ethers.getContractAt("DSChief", ADM_ADDRESS);
  const dsToken = await ethers.getContractAt("DSToken", DS_TOKEN_ADDRESS);

  const hat = await chiefContract.hat()

  const approval = await chiefContract.approvals(hat)
  console.log(`current hat: ${hat} and its approvals: ${approval}`)

  console.log(`approve token for dsToken.address (approve)`)
  const approveResult = await submitTx(dsToken['approve(address,uint256)'](chiefContract.address, amount));
  console.log(approveResult)

  const balance = await dsToken.balanceOf(myAccount.address)
  console.log(`current balance: ${balance}`)

  console.log(`lock token for vote`)
  const result = await submitTx(
    chiefContract.lock(+amount)
  );
  console.log(result)
}
