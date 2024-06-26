import { IDriver } from "../Schema/drift/Driver";
import Leaderboard, { ILeaderboard } from "../Schema/drift/Leaderboard";
import driftSeasonService from "../drift-season/drift-season.service";
import driverService from "../driver/driver.service";
import { isAdmin } from "../user/utils/isAdmin";
import { Request } from "express";

class LeaderboardService {
  async createDriver(req: Request): Promise<ILeaderboard | null> {
    const { seasonId } = req.body;

    if (!(await isAdmin(req))) {
      return null;
    }

    const leaderboard = new Leaderboard({
      seasonId,
    });
    const savedLeaderboard = await leaderboard.save();

    const driftSeason = await driftSeasonService.findById(seasonId);

    if (!driftSeason || !savedLeaderboard) return savedLeaderboard;

    driftSeason.leaderboard = savedLeaderboard;
    driftSeason.save();

    return savedLeaderboard;
  }

  async findAll(req: Request): Promise<ILeaderboard[]> {
    const isUserAdmin = await isAdmin(req);
    if (!isUserAdmin) return [];
    return await Leaderboard.find().populate("scoreboard.driver");
  }

  async findById(id: string): Promise<ILeaderboard | null> {
    return await Leaderboard.findById(id).populate("scoreboard.driver");
  }

  async addDriverToScoreboard(
    req: Request,
  ): Promise<{ success?: ILeaderboard; error?: string }> {
    const {
      driverId,
      leaderboardId,
      score,
      numOfWins,
      numOfSeconds,
      numOfThirds,
    } = req.body;
    const [isUserAdmin, leaderboard, driver] = await Promise.all([
      isAdmin(req),
      this.findById(leaderboardId),
      driverService.findById(driverId) as unknown as IDriver,
    ]);

    if (!isUserAdmin) {
      return { error: "Cannot edit scoreboard" };
    }

    // if (!canAccess) return { error: 'Cannot edit fishin permit' }

    const scoreboardDriver = {
      driver,
      score,
      numOfWins,
      numOfSeconds,
      numOfThirds,
    };

    leaderboard?.scoreboard.push(scoreboardDriver);
    const updated = await leaderboard?.save();
    return { success: updated };
  }
}

export default new LeaderboardService();
