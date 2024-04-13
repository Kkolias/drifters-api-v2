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
} from "../../Schema/drift/CompetitionDay";
import competitionDayUtil from "./createCompetitionDayFromQualifyingResults";
import competitionDayComputedUtil from "../computed/competition-day.computed";
import { IDriver } from "../../Schema/drift/Driver";
// import driverService from "../../driver/driver.service";

export async function handleNewHeatOnJudging(
  competitionDayId: string,
  judgedHeatId: string
): Promise<any> {
  // find heat from competitionDay by id where heatList.heatId === judgedHeatId
  const competitionDay = await CompetitionDay.findById(competitionDayId)
    .lean()
    .populate("heatList.runList")
    .populate("heatList.driver1")
    .populate("heatList.driver2");
  if (!competitionDay) return;

  const judgetHeat = competitionDay?.heatList?.find(
    (heat) => heat?._id?.toString() === judgedHeatId
  );
  if (!judgetHeat) return;

  const bracketNumber = judgetHeat.bracketNumber;
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

async function handleCreateNewHeat(
  competitionDayId: string,
  judgetHeat: IHeat
): Promise<ICompetitionDayItem | null> {
  const newHeat = generateHeat(judgetHeat);

  // save new heat to competitionDay
  return await CompetitionDay.findOneAndUpdate(
    { _id: competitionDayId },
    { $push: { heatList: newHeat } },
    { new: true }
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
    default:
      return 0;
  }
}

function generateHeat(judgetHeat: IHeat): IHeat {
  const newHeatType = heatTypeToNextHeatType(judgetHeat.heatType);
  const newBracketNumber = bracketNumberToNextBracketNumber(
    judgetHeat.bracketNumber
  );

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
    default:
      return 0;
  }
}

async function handleAddWinnerToExistingHeat(
  competitionDayId: string,
  judgetHeat: IHeat
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
    { new: true }
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
  judgetHeat: IHeat
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
  judgetHeat: IHeat
): Promise<ICompetitionDayItem | null> {
  const winner = competitionDayComputedUtil.computeHeatWinnerId(
    judgetHeat
  ) as IDriver;
  const loser = (
    judgetHeat.driver1?._id === winner?._id
      ? judgetHeat.driver2
      : judgetHeat.driver1
  ) as IDriver;

  const finalHeat = generateHeatFinalOrBronze(
    winner,
    judgetHeat,
    HeatType.final
  );
  const bronzeHeat = generateHeatFinalOrBronze(
    loser,
    judgetHeat,
    HeatType.bronze
  );

  const heatList = [finalHeat, bronzeHeat];

  // save new heats to competitionDay
  return await CompetitionDay.findOneAndUpdate(
    { _id: competitionDayId },
    { $push: { heatList } },
    { new: true }
  );
}

function generateHeatFinalOrBronze(
  driver1: IDriver,
  judgetHeat: IHeat,
  heatType: HeatType.final | HeatType.bronze
): IHeat {
  const newBracketNumber = heatType === HeatType.final ? 32 : 31;

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
  judgetHeat: IHeat
): Promise<ICompetitionDayItem | null> {
  const winner = competitionDayComputedUtil.computeHeatWinnerId(
    judgetHeat
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
      { new: true }
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
      { new: true }
    ),
  ]);

  return await CompetitionDay.findById(competitionDayId)
    .lean()
    .populate("heatList.runList")
    .populate("heatList.driver1")
    .populate("heatList.driver2");
}
