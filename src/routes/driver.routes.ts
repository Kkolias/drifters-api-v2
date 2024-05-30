import express from "express";
import driverController from "../driver/driver.controller";
const router = express.Router();

router.get("/get-all", driverController.getAll);
router.get("/get-by-id", driverController.getById);
router.get("/get-by-name", driverController.getByName);
router.post("/create", driverController.createDriver);
router.post("/add-car", driverController.addCarToDriver);

export = router;
