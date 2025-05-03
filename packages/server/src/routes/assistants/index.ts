import express, { Request } from 'express'
import assistantsController from '../../controllers/assistants'
import { authorize } from '../../middleware/auth/index'

const router = express.Router()

// CREATE
router.post('/', authorize({ resourceType: 'assistant', action: 'create' }), assistantsController.createAssistant)

// READ
router.get('/', authorize({ resourceType: 'assistant', action: 'read' }), assistantsController.getAllAssistants)
router.get(['/', '/:id'], authorize({ resourceType: 'assistant', action: 'read', resourceId: (req: Request) => req.params.id }), assistantsController.getAssistantById)

// UPDATE
router.put(['/', '/:id'], authorize({ resourceType: 'assistant', action: 'update', resourceId: (req: Request) => req.params.id }), assistantsController.updateAssistant)

// DELETE
router.delete(['/', '/:id'], authorize({ resourceType: 'assistant', action: 'delete', resourceId: (req: Request) => req.params.id }), assistantsController.deleteAssistant)

// Component access requires read permission on assistants
router.get('/components/chatmodels', authorize({ resourceType: 'assistant', action: 'read' }), assistantsController.getChatModels)
router.get('/components/docstores', authorize({ resourceType: 'assistant', action: 'read' }), assistantsController.getDocumentStores)
router.get('/components/tools', authorize({ resourceType: 'assistant', action: 'read' }), assistantsController.getTools)

// Generate Assistant Instruction requires create/update permission
router.post('/generate/instruction', authorize({ resourceType: 'assistant', action: 'create' }), assistantsController.generateAssistantInstruction)

export default router
