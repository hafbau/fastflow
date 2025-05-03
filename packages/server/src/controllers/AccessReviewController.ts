import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import accessReviewService from '../services/AccessReviewService'
import logger from '../utils/logger'
import { InternalFastflowError } from '../errors/InternalFastflowError'

/**
 * Controller for access review endpoints
 */
export class AccessReviewController {
    /**
     * Create a new access review
     * @param req Request
     * @param res Response
     */
    async createAccessReview(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id
            if (!userId) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated'
                })
                return
            }

            const reviewData = {
                ...req.body,
                createdBy: userId
            }

            const accessReview = await accessReviewService.createAccessReview(reviewData)

            res.status(StatusCodes.CREATED).json({
                success: true,
                data: accessReview
            })
        } catch (error: any) {
            logger.error(`[AccessReviewController] Create access review error: ${error.message}`)
            const statusCode = error instanceof InternalFastflowError
                ? error.statusCode
                : StatusCodes.INTERNAL_SERVER_ERROR
            res.status(statusCode).json({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Get all access reviews
     * @param req Request
     * @param res Response
     */
    async getAllAccessReviews(req: Request, res: Response): Promise<void> {
        try {
            const filters = req.query

            const accessReviews = await accessReviewService.getAllAccessReviews(filters)

            res.status(StatusCodes.OK).json({
                success: true,
                data: accessReviews
            })
        } catch (error: any) {
            logger.error(`[AccessReviewController] Get all access reviews error: ${error.message}`)
            const statusCode = error instanceof InternalFastflowError
                ? error.statusCode
                : StatusCodes.INTERNAL_SERVER_ERROR
            res.status(statusCode).json({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Get an access review by ID
     * @param req Request
     * @param res Response
     */
    async getAccessReviewById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params

            const accessReview = await accessReviewService.getAccessReviewById(id)

            res.status(StatusCodes.OK).json({
                success: true,
                data: accessReview
            })
        } catch (error: any) {
            logger.error(`[AccessReviewController] Get access review by ID error: ${error.message}`)
            const statusCode = error instanceof InternalFastflowError
                ? error.statusCode
                : StatusCodes.INTERNAL_SERVER_ERROR
            res.status(statusCode).json({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Update an access review
     * @param req Request
     * @param res Response
     */
    async updateAccessReview(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const userId = req.user?.id
            if (!userId) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated'
                })
                return
            }

            const updateData = req.body

            const updatedReview = await accessReviewService.updateAccessReview(id, updateData, userId)

            res.status(StatusCodes.OK).json({
                success: true,
                data: updatedReview
            })
        } catch (error: any) {
            logger.error(`[AccessReviewController] Update access review error: ${error.message}`)
            const statusCode = error instanceof InternalFastflowError
                ? error.statusCode
                : StatusCodes.INTERNAL_SERVER_ERROR
            res.status(statusCode).json({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Delete an access review
     * @param req Request
     * @param res Response
     */
    async deleteAccessReview(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const userId = req.user?.id
            if (!userId) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated'
                })
                return
            }

            await accessReviewService.deleteAccessReview(id, userId)

            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Access review deleted successfully'
            })
        } catch (error: any) {
            logger.error(`[AccessReviewController] Delete access review error: ${error.message}`)
            const statusCode = error instanceof InternalFastflowError
                ? error.statusCode
                : StatusCodes.INTERNAL_SERVER_ERROR
            res.status(statusCode).json({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Generate review items for an access review
     * @param req Request
     * @param res Response
     */
    async generateReviewItems(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const userId = req.user?.id
            if (!userId) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated'
                })
                return
            }

            const options = req.body

            const itemsGenerated = await accessReviewService.generateReviewItems(id, options, userId)

            res.status(StatusCodes.OK).json({
                success: true,
                data: { itemsGenerated }
            })
        } catch (error: any) {
            logger.error(`[AccessReviewController] Generate review items error: ${error.message}`)
            const statusCode = error instanceof InternalFastflowError
                ? error.statusCode
                : StatusCodes.INTERNAL_SERVER_ERROR
            res.status(statusCode).json({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Get review items for an access review
     * @param req Request
     * @param res Response
     */
    async getReviewItems(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const filters = req.query

            const reviewItems = await accessReviewService.getReviewItems(id, filters)

            res.status(StatusCodes.OK).json({
                success: true,
                data: reviewItems
            })
        } catch (error: any) {
            logger.error(`[AccessReviewController] Get review items error: ${error.message}`)
            const statusCode = error instanceof InternalFastflowError
                ? error.statusCode
                : StatusCodes.INTERNAL_SERVER_ERROR
            res.status(statusCode).json({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Update a review item
     * @param req Request
     * @param res Response
     */
    async updateReviewItem(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const userId = req.user?.id
            if (!userId) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated'
                })
                return
            }

            const updateData = req.body

            const updatedItem = await accessReviewService.updateReviewItem(id, updateData, userId)

            res.status(StatusCodes.OK).json({
                success: true,
                data: updatedItem
            })
        } catch (error: any) {
            logger.error(`[AccessReviewController] Update review item error: ${error.message}`)
            const statusCode = error instanceof InternalFastflowError
                ? error.statusCode
                : StatusCodes.INTERNAL_SERVER_ERROR
            res.status(statusCode).json({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Create a review action
     * @param req Request
     * @param res Response
     */
    async createReviewAction(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id
            if (!userId) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated'
                })
                return
            }

            const actionData = {
                ...req.body,
                performedBy: userId
            }

            const action = await accessReviewService.createReviewAction(actionData)

            res.status(StatusCodes.CREATED).json({
                success: true,
                data: action
            })
        } catch (error: any) {
            logger.error(`[AccessReviewController] Create review action error: ${error.message}`)
            const statusCode = error instanceof InternalFastflowError
                ? error.statusCode
                : StatusCodes.INTERNAL_SERVER_ERROR
            res.status(statusCode).json({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Create a scheduled access review
     * @param req Request
     * @param res Response
     */
    async createAccessReviewSchedule(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id
            if (!userId) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated'
                })
                return
            }

            const scheduleData = {
                ...req.body,
                createdBy: userId
            }

            const schedule = await accessReviewService.createAccessReviewSchedule(scheduleData)

            res.status(StatusCodes.CREATED).json({
                success: true,
                data: schedule
            })
        } catch (error: any) {
            logger.error(`[AccessReviewController] Create access review schedule error: ${error.message}`)
            const statusCode = error instanceof InternalFastflowError
                ? error.statusCode
                : StatusCodes.INTERNAL_SERVER_ERROR
            res.status(statusCode).json({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Get all access review schedules
     * @param req Request
     * @param res Response
     */
    async getAllAccessReviewSchedules(req: Request, res: Response): Promise<void> {
        try {
            const filters = req.query

            const schedules = await accessReviewService.getAllAccessReviewSchedules(filters)

            res.status(StatusCodes.OK).json({
                success: true,
                data: schedules
            })
        } catch (error: any) {
            logger.error(`[AccessReviewController] Get all access review schedules error: ${error.message}`)
            const statusCode = error instanceof InternalFastflowError
                ? error.statusCode
                : StatusCodes.INTERNAL_SERVER_ERROR
            res.status(statusCode).json({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Update an access review schedule
     * @param req Request
     * @param res Response
     */
    async updateAccessReviewSchedule(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const userId = req.user?.id
            if (!userId) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated'
                })
                return
            }

            const updateData = req.body

            const updatedSchedule = await accessReviewService.updateAccessReviewSchedule(id, updateData, userId)

            res.status(StatusCodes.OK).json({
                success: true,
                data: updatedSchedule
            })
        } catch (error: any) {
            logger.error(`[AccessReviewController] Update access review schedule error: ${error.message}`)
            const statusCode = error instanceof InternalFastflowError
                ? error.statusCode
                : StatusCodes.INTERNAL_SERVER_ERROR
            res.status(statusCode).json({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Delete an access review schedule
     * @param req Request
     * @param res Response
     */
    async deleteAccessReviewSchedule(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const userId = req.user?.id
            if (!userId) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated'
                })
                return
            }

            await accessReviewService.deleteAccessReviewSchedule(id, userId)

            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Access review schedule deleted successfully'
            })
        } catch (error: any) {
            logger.error(`[AccessReviewController] Delete access review schedule error: ${error.message}`)
            const statusCode = error instanceof InternalFastflowError
                ? error.statusCode
                : StatusCodes.INTERNAL_SERVER_ERROR
            res.status(statusCode).json({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Run scheduled access reviews
     * @param req Request
     * @param res Response
     */
    async runScheduledAccessReviews(req: Request, res: Response): Promise<void> {
        try {
            const reviewsCreated = await accessReviewService.runScheduledAccessReviews()

            res.status(StatusCodes.OK).json({
                success: true,
                data: { reviewsCreated }
            })
        } catch (error: any) {
            logger.error(`[AccessReviewController] Run scheduled access reviews error: ${error.message}`)
            const statusCode = error instanceof InternalFastflowError
                ? error.statusCode
                : StatusCodes.INTERNAL_SERVER_ERROR
            res.status(statusCode).json({
                success: false,
                message: error.message
            })
        }
    }
}

// Create and export the controller instance
const accessReviewController = new AccessReviewController()
export default accessReviewController