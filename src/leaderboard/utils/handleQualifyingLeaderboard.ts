// this will be used to handle giving drivers points for qualifying results
// 1st place = 8 points, 2nd place = 7 points and son on until 8th place = 1 point
// props will be eventId and qualifying can be found using that.
// we will also need to find the leaderboard by seasonId

import DriftEvent from "../../Schema/drift/DriftEvent";
import Leaderboard, { ILeaderboard } from "../../Schema/drift/Leaderboard";
import driftSeasonService from "../../drift-season/drift-season.service";
import qualifyingService from "../../qualifying/qualifying.service";

// when giving score if driver is not in leaderboard we will add him to leaderboard and give points
// this because events can have wildcard drivers that are not in leaderboard yet

// if driver is in leaderboard we will update his score

// sctructure of leaderboard:
// leaderboard has scoreboard which is an array of objects
// item in scoreboard has driver and score, also numOfWins, numOfSeconds, numOfThirds but those are not used here

async function getLeaderboardBySeasonId(
  seasonId: string
): Promise<ILeaderboard> {
  return (await Leaderboard.findOne({ seasonId }).populate(
    "scoreboard.driver"
  )) as ILeaderboard;
}

async function getQualifyingByEventId(eventId: string) {
  return await qualifyingService.findByEventIdComputed(eventId);
}

function getPointsForPosition(position: number) {
  if (position > 8) return 0;
  return 9 - position;
}

export async function handleQualifyingScoring({
  eventId,
}: {
  eventId: string;
}) {
  const event = await DriftEvent.findById(eventId);
  const seasonId = event?.seasonId;

  if (!seasonId) return;
  const qualifying = await getQualifyingByEventId(eventId);
  if (!qualifying) return;

  let leaderboard = await getLeaderboardBySeasonId(seasonId);

  if (!leaderboard) {
    leaderboard = await createNewLeaderboard(seasonId);
  }

  for (let i = 0; i < qualifying.resultList.length; i++) {
    const result = qualifying.resultList[i];
    const driver = result.driver;
    const score = getPointsForPosition(i + 1);

    const scoreboardItem = leaderboard.scoreboard.find(
      (item) => item.driver._id.toString() === driver._id.toString()
    );

    if (scoreboardItem) {
      scoreboardItem.score += score;
    } else {
      const updatedScoreboardItem = {
        driver,
        score,
        numOfWins: 0,
        numOfSeconds: 0,
        numOfThirds: 0,
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

  const savedLeaderboard = await newLeaderboard.save();

  const driftSeason = await driftSeasonService.findById(seasonId);

  if (!driftSeason || !savedLeaderboard) return savedLeaderboard;

  driftSeason.leaderboard = savedLeaderboard;
  driftSeason.save();
  return savedLeaderboard;
}
