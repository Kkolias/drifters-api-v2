import { isAdmin } from "../user/utils/isAdmin";
import { Request, Response } from "express";
import qualifyingShowdownService from "./qualifying-showdown.service";

export class QualifyingShowdownController {
  async createQualifyingShowdown(req: Request, res: Response) {
    try {
      if (!isAdmin(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const created =
        await qualifyingShowdownService.handleCreateQualifyingShowdown(req);

      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create leaderboard" });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const items = await qualifyingShowdownService.findAll(req);
      res.status(200).json(items);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve leaderboard" });
    }
  }

  async giveJudgePointsToShowdown(req: Request, res: Response) {
    try {
      if (!isAdmin(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { success, error } =
        await qualifyingShowdownService.handleGiveJudgePointsToShowdownRun(req);

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

export default new QualifyingShowdownController();
