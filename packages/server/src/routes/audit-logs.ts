import express from 'express'
import auditLogRoutes from './auditLogRoutes'

const router = express.Router()

// Use the audit log routes
router.use('/', auditLogRoutes)

export default router