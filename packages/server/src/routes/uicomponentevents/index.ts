import express from 'express'
import { uiComponentEventsRouter } from '../api/v1/uicomponentevents'

const router = express.Router()

// Use the UI component events router
router.use('/', uiComponentEventsRouter)

export default router 