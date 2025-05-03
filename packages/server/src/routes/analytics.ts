import express from 'express'
import analyticsController from '../controllers/AnalyticsController'
import { checkPermission } from '../middleware/auth/permissionCheck'

const router = express.Router()

/**
 * @swagger
 * /api/v1/analytics/permissions:
 *   get:
 *     summary: Get permission analytics
 *     description: Retrieves analytics data about permission usage
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startTime
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start time for analytics data
 *       - in: query
 *         name: endTime
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End time for analytics data
 *       - in: query
 *         name: granularity
 *         required: false
 *         schema:
 *           type: string
 *           enum: [hourly, daily, weekly, monthly]
 *         description: Time granularity for analytics data
 *       - in: query
 *         name: organizationId
 *         required: false
 *         schema:
 *           type: string
 *         description: Organization ID to filter by
 *       - in: query
 *         name: workspaceId
 *         required: false
 *         schema:
 *           type: string
 *         description: Workspace ID to filter by
 *     responses:
 *       200:
 *         description: Permission analytics data
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get(
    '/permissions',
    checkPermission({ resourceType: 'analytics', action: 'read' }),
    analyticsController.getPermissionAnalytics
)

/**
 * @swagger
 * /api/v1/analytics/compliance:
 *   get:
 *     summary: Get compliance analytics
 *     description: Retrieves analytics data about compliance status
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startTime
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start time for analytics data
 *       - in: query
 *         name: endTime
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End time for analytics data
 *       - in: query
 *         name: organizationId
 *         required: false
 *         schema:
 *           type: string
 *         description: Organization ID to filter by
 *       - in: query
 *         name: workspaceId
 *         required: false
 *         schema:
 *           type: string
 *         description: Workspace ID to filter by
 *     responses:
 *       200:
 *         description: Compliance analytics data
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get(
    '/compliance',
    checkPermission({ resourceType: 'analytics', action: 'read' }),
    analyticsController.getComplianceAnalytics
)

/**
 * @swagger
 * /api/v1/analytics/security:
 *   get:
 *     summary: Get security analytics
 *     description: Retrieves analytics data about security status
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startTime
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start time for analytics data
 *       - in: query
 *         name: endTime
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End time for analytics data
 *       - in: query
 *         name: granularity
 *         required: false
 *         schema:
 *           type: string
 *           enum: [hourly, daily, weekly, monthly]
 *         description: Time granularity for analytics data
 *       - in: query
 *         name: organizationId
 *         required: false
 *         schema:
 *           type: string
 *         description: Organization ID to filter by
 *       - in: query
 *         name: workspaceId
 *         required: false
 *         schema:
 *           type: string
 *         description: Workspace ID to filter by
 *     responses:
 *       200:
 *         description: Security analytics data
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get(
    '/security',
    checkPermission({ resourceType: 'analytics', action: 'read' }),
    analyticsController.getSecurityAnalytics
)

/**
 * @swagger
 * /api/v1/analytics/alerts:
 *   get:
 *     summary: Get alerts
 *     description: Retrieves alerts for analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startTime
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start time for alerts
 *       - in: query
 *         name: endTime
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End time for alerts
 *       - in: query
 *         name: alertType
 *         required: false
 *         schema:
 *           type: string
 *           enum: [SECURITY_ISSUE, COMPLIANCE_ISSUE, PERFORMANCE_ISSUE, ACCESS_ISSUE, SYSTEM_ISSUE]
 *         description: Alert type to filter by
 *       - in: query
 *         name: severity
 *         required: false
 *         schema:
 *           type: string
 *           enum: [critical, high, medium, low, info]
 *         description: Alert severity to filter by
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [open, acknowledged, resolved, dismissed]
 *         description: Alert status to filter by
 *       - in: query
 *         name: organizationId
 *         required: false
 *         schema:
 *           type: string
 *         description: Organization ID to filter by
 *       - in: query
 *         name: workspaceId
 *         required: false
 *         schema:
 *           type: string
 *         description: Workspace ID to filter by
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *         description: User ID to filter by
 *       - in: query
 *         name: resourceId
 *         required: false
 *         schema:
 *           type: string
 *         description: Resource ID to filter by
 *       - in: query
 *         name: resourceType
 *         required: false
 *         schema:
 *           type: string
 *         description: Resource type to filter by
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of alerts to return
 *     responses:
 *       200:
 *         description: Alerts data
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get(
    '/alerts',
    checkPermission({ resourceType: 'analytics', action: 'read' }),
    analyticsController.getAlerts
)

/**
 * @swagger
 * /api/v1/analytics/alerts/{alertId}:
 *   put:
 *     summary: Update alert status
 *     description: Updates the status of an alert
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alertId
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, acknowledged, resolved, dismissed]
 *                 description: New alert status
 *               resolution:
 *                 type: string
 *                 description: Resolution details (required for resolved status)
 *     responses:
 *       200:
 *         description: Updated alert
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Alert not found
 *       500:
 *         description: Internal server error
 */
router.put(
    '/alerts/:alertId',
    checkPermission({ resourceType: 'analytics', action: 'write' }),
    analyticsController.updateAlertStatus
)

/**
 * @swagger
 * /api/v1/analytics/users/{userId}/permissions:
 *   get:
 *     summary: Get user permission utilization
 *     description: Retrieves permission utilization data for a specific user
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: startTime
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start time for analytics data
 *       - in: query
 *         name: endTime
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End time for analytics data
 *     responses:
 *       200:
 *         description: User permission utilization data
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get(
    '/users/:userId/permissions',
    checkPermission({ resourceType: 'analytics', action: 'read' }),
    analyticsController.getUserPermissionUtilization
)

export default router