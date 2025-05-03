import express, { Request } from 'express'
import statsController from '../../controllers/stats'
import { authorize } from '../../middleware/auth/index'

const router = express.Router()

// READ - requires read permission on chatflow
router.get(['/', '/:id'],
  authorize({
    resourceType: 'chatflow',
    action: 'read',
    resourceId: (req: Request) => req.params.id || '*'
  }),
  statsController.getChatflowStats
)

export default router
