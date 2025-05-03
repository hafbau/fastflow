import express from 'express'
import UserController from '../controllers/UserController'
import { verifyJWT } from '../utils/supabase'
import { checkRolePermission } from '../middleware/rolePermission'
import { authRateLimiter, exponentialBackoff } from '../middlewares/rateLimit'
import { logAuthEvent, logAuthorizationEvent, logResourceEvent, captureResourceBefore } from '../middlewares/auditLogger'

const router = express.Router()
const userController = new UserController()

/**
 * Public routes (no authentication required)
 */

// Register a new user
router.post('/register',
    authRateLimiter('register'),
    exponentialBackoff(),
    logAuthEvent('user_register'),
    userController.register.bind(userController)
)

// Reset password
router.post('/reset-password',
    authRateLimiter('resetPassword'),
    exponentialBackoff(),
    logAuthEvent('password_reset_request'),
    userController.resetPassword.bind(userController)
)

/**
 * Protected routes (authentication required)
 */

// Get current user profile
router.get('/me',
    verifyJWT,
    logAuthEvent('user_profile_access'),
    userController.getCurrentUser.bind(userController)
)

// Update current user profile
router.put('/me',
    verifyJWT,
    logResourceEvent('user_profile', 'update'),
    userController.updateCurrentUser.bind(userController)
)

/**
 * Admin routes (admin permissions required)
 */

// Invite a user
router.post(
    '/invite',
    verifyJWT,
    checkRolePermission('users:create'),
    logAuthorizationEvent('permission_check'),
    logResourceEvent('user', 'invite'),
    userController.invite.bind(userController)
)

// Get user by ID
router.get(
    '/:id',
    verifyJWT,
    checkRolePermission('users:read'),
    logAuthorizationEvent('permission_check'),
    logResourceEvent('user', 'read'),
    userController.getUserById.bind(userController)
)

// Update user
router.put(
    '/:id',
    verifyJWT,
    checkRolePermission('users:update'),
    logAuthorizationEvent('permission_check'),
    captureResourceBefore((id) => userController.getUserByIdForAudit(id)),
    logResourceEvent('user', 'update'),
    userController.updateUser.bind(userController)
)

// Update user status
router.patch(
    '/:id/status',
    verifyJWT,
    checkRolePermission('users:update'),
    logAuthorizationEvent('permission_check'),
    captureResourceBefore((id) => userController.getUserByIdForAudit(id)),
    logResourceEvent('user', 'update_status'),
    userController.updateUserStatus.bind(userController)
)

// Delete user
router.delete(
    '/:id',
    verifyJWT,
    checkRolePermission('users:delete'),
    logAuthorizationEvent('permission_check'),
    captureResourceBefore((id) => userController.getUserByIdForAudit(id)),
    logResourceEvent('user', 'delete'),
    userController.deleteUser.bind(userController)
)

// Reset user password (admin)
router.post(
    '/:id/reset-password',
    verifyJWT,
    checkRolePermission('users:update'),
    logAuthorizationEvent('permission_check'),
    logResourceEvent('user', 'reset_password_admin'),
    userController.resetPasswordByAdmin.bind(userController)
)

// Search users
router.get(
    '/',
    verifyJWT,
    checkRolePermission('users:read'),
    logAuthorizationEvent('permission_check'),
    logResourceEvent('user', 'search'),
    userController.searchUsers.bind(userController)
)

export default router