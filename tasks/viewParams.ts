import { HardhatEthersHelpers, HardhatRuntimeEnvironment } from "hardhat/types";
import { ChainLog as ChainLogContract } from "../typechain-types";
import { toHex, displayUnits, Unit } from "./utils";
import { BigNumber } from "ethers";

const CHAINLOG_MAINNET = "0xda0ab1e0017debcd72be8599041a2aa3ba7e740f";
type Contracts =
  | "MCD_ADM"
  | "MCD_VAT"
  | "MCD_DOG"
  | "MCD_FLOP"
  | "MCD_FLAP"
  | "MCD_JUG"
  | "MCD_VOW"
  | "MCD_PAUSE"
  | "MCD_POT"
  | "ILK_REGISTRY";

type ClipContracts = "MCD_CLIP_ETH_A" | "MCD_CLIP_ETH_B" | "MCD_CLIP_ETH_C";
type CurrencySymobl = "ETH";

// ilk毎に設定されているパラメーターはとりあえず無視
// ilk関係は大体dai statsにある
class ChainLog {
  constructor(private readonly chainLog: ChainLogContract) {}

  async getAddressOf(contract: Contracts | ClipContracts) {
    return this.chainLog.getAddress(toHex(contract));
  }

  static async get(ethers: HardhatEthersHelpers) {
    const chainlog = await ethers.getContractAt("ChainLog", CHAINLOG_MAINNET);
    return new ChainLog(chainlog);
  }
}
export async function viewParams(hre: HardhatRuntimeEnvironment) {
  const { ethers } = hre;
  const chainlog = await ChainLog.get(ethers);

  // dog.Hole [rad]
  const dogAddress = await chainlog.getAddressOf("MCD_DOG");
  const dogContract = await ethers.getContractAt("Dog", dogAddress);
  const dog = {
    Hole: displayUnits(await dogContract.Hole(), Unit.Rad),
  };
  // vow wait [seconds] dump [wad] sump [rad] bump [rad] hump [rad]
  const vowAddress = await chainlog.getAddressOf("MCD_VOW");
  const vowContract = await ethers.getContractAt("Vow", vowAddress);
  const vow = {
    wait: (await vowContract.wait()).toNumber(),
    dump: displayUnits(await vowContract.dump(), Unit.Wad),
    sump: displayUnits(await vowContract.sump(), Unit.Rad),
    bump: displayUnits(await vowContract.bump(), Unit.Rad),
    hump: displayUnits(await vowContract.hump(), Unit.Rad),
  };

  // chief MAX_YAYS [uint]
  const chiefAddress = await chainlog.getAddressOf("MCD_ADM");
  const chiefContract = await ethers.getContractAt("DSChief", chiefAddress);
  const chief = {
    MAX_YAYS: (await chiefContract.MAX_YAYS()).toNumber(),
  };

  // pause delay [seconds]
  const pauseAddress = await chainlog.getAddressOf("MCD_PAUSE");
  const pauseContract = await ethers.getContractAt("DSPause", pauseAddress);
  const pause = {
    delay: (await pauseContract.delay()).toNumber(),
  };

  // flop beg [wad] pad [wad] ttl [seconds] tau [seconds]
  const flopAddress = await chainlog.getAddressOf("MCD_FLOP");
  const flopContract = await ethers.getContractAt("Flopper", flopAddress);
  const flop = {
    beg: displayUnits(await flopContract.beg(), Unit.Wad),
    pad: displayUnits(await flopContract.pad(), Unit.Wad),
    ttl: await flopContract.ttl(),
    tau: await flopContract.tau(),
  };

  // flap beg [wad] ttl [seconds] tau [seconds]
  const flapAddress = await chainlog.getAddressOf("MCD_FLAP");
  const flapContract = await ethers.getContractAt("Flapper", flapAddress);
  const flap = {
    beg: displayUnits(await flapContract.beg(), Unit.Wad),
    ttl: await flapContract.ttl(),
    tau: await flapContract.tau(),
  };

  // vat Line [rad]
  const vatAddress = await chainlog.getAddressOf("MCD_VAT");
  const vatContract = await ethers.getContractAt("Vat", vatAddress);
  const vat = {
    Line: displayUnits(await vatContract.Line(), Unit.Rad),
  };

  // jug base [ray]
  const jugAddress = await chainlog.getAddressOf("MCD_JUG");
  const jugContract = await ethers.getContractAt("Jug", jugAddress);
  const jug = {
    base: displayUnits(await jugContract.base(), Unit.Ray),
  };

  // pot dsr [ray]
  const potAddress = await chainlog.getAddressOf("MCD_POT");
  console.log(`potAddress ${potAddress}`);
  const potContract = await ethers.getContractAt("Pot", potAddress);
  const pot = {
    dsr: displayUnits(await potContract.dsr(), Unit.Ray),
  };

  // clip buf [ray], tail [seconds], cusp [ray], chip [wad], tip [rad]
  const clipContracts: { contract: ClipContracts; symbol: CurrencySymobl }[] = [
    { contract: "MCD_CLIP_ETH_A", symbol: "ETH" },
    { contract: "MCD_CLIP_ETH_B", symbol: "ETH" },
    { contract: "MCD_CLIP_ETH_C", symbol: "ETH" },
  ];
  const results = await Promise.all(
    clipContracts.map(async (c) => {
      const { contract } = c;
      const clipAddress = await chainlog.getAddressOf(contract);
      const clip = await ethers.getContractAt("Clipper", clipAddress);
      const buf = await clip.buf();
      const tail = await clip.tail();
      const cusp = await clip.cusp();
      const chip = await clip.chip();
      const tip = await clip.tip();
      return {
        clip: contract,
        buf: displayUnits(buf, Unit.Ray),
        tail: tail.toNumber(),
        cusp: displayUnits(cusp, Unit.Ray),
        chip: displayUnits(chip, Unit.Wad),
        tip: displayUnits(tip, Unit.Rad),
      };
    })
  );

  // とりあえずETH関連のClipだけ

  console.log({
    dog,
    vow,
    chief,
    pause,
    flop,
    flap,
    vat,
    jug,
    pot,
    clip: [...results],
  });
}
