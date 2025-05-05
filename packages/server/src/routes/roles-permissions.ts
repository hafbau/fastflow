import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { authenticateUser } from '../middleware/auth'
import { validateRequestBody } from '../middleware/validator'
import rolesPermissionsService from '../services/roles-permissions'
import permissionService from '../services/roles-permissions/PermissionService'

const router = express.Router()

/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/roles', authenticateUser, async (req, res) => {
    try {
        // Check if user has permission to read roles
        if (!req.user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: 'Authentication required'
            })
        }
        
        const hasPermission = await permissionService.hasPermission(
            req.user.id,
            'role',
            '*',
            'read'
        )
        
        if (!hasPermission) {
            return res.status(StatusCodes.FORBIDDEN).json({
                message: 'You do not have permission to view roles'
            })
        }
        
        const roles = await rolesPermissionsService.getAllRoles()
        return res.status(StatusCodes.OK).json(roles)
    } catch (error) {
        console.error('Error getting roles:', error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Failed to get roles'
        })
    }
})

/**
 * @swagger
 * /api/v1/roles/system:
 *   get:
 *     summary: Get system roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of system roles
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/roles/system', authenticateUser, async (req, res) => {
    try {
        // Check if user has permission to read roles
        if (!req.user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: 'Authentication required'
            })
        }
        
        const hasPermission = await permissionService.hasPermission(
            req.user.id,
            'role',
            '*',
            'read'
        )
        
        if (!hasPermission) {
            return res.status(StatusCodes.FORBIDDEN).json({
                message: 'You do not have permission to view roles'
            })
        }
        
        // Get all roles and filter for system roles
        const allRoles = await rolesPermissionsService.getAllRoles()
        const roles = allRoles.filter(role => role.type === 'system')
        return res.status(StatusCodes.OK).json(roles)
    } catch (error) {
        console.error('Error getting system roles:', error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Failed to get system roles'
        })
    }
})

/**
 * @swagger
 * /api/v1/organizations/{organizationId}/roles:
 *   get:
 *     summary: Get roles for an organization
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: List of roles for the organization
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/organizations/:organizationId/roles', authenticateUser, async (req, res) => {
    try {
        const { organizationId } = req.params
        
        // Check if user has permission to read roles for this organization
        if (!req.user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: 'Authentication required'
            })
        }
        
        const hasPermission = await permissionService.hasPermission(
            req.user.id,
            'organization',
            organizationId,
            'read'
        )
        
        if (!hasPermission) {
            return res.status(StatusCodes.FORBIDDEN).json({
                message: 'You do not have permission to view roles for this organization'
            })
        }
        
        const roles = await rolesPermissionsService.getRolesByOrganizationId(organizationId)
        return res.status(StatusCodes.OK).json(roles)
    } catch (error) {
        console.error('Error getting organization roles:', error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Failed to get organization roles'
        })
    }
})

export default router