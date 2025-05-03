import express from 'express'
import accessReviewController from '../controllers/AccessReviewController'
import { authenticateUser } from '../middleware/auth'
import { checkRolePermission } from '../middleware/rolePermission'

const router = express.Router()

// Access Review Routes
router.post(
    '/',
    authenticateUser,
    checkRolePermission('access_reviews:create'),
    accessReviewController.createAccessReview.bind(accessReviewController)
)

router.get(
    '/',
    authenticateUser,
    checkRolePermission('access_reviews:read'),
    accessReviewController.getAllAccessReviews.bind(accessReviewController)
)

router.get(
    '/:id',
    authenticateUser,
    checkRolePermission('access_reviews:read'),
    accessReviewController.getAccessReviewById.bind(accessReviewController)
)

router.put(
    '/:id',
    authenticateUser,
    checkRolePermission('access_reviews:update'),
    accessReviewController.updateAccessReview.bind(accessReviewController)
)

router.delete(
    '/:id',
    authenticateUser,
    checkRolePermission('access_reviews:delete'),
    accessReviewController.deleteAccessReview.bind(accessReviewController)
)

// Review Items Routes
router.post(
    '/:id/items/generate',
    authenticateUser,
    checkRolePermission('access_reviews:update'),
    accessReviewController.generateReviewItems.bind(accessReviewController)
)

router.get(
    '/:id/items',
    authenticateUser,
    checkRolePermission('access_reviews:read'),
    accessReviewController.getReviewItems.bind(accessReviewController)
)

router.put(
    '/items/:id',
    authenticateUser,
    checkRolePermission('access_reviews:update'),
    accessReviewController.updateReviewItem.bind(accessReviewController)
)

// Review Actions Routes
router.post(
    '/actions',
    authenticateUser,
    checkRolePermission('access_reviews:update'),
    accessReviewController.createReviewAction.bind(accessReviewController)
)

// Schedule Routes
router.post(
    '/schedules',
    authenticateUser,
    checkRolePermission('access_reviews:create'),
    accessReviewController.createAccessReviewSchedule.bind(accessReviewController)
)

router.get(
    '/schedules',
    authenticateUser,
    checkRolePermission('access_reviews:read'),
    accessReviewController.getAllAccessReviewSchedules.bind(accessReviewController)
)

router.put(
    '/schedules/:id',
    authenticateUser,
    checkRolePermission('access_reviews:update'),
    accessReviewController.updateAccessReviewSchedule.bind(accessReviewController)
)

router.delete(
    '/schedules/:id',
    authenticateUser,
    checkRolePermission('access_reviews:delete'),
    accessReviewController.deleteAccessReviewSchedule.bind(accessReviewController)
)

router.post(
    '/schedules/run',
    authenticateUser,
    checkRolePermission('access_reviews:create'),
    accessReviewController.runScheduledAccessReviews.bind(accessReviewController)
)

export default router