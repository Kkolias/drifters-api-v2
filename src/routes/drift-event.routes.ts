import express from "express";
import driftEventController from "../drift-event/drift-event.controller";
const router = express.Router();

router.get("/get-all", driftEventController.getAll);
router.get("/get-by-id", driftEventController.getById);
router.post("/create-drift-event", driftEventController.createDriftEvent);
router.post(
  "/add-qualifying-to-drift-event",
  driftEventController.addQualifyingToDriftEvent,
);
router.post(
  "/handle-qualifying-scoring",
  driftEventController.handleQualifyingScoring,
);
router.post(
  "/handle-competition-day-scoring",
  driftEventController.handleCompetitionDayScoring,
);

export = router;
