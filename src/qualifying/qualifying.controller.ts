
import { Request, Response } from "express";
import qualifyingService from "./qualifying.service";



export class QualifyingController {
    async createQualifying(req: Request, res: Response) {
        try {
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
          const { success, error } =
            await qualifyingService.handleCreateResultItem(req);
    
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
}

export default new QualifyingController()