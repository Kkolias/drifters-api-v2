import { Request, Response } from "express";
import qualifyingService from "./qualifying.service";
import { isAdmin } from "../user/utils/isAdmin";

export class QualifyingController {
  async createQualifying(req: Request, res: Response) {
    try {
      if (!isAdmin(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const output = await qualifyingService.handleCreateQualifying(req);

      res.status(201).json(output);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create qualifying" });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const qualifyings = await qualifyingService.findAllComputed(req);
      res.status(200).json(qualifyings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve leaderboard" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req?.query?.id?.toString() || "";
      const qualifying = await qualifyingService.findById(id);
      res.status(200).json(qualifying);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve leaderboard" });
    }
  }

  async createResultItemToQualifying(req: Request, res: Response) {
    try {
      if (!isAdmin(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { success, error } = await qualifyingService.handleCreateResultItem(
        req
      );

      if (error) {
        res.status(400).json(error);
      } else {
        res.status(200).json(success);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update qualifying data" });
    }
  }

  async createResultItemListToQualifying(req: Request, res: Response) {
    try {
      if (!isAdmin(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { success, error } =
        await qualifyingService.handleCreateResultItemList(req);

      if (error) {
        res.status(400).json(error);
      } else {
        res.status(200).json(success);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update qualifying data" });
    }
  }

  async addRunsToResultItem(req: Request, res: Response) {
    try {
      if (!isAdmin(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { success, error } =
        await qualifyingService.handleAddRunsToResultItem(req);

      if (error) {
        res.status(400).json(error);
      } else {
        res.status(200).json(success);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update qualifying data" });
    }
  }

  async deleteResultItemsByDriverIds(req: Request, res: Response) {
    try {
      if (!isAdmin(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { success, error } =
        await qualifyingService.handleDeleteResultsByDriverIds(req);

      if (error) {
        res.status(400).json(error);
      } else {
        res.status(200).json(success);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update qualifying data" });
    }
  }
}

export default new QualifyingController();
