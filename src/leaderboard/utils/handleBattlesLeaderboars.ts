// this will be used to generate points for events competition day results
// points are following:
// 1st +100, 2nd +88, 3rd 76, 4th 64, 5th-8th 48, 9th-16th 32, 17th-32nd 16 other 0

import DriftEvent from "../../Schema/drift/DriftEvent";
import { IDriver } from "../../Schema/drift/Driver";
import Leaderboard, { ILeaderboard } from "../../Schema/drift/Leaderboard";
import competitionDayService from "../../competition-day/competition-day.service";
import {
  ICompetitionDayComputed,
  IScoreBoardItem,
} from "../../competition-day/computed/competition-day.computed";

async function getLeaderboardBySeasonId(
  seasonId: string
): Promise<ILeaderboard> {
  return (await Leaderboard.findOne({ seasonId }).populate(
    "scoreboard.driver"
  )) as ILeaderboard;
}

async function getCompetitionDayByEventId(
  eventId: string
): Promise<ICompetitionDayComputed> {
  return (await competitionDayService.findByEventId(
    eventId
  )) as ICompetitionDayComputed;
}

function getPointsForPosition(result: IScoreBoardItem) {
  // 1st +100, 2nd +88, 3rd 76, 4th 64, 5th-8th 48, 9th-16th 32, 17th-32nd 16 other 0
  const position = result?.placement;
  if (!position) return 0;
  if (position === 1) return 100;
  if (position === 2) return 88;
  if (position === 3) return 76;
  if (position === 4) return 64;
  if (position >= 5 && position <= 8) return 48;
  if (position >= 9 && position <= 16) return 32;
  if (position >= 17 && position <= 32) return 16;
  return 0;
}

function isWinner(result: IScoreBoardItem) {
  return result?.placement === 1;
}

function isSecond(result: IScoreBoardItem) {
  return result?.placement === 2;
}

function isThird(result: IScoreBoardItem) {
  return result?.placement === 3;
}

export async function handleCompetitionDayScoring({
  eventId,
}: {
  eventId: string;
}) {
  const event = await DriftEvent.findById(eventId);
  const seasonId = event?.seasonId;

  if (!seasonId) return;
  const competitionDay = await getCompetitionDayByEventId(eventId);
  if (!competitionDay) return;

  const battlesScoreboard = competitionDay?.scoreBoard || [];

  let leaderboard = await getLeaderboardBySeasonId(seasonId);

  if (!leaderboard) {
    leaderboard = await createNewLeaderboard(seasonId);
  }

  for (let i = 0; i < battlesScoreboard.length; i++) {
    const result = battlesScoreboard[i];
    const driver = result.driver as IDriver;
    const score = getPointsForPosition(result);

    const scoreboardItem = leaderboard.scoreboard.find(
      (item) => item.driver._id.toString() === driver?._id.toString()
    );

    if (scoreboardItem) {
      const numOfWins = isWinner(result) ? scoreboardItem?.numOfWins + 1 : 0;
      const numOfSeconds = isSecond(result)
        ? scoreboardItem?.numOfSeconds + 1
        : 0;
      const numOfThirds = isThird(result) ? scoreboardItem?.numOfThirds + 1 : 0;
      scoreboardItem.score += score;
      scoreboardItem.numOfWins = numOfWins;
      scoreboardItem.numOfSeconds = numOfSeconds;
      scoreboardItem.numOfThirds = numOfThirds;
    } else {
      const numOfWins = isWinner(result) ? 1 : 0;
      const numOfSeconds = isSecond(result) ? 1 : 0;
      const numOfThirds = isThird(result) ? 1 : 0;
      const updatedScoreboardItem = {
        driver,
        score,
        numOfWins,
        numOfSeconds,
        numOfThirds,
      };
      leaderboard.scoreboard.push(updatedScoreboardItem);
    }
  }

  leaderboard.save();
}

async function createNewLeaderboard(seasonId: string): Promise<ILeaderboard> {
  const newLeaderboard = new Leaderboard({
    seasonId,
  });

  return await newLeaderboard.save();
}
