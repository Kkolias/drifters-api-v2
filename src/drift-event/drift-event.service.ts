import DriftEvent, { IDriftEventSchema } from "../Schema/drift/DriftEvent";
import driftSeasonService from "../drift-season/drift-season.service";
import { handleCompetitionDayScoring } from "../leaderboard/utils/handleBattlesLeaderboars";
import { handleQualifyingScoring } from "../leaderboard/utils/handleQualifyingLeaderboard";
import qualifyingService from "../qualifying/qualifying.service";
import { isAdmin } from "../user/utils/isAdmin";
import { Request } from "express";

export class DriftEventService {
  async findAll(req: Request): Promise<IDriftEventSchema[]> {
    const isUserAdmin = await isAdmin(req);
    if (!isUserAdmin) return [];
    return await DriftEvent.find().populate("qualifying");
  }

  async findById(id: string): Promise<IDriftEventSchema | null> {
    // populate qualifying and competitionDay
    return await DriftEvent.findById(id)
      .populate("qualifying")
      .populate("competitionDay")
      .exec();
  }

  async createDriftEvent(payload: {
    seasonId: string;
    name: string;
    country: string;
    startsAt: Date;
    endsAt: Date;
  }): Promise<IDriftEventSchema> {
    const driftEvent = await DriftEvent.create(payload);

    const driftSeason = await driftSeasonService.findById(payload.seasonId);

    if (!driftEvent || !driftSeason) return driftEvent;

    driftSeason.driftEvents.push(driftEvent);
    driftSeason.save();

    return driftEvent;
  }

  async handleCreateDriftEvent(
    req: Request
  ): Promise<IDriftEventSchema | null> {
    const { seasonId, name, country, startsAt, endsAt } = req.body;

    if (!(await isAdmin(req))) {
      return null;
    }

    return await this.createDriftEvent({
      seasonId,
      name,
      country,
      startsAt,
      endsAt,
    });
  }

  async addQualifyingToDriftEvent(
    qualifyingId: string,
    driftEventId: string
  ): Promise<IDriftEventSchema | null> {
    const [qualifying, driftEvent] = await Promise.all([
      qualifyingService.findById(qualifyingId),
      this.findById(driftEventId),
    ]);

    if (!driftEvent || !qualifying) return null;

    driftEvent.qualifying = qualifying;
    driftEvent?.save();

    return driftEvent;
  }

  async handleAddQualifyingToDriftEvent(
    req: Request
  ): Promise<{ error: string; success: IDriftEventSchema | null }> {
    const { qualifyingId, driftEventId } = req.body;

    const qualifying = await this.addQualifyingToDriftEvent(
      qualifyingId,
      driftEventId
    );

    if (!qualifying) return { error: "updating event failed", success: null };
    return { error: "", success: qualifying };
  }

  async handleQualifyingScoring(
    req: Request
  ): Promise<{ error: string; success: IDriftEventSchema | null }> {
    const { eventId } = req.body;

    await handleQualifyingScoring({
      eventId,
    });
    const updatedEvent = await this.findById(eventId);

    if (!updatedEvent) return { error: "scoring failed", success: null };
    return { error: "", success: updatedEvent };
  }

  async handleCompetitionDayScoring(
    req: Request
  ): Promise<{ error: string; success: IDriftEventSchema | null }> {
    const { eventId } = req.body;

    await handleCompetitionDayScoring({
      eventId,
    });
    const updatedEvent = await this.findById(eventId);

    if (!updatedEvent) return { error: "scoring failed", success: null };
    return { error: "", success: updatedEvent };
  }
}

export default new DriftEventService();
