import express from 'express'
import userController from '../user/user.controller'

const router = express.Router()


router.get('/get-by-token', userController.getUserByToken)
router.post('/login', userController.login)
router.post('/sign-up', userController.signUp)
router.post('/update-role', userController.updateRole)

export = router