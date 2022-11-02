import { ContractTransaction, ContractReceipt } from "ethers";

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
  console.log(`    tx result: ${JSON.stringify(result)}`)
  const receipt = await result.wait(wait);
  return receipt;
}
