// this will be used to generate points for events competition day results
// points are following:
// 1st +100, 2nd +88, 3rd 76, 4th 64, 5th-8th 48, 9th-16th 32, 17th-32nd 16 other 0

import DriftEvent from "../../Schema/drift/DriftEvent";
import { IDriver } from "../../Schema/drift/Driver";
import Leaderboard, {
  DriftSerie,
  ILeaderboard,
} from "../../Schema/drift/Leaderboard";
import competitionDayService from "../../competition-day/competition-day.service";
import {
  ICompetitionDayComputed,
  IScoreBoardItem,
} from "../../competition-day/computed/competition-day.computed";
import driftSeasonService from "../../drift-season/drift-season.service";
import { getBattlesPositionPointBySerie } from "../../utils/drift/getBattlesPositionPointBySerie";

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

function getPointsForPosition(
  driftSerie: DriftSerie | null,
  result: IScoreBoardItem
) {
  // 1st +100, 2nd +88, 3rd 76, 4th 64, 5th-8th 48, 9th-16th 32, 17th-32nd 16 other 0
  const position = result?.placement;
  return getBattlesPositionPointBySerie(driftSerie, position);
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

async function getDriftSerieOfSeason(
  seasonId: string
): Promise<DriftSerie | null> {
  const season = await driftSeasonService.findById(seasonId);
  return season?.serie || null;
}

export async function handleCompetitionDayScoring({
  eventId,
}: {
  eventId: string;
}) {
  const event = await DriftEvent.findById(eventId);
  const seasonId = event?.seasonId;

  if (!seasonId) return;
  const driftSerie = await getDriftSerieOfSeason(seasonId);

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
    const score = getPointsForPosition(driftSerie, result);

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
