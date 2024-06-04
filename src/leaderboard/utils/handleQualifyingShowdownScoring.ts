import DriftEvent from "../../Schema/drift/DriftEvent";
import { IDriver } from "../../Schema/drift/Driver";
import Leaderboard, { ILeaderboard } from "../../Schema/drift/Leaderboard";
import { IQualifyingResultItem } from "../../Schema/drift/Qualifying";
import QualifyingShowdown from "../../Schema/drift/QualifyingShowdown";
import { IScoreBoardItem } from "../../competition-day/computed/competition-day.computed";
import qualifyingShowdownComputed, {
  IQualifyingShowdownComputed,
} from "../../qualifying-showdown/computed/qualifying-showdown.computed";
import qualifyingService from "../../qualifying/qualifying.service";

export async function handleQualifyingShowdownScoring({
  eventId,
}: {
  eventId: string;
}) {
  const event = await DriftEvent.findById(eventId);
  const seasonId = event?.seasonId;

  if (!seasonId) return;
  const qualifyingShowdown = await findByEventId(eventId);
  if (!qualifyingShowdown) return;

  let leaderboard = await getLeaderboardBySeasonId(seasonId);

  if (!leaderboard) {
    leaderboard = await createNewLeaderboard(seasonId);
  }

  const battlesScoreboard = qualifyingShowdown?.scoreBoard || [];

  for (let i = 0; i < battlesScoreboard.length; i++) {
    const result = battlesScoreboard[i];
    const driver = result.driver as IDriver;
    const score = getPointsForPosition(result);

    const scoreboardItem = leaderboard.scoreboard.find(
      (item) => item.driver._id.toString() === driver?._id.toString()
    );

    if (scoreboardItem) {
      const numOfWins = 0;
      const numOfSeconds = 0;
      const numOfThirds = 0;
      scoreboardItem.score += score;
      scoreboardItem.numOfWins = numOfWins;
      scoreboardItem.numOfSeconds = numOfSeconds;
      scoreboardItem.numOfThirds = numOfThirds;
    } else {
      const numOfWins = 0;
      const numOfSeconds = 0;
      const numOfThirds = 0;
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

function getPointsForPosition(result: IScoreBoardItem): number {
  const placement = result?.placement;
  if (placement === 1) return 4;
  if (placement === 2) return 3;
  if (placement === 3) return 2;
  if (placement === 4) return 1;
  return 0;
}

async function getQualifyingResults(
  eventId: string
): Promise<IQualifyingResultItem[]> {
  const qualifying = await qualifyingService.findByEventIdComputed(eventId);

  return qualifying?.resultList || []; // this is sorted already
}

async function findByEventId(
  eventId: string
): Promise<IQualifyingShowdownComputed | null> {
  const qualifyingShowdown = await QualifyingShowdown.findOne({ eventId })
    .lean()
    .populate("heatList.driver1")
    .populate("heatList.driver2");

  const qualifyingResultList = await getQualifyingResults(eventId);
  if (!qualifyingShowdown || !qualifyingResultList) return null;

  return qualifyingShowdownComputed.computeQualifyingShowdown(
    qualifyingShowdown,
    qualifyingResultList
  ) as IQualifyingShowdownComputed;
}

async function getLeaderboardBySeasonId(
  seasonId: string
): Promise<ILeaderboard> {
  return (await Leaderboard.findOne({ seasonId }).populate(
    "scoreboard.driver"
  )) as ILeaderboard;
}

async function createNewLeaderboard(seasonId: string): Promise<ILeaderboard> {
  const newLeaderboard = new Leaderboard({
    seasonId,
  });

  return await newLeaderboard.save();
}
