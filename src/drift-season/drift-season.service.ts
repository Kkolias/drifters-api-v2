import mongoose from "mongoose";
import DriftSeason, { IDriftSeason } from "../Schema/drift/DriftSeason";
import { DriftSerie } from "../Schema/drift/Leaderboard";
import driftEventService from "../drift-event/drift-event.service";
import driverService from "../driver/driver.service";
import leaderboardService from "../leaderboard/leaderboard.service";
import { isAdmin } from "../user/utils/isAdmin";
import { Request } from "express";

export class DriftSeasonService {
  async findAll(req: Request): Promise<IDriftSeason[]> {
    const isUserAdmin = await isAdmin(req);
    if (!isUserAdmin) return [];

    return await DriftSeason.find()
      .populate({
        path: "driftEvents",
        populate: [{ path: "qualifying" }, { path: "competitionDay" }],
      })
      .populate("leaderboard")
      .exec();
  }

  async findAllLight(): Promise<IDriftSeason[]> {
    return await DriftSeason.find().exec();
  }

  async findById(id: string): Promise<IDriftSeason | null> {
    return await DriftSeason.findById(id)
      .populate("driftEvents")
      .populate("leaderboard");
  }

  async findBySlug(slug: string): Promise<IDriftSeason | null> {
    return await DriftSeason.findOne({ slug })
      .populate("driftEvents")
      .populate("leaderboard");
  }

  async findAllByDriverId(driverId: string): Promise<IDriftSeason[]> {
    const ObjectId = mongoose.Types.ObjectId;
    console.log("driverId", driverId)
    if(!driverId) return [];
    // find seasons where season.leaderboard list has leaderboardItem.driver with driverId
    const driftSeasons = await DriftSeason.find()
    .populate({
      path: 'leaderboard',
      populate: {
        path: 'scoreboard.driver',
        // match: { _id: new ObjectId(driverId) }
      }
    })
    .exec();

    const filteredDriftSeasons = driftSeasons.filter(season => 
      season.leaderboard && season.leaderboard.scoreboard.some(scoreboardEntry => 
        scoreboardEntry.driver && scoreboardEntry.driver._id.equals(new ObjectId(driverId))
      )
    );
    return filteredDriftSeasons;
  }

  async createDriftSeason({
    serie,
    name,
    year,
    slug
  }: {
    serie: DriftSerie;
    name: string;
    year: number;
    slug: string;
  }): Promise<IDriftSeason> {
    const driftSeason = await DriftSeason.create({ serie, year, name, slug });
    return driftSeason;
  }

  async handleCreateDriftSeason(req: Request): Promise<IDriftSeason | null> {
    const { year, serie, name, slug } = req.body;

    if (!(await isAdmin(req))) {
      return null;
    }

    return await this.createDriftSeason({ serie, name, year, slug });
  }

  async addEventToDriftSeason(
    eventId: string,
    seasonId: string
  ): Promise<IDriftSeason | null> {
    const [driftSeason, driftEvent] = await Promise.all([
      this.findById(seasonId),
      driftEventService.findById(eventId),
    ]);

    if (!driftEvent || !driftSeason) return null;

    driftSeason.driftEvents.push(driftEvent);
    driftSeason?.save();

    return driftSeason;
  }

  async handleAddEventToDriftSeason(
    req: Request
  ): Promise<{ error: string; success: IDriftSeason | null }> {
    const { eventId, seasonId } = req.body;

    const driftEvent = await this.addEventToDriftSeason(eventId, seasonId);

    if (!driftEvent) return { error: "updating season failed", success: null };
    return { error: "", success: driftEvent };
  }

  async addDriverToDriftSeason(
    driverId: string,
    seasonId: string
  ): Promise<IDriftSeason | null> {
    const [driftSeason, driver] = await Promise.all([
      this.findById(seasonId),
      driverService.findById(driverId),
    ]);

    if (!driver || !driftSeason) return null;

    driftSeason.driversOfSeason.push(driver);
    driftSeason?.save();

    return driftSeason;
  }

  async handleAddDriverToDriftSeason(
    req: Request
  ): Promise<{ error: string; success: IDriftSeason | null }> {
    const { driverId, seasonId } = req.body;

    const driftEvent = await this.addDriverToDriftSeason(driverId, seasonId);

    if (!driftEvent) return { error: "updating season failed", success: null };
    return { error: "", success: driftEvent };
  }

  async addManyDriversToDriftSeason(
    driverIdList: string[],
    seasonId: string
  ): Promise<IDriftSeason | null> {
    const [driftSeason, drivers] = await Promise.all([
      this.findById(seasonId),
      driverService.findByIdList(driverIdList),
    ]);

    if (!drivers || !driftSeason) return null;

    driftSeason.driversOfSeason.push(...drivers);
    driftSeason?.save();

    return driftSeason;
  }

  async handleAddManyDriversToDriftSeason(
    req: Request
  ): Promise<{ error: string; success: IDriftSeason | null }> {
    const { driverIdList, seasonId } = req.body;

    const driftEvent = await this.addManyDriversToDriftSeason(
      driverIdList,
      seasonId
    );

    if (!driftEvent) return { error: "updating season failed", success: null };
    return { error: "", success: driftEvent };
  }

  async addLeaderboardToDriftSeason(
    leaderboardId: string,
    seasonId: string
  ): Promise<IDriftSeason | null> {
    const [driftSeason, leaderboard] = await Promise.all([
      this.findById(seasonId),
      leaderboardService.findById(leaderboardId),
    ]);

    if (!leaderboard || !driftSeason) return null;

    driftSeason.leaderboard = leaderboard;
    driftSeason?.save();

    return driftSeason;
  }

  async handleAddLeaderboardToDriftSeason(
    req: Request
  ): Promise<{ error: string; success: IDriftSeason | null }> {
    const { leaderboardId, seasonId } = req.body;

    const driftEvent = await this.addLeaderboardToDriftSeason(
      leaderboardId,
      seasonId
    );

    if (!driftEvent) return { error: "updating season failed", success: null };
    return { error: "", success: driftEvent };
  }
}

export default new DriftSeasonService();
