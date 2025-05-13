import express, { Request } from 'express'
import workspacesController from '../../controllers/workspaces'
import workspaceSettingsController from '../../controllers/workspace-settings'
import { authorize } from '../../middleware/auth/index'

const router = express.Router()

// Workspace routes
router.get('/',
  authorize({ resourceType: 'workspace', action: 'read' }),
  workspacesController.getAllWorkspaces
)
router.get('/:id',
  authorize({ resourceType: 'workspace', action: 'read', resourceId: (req: Request) => req.params.id }),
  workspacesController.getWorkspaceById
)
router.get('/slug/:slug',
  authorize({ resourceType: 'workspace', action: 'read' }),
  workspacesController.getWorkspaceBySlug
)
router.get('/organization/:organizationId',
  authorize({ resourceType: 'organization', action: 'read', resourceId: (req: Request) => req.params.organizationId }),
  workspacesController.getWorkspacesByOrganizationId
)
router.post('/',
  authorize({ resourceType: 'workspace', action: 'create' }),
  workspacesController.createWorkspace
)
router.put('/:id',
  authorize({ resourceType: 'workspace', action: 'update', resourceId: (req: Request) => req.params.id }),
  workspacesController.updateWorkspace
)
router.delete('/:id',
  authorize({ resourceType: 'workspace', action: 'delete', resourceId: (req: Request) => req.params.id }),
  workspacesController.deleteWorkspace
)

// Workspace members routes
router.get('/:id/members',
  authorize({ resourceType: 'workspace', action: 'read', resourceId: (req: Request) => req.params.id }),
  workspacesController.getWorkspaceMembers
)
router.post('/:id/members',
  authorize({ resourceType: 'workspace', action: 'update', resourceId: (req: Request) => req.params.id }),
  workspacesController.addWorkspaceMember
)
router.put('/:id/members/:userId',
  authorize({ resourceType: 'workspace', action: 'update', resourceId: (req: Request) => req.params.id }),
  workspacesController.updateWorkspaceMember
)
router.delete('/:id/members/:userId',
  authorize({ resourceType: 'workspace', action: 'update', resourceId: (req: Request) => req.params.id }),
  workspacesController.removeWorkspaceMember
)

// Workspace settings routes
router.get('/:id/settings',
  authorize({ resourceType: 'workspace', action: 'read', resourceId: (req: Request) => req.params.id }),
  workspaceSettingsController.getWorkspaceSettings
)
router.put('/:id/settings',
  authorize({ resourceType: 'workspace', action: 'update', resourceId: (req: Request) => req.params.id }),
  workspaceSettingsController.updateWorkspaceSettings
)

export default router