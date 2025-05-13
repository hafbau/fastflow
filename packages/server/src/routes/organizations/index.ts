import express, { Request } from 'express'
import organizationsController from '../../controllers/organizations'
import organizationSettingsController from '../../controllers/organization-settings'
import { authorize } from '../../middleware/auth/index'

const router = express.Router()

// Organization routes
router.get('/',
  authorize({ resourceType: 'organization', action: 'read' }),
  organizationsController.getAllOrganizations
)
router.get('/:id',
  authorize({ resourceType: 'organization', action: 'read', resourceId: (req: Request) => req.params.id }),
  organizationsController.getOrganizationById
)
router.get('/slug/:slug',
  authorize({ resourceType: 'organization', action: 'read' }),
  organizationsController.getOrganizationBySlug
)
router.post('/',
  authorize({ resourceType: 'organization', action: 'create' }),
  organizationsController.createOrganization
)
router.put('/:id',
  authorize({ resourceType: 'organization', action: 'update', resourceId: (req: Request) => req.params.id }),
  organizationsController.updateOrganization
)
router.delete('/:id',
  authorize({ resourceType: 'organization', action: 'delete', resourceId: (req: Request) => req.params.id }),
  organizationsController.deleteOrganization
)

// Organization members routes
router.get('/:id/members',
  authorize({ resourceType: 'organization', action: 'read', resourceId: (req: Request) => req.params.id }),
  organizationsController.getOrganizationMembers
)
router.post('/:id/members',
  authorize({ resourceType: 'organization', action: 'update', resourceId: (req: Request) => req.params.id }),
  organizationsController.addOrganizationMember
)
router.put('/:id/members/:userId',
  authorize({ resourceType: 'organization', action: 'update', resourceId: (req: Request) => req.params.id }),
  organizationsController.updateOrganizationMember
)
router.delete('/:id/members/:userId',
  authorize({ resourceType: 'organization', action: 'update', resourceId: (req: Request) => req.params.id }),
  organizationsController.removeOrganizationMember
)

// Organization settings routes
router.get('/:id/settings',
  authorize({ resourceType: 'organization', action: 'read', resourceId: (req: Request) => req.params.id }),
  organizationSettingsController.getOrganizationSettings
)
router.put('/:id/settings',
  authorize({ resourceType: 'organization', action: 'update', resourceId: (req: Request) => req.params.id }),
  organizationSettingsController.updateOrganizationSettings
)

export default router