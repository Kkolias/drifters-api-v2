import { Request, Response } from "express";
import driftSeasonService from "./drift-season.service";
import { isAdmin } from "../user/utils/isAdmin";

export class DriftSeasonController {
  async createDriftSeason(req: Request, res: Response) {
    try {
      if(!isAdmin(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const output = await driftSeasonService.handleCreateDriftSeason(req);

      res.status(201).json(output);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create drift season" });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const qualifyings = await driftSeasonService.findAll(req);
      res.status(200).json(qualifyings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve drift seasons" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req?.query?.id?.toString() || "";
      const qualifying = await driftSeasonService.findById(id);
      res.status(200).json(qualifying);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve drift season" });
    }
  }

  async addDriverToDriftSeason(req: Request, res: Response) {
    try {
      if(!isAdmin(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { success, error } =
        await driftSeasonService.handleAddDriverToDriftSeason(req);

      if (error) {
        res.status(400).json(error);
      } else {
        res.status(200).json(success);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update drift season data" });
    }
  }

  async addManyDriversToDriftSeason(req: Request, res: Response) {
    try {
      if(!isAdmin(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { success, error } =
        await driftSeasonService.handleAddManyDriversToDriftSeason(req);

      if (error) {
        res.status(400).json(error);
      } else {
        res.status(200).json(success);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update drift season data" });
    }
  }

  async addEventToDriftSeason(req: Request, res: Response) {
    try {
      if(!isAdmin(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { success, error } =
        await driftSeasonService.handleAddEventToDriftSeason(req);

      if (error) {
        res.status(400).json(error);
      } else {
        res.status(200).json(success);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update drift season data" });
    }
  }

  async addLeaderboardToDriftSeason(req: Request, res: Response) {
    try {
      if(!isAdmin(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { success, error } =
        await driftSeasonService.handleAddLeaderboardToDriftSeason(req);

      if (error) {
        res.status(400).json(error);
      } else {
        res.status(200).json(success);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update drift season data" });
    }
  }
}

export default new DriftSeasonController();
