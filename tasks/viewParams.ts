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

class ChainLog {
  constructor(private readonly chainLog: ChainLogContract) {}

  async getAddressOf(contract: string): Promise<string>;
  async getAddressOf(contract: Contracts): Promise<string>;
  async getAddressOf(contract: Contracts | string) {
    return this.chainLog.getAddress(toHex(contract));
  }

  static async fromEthers(ethers: HardhatEthersHelpers) {
    const chainlog = await ethers.getContractAt("ChainLog", CHAINLOG_MAINNET);
    return new ChainLog(chainlog);
  }
}

export async function viewParams(hre: HardhatRuntimeEnvironment) {
  const { ethers } = hre;
  const chainlog = await ChainLog.fromEthers(ethers);
  const { chainId } = hre.network.config;

  if (!chainId || chainId !== 1) {
    throw new Error("This command only works on mainnet");
  }
  // 対象の担保
  const ilks: string[] = ["ETH-A"];

  // dog.Hole [rad]
  const dogAddress = await chainlog.getAddressOf("MCD_DOG");
  const dogContract = await ethers.getContractAt("Dog", dogAddress);
  const dogIlks = await Promise.all(
    ilks.map(async (i) => {
      const ilk = await dogContract.ilks(toHex(i));
      const { chop, hole } = ilk;
      return {
        ilk: i,
        chop,
        hole,
      };
    })
  );
  const dog = {
    Hole: await dogContract.Hole(),
    ilks: [...dogIlks],
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

  // vat line [rad] dust [rad]
  const ilkData = await Promise.all(
    ilks.map(async (ilkKey) => {
      const ilk = await vatContract.ilks(toHex(ilkKey));
      const { line, dust } = ilk;
      return {
        ilk: ilkKey,
        line,
        dust,
      };
    })
  );

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
  const potContract = await ethers.getContractAt("Pot", potAddress);
  const pot = {
    dsr: await potContract.dsr(),
  };

  // clip buf [ray], tail [seconds], cusp [ray], chip [wad], tip [rad]
  const clips = await Promise.all(
    ilks.map(async (i) => {
      const contract = `MCD_CLIP_${i.split("-").join("_")}`;
      const clipAddress = await chainlog.getAddressOf(contract);
      const clip = await ethers.getContractAt("Clipper", clipAddress);
      const buf = await clip.buf();
      const tail = await clip.tail();
      const cusp = await clip.cusp();
      const chip = await clip.chip();
      const tip = await clip.tip();
      return {
        contract,
        buf,
        tail: tail.toNumber(),
        cusp,
        chip,
        tip,
      };
    })
  );

  const spotAddress = await chainlog.getAddressOf("MCD_SPOT");
  const spotContract = await ethers.getContractAt("Spotter", spotAddress);
  const spotIlk = await Promise.all(
    ilks.map(async (i) => {
      const ilk = await spotContract.ilks(toHex(i));
      const { mat } = ilk;
      return {
        ilk: i,
        mat,
      };
    })
  );

  console.log(
    JSON.stringify(
      {
        dog: {
          Hole: dog.Hole.toString(),
          ilks: [...dog.ilks].map(({ ilk, chop, hole }) => ({
            ilk,
            chop: chop.toString(),
            hole: hole.toString(),
          })),
        },
        vow: {
          wait: vow.wait,
          dump: vow.dump.toString(),
          sump: vow.sump.toString(),
          bump: vow.bump.toString(),
          hump: vow.hump.toString(),
        },
        chief,
        pause,
        flop: {
          beg: flop.beg.toString(),
          pad: flop.pad.toString(),
          ttl: flop.ttl,
          tau: flop.tau,
        },
        flap: {
          beg: flap.beg.toString(),
          ttl: flap.ttl,
          tau: flap.tau,
        },
        vat: {
          ilks: [...ilkData].map(({ ilk, line, dust }) => ({
            ilk,
            line: line.toString(),
            dust: dust.toString(),
          })),
        },
        jug: {
          base: jug.base,
        },
        pot: {
          dsr: pot.dsr.toString(),
        },
        clip: [...clips].map(({ contract, buf, tail, cusp, chip }) => ({
          contract,
          buf: buf.toString(),
          tail: tail.toString(),
          cusp: cusp.toString(),
          chip: chip.toString(),
        })),
        spot: [...spotIlk].map(({ ilk, mat }) => ({
          ilk,
          mat: mat.toString(),
        })),
      },
      null,
      2
    )
  );
  console.log("Normalized values");
  console.log(
    JSON.stringify(
      {
        dog: {
          Hole: normalize(dog.Hole, Unit.Rad),
          ilks: [...dog.ilks].map(({ ilk, chop, hole }) => ({
            ilk,
            chop: normalize(chop, Unit.Wad),
            hole: normalize(hole, Unit.Rad),
          })),
        },
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
          ilks: [...ilkData].map(({ ilk, line, dust }) => ({
            ilk,
            line: normalize(line, Unit.Rad),
            dust: normalize(dust, Unit.Rad),
          })),
        },
        jug: {
          base: normalize(jug.base, Unit.Ray),
        },
        pot: {
          dsr: normalize(pot.dsr, Unit.Ray),
        },
        clips: [...clips].map(({ contract, buf, tail, cusp, chip, tip }) => ({
          contract,
          buf: normalize(buf, Unit.Ray),
          tail: tail,
          cusp: normalize(cusp, Unit.Ray),
          chip: normalize(chip, Unit.Wad),
          tip: normalize(tip, Unit.Rad),
        })),
        spot: [...spotIlk].map(({ilk, mat}) => ({
          ilk,
          mat: normalize(mat, Unit.Ray)
        }))
      },
      null,
      2
    )
  );
}
