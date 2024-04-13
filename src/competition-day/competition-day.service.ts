import CompetitionDay, {
  ICompetitionDayItem,
  IHeat,
  IRunItem,
  IRunPairItem,
  JudgePoint,
} from "../Schema/drift/CompetitionDay";
import driftEventService from "../drift-event/drift-event.service";
import driverService from "../driver/driver.service";
import { isAdmin } from "../user/utils/isAdmin";
import { Request } from "express";
import competitionDayComputed, {
  ICompetitionDayComputed,
} from "./computed/competition-day.computed";
import util from "./utils/createCompetitionDayFromQualifyingResults";
import { handleNewHeatOnJudging } from "./utils/handleNewHeatOnJudging";

export class CompetitionDayService {
  async findAll(req: Request): Promise<ICompetitionDayItem[]> {
    const isUserAdmin = await isAdmin(req);
    if (!isUserAdmin) return [];
    return await CompetitionDay.find().populate("heatList.runList");
  }

  async findById(id: string): Promise<ICompetitionDayComputed | null> {
    const competitionDay = await CompetitionDay.findById(id)
      .lean()
      .populate("heatList.driver1")
      .populate("heatList.driver2");
    if (!competitionDay) return null;

    return competitionDayComputed.computeCompetitionDay(competitionDay);
  }

  async createCompetitionDay(eventId: string): Promise<ICompetitionDayItem> {
    const competitionDay = await CompetitionDay.create({
      eventId,
      resultList: [],
    });

    const driftEvent = await driftEventService.findById(eventId);

    if (!driftEvent || !competitionDay) return competitionDay;

    driftEvent.competitionDay = competitionDay;
    driftEvent.save();

    return competitionDay;
  }

  async handleCreateCompetitionDay(
    req: Request
  ): Promise<{ error?: string; success: ICompetitionDayItem | null }> {
    const { eventId } = req.body;
    const competitionDay = await this.createCompetitionDay(eventId);
    if (!competitionDay)
      return { error: "Error creating competition day", success: null };

    return { success: competitionDay };
  }

  async addHeatToCompetitionDay(
    driver1Id: string,
    driver2Id: string,
    heatType: string,
    bracketNumber: number,
    competitionDayId: string
  ): Promise<{ success: ICompetitionDayItem | null; error?: string }> {
    const [driver1, driver2] = await Promise.all([
      driverService.findById(driver1Id),
      driverService.findById(driver2Id),
    ]);

    if (!driver1 || !driver2)
      return { error: "unexpected error", success: null };

    const newHeat = {
      driver1,
      driver2,
      heatType,
      bracketNumber,
      runList: [],
    };

    const competitionDay = await CompetitionDay.findOneAndUpdate(
      { _id: competitionDayId },
      { $push: { heatList: newHeat } },
      { new: true }
    );

    return { success: competitionDay };
  }

  async handleAddHeatToCompetitionDay(
    req: Request
  ): Promise<{ error?: string; success: ICompetitionDayItem | null }> {
    const { driver1Id, driver2Id, heatType, bracketNumber, competitionDayId } =
      req.body;
    return await this.addHeatToCompetitionDay(
      driver1Id,
      driver2Id,
      heatType,
      bracketNumber,
      competitionDayId
    );
  }

  async addRunToHeat(
    competitionDayId: string,
    heatId: string,
    newRun: Partial<IRunPairItem>
  ): Promise<ICompetitionDayItem> {
    const heat = await CompetitionDay.findOne(
      { _id: competitionDayId, "heatList._id": heatId },
      { "heatList.$": 1 }
    );

    if (!heat) {
      throw new Error("Heat not found");
    }

    const runNumber = heat.heatList[0].runList.length + 1;

    const competitionDay = await CompetitionDay.findOneAndUpdate(
      { _id: competitionDayId, "heatList._id": heatId },
      {
        $push: {
          "heatList.$.runList": {
            ...newRun,
            runNumber,
          },
        },
      },
      { new: true }
    );

    return competitionDay as ICompetitionDayItem;
  }

  async handleAddRunToHeat(
    req: Request
  ): Promise<{ error?: string; success: ICompetitionDayItem | null }> {
    const { competitionDayId, heatId, newRun } = req.body;
    const competitionDay = await this.addRunToHeat(
      competitionDayId,
      heatId,
      newRun
    );

    if (!competitionDay)
      return { error: "Error creating competition day", success: null };

    return { success: competitionDay };
  }

  async giveJudgePointsToRun(
    competitionDayId: string,
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
  ): Promise<ICompetitionDayItem | null> {
    const competitionDay = await CompetitionDay.findOneAndUpdate(
      { _id: competitionDayId, "heatList.runList._id": runId },
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
    if (!competitionDay) return null;

    return await handleNewHeatOnJudging(competitionDayId, heatId);
  }

  async handleGiveJudgePointsToRun(
    req: Request
  ): Promise<{ error?: string; success: ICompetitionDayItem | null }> {
    const { competitionDayId, heatId, runId, judgePoints } = req.body;
    const competitionDay = await this.giveJudgePointsToRun(
      competitionDayId,
      heatId,
      runId,
      judgePoints
    );

    if (!competitionDay)
      return { error: "Error creating competition day", success: null };

    return { success: competitionDay };
  }

  async generateCompetitionDayFromResultListForEvent(
    eventId: string
  ): Promise<ICompetitionDayItem> {
    return await util.execute(eventId);
  }

  async handleGenerateCompetitionDayFromResultListForEvent(
    req: Request
  ): Promise<{ error?: string; success: ICompetitionDayItem | null }> {
    const { eventId } = req.body;
    const created = await this.generateCompetitionDayFromResultListForEvent(
      eventId
    );

    if (!created)
      return { error: "Error creating competition day", success: null };

    return { success: created };
  }
}

export default new CompetitionDayService();
