import express from 'express'
import competitionDayController from '../competition-day/competition-day.controller'
const router = express.Router()


router.get('/get-all', competitionDayController.getAll)
router.get('/get-by-id', competitionDayController.getById)
router.post('/create', competitionDayController.createCompetitionDay)
router.post('/create-heat-to-day', competitionDayController.addHeatToCompetitionDay)
router.post('/add-run-to-heat', competitionDayController.addRunToHeat)
router.post('/give-judge-points', competitionDayController.giveJudgePointsToRun)
router.post('/generate-competition-day-from-results', competitionDayController.generateCompetitionDayFromResults)


export = router