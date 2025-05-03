import express, { Request } from 'express'
import apikeyController from '../../controllers/apikey'
import { apiKeyRateLimiter, exponentialBackoff } from '../../middlewares/rateLimit'
import { authorize } from '../../middleware/auth/index'

const router = express.Router()

// CREATE
router.post('/',
    authorize({ resourceType: 'apikey', action: 'create' }),
    apiKeyRateLimiter('create'),
    exponentialBackoff(),
    apikeyController.createApiKey
)
router.post('/import',
    authorize({ resourceType: 'apikey', action: 'create' }),
    apikeyController.importKeys
)

// READ
router.get('/',
    authorize({ resourceType: 'apikey', action: 'read' }),
    apikeyController.getAllApiKeys
)

// UPDATE
router.put(['/', '/:id'],
    authorize({ resourceType: 'apikey', action: 'update', resourceId: (req: Request) => req.params.id }),
    apikeyController.updateApiKey
)

// DELETE
router.delete(['/', '/:id'],
    authorize({ resourceType: 'apikey', action: 'delete', resourceId: (req: Request) => req.params.id }),
    apikeyController.deleteApiKey
)

export default router
