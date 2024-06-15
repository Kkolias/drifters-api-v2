import { JudgePoint, RunType } from "../../Schema/drift/CompetitionDay";
import QualifyingShowdown, {
  IQualifyingShowdownItem,
  IShowdownHeat,
  ShowDownHeatType,
} from "../../Schema/drift/QualifyingShowdown";
import { wasJudgetOneMoreTime } from "../../competition-day/utils/handleNewHeatOnJudging";
import competitionDayUtil from "../../competition-day/utils/createCompetitionDayFromQualifyingResults";
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

    // jos bracketNumber 1 niin luodaan uusi heat johon lisätään voittaja
    // jos bracketNumber 2 niin lisätään voittaja olemassa olevaan heatiin

    if (!judgetHeat) return null;

    const omt = wasJudgetOneMoreTime(judgetHeat, runId);

    if (omt)
      return await this.handleAddOneMoreTimeRunToHeat(showdownId, judgetHeat);

    const bracketNumber = judgetHeat?.bracketNumber;
    if (bracketNumber === 1) {
      // create new heat with winner as driver1
      return await this.handleCreateNewHeat(showdownId, judgetHeat);
    } else if (bracketNumber === 2) {
      // add winner to existing heat as driver2
      return await this.handleAddWinnerToExistingHeat(showdownId, judgetHeat);
    }

    const eventId = qualifyingShowdown?.eventId;
    console.log("IS FINALE")
    await this.scoreHeats(eventId, showdownHeats);

    return qualifyingShowdown;
  }

  private async findShowdownItemById(
    competitionDayId: string
  ): Promise<IQualifyingShowdownItem | null> {
    return await QualifyingShowdown.findById(competitionDayId)
      .lean()
      .populate("heatList.runList")
      .populate("heatList.driver1")
      .populate("heatList.driver2");
  }

  private async isHeatForBracketNumberCreated(
    showdownId: string,
    bracketNumber: number
  ): Promise<boolean> {
    // find heat from competitionDay by id where heatList has item with bracketNumber
    const found = await QualifyingShowdown.findOne({
      _id: showdownId,
      "heatList.bracketNumber": bracketNumber,
    });
    return !!found;
  }

  private async generateHeat(
    showdownId: string,
    judgetHeat: IShowdownHeat
  ): Promise<IShowdownHeat | null> {
    const isBracketAlreadyCreated = await this.isHeatForBracketNumberCreated(
      showdownId,
      3
    );
    if (isBracketAlreadyCreated) {
      return null;
    }

    const driver1 = getHeatWinner(judgetHeat);
    const driver2 = null;

    return {
      driver1, // this is lead driver
      driver2, // this is chase driver
      heatType: ShowDownHeatType.Top2,
      bracketNumber: 3,
      runList: [competitionDayUtil.generateFirstRun(driver1, driver2)],
    } as IShowdownHeat;
  }

  private async handleCreateNewHeat(
    showdownId: string,
    judgetHeat: IShowdownHeat
  ): Promise<IQualifyingShowdownItem | null> {
    const newHeat = await this.generateHeat(showdownId, judgetHeat);
    if (!newHeat) return await this.findShowdownItemById(showdownId);

    // save new heat to competitionDay
    return await QualifyingShowdown.findOneAndUpdate(
      { _id: showdownId },
      { $push: { heatList: newHeat } },
      { new: true }
    );
  }

  private async handleAddWinnerToExistingHeat(
    competitionDayId: string,
    judgetHeat: IShowdownHeat
  ): Promise<IQualifyingShowdownItem | null> {
    const driver2 = getHeatWinner(judgetHeat);
    //   const drvier2 = await driverService.findById(winnerId)

    const nextBracketNumber = 3;

    // update heats driver2 with winner
    // update also heats runLists first items run1.chaseDriverId with winner
    // update also heats runLists second items run2.leadDriverId with winner
    const updatedHeat = await QualifyingShowdown.findOneAndUpdate(
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
    showdownHeats: IShowdownHeat[]
  ): Promise<boolean> {
    if (!this.isShowdownFinished(showdownHeats)) return false;

    await handleQualifyingShowdownScoring({
      eventId,
    });
    return true;
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
