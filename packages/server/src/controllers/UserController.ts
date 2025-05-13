import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import UserService, { UserStatus } from '../services/UserService'
import logger from '../utils/logger'
import UserOrganizationService from '../services/UserOrganizationService'
import { RoleService } from '../services/roles-permissions/RoleService'
import OrganizationService from '../services/organizations'
import WorkspaceService from '../services/workspaces'
import WorkspaceMemberService from '../services/workspace-members'
import { SYSTEM_ROLES_NAME } from '../services/roles-permissions/initializeRolesAndPermissions'

/**
 * Controller for user management
 */
export class UserController {
    private userService: UserService
    private userOrgService: UserOrganizationService
    private userRoleService: RoleService
    private organizationService: typeof OrganizationService
    private workspaceService: typeof WorkspaceService
    private workspaceMemberService: typeof WorkspaceMemberService

    /**
     * Constructor
     */
    constructor() {
        // TODO: Use dependency injection for these services
        this.userService = new UserService()
        this.userOrgService = new UserOrganizationService()
        this.userRoleService = new RoleService()
        // TODO: Use classical pattern for these services
        this.organizationService = OrganizationService
        this.workspaceService = WorkspaceService
        this.workspaceMemberService = WorkspaceMemberService
    }

    /**
     * Register a new user
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    async register(req: Request, res: Response): Promise<void> {
        try {
            console.log('Registering user', req.body)
            const [fname, lname] = req.body?.fullName.split(' ') ?? []
            const { email, password, firstName = fname, lastName = lname, fullName: displayName } = req.body

            if (!email || !password) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: 'Email and password are required'
                })
                return
            }
            logger.info(`[UserController] Registering user: ${email}`)
            const user = await this.userService.register(email, password, {
                firstName,
                lastName,
                displayName,
            })
            logger.info(`[UserController] User registered: ${user.id}`)
            // Create default organization and workspace for the user
            const organization = await this.organizationService.createOrganization({
                name: 'Default Organization',
                slug: `org-${user.id.slice(0, 8)}`,
                createdBy: user.id,
            })
            logger.info(`[UserController] Organization created: ${organization.id}`)
            const workspace = await this.workspaceService.createWorkspace({
                name: 'Default Workspace',
                organizationId: organization.id,
                slug: `ws-${user.id.slice(0, 8)}`,
                createdBy: user.id,
            });
            logger.info(`[UserController] Workspace created: ${workspace.id}`)
            // Assign default roles to the user
            await this.userRoleService.assignAdminRoleToUser(user.id)
            logger.info(`[UserController] Admin role assigned to user: ${user.id}`)
            // TODO: Not sure if this is needed
            await this.userRoleService.assignAdminRoleToUser(user.id, workspace.id)
            logger.info(`[UserController] Admin role assigned to user in workspace: ${user.id}, workspace: ${workspace.id}`)
            
            // TODO: This feels like should be in the organization & workspace services but beware of circular dependencies
            await this.userOrgService.addUserToOrganization(user.id, organization.id, SYSTEM_ROLES_NAME.ADMIN)
            logger.info(`[UserController] User added to organization: ${user.id}, organization: ${organization.id}`)
            await this.workspaceMemberService.addWorkspaceMember({
                userId: user.id,
                workspaceId: workspace.id,
                role: SYSTEM_ROLES_NAME.ADMIN
            })
            logger.info(`[UserController] User added to workspace: ${user.id}, workspace: ${workspace.id}`)
            res.status(StatusCodes.CREATED).json({
                success: true,
                data: user
            });
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
     * Get current user organizations
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    async getCurrentUserOrganizations(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id

            if (!userId) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    error: 'Authentication required'
                })
                return
            }

            const orgs = await this.userOrgService.getUserOrganizations(userId)

            res.status(StatusCodes.OK).json({
                success: true,
                data: orgs
            })
        } catch (error: any) {
            logger.error(`[UserController] Get current user organizations error: ${error.message}`)
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
                metadata: {avatarUrl, phoneNumber},
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
                metadata: { avatarUrl, phoneNumber, ...metadata },
                preferences,
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