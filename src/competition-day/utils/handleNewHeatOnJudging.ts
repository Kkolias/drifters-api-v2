// point of this file is to handle creating new heat or adding winner to exsisting heat
// if heat's bracket number is odd then it will create new heat with winner as driver1
// if heat's bracket number is even then it will add winner to existing heat as driver2
// new heatType is gotten from heatTypeToNextHeatType function top32 -> top16 -> top8 -> top4
// bronze and final are handled in different function

// next bracketNumber is gotten from bracketNumberToNextBracketNumber function

import CompetitionDay, {
  HeatType,
  ICompetitionDayItem,
  IHeat,
  JudgePoint,
  RunType,
} from "../../Schema/drift/CompetitionDay";
import competitionDayUtil from "./createCompetitionDayFromQualifyingResults";
import competitionDayComputedUtil from "../computed/competition-day.computed";
import { IDriver } from "../../Schema/drift/Driver";
// import driverService from "../../driver/driver.service";

export async function handleNewHeatOnJudging(
  competitionDayId: string,
  judgedHeatId: string,
  runId: string,
): Promise<any> {
  // find heat from competitionDay by id where heatList.heatId === judgedHeatId
  const competitionDay = await CompetitionDay.findById(competitionDayId)
    .lean()
    .populate("heatList.runList")
    .populate("heatList.driver1")
    .populate("heatList.driver2");
  if (!competitionDay) return;

  const judgetHeat = competitionDay?.heatList?.find(
    (heat) => heat?._id?.toString() === judgedHeatId,
  );
  if (!judgetHeat) return;

  const omt = wasJudgetOneMoreTime(judgetHeat, runId);
  if (omt)
    return await handleAddOneMoreTimeRunToHeat(competitionDayId, judgetHeat);

  const bracketNumber = judgetHeat.bracketNumber;
  if (bracketNumber >= 31) return competitionDay;
  if (bracketNumber === 29 || bracketNumber === 30)
    return await handleJudgetTop4Heat(competitionDayId, judgetHeat);

  // check if heat's bracket number is odd or even
  const isBracketNumberOdd = bracketNumber % 2 === 1;
  if (isBracketNumberOdd) {
    // create new heat with winner as driver1
    return await handleCreateNewHeat(competitionDayId, judgetHeat);
  } else {
    // add winner to existing heat as driver2
    return await handleAddWinnerToExistingHeat(competitionDayId, judgetHeat);
  }
}

function wasJudgetOneMoreTime(judgetHeat: IHeat, runId: string): boolean {
  const run = judgetHeat.runList.find((run) => run?._id?.toString() === runId);
  if (!run) return false;

  // if alteast 2 judgePoints are 'omt'
  // or if all are different
  const omtCount = [run.judgePoint1, run.judgePoint2, run.judgePoint3]?.filter(
    (i) => i === JudgePoint.omt,
  )?.length;

  const allDifferent =
    run.judgePoint1 !== run.judgePoint2 &&
    run.judgePoint2 !== run.judgePoint3 &&
    run.judgePoint1 !== run.judgePoint3;
  return omtCount >= 2 || allDifferent;
}

async function findById(
  competitionDayId: string,
): Promise<ICompetitionDayItem | null> {
  return await CompetitionDay.findById(competitionDayId)
    .lean()
    .populate("heatList.runList")
    .populate("heatList.driver1")
    .populate("heatList.driver2");
}

async function handleCreateNewHeat(
  competitionDayId: string,
  judgetHeat: IHeat,
): Promise<ICompetitionDayItem | null> {
  const newHeat = await generateHeat(competitionDayId, judgetHeat);
  if (!newHeat) return await findById(competitionDayId);

  // save new heat to competitionDay
  return await CompetitionDay.findOneAndUpdate(
    { _id: competitionDayId },
    { $push: { heatList: newHeat } },
    { new: true },
  );
}

function heatTypeToNextHeatType(heatType: HeatType): HeatType {
  switch (heatType) {
    case HeatType.top32:
      return HeatType.top16;
    case HeatType.top16:
      return HeatType.top8;
    case HeatType.top8:
      return HeatType.top4;
    default:
      return HeatType.final;
  }
}

// bracketNumberToNextBracketNumber function works:
// 1 -> 17 | 3 -> 18 | 5 -> 19 | 7 -> 20 | 9 -> 21 | 11 -> 22 | 13 -> 23 | 15 -> 24
function bracketNumberToNextBracketNumber(bracketNumber: number): number {
  switch (bracketNumber) {
    case 1:
      return 17;
    case 3:
      return 18;
    case 5:
      return 19;
    case 7:
      return 20;
    case 9:
      return 21;
    case 11:
      return 22;
    case 13:
      return 23;
    case 15:
      return 24;
    case 17:
      return 25;
    case 19:
      return 26;
    case 21:
      return 27;
    case 23:
      return 28;
    case 25:
      return 29;
    case 27:
      return 30;
    default:
      return 0;
  }
}

async function generateHeat(
  competitionDayId: string,
  judgetHeat: IHeat,
): Promise<IHeat | null> {
  const newHeatType = heatTypeToNextHeatType(judgetHeat.heatType);
  const newBracketNumber = bracketNumberToNextBracketNumber(
    judgetHeat.bracketNumber,
  );

  const isBracketAlreadyCreated = await isHeatForBracketNumberCreated(
    competitionDayId,
    newBracketNumber,
  );
  if (isBracketAlreadyCreated) {
    return null;
  }

  const driver1 = competitionDayComputedUtil.computeHeatWinnerId(judgetHeat);
  const driver2 = null;

  return {
    driver1, // this is lead driver
    driver2, // this is chase driver
    heatType: newHeatType,
    bracketNumber: newBracketNumber,
    runList: [competitionDayUtil.generateFirstRun(driver1, driver2)],
  } as IHeat;
}

function getNextBracketNumberForChaseDriver(judgetHeat: IHeat): number {
  // 2 -> 17 | 4 -> 18 | 6 -> 19 | 8 -> 20 | 10 -> 21 | 12 -> 22 | 14 -> 23 | 16 -> 24
  const bracketNumber = judgetHeat.bracketNumber;
  switch (bracketNumber) {
    case 2:
      return 17;
    case 4:
      return 18;
    case 6:
      return 19;
    case 8:
      return 20;
    case 10:
      return 21;
    case 12:
      return 22;
    case 14:
      return 23;
    case 16:
      return 24;
    case 18:
      return 25;
    case 20:
      return 26;
    case 22:
      return 27;
    case 24:
      return 28;
    case 26:
      return 29;
    case 28:
      return 30;
    default:
      return 0;
  }
}

async function handleAddWinnerToExistingHeat(
  competitionDayId: string,
  judgetHeat: IHeat,
): Promise<ICompetitionDayItem | null> {
  const driver2 = competitionDayComputedUtil.computeHeatWinnerId(judgetHeat);
  //   const drvier2 = await driverService.findById(winnerId)

  const nextBracketNumber = getNextBracketNumberForChaseDriver(judgetHeat);

  // update heats driver2 with winner
  // update also heats runLists first items run1.chaseDriverId with winner
  // update also heats runLists second items run2.leadDriverId with winner
  const updatedHeat = await CompetitionDay.findOneAndUpdate(
    { _id: competitionDayId, "heatList.bracketNumber": nextBracketNumber },
    {
      $set: {
        "heatList.$.driver2": driver2,
        "heatList.$.runList.0.run1.chaseDriverId": driver2?._id,
        "heatList.$.runList.0.run2.leadDriverId": driver2?._id,
      },
    },
    { new: true },
  );

  //   const updatedHeat = await CompetitionDay.findOneAndUpdate(
  //     { _id: competitionDayId, "heatList.bracketNumber": nextBracketNumber },
  //     { $set: { "heatList.$.driver2": driver2 } },
  //     { new: true }
  //   );

  return updatedHeat;
}

async function handleJudgetTop4Heat(
  competitionDayId: string,
  judgetHeat: IHeat,
) {
  const heatNumber = judgetHeat.bracketNumber;
  if (heatNumber === 29) {
    return await handleCreateFinalAndBronze(competitionDayId, judgetHeat);
  } else if (heatNumber === 30) {
    return await handleAddDriversToFinalAndBronze(competitionDayId, judgetHeat);
  }
}

async function handleCreateFinalAndBronze(
  competitionDayId: string,
  judgetHeat: IHeat,
): Promise<ICompetitionDayItem | null> {
  const winner = competitionDayComputedUtil.computeHeatWinnerId(
    judgetHeat,
  ) as IDriver;
  const loser = (
    judgetHeat.driver1?._id === winner?._id
      ? judgetHeat.driver2
      : judgetHeat.driver1
  ) as IDriver;

  const finalHeat = await generateHeatFinalOrBronze(
    competitionDayId,
    winner,
    HeatType.final,
  );
  const bronzeHeat = await generateHeatFinalOrBronze(
    competitionDayId,
    loser,
    HeatType.bronze,
  );

  const heatList = [finalHeat, bronzeHeat]?.filter((i) => i);

  // save new heats to competitionDay
  return await CompetitionDay.findOneAndUpdate(
    { _id: competitionDayId },
    { $push: { heatList } },
    { new: true },
  );
}

async function generateHeatFinalOrBronze(
  competitionDayId: string,
  driver1: IDriver,
  heatType: HeatType.final | HeatType.bronze,
): Promise<IHeat | null> {
  const newBracketNumber = heatType === HeatType.final ? 32 : 31;

  const isBracketAlreadyCreated = await isHeatForBracketNumberCreated(
    competitionDayId,
    newBracketNumber,
  );
  if (isBracketAlreadyCreated) return null;

  return {
    driver1, // this is lead driver
    driver2: null, // this is chase driver
    heatType,
    bracketNumber: newBracketNumber,
    runList: [competitionDayUtil.generateFirstRun(driver1, null)],
  } as IHeat;
}

async function handleAddDriversToFinalAndBronze(
  competitionDayId: string,
  judgetHeat: IHeat,
): Promise<ICompetitionDayItem | null> {
  const winner = competitionDayComputedUtil.computeHeatWinnerId(
    judgetHeat,
  ) as IDriver;
  const loser = (
    judgetHeat.driver1?._id === winner?._id
      ? judgetHeat.driver2
      : judgetHeat.driver1
  ) as IDriver;

  await Promise.all([
    CompetitionDay.findOneAndUpdate(
      { _id: competitionDayId, "heatList.bracketNumber": 32 },
      {
        $set: {
          "heatList.$.driver2": winner,
          "heatList.$.runList.0.run1.chaseDriverId": winner?._id,
          "heatList.$.runList.0.run2.leadDriverId": winner?._id,
        },
      },
      { new: true },
    ),
    CompetitionDay.findOneAndUpdate(
      { _id: competitionDayId, "heatList.bracketNumber": 31 },
      {
        $set: {
          "heatList.$.driver2": loser,
          "heatList.$.runList.0.run1.chaseDriverId": loser?._id,
          "heatList.$.runList.0.run2.leadDriverId": loser?._id,
        },
      },
      { new: true },
    ),
  ]);

  return await CompetitionDay.findById(competitionDayId)
    .lean()
    .populate("heatList.runList")
    .populate("heatList.driver1")
    .populate("heatList.driver2");
}

async function isHeatForBracketNumberCreated(
  competitionDayId: string,
  bracketNumber: number,
): Promise<boolean> {
  // find heat from competitionDay by id where heatList has item with bracketNumber
  const found = await CompetitionDay.findOne({
    _id: competitionDayId,
    "heatList.bracketNumber": bracketNumber,
  });
  return !!found;
}

// section for creating new run to heat.runList for one more time
async function handleAddOneMoreTimeRunToHeat(
  competitionDayId: string,
  judgetHeat: IHeat,
): Promise<ICompetitionDayItem | null> {
  const runNumber = judgetHeat.runList.length + 1;
  const newRun = competitionDayUtil.generateFirstRun(
    judgetHeat.driver1,
    judgetHeat.driver2,
    RunType.omt,
    runNumber,
  );
  const updatedHeat = await CompetitionDay.findOneAndUpdate(
    { _id: competitionDayId, "heatList._id": judgetHeat._id },
    { $push: { "heatList.$.runList": newRun } },
    { new: true },
  );

  return updatedHeat;
}
