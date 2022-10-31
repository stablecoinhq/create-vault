import { ethers } from "hardhat";
import { toHex, submitAndWait } from "./utils";
import { BigNumber, ContractTransaction } from "ethers";
require("dotenv").config();
const VAT_ADDRESS = "0x1b1FE236166eD0Ac829fa230afE38E61bC281C5e";
const FAU_JOIN_ADDRESS = "0x0ab0c0B4E13e7B05566a1dA30F63706daf0848BE";
const FAU_ADDRESS = "0xBA62BCfcAaFc6622853cca2BE6Ac7d845BC0f2Dc";
const SPOT_ADDRESS = "0x54301c9E0c8728e9B2C2d2EF4052fa841F182617"

const FAU_A = toHex("FAU-A");

const confirmationHeight = process.env.CONFIRMATION_HEIGHT ? parseInt(process.env.CONFIRMATION_HEIGHT!) : 0;

async function submitTx(tx: Promise<ContractTransaction>) {
  return submitAndWait(tx, confirmationHeight);
}

// 生成するFAUの数量 ... 100 FAU
const toMint = BigNumber.from("10").pow(20);

// 生成したFau tokenをコラテラルとしてDAIをMintしてVaultを生成する
async function main() {
  const [myAccount] = await ethers.getSigners();
  const vat = await ethers.getContractAt("Vat", VAT_ADDRESS);
  const spotContract = await ethers.getContractAt("Spotter", SPOT_ADDRESS);
  const fauJoin = await ethers.getContractAt("GemJoin", FAU_JOIN_ADDRESS);
  const fauToken = await ethers.getContractAt("ERC20Mintable", FAU_ADDRESS);

  const myTokenBalance = await fauToken.balanceOf(myAccount.address);

  console.log(`My fau token balance ${myTokenBalance}`)

  if (myTokenBalance.lt(toMint)) {
    console.log("Minting new tokens");
    await submitTx(fauToken.mint(myAccount.address, toMint));
  }

  console.log(`Put token into vault: address: ${fauJoin.address}, toMint: ${toMint.toString()}`);
  console.log(`approve token for fauJoin.address (approve)`)
  await submitTx(fauToken.approve(fauJoin.address, toMint));
  console.log(`register value to dai system (join)`)
  await submitTx(fauJoin.join(myAccount.address, toMint));

  const ilkInfoFromSpot = await spotContract.ilks(FAU_A)
  const { mat } = ilkInfoFromSpot;

  const ilkInfoFromVat = await vat.ilks(FAU_A);
  const { rate, spot } = ilkInfoFromVat;
  console.log(`    parameters: ${JSON.stringify({
    mat: mat.toString(),
    rate: rate.toString(),
    spot: spot.toString(),
    toMint: toMint.toString(),
    ilkInfoFromSpot,
    ilkInfoFromVat,
  })}`)
  const value1e27 = BigNumber.from("10").pow(27);
  // (collateral amount) * (exchange rate) / (scaling factor (rate)) / (minimum collateral ratio)
  // dart = (new dai amount)
  const dart =
    (toMint) // token can be minimum value to calculate price
      .mul(spot) // exchange rate
      .mul(value1e27) // spot, rate and mat all have 1e27 decimals, so cancel them out and multiply here
      .div(rate) // scaling factor
      .div(mat) // minimum collateral ratio
      .sub(1000000); // buffer
  console.log("Minting dai");
  console.log(`    parameters: ${JSON.stringify({
    FAU_A,
    address: myAccount.address,
    dart: dart.toString()
  })}`)
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
  const { ink, art } = myVault
  console.log(`result: ${JSON.stringify({ myVault, ink, art })}`);
}

main().then((e) => {
  console.log(e);
  process.exit(1);
});
