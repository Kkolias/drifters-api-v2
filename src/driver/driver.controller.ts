import { Request, Response } from "express";
import driverService from "./driver.service";

export class DriverController {
    async createDriver(req: Request, res: Response) {
        try {
            const savedPermit = await driverService.createDriver(req);

            res.status(201).json(savedPermit);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to create driver" });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const drivers = await driverService.findAll(req);
            res.status(200).json(drivers);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to retrieve drivers" });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const id = req?.query?.id?.toString() || "";
            const driver = await driverService.findById(id);
            res.status(200).json(driver);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to retrieve driver" });
        }
    }

    async addCarToDriver(req: Request, res: Response) {
        try {
            const { success, error } =
                await driverService.addCarToDriver(req);

            if (error) {
                res.status(400).json(error);
            } else {
                res.status(200).json(success);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to update driver data" });
        }
    }
}

export default new DriverController()