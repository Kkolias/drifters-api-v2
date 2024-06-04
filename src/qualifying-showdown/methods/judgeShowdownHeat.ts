import { JudgePoint, RunType } from "../../Schema/drift/CompetitionDay";
import QualifyingShowdown, {
  IQualifyingShowdownItem,
  IShowdownHeat,
} from "../../Schema/drift/QualifyingShowdown";
import { wasJudgetOneMoreTime } from "../../competition-day/utils/handleNewHeatOnJudging";
import competitionDayUtil from "../../competition-day/utils/createCompetitionDayFromQualifyingResults";
import { IQualifyingResultItem } from "../../Schema/drift/Qualifying";
import qualifyingService from "../../qualifying/qualifying.service";
import competitionDayComputed from "../../competition-day/computed/competition-day.computed";
import { getHeatWinner } from "../../utils/drift/getHeatWinner";
import { handleQualifyingShowdownScoring } from "../../leaderboard/utils/handleQualifyingShowdownScoring";

export class JudgeShowDownUtil {
  async giveJudgePointsToShowdownRun(
    showdownId: string,
    heatId: string,
    runId: string,
    {
      judgePoint1,
      judgePoint2,
      judgePoint3,
    }: {
      judgePoint1: JudgePoint;
      judgePoint2: JudgePoint;
      judgePoint3: JudgePoint;
    }
  ): Promise<IQualifyingShowdownItem | null> {
    const qualifyingShowdown = await QualifyingShowdown.findOneAndUpdate(
      { _id: showdownId, "heatList.runList._id": runId },
      {
        $set: {
          "heatList.$[outer].runList.$[inner].judgePoint1": judgePoint1,
          "heatList.$[outer].runList.$[inner].judgePoint2": judgePoint2,
          "heatList.$[outer].runList.$[inner].judgePoint3": judgePoint3,
        },
      },
      {
        new: true,
        arrayFilters: [{ "outer._id": heatId }, { "inner._id": runId }],
      }
    );
    if (!qualifyingShowdown) return null;

    const showdownHeats = qualifyingShowdown?.heatList || [];

    const judgetHeat = showdownHeats.find(
      (heat) => heat._id.toString() === heatId
    );

    if (!judgetHeat) return null;

    const omt = wasJudgetOneMoreTime(judgetHeat, runId);

    if (omt) return await this.handleAddOneMoreTimeRunToHeat(showdownId, judgetHeat);

    const eventId = qualifyingShowdown?.eventId;

    await this.scoreHeats(eventId, showdownHeats);

    return qualifyingShowdown;
  }

  private async handleAddOneMoreTimeRunToHeat(
    showdownId: string,
    judgetHeat: IShowdownHeat
  ): Promise<IQualifyingShowdownItem | null> {
    const runNumber = judgetHeat.runList.length + 1;
    const newRun = competitionDayUtil.generateFirstRun(
      judgetHeat.driver1,
      judgetHeat.driver2,
      RunType.omt,
      runNumber
    );
    const updatedHeat = await QualifyingShowdown.findOneAndUpdate(
      { _id: showdownId, "heatList._id": judgetHeat._id },
      { $push: { "heatList.$.runList": newRun } },
      { new: true }
    );

    return updatedHeat;
  }

  private async scoreHeats(
    eventId: string,
    showdownHeats: IShowdownHeat[],
  ): Promise<boolean> {
    if (!this.isShowdownFinished(showdownHeats)) return false;

    await handleQualifyingShowdownScoring({
      eventId,
    });
    return true
  }

  isShowdownFinished(heatList: IShowdownHeat[]): boolean {
    const firstHeat = heatList?.[0];
    const secondHeat = heatList?.[1];

    if (!firstHeat || !secondHeat) return false;

    const firstWinner = getHeatWinner(firstHeat);
    const secondWinner = getHeatWinner(secondHeat);

    return !!firstWinner && !!secondWinner;
  }
}

export default new JudgeShowDownUtil();