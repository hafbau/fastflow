import { getRepository, Repository } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../errors/InternalFastflowError'
import { WorkspaceMember } from '../database/entities/WorkspaceMember'
import { Workspace } from '../database/entities/Workspace'
import { UserProfile } from '../database/entities/UserProfile'
import { UserOrganizationService } from './UserOrganizationService'
import logger from '../utils/logger'
import { getInitializedDataSource } from '../DataSource'

/**
 * Service for managing workspace memberships
 */
export class WorkspaceMemberService {
    private workspaceMemberRepository: Repository<WorkspaceMember> | null = null
    private workspaceRepository: Repository<Workspace> | null = null
    private userProfileRepository: Repository<UserProfile> | null = null
    private userOrganizationService: UserOrganizationService | null = null
    private isInitialized = false

    /**
     * Constructor
     */
    constructor() {
        // Repositories will be initialized on demand
    }
    
    /**
     * Initialize repositories lazily
     */
    private async ensureInitialized(): Promise<void> {
        if (this.isInitialized) {
            return
        }

        try {
            // Get initialized data source
            const dataSource = await getInitializedDataSource()
            
            // Get repositories
            this.workspaceMemberRepository = dataSource.getRepository(WorkspaceMember)
            this.workspaceRepository = dataSource.getRepository(Workspace)
            this.userProfileRepository = dataSource.getRepository(UserProfile)
            this.userOrganizationService = new UserOrganizationService()
            
            this.isInitialized = true
        } catch (error) {
            logger.error('Failed to initialize WorkspaceMemberService repositories', error)
            throw error
        }
    }

    /**
     * Add a user to a workspace
     * @param {string} userId - User ID
     * @param {string} workspaceId - Workspace ID
     * @param {string} role - User role in the workspace
     * @returns {Promise<WorkspaceMember>}
     */
    async addUserToWorkspace(userId: string, workspaceId: string, role: string = 'member'): Promise<WorkspaceMember> {
        try {
            // Ensure repositories are initialized
            await this.ensureInitialized()
            
            // Check if user exists
            const user = await this.userProfileRepository!.findOne({
                where: { id: userId } as any
            })

            if (!user) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, 'User not found')
            }

            // Check if workspace exists
            const workspace = await this.workspaceRepository!.findOne({
                where: { id: workspaceId } as any,
                relations: ['organization']
            })

            if (!workspace) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, 'Workspace not found')
            }

            // Check if user is a member of the organization
            const isMember = await this.userOrganizationService!.isUserMemberOfOrganization(
                userId,
                workspace.organizationId
            )

            if (!isMember) {
                throw new InternalFastflowError(
                    StatusCodes.FORBIDDEN,
                    'User must be a member of the organization to join a workspace'
                )
            }

            // Check if user is already a member of the workspace
            const existingMembership = await this.workspaceMemberRepository!.findOne({
                where: {
                    userId,
                    workspaceId
                } as any
            })

            if (existingMembership) {
                // Update role if different
                if (existingMembership.role !== role) {
                    existingMembership.role = role
                    await this.workspaceMemberRepository!.save(existingMembership)
                }
                return existingMembership
            }

            // Create new membership
            const workspaceMember = this.workspaceMemberRepository!.create({
                userId,
                workspaceId,
                role,
                isActive: true
            })

            await this.workspaceMemberRepository!.save(workspaceMember)
            return workspaceMember
        } catch (error: any) {
            logger.error(`[WorkspaceMemberService] Add user to workspace error: ${error.message}`)
            throw error
        }
    }

    /**
     * Remove a user from a workspace
     * @param {string} userId - User ID
     * @param {string} workspaceId - Workspace ID
     * @returns {Promise<void>}
     */
    async removeUserFromWorkspace(userId: string, workspaceId: string): Promise<void> {
        try {
            // Ensure repositories are initialized
            await this.ensureInitialized()
            
            // Check if user is a member of the workspace
            const membership = await this.workspaceMemberRepository!.findOne({
                where: {
                    userId,
                    workspaceId
                } as any
            })

            if (!membership) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, 'User is not a member of this workspace')
            }

            // Delete membership
            await this.workspaceMemberRepository!.delete(membership.id)
        } catch (error: any) {
            logger.error(`[WorkspaceMemberService] Remove user from workspace error: ${error.message}`)
            throw error
        }
    }

    /**
     * Update user role in a workspace
     * @param {string} userId - User ID
     * @param {string} workspaceId - Workspace ID
     * @param {string} role - New role
     * @returns {Promise<WorkspaceMember>}
     */
    async updateUserRole(userId: string, workspaceId: string, role: string): Promise<WorkspaceMember> {
        try {
            // Ensure repositories are initialized
            await this.ensureInitialized()
            
            // Check if user is a member of the workspace
            const membership = await this.workspaceMemberRepository!.findOne({
                where: {
                    userId,
                    workspaceId
                } as any
            })

            if (!membership) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, 'User is not a member of this workspace')
            }

            // Update role
            membership.role = role
            await this.workspaceMemberRepository!.save(membership)
            return membership
        } catch (error: any) {
            logger.error(`[WorkspaceMemberService] Update user role error: ${error.message}`)
            throw error
        }
    }

    /**
     * Get user workspaces
     * @param {string} userId - User ID
     * @returns {Promise<Workspace[]>}
     */
    async getUserWorkspaces(userId: string): Promise<Workspace[]> {
        try {
            // Ensure repositories are initialized
            await this.ensureInitialized()
            
            // Get user memberships
            const memberships = await this.workspaceMemberRepository!.find({
                where: {
                    userId,
                } as any,
                relations: ['workspace']
            })

            // Extract workspaces
            return memberships.map((membership: WorkspaceMember) => membership.workspace)
        } catch (error: any) {
            logger.error(`[WorkspaceMemberService] Get user workspaces error: ${error.message}`)
            throw error
        }
    }

    /**
     * Get workspace members
     * @param {string} workspaceId - Workspace ID
     * @returns {Promise<UserProfile[]>}
     */
    async getWorkspaceMembers(workspaceId: string): Promise<UserProfile[]> {
        try {
            // Ensure repositories are initialized
            await this.ensureInitialized()
            
            // Get workspace memberships
            const memberships = await this.workspaceMemberRepository!.find({
                where: {
                    workspaceId,
                } as any,
                relations: ['user']
            })

            // Extract users
            return memberships.map((membership: WorkspaceMember) => membership.user)
        } catch (error: any) {
            logger.error(`[WorkspaceMemberService] Get workspace members error: ${error.message}`)
            throw error
        }
    }

    /**
     * Check if user is a member of a workspace
     * @param {string} userId - User ID
     * @param {string} workspaceId - Workspace ID
     * @returns {Promise<boolean>}
     */
    async isUserMemberOfWorkspace(userId: string, workspaceId: string): Promise<boolean> {
        try {
            // Ensure repositories are initialized
            await this.ensureInitialized()
            
            const membership = await this.workspaceMemberRepository!.findOne({
                where: {
                    userId,
                    workspaceId,
                } as any
            })

            return !!membership
        } catch (error: any) {
            logger.error(`[WorkspaceMemberService] Check user membership error: ${error.message}`)
            throw error
        }
    }

    /**
     * Get user role in a workspace
     * @param {string} userId - User ID
     * @param {string} workspaceId - Workspace ID
     * @returns {Promise<string|null>}
     */
    async getUserRole(userId: string, workspaceId: string): Promise<string | null> {
        try {
            // Ensure repositories are initialized
            await this.ensureInitialized()
            
            const membership = await this.workspaceMemberRepository!.findOne({
                where: {
                    userId,
                    workspaceId,
                } as any
            })

            return membership ? membership.role : null
        } catch (error: any) {
            logger.error(`[WorkspaceMemberService] Get user role error: ${error.message}`)
            throw error
        }
    }
}

export default WorkspaceMemberService