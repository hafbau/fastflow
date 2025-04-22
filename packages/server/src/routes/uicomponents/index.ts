import express from 'express'
import { uiComponentsRouter } from '../api/v1/uicomponents'

const router = express.Router()

// Use the UI components router
router.use('/', uiComponentsRouter)

export default router 