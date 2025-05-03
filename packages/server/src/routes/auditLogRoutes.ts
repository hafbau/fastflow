import express from 'express'
import AuditLogController from '../controllers/AuditLogController'
import { verifyJWT } from '../utils/supabase'
import { checkRolePermission } from '../middleware/rolePermission'

const router = express.Router()
const auditLogController = AuditLogController

/*
 * @route GET /api/v1/audit-logs
 * @desc Get audit logs with filtering and pagination
 * @access Private (requires audit:read permission)
 */
router.get(
    '/',
    verifyJWT,
    checkRolePermission('audit:read'),
    auditLogController.getAuditLogs.bind(auditLogController)
)

/*
 * @route GET /api/v1/audit-logs/:id
 * @desc Get audit log by ID
 * @access Private (requires audit:read permission)
 */
router.get(
    '/:id',
    verifyJWT,
    checkRolePermission('audit:read'),
    auditLogController.getAuditLogById.bind(auditLogController)
)

/*
 * @route GET /api/v1/audit-logs/export
 * @desc Export audit logs as CSV
 * @access Private (requires audit:read permission)
 */
router.get(
    '/export',
    verifyJWT,
    checkRolePermission('audit:read'),
    auditLogController.exportAuditLogs.bind(auditLogController)
)

export default router