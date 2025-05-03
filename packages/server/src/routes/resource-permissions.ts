/**
 * Resource Permissions Routes
 * 
 * This module defines the routes for resource permissions management.
 */

import express from 'express'
import * as resourcePermissionsController from '../controllers/resource-permissions'
import { checkPermission } from '../middleware/auth/permissionCheck'

const router = express.Router()

/**
 * @route GET /api/v1/resource-permissions/users/:userId/resources/:resourceType/:resourceId
 * @desc Get resource permissions for a user
 * @access Private (requires manage:permissions)
 */
router.get(
    '/users/:userId/resources/:resourceType/:resourceId',
    checkPermission({ resourceType: 'permission', action: 'manage' }),
    resourcePermissionsController.getResourcePermissions
)

/**
 * @route POST /api/v1/resource-permissions/users/:userId/resources/:resourceType/:resourceId
 * @desc Assign permission to a resource for a user
 * @access Private (requires manage:permissions)
 */
router.post(
    '/users/:userId/resources/:resourceType/:resourceId',
    checkPermission({ resourceType: 'permission', action: 'manage' }),
    resourcePermissionsController.assignPermission
)

/**
 * @route DELETE /api/v1/resource-permissions/users/:userId/resources/:resourceType/:resourceId
 * @desc Remove permission from a resource for a user
 * @access Private (requires manage:permissions)
 */
router.delete(
    '/users/:userId/resources/:resourceType/:resourceId',
    checkPermission({ resourceType: 'permission', action: 'manage' }),
    resourcePermissionsController.removePermission
)

/**
 * @route GET /api/v1/resource-permissions/users/:userId/resources/:resourceType
 * @desc Get resources with a specific permission for a user
 * @access Private (requires manage:permissions)
 */
router.get(
    '/users/:userId/resources/:resourceType',
    checkPermission({ resourceType: 'permission', action: 'manage' }),
    resourcePermissionsController.getResourcesWithPermission
)

/**
 * @route GET /api/v1/resource-permissions/resources/:resourceType/:resourceId/users
 * @desc Get users with a specific permission for a resource
 * @access Private (requires manage:permissions)
 */
router.get(
    '/resources/:resourceType/:resourceId/users',
    checkPermission({ resourceType: 'permission', action: 'manage' }),
    resourcePermissionsController.getUsersWithPermission
)

/**
 * @route GET /api/v1/resource-permissions/check/users/:userId/resources/:resourceType/:resourceId
 * @desc Check if a user has a specific permission for a resource
 * @access Private (requires manage:permissions)
 */
router.get(
    '/check/users/:userId/resources/:resourceType/:resourceId',
    checkPermission({ resourceType: 'permission', action: 'manage' }),
    resourcePermissionsController.checkPermission
)

/**
 * @route POST /api/v1/resource-permissions/batch-check/users/:userId/resources/:resourceType/:resourceId
 * @desc Batch check permissions for a user and resource
 * @access Private (requires manage:permissions)
 */
router.post(
    '/batch-check/users/:userId/resources/:resourceType/:resourceId',
    checkPermission({ resourceType: 'permission', action: 'manage' }),
    resourcePermissionsController.batchCheckPermissions
)

/**
 * @route DELETE /api/v1/resource-permissions/resources/:resourceType/:resourceId
 * @desc Remove all permissions for a resource
 * @access Private (requires manage:permissions)
 */
router.delete(
    '/resources/:resourceType/:resourceId',
    checkPermission({ resourceType: 'permission', action: 'manage' }),
    resourcePermissionsController.removeAllPermissionsForResource
)

export default router