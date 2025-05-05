import { getRepository, Repository } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../errors/InternalFastflowError'
import { UserOrganization } from '../database/entities/UserOrganization'
import { Organization } from '../database/entities/Organization'
import { UserProfile } from '../database/entities/UserProfile'
import logger from '../utils/logger'
import { getInitializedDataSource } from '../DataSource'

/**
 * Service for managing user organization memberships
 */
export class UserOrganizationService {
    private userOrgRepository: Repository<UserOrganization> | null = null
    private organizationRepository: Repository<Organization> | null = null
    private userProfileRepository: Repository<UserProfile> | null = null
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
            this.userOrgRepository = dataSource.getRepository(UserOrganization)
            this.organizationRepository = dataSource.getRepository(Organization)
            this.userProfileRepository = dataSource.getRepository(UserProfile)
            
            this.isInitialized = true
        } catch (error) {
            logger.error('Failed to initialize UserOrganizationService repositories', error)
            throw error
        }
    }

    /**
     * Add a user to an organization
     * @param {string} userId - User ID
     * @param {string} organizationId - Organization ID
     * @param {string} role - User role in the organization
     * @returns {Promise<UserOrganization>}
     */
    async addUserToOrganization(userId: string, organizationId: string, role: string = 'member'): Promise<UserOrganization> {
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

            // Check if organization exists
            const organization = await this.organizationRepository!.findOne({
                where: { id: organizationId } as any
            })

            if (!organization) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, 'Organization not found')
            }

            // Check if user is already a member of the organization
            const existingMembership = await this.userOrgRepository!.findOne({
                where: {
                    userId,
                    organizationId
                } as any
            })

            if (existingMembership) {
                // Update role if different
                if (existingMembership.role !== role) {
                    existingMembership.role = role
                    await this.userOrgRepository!.save(existingMembership)
                }
                return existingMembership
            }

            // Create new membership
            const userOrg = this.userOrgRepository!.create({
                userId,
                organizationId,
                role,
                isActive: true
            })

            await this.userOrgRepository!.save(userOrg)
            return userOrg
        } catch (error: any) {
            logger.error(`[UserOrganizationService] Add user to organization error: ${error.message}`)
            throw error
        }
    }

    /**
     * Remove a user from an organization
     * @param {string} userId - User ID
     * @param {string} organizationId - Organization ID
     * @returns {Promise<void>}
     */
    async removeUserFromOrganization(userId: string, organizationId: string): Promise<void> {
        try {
            // Ensure repositories are initialized
            await this.ensureInitialized()
            
            // Check if user is a member of the organization
            const membership = await this.userOrgRepository!.findOne({
                where: {
                    userId,
                    organizationId
                } as any
            })

            if (!membership) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, 'User is not a member of this organization')
            }

            // Delete membership
            await this.userOrgRepository!.delete(membership.id)
        } catch (error: any) {
            logger.error(`[UserOrganizationService] Remove user from organization error: ${error.message}`)
            throw error
        }
    }

    /**
     * Update user role in an organization
     * @param {string} userId - User ID
     * @param {string} organizationId - Organization ID
     * @param {string} role - New role
     * @returns {Promise<UserOrganization>}
     */
    async updateUserRole(userId: string, organizationId: string, role: string): Promise<UserOrganization> {
        try {
            // Ensure repositories are initialized
            await this.ensureInitialized()
            
            // Check if user is a member of the organization
            const membership = await this.userOrgRepository!.findOne({
                where: {
                    userId,
                    organizationId
                } as any
            })

            if (!membership) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, 'User is not a member of this organization')
            }

            // Update role
            membership.role = role
            await this.userOrgRepository!.save(membership)
            return membership
        } catch (error: any) {
            logger.error(`[UserOrganizationService] Update user role error: ${error.message}`)
            throw error
        }
    }

    /**
     * Get user organizations
     * @param {string} userId - User ID
     * @returns {Promise<Organization[]>}
     */
    async getUserOrganizations(userId: string): Promise<Organization[]> {
        try {
            // Ensure repositories are initialized
            await this.ensureInitialized()
            
            // Get user memberships
            const memberships = await this.userOrgRepository!.find({
                where: {
                    userId,
                    isActive: true
                } as any,
                relations: ['organization']
            })

            // Extract organizations
            return memberships.map((membership: UserOrganization) => membership.organization)
        } catch (error: any) {
            logger.error(`[UserOrganizationService] Get user organizations error: ${error.message}`)
            throw error
        }
    }

    /**
     * Get organization members
     * @param {string} organizationId - Organization ID
     * @returns {Promise<UserProfile[]>}
     */
    async getOrganizationMembers(organizationId: string): Promise<UserProfile[]> {
        try {
            // Ensure repositories are initialized
            await this.ensureInitialized()
            
            // Get organization memberships
            const memberships = await this.userOrgRepository!.find({
                where: {
                    organizationId,
                    isActive: true
                } as any,
                relations: ['user']
            })

            // Extract users
            return memberships.map((membership: UserOrganization) => membership.user)
        } catch (error: any) {
            logger.error(`[UserOrganizationService] Get organization members error: ${error.message}`)
            throw error
        }
    }

    /**
     * Check if user is a member of an organization
     * @param {string} userId - User ID
     * @param {string} organizationId - Organization ID
     * @returns {Promise<boolean>}
     */
    async isUserMemberOfOrganization(userId: string, organizationId: string): Promise<boolean> {
        try {
            // Ensure repositories are initialized
            await this.ensureInitialized()
            
            const membership = await this.userOrgRepository!.findOne({
                where: {
                    userId,
                    organizationId,
                    isActive: true
                } as any
            })

            return !!membership
        } catch (error: any) {
            logger.error(`[UserOrganizationService] Check user membership error: ${error.message}`)
            throw error
        }
    }

    /**
     * Get user role in an organization
     * @param {string} userId - User ID
     * @param {string} organizationId - Organization ID
     * @returns {Promise<string|null>}
     */
    async getUserRole(userId: string, organizationId: string): Promise<string | null> {
        try {
            // Ensure repositories are initialized
            await this.ensureInitialized()
            
            const membership = await this.userOrgRepository!.findOne({
                where: {
                    userId,
                    organizationId,
                    isActive: true
                } as any
            })

            return membership ? membership.role : null
        } catch (error: any) {
            logger.error(`[UserOrganizationService] Get user role error: ${error.message}`)
            throw error
        }
    }
}

export default UserOrganizationService