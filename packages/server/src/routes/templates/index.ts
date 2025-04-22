import express from 'express'
import { templatesRouter } from '../api/v1/templates'

const router = express.Router()

// Use the templates router
router.use('/', templatesRouter)

export default router 