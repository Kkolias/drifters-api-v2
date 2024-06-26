import express from "express";
import qualifyingController from "../qualifying/qualifying.controller";
const router = express.Router();

router.get("/get-all", qualifyingController.getAll);
router.get("/get-by-id", qualifyingController.getById);
router.post("/create", qualifyingController.createQualifying);
router.post(
  "/create-result-item",
  qualifyingController.createResultItemToQualifying,
);
router.post(
  "/create-result-item-list",
  qualifyingController.createResultItemListToQualifying,
);
router.post("/add-run-to-result", qualifyingController.addRunsToResultItem);
router.post(
  "/delete-results-by-driver-ids",
  qualifyingController.deleteResultItemsByDriverIds,
);

export = router;
