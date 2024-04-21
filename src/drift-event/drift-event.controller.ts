import { Request, Response } from "express";
import driftEventService from "./drift-event.service";
import { isAdmin } from "../user/utils/isAdmin";

export class DriftEventController {
  async createDriftEvent(req: Request, res: Response) {
    try {
      if (!isAdmin(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const output = await driftEventService.handleCreateDriftEvent(req);

      res.status(201).json(output);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create drift event" });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const qualifyings = await driftEventService.findAll(req);
      res.status(200).json(qualifyings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve drift events" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req?.query?.id?.toString() || "";
      const qualifying = await driftEventService.findById(id);
      res.status(200).json(qualifying);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve drift event" });
    }
  }

  async addQualifyingToDriftEvent(req: Request, res: Response) {
    try {
      if (!isAdmin(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { success, error } =
        await driftEventService.handleAddQualifyingToDriftEvent(req);

      if (error) {
        res.status(400).json(error);
      } else {
        res.status(200).json(success);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update drift event data" });
    }
  }

  async handleQualifyingScoring(req: Request, res: Response) {
    try {
      if (!isAdmin(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { success, error } =
        await driftEventService.handleQualifyingScoring(req);

      if (error) {
        res.status(400).json(error);
      } else {
        res.status(200).json(success);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update drift event data" });
    }
  }

  async handleCompetitionDayScoring(req: Request, res: Response) {
    try {
      if (!isAdmin(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { success, error } =
        await driftEventService.handleCompetitionDayScoring(req);

      if (error) {
        res.status(400).json(error);
      } else {
        res.status(200).json(success);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update drift event data" });
    }
  }
}

export default new DriftEventController();
