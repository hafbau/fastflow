import express, { Request } from 'express'
import credentialsController from '../../controllers/credentials'
import { authorize } from '../../middleware/auth/index'

const router = express.Router()

// CREATE
router.post('/', authorize({ resourceType: 'credential', action: 'create' }), credentialsController.createCredential)

// READ
router.get('/', authorize({ resourceType: 'credential', action: 'read' }), credentialsController.getAllCredentials)
router.get(['/', '/:id'], authorize({ resourceType: 'credential', action: 'read', resourceId: (req: Request) => req.params.id }), credentialsController.getCredentialById)

// UPDATE
router.put(['/', '/:id'], authorize({ resourceType: 'credential', action: 'update', resourceId: (req: Request) => req.params.id }), credentialsController.updateCredential)

// DELETE
router.delete(['/', '/:id'], authorize({ resourceType: 'credential', action: 'delete', resourceId: (req: Request) => req.params.id }), credentialsController.deleteCredentials)

export default router
