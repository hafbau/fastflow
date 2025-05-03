import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import UserService, { UserStatus } from '../services/UserService'
import logger from '../utils/logger'

/**
 * Controller for user management
 */
export class UserController {
    private userService: UserService

    /**
     * Constructor
     */
    constructor() {
        this.userService = new UserService()
    }

    /**
     * Register a new user
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, firstName, lastName, displayName, avatarUrl, phoneNumber, preferences } = req.body

            if (!email || !password) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: 'Email and password are required'
                })
                return
            }

            const user = await this.userService.register(email, password, {
                firstName,
                lastName,
                displayName,
                avatarUrl,
                phoneNumber,
                preferences
            })

            res.status(StatusCodes.CREATED).json({
                success: true,
                data: user
            })
        } catch (error: any) {
            logger.error(`[UserController] Register error: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            })
        }
    }

    /**
     * Invite a user
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    async invite(req: Request, res: Response): Promise<void> {
        try {
            const { email, firstName, lastName, displayName, avatarUrl, phoneNumber, preferences, organizationId, workspaceId } = req.body

            if (!email) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: 'Email is required'
                })
                return
            }

            const user = await this.userService.invite(email, {
                firstName,
                lastName,
                displayName,
                avatarUrl,
                phoneNumber,
                preferences,
                organizationId,
                workspaceId
            })

            res.status(StatusCodes.CREATED).json({
                success: true,
                data: user
            })
        } catch (error: any) {
            logger.error(`[UserController] Invite error: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            })
        }
    }

    /**
     * Get current user profile
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    async getCurrentUser(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id

            if (!userId) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    error: 'Authentication required'
                })
                return
            }

            const user = await this.userService.getUserById(userId)

            res.status(StatusCodes.OK).json({
                success: true,
                data: user
            })
        } catch (error: any) {
            logger.error(`[UserController] Get current user error: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            })
        }
    }

    /**
     * Get user by ID
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params

            if (!id) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: 'User ID is required'
                })
                return
            }

            const user = await this.userService.getUserById(id)

            res.status(StatusCodes.OK).json({
                success: true,
                data: user
            })
        } catch (error: any) {
            logger.error(`[UserController] Get user by ID error: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            })
        }
    }

    /**
     * Update current user profile
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    async updateCurrentUser(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id

            if (!userId) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    error: 'Authentication required'
                })
                return
            }

            const { firstName, lastName, displayName, avatarUrl, phoneNumber, preferences } = req.body

            const user = await this.userService.updateUser(userId, {
                firstName,
                lastName,
                displayName,
                avatarUrl,
                phoneNumber,
                preferences
            })

            res.status(StatusCodes.OK).json({
                success: true,
                data: user
            })
        } catch (error: any) {
            logger.error(`[UserController] Update current user error: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            })
        }
    }

    /**
     * Update user
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params

            if (!id) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: 'User ID is required'
                })
                return
            }

            const { firstName, lastName, displayName, avatarUrl, phoneNumber, preferences, metadata } = req.body

            const user = await this.userService.updateUser(id, {
                firstName,
                lastName,
                displayName,
                avatarUrl,
                phoneNumber,
                preferences,
                metadata
            })

            res.status(StatusCodes.OK).json({
                success: true,
                data: user
            })
        } catch (error: any) {
            logger.error(`[UserController] Update user error: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            })
        }
    }

    /**
     * Update user status
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    async updateUserStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const { status } = req.body

            if (!id) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: 'User ID is required'
                })
                return
            }

            if (!status || !Object.values(UserStatus).includes(status as UserStatus)) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: 'Valid status is required'
                })
                return
            }

            const user = await this.userService.updateUserStatus(id, status as UserStatus)

            res.status(StatusCodes.OK).json({
                success: true,
                data: user
            })
        } catch (error: any) {
            logger.error(`[UserController] Update user status error: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            })
        }
    }

    /**
     * Delete user
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params

            if (!id) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: 'User ID is required'
                })
                return
            }

            await this.userService.deleteUser(id)

            res.status(StatusCodes.OK).json({
                success: true,
                data: { message: 'User deleted successfully' }
            })
        } catch (error: any) {
            logger.error(`[UserController] Delete user error: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            })
        }
    }

    /**
     * Reset password
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body

            if (!email) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: 'Email is required'
                })
                return
            }

            await this.userService.resetPassword(email)

            res.status(StatusCodes.OK).json({
                success: true,
                data: { message: 'Password reset email sent' }
            })
        } catch (error: any) {
            logger.error(`[UserController] Reset password error: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            })
        }
    }

    /**
     * Reset password by admin
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    async resetPasswordByAdmin(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params

            if (!id) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: 'User ID is required'
                })
                return
            }

            await this.userService.resetPasswordByAdmin(id)

            res.status(StatusCodes.OK).json({
                success: true,
                data: { message: 'Password reset email sent' }
            })
        } catch (error: any) {
            logger.error(`[UserController] Reset password by admin error: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            })
        }
    }

    /**
     * Search users
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    async searchUsers(req: Request, res: Response): Promise<void> {
        try {
            const { query, status, organizationId, workspaceId, page, limit, sortBy, sortDirection } = req.query

            const result = await this.userService.searchUsers({
                query: query as string,
                status: status as UserStatus,
                organizationId: organizationId as string,
                workspaceId: workspaceId as string,
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
                sortBy: sortBy as string,
                sortDirection: sortDirection as 'asc' | 'desc'
            })

            res.status(StatusCodes.OK).json({
                success: true,
                data: result
            })
        } catch (error: any) {
            logger.error(`[UserController] Search users error: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            })
        }
    }
    /**
     * Get user by ID (public accessor for middleware)
     * @param {string} id - User ID
     * @returns {Promise<any>} User object
     */
    public getUserByIdForAudit(id: string): Promise<any> {
        return this.userService.getUserById(id)
    }
    
    /**
     * Get user service instance (for middleware use)
     * @returns {UserService} User service instance
     */
    public getUserService(): UserService {
        return this.userService;
    }
}

export default UserController