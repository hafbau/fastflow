import express, { Request } from 'express'
import variablesController from '../../controllers/variables'
import { authorize } from '../../middleware/auth/index'

const router = express.Router()

// CREATE
router.post('/', authorize({ resourceType: 'variable', action: 'create' }), variablesController.createVariable)

// READ
router.get('/', authorize({ resourceType: 'variable', action: 'read' }), variablesController.getAllVariables)

// UPDATE
router.put(['/', '/:id'], authorize({ resourceType: 'variable', action: 'update', resourceId: (req: Request) => req.params.id }), variablesController.updateVariable)

// DELETE
router.delete(['/', '/:id'], authorize({ resourceType: 'variable', action: 'delete', resourceId: (req: Request) => req.params.id }), variablesController.deleteVariable)

export default router
