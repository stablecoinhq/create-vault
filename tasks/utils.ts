import { ContractTransaction, ContractReceipt, BigNumber } from "ethers";
import { HardhatEthersHelpers } from "hardhat/types";
import { ChainLog as ChainLogContract } from "../typechain-types";

function ascii_to_hexa(str: string) {
  var arr = [];
  for (var n = 0, l = str.length; n < l; n++) {
    var hex = Number(str.charCodeAt(n)).toString(16);
    arr.push(hex);
  }
  return arr.join("");
}

export function toHex(str: string) {
  const ARRAY_LENGTH = 64;
  const hex = ascii_to_hexa(str);
  const rest = "0".repeat(ARRAY_LENGTH - hex.length);
  return `0x${hex}${rest}`;
}

export async function submitAndWait(
  tx: Promise<ContractTransaction>,
  wait?: number
): Promise<ContractReceipt> {
  const result = await tx;
  console.log(`    tx result: ${JSON.stringify(result)}`);
  const receipt = await result.wait(wait);
  return receipt;
}

export enum Unit {
  Wad = 18,
  Ray = 27,
  Rad = 45,
}

export const constants = {
  WAD: BigNumber.from(10).pow(Unit.Wad),
  RAY: BigNumber.from(10).pow(Unit.Ray),
  RAD: BigNumber.from(10).pow(Unit.Rad),
};

export function displayUnits(num: BigNumber, unit: Unit): number {
  function toStandard(targetNum: BigNumber, divBy: BigNumber): number {
    return targetNum.mul(100000).div(divBy).toNumber() / 100000;
  }
  return toStandard(num, BigNumber.from(10).pow(unit));
}

export class ChainLog {
  constructor(private readonly chainLog: ChainLogContract) { }

  async getAddressOf(contract: string): Promise<string>;
  async getAddressOf(contract: Contracts): Promise<string>;
  async getAddressOf(contract: Contracts | string) {
    return this.chainLog.getAddress(toHex(contract));
  }

  static async fromEthers(chainId: number, ethers: HardhatEthersHelpers) {
    let chainLogAddress = ""
    const CHAINLOG_MAINNET = "0xda0ab1e0017debcd72be8599041a2aa3ba7e740f";
    const CHAINLOG_GOERLI = "0xA25435EFc77767e17CB41dA5c33685d6bDEc1f61";
    if (chainId === 1) {
      chainLogAddress = CHAINLOG_MAINNET
    } else if (chainId === 5) {
      chainLogAddress = CHAINLOG_GOERLI
    } else {
      chainLogAddress = CHAINLOG_MAINNET
    }
    const chainlog = await ethers.getContractAt("ChainLog", chainLogAddress);
    return new ChainLog(chainlog);
  }
}

export enum Contracts {
  MCD_ADM = "MCD_ADM",
  MCD_VAT = "MCD_VAT",
  MCD_DOG = "MCD_DOG",
  MCD_FLOP = "MCD_FLOP",
  MCD_FLAP = "MCD_FLAP",
  MCD_JUG = "MCD_JUG",
  MCD_VOW = "MCD_VOW",
  MCD_PAUSE = "MCD_PAUSE",
  MCD_POT = "MCD_POT",
  ILK_REGISTRY = "ILK_REGISTRY",
  CLIPPER_MOM = "CLIPPER_MOM",
  MCD_GOV = "MCD_GOV"
}
