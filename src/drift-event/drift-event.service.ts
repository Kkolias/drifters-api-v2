import DriftEvent, { IDriftEventSchema } from "../Schema/drift/DriftEvent";
import qualifyingService from "../qualifying/qualifying.service";
import { isAdmin } from "../user/utils/isAdmin";
import { Request } from "express";

export class DriftEventService {
  async findAll(req: Request): Promise<IDriftEventSchema[]> {
    const isUserAdmin = await isAdmin(req);
    if (!isUserAdmin) return [];
    return await DriftEvent.find().populate('qualifying');
  }

  async findById(id: string): Promise<IDriftEventSchema | null> {
    return await DriftEvent.findById(id).populate('qualifying');
  }

  async createDriftEvent(seasonId: string): Promise<IDriftEventSchema> {
    const driftEvent = await DriftEvent.create({ seasonId });
    return driftEvent;
  }

  async handleCreateDriftEvent(
    req: Request
  ): Promise<IDriftEventSchema | null> {
    const { seasonId } = req.body;

    if (!(await isAdmin(req))) {
      return null;
    }

    return await this.createDriftEvent(seasonId);
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
      driftEventId,
    );

    if (!qualifying) return { error: "updating event failed", success: null };
    return { error: "", success: qualifying };
  }
}

export default new DriftEventService();
