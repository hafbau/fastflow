import express from 'express'
import * as customRolesController from '../controllers/custom-roles'
import { authenticateUser } from '../middleware/auth'
import { checkRolePermission } from '../middleware/rolePermission'

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticateUser)

// Get all custom roles (requires system-level permission)
router.get(
    '/',
    checkRolePermission('role:read'),
    customRolesController.getAllCustomRoles
)

// Get custom roles by organization
router.get(
    '/organizations/:organizationId',
    checkRolePermission('role:read'),
    customRolesController.getCustomRolesByOrganization
)

// Get custom role by ID
router.get(
    '/:roleId',
    checkRolePermission('role:read'),
    customRolesController.getCustomRoleById
)

// Create a new custom role for an organization
router.post(
    '/organizations/:organizationId',
    checkRolePermission('role:create'),
    customRolesController.createCustomRole
)

// Update a custom role
router.put(
    '/:roleId',
    checkRolePermission('role:update'),
    customRolesController.updateCustomRole
)

// Delete a custom role
router.delete(
    '/:roleId',
    checkRolePermission('role:delete'),
    customRolesController.deleteCustomRole
)

// Get role templates for an organization
router.get(
    '/templates/organizations/:organizationId',
    checkRolePermission('role:read'),
    customRolesController.getRoleTemplates
)

// Create a role template for an organization
router.post(
    '/templates/organizations/:organizationId',
    checkRolePermission('role:create'),
    customRolesController.createRoleTemplate
)

// Create a role from template
router.post(
    '/from-template/:templateId',
    checkRolePermission('role:create'),
    customRolesController.createRoleFromTemplate
)

// Get effective permissions for a role
router.get(
    '/:roleId/effective-permissions',
    checkRolePermission('role:read'),
    customRolesController.getEffectiveRolePermissions
)

// Get role hierarchy
router.get(
    '/:roleId/hierarchy',
    checkRolePermission('role:read'),
    customRolesController.getRoleHierarchy
)

// Assign permission to role
router.post(
    '/:roleId/permissions/:permissionId',
    checkRolePermission('role:update'),
    customRolesController.assignPermissionToRole
)

// Remove permission from role
router.delete(
    '/:roleId/permissions/:permissionId',
    checkRolePermission('role:update'),
    customRolesController.removePermissionFromRole
)

export default router