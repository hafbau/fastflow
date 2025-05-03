import express from 'express'
import rateLimitController from '../../controllers/rateLimit'
import { verifyJWT } from '../../utils/supabase'
import { checkRolePermission } from '../../middleware/rolePermission'

const router = express.Router()

// Get rate limit statistics (admin only)
router.get(
    '/stats',
    verifyJWT,
    checkRolePermission('admin'),
    rateLimitController.getRateLimitStats
)

// Get rate limit events (admin only)
router.get(
    '/events',
    verifyJWT,
    checkRolePermission('admin'),
    rateLimitController.getRateLimitEvents
)

// Clear rate limit events (admin only)
router.delete(
    '/events',
    verifyJWT,
    checkRolePermission('admin'),
    rateLimitController.clearRateLimitEvents
)

export default router