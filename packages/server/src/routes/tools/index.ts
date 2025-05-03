import express, { Request } from 'express'
import toolsController from '../../controllers/tools'
import { authorize } from '../../middleware/auth/index'

const router = express.Router()

// CREATE
router.post('/', authorize({ resourceType: 'tool', action: 'create' }), toolsController.createTool)

// READ
router.get('/', authorize({ resourceType: 'tool', action: 'read' }), toolsController.getAllTools)
router.get(['/', '/:id'], authorize({ resourceType: 'tool', action: 'read', resourceId: (req: Request) => req.params.id }), toolsController.getToolById)

// UPDATE
router.put(['/', '/:id'], authorize({ resourceType: 'tool', action: 'update', resourceId: (req: Request) => req.params.id }), toolsController.updateTool)

// DELETE
router.delete(['/', '/:id'], authorize({ resourceType: 'tool', action: 'delete', resourceId: (req: Request) => req.params.id }), toolsController.deleteTool)

export default router
