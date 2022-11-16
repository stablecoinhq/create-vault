import { ContractTransaction, ContractReceipt, BigNumber } from "ethers";

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
