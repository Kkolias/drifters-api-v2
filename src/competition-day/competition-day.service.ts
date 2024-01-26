import CompetitionDay, {
  ICompetitionDayItem,
  IHeat,
  IRunItem,
  JudgePoint,
} from "../Schema/drift/CompetitionDay";
import driftEventService from "../drift-event/drift-event.service";
import driverService from "../driver/driver.service";
import { isAdmin } from "../user/utils/isAdmin";
import { Request } from "express";

export class CompetitionDayService {
  async findAll(req: Request): Promise<ICompetitionDayItem[]> {
    const isUserAdmin = await isAdmin(req);
    if (!isUserAdmin) return [];
    return await CompetitionDay.find().populate("heatList.runList");
  }

  async findById(id: string): Promise<ICompetitionDayItem | null> {
    return await CompetitionDay.findById(id);
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
    const { driver1Id, driver2Id, heatType, bracketNumber, competitionDayId } = req.body;
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
    newRun: Partial<IRunItem>
  ): Promise<ICompetitionDayItem> {
    // const newRun = {
    //   type,
    //   runNumber,
    //   leadDriverId,
    //   chaseDriverId,
    // };

    console.log("NEW: ", newRun);

    const competitionDay = await CompetitionDay.findOneAndUpdate(
      { _id: competitionDayId, "heatList._id": heatId },
      { $push: { 'heatList.$.runList': newRun } },
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
  ) {
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
        arrayFilters: [
          { "outer._id": heatId },
          { "inner._id": runId },
        ],
      }
    );
    return competitionDay;
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
}

export default new CompetitionDayService();
