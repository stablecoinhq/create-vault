import { toHex, submitAndWait } from "./utils";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types"

require("dotenv").config();
const VAT_ADDRESS = "0x1b1FE236166eD0Ac829fa230afE38E61bC281C5e";
const FAU_JOIN_ADDRESS = "0x0ab0c0B4E13e7B05566a1dA30F63706daf0848BE";
const FAU_ADDRESS = "0xBA62BCfcAaFc6622853cca2BE6Ac7d845BC0f2Dc";
const SPOT_ADDRESS = "0x54301c9E0c8728e9B2C2d2EF4052fa841F182617"

const FAU_A = toHex("FAU-A");

const confirmationHeight = process.env.CONFIRMATION_HEIGHT ? parseInt(process.env.CONFIRMATION_HEIGHT!) : 0;


// 生成したFau tokenをコラテラルとしてDAIをMintしてVaultを生成する
export const createVault = async function (hre: HardhatRuntimeEnvironment, args: TaskArguments) {
  const ethers = hre.ethers

  async function submitTx(tx: Promise<ContractTransaction>): Promise<ContractReceipt> {
    return submitAndWait(tx, confirmationHeight);
  }

  // 生成するFAUの数量 ... 100 FAU
  const toMint = BigNumber.from(args.amount ?? 100).mul(BigNumber.from("10").pow(18));


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
  if (1) {
    await submitTx(fauToken.approve(fauJoin.address, toMint));
  }
  console.log(`register value to dai system (join)`)
  if (1) {
    await submitTx(fauJoin.join(myAccount.address, toMint));
  }

  const ilkInfoFromSpot = await spotContract.ilks(FAU_A)
  const { mat } = ilkInfoFromSpot;

  const ilkInfoFromVat = await vat.ilks(FAU_A);
  const totalLine = await vat.Line();
  const totalDebt = await vat.debt();
  const { rate, spot, line, Art } = ilkInfoFromVat;

  // (collateral amount) * (exchange rate = spot * mat) / (scaling factor (rate)) / (minimum collateral ratio = mat)
  // dart = (new dai amount)
  const dart =
    (toMint) // token can be minimum value to calculate price
      .mul(spot) // exchange rate with safety margin
      .div(rate) // scaling factor
      .sub(1); // buffer

  console.log(`    parameters: ${JSON.stringify({
    mat: mat.toString(),
    rate: rate.toString(),
    spot: spot.toString(),
    line: line.toString(),
    Art: Art.toString(),
    ArtTimesRateLessThanLine: (Art.add(dart)).mul(rate).lt(line),
    totalLine: totalLine.toString(),
    totalDebt: totalDebt.toString(),
    totalDebtLessThanTotalLine: totalDebt.add(rate.mul(dart)).lt(totalLine),
    toMint: toMint.toString(),
    ilkInfoFromSpot,
    ilkInfoFromVat,
  })}`)

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
      dart,
      // { nonce: 6, gasPrice: 34906672017 }
    )
  );
  const myVault = await vat.urns(FAU_A, myAccount.address);
  const { ink, art } = myVault
  console.log(`result: ${JSON.stringify({ myVault, ink, art })}`);
}
