import { Request, Response } from "express";
import competitionDayService from "./competition-day.service";

export class QualifyingController {
  async createCompetitionDay(req: Request, res: Response) {
    try {
      const output = await competitionDayService.handleCreateCompetitionDay(
        req
      );

      res.status(201).json(output);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create competitionDay" });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const qualifyings = await competitionDayService.findAll(req);
      res.status(200).json(qualifyings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve competitionDays" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req?.query?.id?.toString() || "";
      const qualifying = await competitionDayService.findById(id);
      res.status(200).json(qualifying);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve competitionDay" });
    }
  }

  async addHeatToCompetitionDay(req: Request, res: Response) {
    try {
      const { success, error } =
        await competitionDayService.handleAddHeatToCompetitionDay(req);

      if (error) {
        res.status(400).json(error);
      } else {
        res.status(200).json(success);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update competition day data" });
    }
  }

  async addRunToHeat(req: Request, res: Response) {
    try {
      const { success, error } = await competitionDayService.handleAddRunToHeat(
        req
      );

      if (error) {
        res.status(400).json(error);
      } else {
        res.status(200).json(success);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update competition day data" });
    }
  }

  async giveJudgePointsToRun(req: Request, res: Response) {
    try {
      const { success, error } =
        await competitionDayService.handleGiveJudgePointsToRun(req);

      if (error) {
        res.status(400).json(error);
      } else {
        res.status(200).json(success);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update competition day data" });
    }
  }

  async generateCompetitionDayFromResults(req: Request, res: Response) {
    try {
      const { success, error } =
        await competitionDayService.handleGenerateCompetitionDayFromResultListForEvent(
          req
        );

      if (error) {
        res.status(400).json(error);
      } else {
        res.status(200).json(success);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate competition day" });
    }
  }

  async updateHeat(req: Request, res: Response) {
    try {
      const { success, error } =
        await competitionDayService.handleUpdateHeat(
          req
        );

      if (error) {
        res.status(400).json(error);
      } else {
        res.status(200).json(success);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update competition day" });
    }
  }
}

export default new QualifyingController();
