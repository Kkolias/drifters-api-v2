import express from 'express'
import leaderboardController from '../leaderboard/leaderboard.controller'
const router = express.Router()


router.get('/get-all', leaderboardController.getAll)
router.get('/get-by-id', leaderboardController.getById)
router.post('/create', leaderboardController.createLeaderboard)
router.post('/add-driver', leaderboardController.addDriverToScoreboard)


export = router