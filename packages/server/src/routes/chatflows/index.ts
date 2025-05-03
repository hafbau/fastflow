import express, { Request } from 'express'
import chatflowsController from '../../controllers/chatflows'
import { authorize } from '../../middleware/auth/index'

const router = express.Router()

// CREATE
router.post('/', authorize({ resourceType: 'chatflow', action: 'create' }), chatflowsController.saveChatflow)
router.post('/importchatflows', authorize({ resourceType: 'chatflow', action: 'create' }), chatflowsController.importChatflows)

// READ
router.get('/', authorize({ resourceType: 'chatflow', action: 'read' }), chatflowsController.getAllChatflows)
router.get(['/', '/:id'], authorize({ resourceType: 'chatflow', action: 'read', resourceId: (req: Request) => req.params.id }), chatflowsController.getChatflowById)
router.get(['/apikey/', '/apikey/:apikey'], chatflowsController.getChatflowByApiKey) // API key auth is handled separately

// UPDATE
router.put(['/', '/:id'], authorize({ resourceType: 'chatflow', action: 'update', resourceId: (req: Request) => req.params.id }), chatflowsController.updateChatflow)

// DELETE
router.delete(['/', '/:id'], authorize({ resourceType: 'chatflow', action: 'delete', resourceId: (req: Request) => req.params.id }), chatflowsController.deleteChatflow)

export default router
