import { ethers } from "hardhat";
import { toHex, submitAndWait } from "./utils";
import { BigNumber, ContractTransaction } from "ethers";
require("dotenv").config();
const VAT_ADDRESS = "0x1b1FE236166eD0Ac829fa230afE38E61bC281C5e";
const FAU_JOIN_ADDRESS = "0x0ab0c0B4E13e7B05566a1dA30F63706daf0848BE";
const FAU_ADDRESS = "0xBA62BCfcAaFc6622853cca2BE6Ac7d845BC0f2Dc";

const FAU_A = toHex("FAU-A");

const confirmationHeight = process.env.CONFIRMATION_HEIGHT ? parseInt(process.env.CONFIRMATION_HEIGHT!) : 0;

async function submitTx(tx: Promise<ContractTransaction>) {
  return submitAndWait(tx, confirmationHeight);
}

// 生成するFAUの数量
const toMint = BigNumber.from("10").pow(20);

// Fau tokenをMintしてVaultを生成する
async function main() {
  const [myAccount] = await ethers.getSigners();
  const vat = await ethers.getContractAt("Vat", VAT_ADDRESS);
  const fauJoin = await ethers.getContractAt("GemJoin", FAU_JOIN_ADDRESS);
  const fauToken = await ethers.getContractAt("ERC20Mintable", FAU_ADDRESS);

  const myTokenBalance = await fauToken.balanceOf(myAccount.address);

  console.log(`My fau token balance ${myTokenBalance}`)

  if (myTokenBalance.lt(toMint)) {
    console.log("Minting tokens");
    await submitTx(fauToken.mint(myAccount.address, toMint));
  }

  console.log("Put token into vault");
  await submitTx(fauToken.approve(fauJoin.address, toMint));
  await submitTx(fauJoin.join(myAccount.address, toMint));

  const ilkInfo = await vat.ilks(FAU_A);
  const { rate, spot } = ilkInfo;
  //   DART=$(bc<<<"scale=${WAD_DECIMALS}; art=(${DINK}*${CR}/${RATE})/2; scale=0; art/1")
  const dart = myTokenBalance.mul(spot).div(rate); // ここ怪しいVat.sol確認しながらやってみて
  console.log("Minting dai");
  await submitTx(
    vat.frob(
      FAU_A,
      myAccount.address,
      myAccount.address,
      myAccount.address,
      toMint,
      dart
    )
  );
  const myVault = await vat.urns(FAU_A, myAccount.address);
  console.log(myVault);
}

main().then((e) => {
  console.log(e);
  process.exit(1);
});
