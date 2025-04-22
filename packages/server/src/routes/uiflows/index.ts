import express from 'express'
import { uiFlowsRouter } from '../api/v1/uiflows'

const router = express.Router()

// Use the UI flows router
router.use('/', uiFlowsRouter)

export default router 