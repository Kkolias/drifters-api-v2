import CompetitionDay, {
  ICompetitionDayItem,
  IRunItem,
} from "../Schema/drift/CompetitionDay";
import driftEventService from "../drift-event/drift-event.service";
import driverService from "../driver/driver.service";
import { isAdmin } from "../user/utils/isAdmin";
import { Request } from "express";

export class CompetitionDayService {
  async findAll(req: Request): Promise<ICompetitionDayItem[]> {
    const isUserAdmin = await isAdmin(req);
    if (!isUserAdmin) return [];
    return await CompetitionDay.find();
  }

  async findById(id: string): Promise<ICompetitionDayItem | null> {
    return await CompetitionDay.findById(id);
  }

  async createQualifying(eventId: string): Promise<ICompetitionDayItem> {
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

  async addHeatToCompetitionDay(
    driver1Id: string,
    driver2Id: string,
    heatType: string,
    competitionDayId: string
  ): Promise<{ success: ICompetitionDayItem | null; error?: string }> {
    const [driver1, driver2, competitionDay] = await Promise.all([
      driverService.findById(driver1Id),
      driverService.findById(driver2Id),
      this.findById(competitionDayId),
    ]);

    if (!driver1 || !driver2 || !competitionDay)
      return { error: "unexpected error", success: null };

    const heatItem = {
      driver1,
      driver2,
      heatType,
      runList: [],
    };
    competitionDay.heatList.push(heatItem);
    competitionDay.save();

    return { success: competitionDay };
  }
}

export default new CompetitionDayService();
