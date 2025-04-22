import express from 'express'
import { screensRouter } from '../api/v1/screens'

const router = express.Router()

// Use the screens router
router.use('/', screensRouter)

export default router 