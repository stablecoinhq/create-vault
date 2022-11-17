import { HardhatEthersHelpers, HardhatRuntimeEnvironment } from "hardhat/types";
import { ChainLog as ChainLogContract } from "../typechain-types";
import { toHex, displayUnits as normalize, Unit } from "./utils";

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
  const { chainId } = hre.network.config;

  if (!chainId || chainId !== 1) {
    throw new Error("This command only works on mainnet");
  }
  // dog.Hole [rad]
  const dogAddress = await chainlog.getAddressOf("MCD_DOG");
  const dogContract = await ethers.getContractAt("Dog", dogAddress);
  const dog = {
    Hole: await dogContract.Hole(),
  };
  // vow wait [seconds] dump [wad] sump [rad] bump [rad] hump [rad]
  const vowAddress = await chainlog.getAddressOf("MCD_VOW");
  const vowContract = await ethers.getContractAt("Vow", vowAddress);
  const vow = {
    wait: (await vowContract.wait()).toNumber(),
    dump: await vowContract.dump(),
    sump: await vowContract.sump(),
    bump: await vowContract.bump(),
    hump: await vowContract.hump(),
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
    beg: await flopContract.beg(),
    pad: await flopContract.pad(),
    ttl: await flopContract.ttl(),
    tau: await flopContract.tau(),
  };

  // flap beg [wad] ttl [seconds] tau [seconds]
  const flapAddress = await chainlog.getAddressOf("MCD_FLAP");
  const flapContract = await ethers.getContractAt("Flapper", flapAddress);
  const flap = {
    beg: await flapContract.beg(),
    ttl: await flapContract.ttl(),
    tau: await flapContract.tau(),
  };

  // vat Line [rad]
  const vatAddress = await chainlog.getAddressOf("MCD_VAT");
  const vatContract = await ethers.getContractAt("Vat", vatAddress);
  const vat = {
    Line: await vatContract.Line(),
  };

  // jug base [ray]
  const jugAddress = await chainlog.getAddressOf("MCD_JUG");
  const jugContract = await ethers.getContractAt("Jug", jugAddress);
  const jug = {
    base: await jugContract.base(),
  };

  // pot dsr [ray]
  const potAddress = await chainlog.getAddressOf("MCD_POT");
  console.log(`potAddress ${potAddress}`);
  const potContract = await ethers.getContractAt("Pot", potAddress);
  const pot = {
    dsr: await potContract.dsr(),
  };

  // clip buf [ray], tail [seconds], cusp [ray], chip [wad], tip [rad]
  const clipContracts: { contract: ClipContracts; symbol: CurrencySymobl }[] = [
    { contract: "MCD_CLIP_ETH_A", symbol: "ETH" },
    { contract: "MCD_CLIP_ETH_B", symbol: "ETH" },
    { contract: "MCD_CLIP_ETH_C", symbol: "ETH" },
  ];
  const clips = await Promise.all(
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
        buf,
        tail: tail.toNumber(),
        cusp,
        chip,
        tip,
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
    clip: [...clips],
  });
  console.log({
    dog: { Hole: normalize(dog.Hole, Unit.Rad) },
    vow: {
      wait: vow.wait,
      dump: normalize(vow.dump, Unit.Wad),
      sump: normalize(vow.sump, Unit.Rad),
      bump: normalize(vow.bump, Unit.Rad),
      hump: normalize(vow.hump, Unit.Rad),
    },
    chief: {
      MAX_YAYS: chief.MAX_YAYS,
    },
    pause: {
      delay: pause.delay,
    },
    flop: {
      beg: normalize(flop.beg, Unit.Wad),
      pad: normalize(flop.pad, Unit.Wad),
      ttl: flop.ttl,
      tau: flop.tau,
    },
    flap: {
      beg: normalize(flap.beg, Unit.Wad),
      ttl: flap.ttl,
      tau: flap.tau,
    },
    vat: {
      Line: normalize(vat.Line, Unit.Rad),
    },
    jug: {
      base: normalize(jug.base, Unit.Ray),
    },
    pot: {
      dsr: normalize(pot.dsr, Unit.Ray),
    },
    clips: [...clips].map((clip) => ({
      clip: clip.clip,
      buf: normalize(clip.buf, Unit.Ray),
      tail: clip.tail,
      cusp: normalize(clip.cusp, Unit.Ray),
      chip: normalize(clip.chip, Unit.Wad),
      tip: normalize(clip.tip, Unit.Rad),
    })),
  });
}
