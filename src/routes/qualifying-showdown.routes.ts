import express from "express";
import qualifyingShowdownController from "../qualifying-showdown/qualifying-showdown.controller";
const router = express.Router();

router.get("/get-all", qualifyingShowdownController.getAll);
router.post("/create-qualifying-showdown", qualifyingShowdownController.createQualifyingShowdown);
router.post("/give-judge-points", qualifyingShowdownController.giveJudgePointsToShowdown);

export = router;
