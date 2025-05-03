import express from 'express'
import exportImportController from '../../controllers/export-import'
import { authorize } from '../../middleware/auth/index'

const router = express.Router()

// Export requires read permission on all resources
router.post('/export', authorize({ resourceType: 'system', action: 'read' }), exportImportController.exportData)

// Import requires create/update permission on all resources
router.post('/import', authorize({ resourceType: 'system', action: 'create' }), exportImportController.importData)

export default router
