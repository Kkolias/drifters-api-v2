import express from "express";
import driftSeasonController from "../drift-season/drfit-season.controller";
const router = express.Router();

router.get("/get-all", driftSeasonController.getAll);
router.get("/get-by-id", driftSeasonController.getById);
router.post("/create-drift-season", driftSeasonController.createDriftSeason);
router.post(
  "/add-driver-to-season",
  driftSeasonController.addDriverToDriftSeason
);
router.post(
  "/add-many-drivers-to-season",
  driftSeasonController.addManyDriversToDriftSeason
);
router.post(
  "/add-leaderboard-to-season",
  driftSeasonController.addLeaderboardToDriftSeason
);
router.post(
  "/add-event-to-season",
  driftSeasonController.addEventToDriftSeason
);
router.get("/find-all-light", driftSeasonController.findAllLight);

export = router;
