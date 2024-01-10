import leaderboardService from "./leaderboard.service";
import { Request, Response } from "express";



export class LeaderboardController {
    async createLeaderboard(req: Request, res: Response) {
        try {
            const savedLeaderboard = await leaderboardService.createDriver(req);

            res.status(201).json(savedLeaderboard);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to create leaderboard" });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const leaderboards = await leaderboardService.findAll(req);
            res.status(200).json(leaderboards);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to retrieve leaderboard" });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const id = req?.query?.id?.toString() || "";
            const leaderboard = await leaderboardService.findById(id);
            res.status(200).json(leaderboard);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to retrieve leaderboard" });
        }
    }

    async addDriverToScoreboard(req: Request, res: Response) {
        try {
          const { success, error } =
            await leaderboardService.addDriverToScoreboard(req);
    
          if (error) {
            res.status(400).json(error);
          } else {
            res.status(200).json(success);
          }
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: "Failed to update scoreboard data" });
        }
      }
}

export default new LeaderboardController()