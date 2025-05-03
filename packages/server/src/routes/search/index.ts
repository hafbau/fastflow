import express from 'express'
import searchController from '../../controllers/search'
import { verifyJWT } from '../../utils/supabase'

const router = express.Router()

// Apply JWT verification middleware to all routes
router.use(verifyJWT)

// Search routes
router.get('/organizations', searchController.searchOrganizations)
router.get('/workspaces', searchController.searchWorkspaces)

export default router