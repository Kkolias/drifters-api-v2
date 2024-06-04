import { IQualifyingResultItem } from "../Schema/drift/Qualifying";
import QualifyingShowdown, {
  IQualifyingShowdownItem,
} from "../Schema/drift/QualifyingShowdown";
import driftEventService from "../drift-event/drift-event.service";
import qualifyingService from "../qualifying/qualifying.service";
import { isAdmin } from "../user/utils/isAdmin";
import { Request } from "express";
import qualifyingShowdownComputed, {
  IQualifyingShowdownComputed,
} from "./computed/qualifying-showdown.computed";
import createQualifyingShowdownUtil from "./methods/createQualifyingShowdown";
import judgeShowDownUtil from "./methods/judgeShowdownHeat";
import { JudgePoint } from "../Schema/drift/CompetitionDay";

export class QualifyingShowdownService {
  async findAll(req: Request): Promise<IQualifyingShowdownItem[]> {
    const isUserAdmin = await isAdmin(req);
    if (!isUserAdmin) return [];
    return await QualifyingShowdown.find().populate("heatList.runList");
  }

  async findById(id: string): Promise<IQualifyingShowdownComputed | null> {
    const qualifyingShowdown = await QualifyingShowdown.findById(id)
      .lean()
      .populate("heatList.driver1")
      .populate("heatList.driver2");
    let event = null;
    if (qualifyingShowdown) {
      event = await driftEventService.findById(qualifyingShowdown?.eventId);
    }
    const qualifyingResults = await this.getQualifyingResults(event?.id);
    if (!qualifyingShowdown || !qualifyingResults) return null;

    return qualifyingShowdownComputed.computeQualifyingShowdown(
      { ...qualifyingShowdown, event },
      qualifyingResults
    );
  }

  async findByEventId(
    eventId: string
  ): Promise<IQualifyingShowdownComputed | null> {
    const qualifyingShowdown = await QualifyingShowdown.findOne({ eventId })
      .lean()
      .populate("heatList.driver1")
      .populate("heatList.driver2");

    const qualifyingResults = await this.getQualifyingResults(eventId);
    if (!qualifyingShowdown || !qualifyingResults) return null;

    return qualifyingShowdownComputed.computeQualifyingShowdown(
      qualifyingShowdown,
      qualifyingResults
    );
  }

  private async getQualifyingResults(
    eventId: string
  ): Promise<IQualifyingResultItem[]> {
    const qualifying = await qualifyingService.findByEventIdComputed(eventId);

    return qualifying?.resultList || []; // this is sorted already
  }

  async createQualifyingShowdown(
    eventId: string
  ): Promise<IQualifyingShowdownItem | null> {
    return await createQualifyingShowdownUtil.execute(eventId);
  }

  async handleCreateQualifyingShowdown(
    req: Request
  ): Promise<{ error?: string; success: IQualifyingShowdownItem | null }> {
    const { eventId } = req.body;
    const result = await this.createQualifyingShowdown(eventId);
    if (!result)
      return { error: "Error creating qualifying showdown", success: null };

    return { success: result };
  }

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
    return await judgeShowDownUtil.giveJudgePointsToShowdownRun(
      showdownId,
      heatId,
      runId,
      {
        judgePoint1,
        judgePoint2,
        judgePoint3,
      }
    );
  }

  async handleGiveJudgePointsToShowdownRun(
    req: Request
  ): Promise<{ error?: string; success: IQualifyingShowdownItem | null }> {
    const { showdownId, heatId, runId, judgePoint1, judgePoint2, judgePoint3 } =
      req.body;
    const result = await this.giveJudgePointsToShowdownRun(
      showdownId,
      heatId,
      runId,
      {
        judgePoint1,
        judgePoint2,
        judgePoint3,
      }
    );
    if (!result)
      return {
        error: "Error giving judge points to showdown run",
        success: null,
      };

    return { success: result };
  }
}

export default new QualifyingShowdownService();