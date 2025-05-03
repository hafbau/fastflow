/**
 * Organization-Scoped Chatflows Routes
 * 
 * This module defines routes for chatflows within an organization context.
 * These routes enforce both organization-level and resource-level permissions.
 */

import express, { Request } from 'express'
import chatflowsController from '../../controllers/chatflows'
import { authorizeMultiTenant } from '../../middleware/auth/multiTenantPermission'

const router = express.Router({ mergeParams: true })

// CREATE
router.post('/', 
  authorizeMultiTenant({
    tenantType: 'organization',
    tenantIdParam: 'organizationId',
    resourceType: 'chatflow',
    action: 'create'
  }),
  chatflowsController.saveChatflow
)

// READ
router.get('/', 
  authorizeMultiTenant({
    tenantType: 'organization',
    tenantIdParam: 'organizationId',
    resourceType: 'chatflow',
    action: 'read'
  }),
  chatflowsController.getAllChatflows
)

router.get('/:id', 
  authorizeMultiTenant({
    tenantType: 'organization',
    tenantIdParam: 'organizationId',
    resourceType: 'chatflow',
    action: 'read',
    resourceId: (req: Request) => req.params.id
  }),
  chatflowsController.getChatflowById
)

// UPDATE
router.put('/:id', 
  authorizeMultiTenant({
    tenantType: 'organization',
    tenantIdParam: 'organizationId',
    resourceType: 'chatflow',
    action: 'update',
    resourceId: (req: Request) => req.params.id
  }),
  chatflowsController.updateChatflow
)

// DELETE
router.delete('/:id', 
  authorizeMultiTenant({
    tenantType: 'organization',
    tenantIdParam: 'organizationId',
    resourceType: 'chatflow',
    action: 'delete',
    resourceId: (req: Request) => req.params.id
  }),
  chatflowsController.deleteChatflow
)

export default router