/**
 * Workspace-Scoped Chatflows Routes
 * 
 * This module defines routes for chatflows within a workspace context.
 * These routes enforce both workspace-level and resource-level permissions.
 */

import express, { Request } from 'express'
import chatflowsController from '../../controllers/chatflows'
import { authorizeMultiTenant } from '../../middleware/auth/multiTenantPermission'

const router = express.Router({ mergeParams: true })

// CREATE
router.post('/', 
  authorizeMultiTenant({
    tenantType: 'workspace',
    tenantIdParam: 'workspaceId',
    resourceType: 'chatflow',
    action: 'create'
  }),
  chatflowsController.saveChatflow
)

// READ
router.get('/', 
  authorizeMultiTenant({
    tenantType: 'workspace',
    tenantIdParam: 'workspaceId',
    resourceType: 'chatflow',
    action: 'read'
  }),
  chatflowsController.getAllChatflows
)

router.get('/:id', 
  authorizeMultiTenant({
    tenantType: 'workspace',
    tenantIdParam: 'workspaceId',
    resourceType: 'chatflow',
    action: 'read',
    resourceId: (req: Request) => req.params.id
  }),
  chatflowsController.getChatflowById
)

// UPDATE
router.put('/:id', 
  authorizeMultiTenant({
    tenantType: 'workspace',
    tenantIdParam: 'workspaceId',
    resourceType: 'chatflow',
    action: 'update',
    resourceId: (req: Request) => req.params.id
  }),
  chatflowsController.updateChatflow
)

// DELETE
router.delete('/:id', 
  authorizeMultiTenant({
    tenantType: 'workspace',
    tenantIdParam: 'workspaceId',
    resourceType: 'chatflow',
    action: 'delete',
    resourceId: (req: Request) => req.params.id
  }),
  chatflowsController.deleteChatflow
)

export default router