import { getRepository, Repository } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../errors/InternalFastflowError'
import { OrganizationMember } from '../database/entities/OrganizationMember'
import { Organization } from '../database/entities/Organization'
import { UserProfile } from '../database/entities/UserProfile'
import logger from '../utils/logger'
import { getInitializedDataSource } from '../DataSource'
import { getErrorMessage } from '../errors/utils'

/**
 * Service for managing user organization memberships
 */
export class UserOrganizationService {
    private userOrgRepository: Repository<OrganizationMember> | null = null
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
            this.userOrgRepository = dataSource.getRepository(OrganizationMember)
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
     * @returns {Promise<OrganizationMember>}
     */
    async addUserToOrganization(userId: string, organizationId: string, role: string = 'member'): Promise<OrganizationMember> {
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
                role
            })

            await this.userOrgRepository!.save(userOrg)
            return userOrg
        } catch (error: any) {
            logger.error(`[UserOrganizationService] Add user to organization error: ${error.message}`)
            throw error
        }
    }

    /**
     * Add a member to an organization (alternative method signature matching organizationMembersService)
     * @param {Partial<OrganizationMember>} member - Member data
     * @returns {Promise<OrganizationMember>}
     */
    async addOrganizationMember(member: Partial<OrganizationMember>): Promise<OrganizationMember> {
        try {
            await this.ensureInitialized()
            
            // Check if organization exists
            if (member.organizationId) {
                const organization = await this.organizationRepository!.findOne({
                    where: { id: member.organizationId } as any
                })
                
                if (!organization) {
                    throw new InternalFastflowError(StatusCodes.NOT_FOUND, 'Organization not found')
                }
            } else {
                throw new InternalFastflowError(StatusCodes.BAD_REQUEST, 'Organization ID is required')
            }
            
            // Check if user exists
            if (member.userId) {
                const user = await this.userProfileRepository!.findOne({
                    where: { id: member.userId } as any
                })
                
                if (!user) {
                    throw new InternalFastflowError(StatusCodes.NOT_FOUND, 'User not found')
                }
            } else {
                throw new InternalFastflowError(StatusCodes.BAD_REQUEST, 'User ID is required')
            }
            
            // Check if member already exists
            try {
                const existingMember = await this.getOrganizationMember(member.organizationId!, member.userId!)
                if (existingMember) {
                    throw new InternalFastflowError(
                        StatusCodes.CONFLICT,
                        `User ${member.userId} is already a member of organization ${member.organizationId}`
                    )
                }
            } catch (error) {
                // If error is NOT_FOUND, that's good - we can proceed
                if (!(error instanceof InternalFastflowError && error.statusCode === StatusCodes.NOT_FOUND)) {
                    throw error
                }
            }
            
            // Set defaults
            if (!member.role) {
                member.role = 'member'
            }
            
            // Note: isActive is now a computed property based on user.status
            
            // Create new member
            const newMember = this.userOrgRepository!.create(member)
            const savedMember = await this.userOrgRepository!.save(newMember)
            
            // Return the complete member with relations
            return this.getOrganizationMember(savedMember.organizationId, savedMember.userId)
        } catch (error: any) {
            logger.error(`[UserOrganizationService] Add organization member error: ${error.message}`)
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: userOrganizationService.addOrganizationMember - ${getErrorMessage(error)}`
            )
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
     * Remove a member from an organization (alternative method signature matching organizationMembersService)
     * @param {string} organizationId - Organization ID
     * @param {string} userId - User ID
     * @returns {Promise<void>}
     */
    async removeOrganizationMember(organizationId: string, userId: string): Promise<void> {
        return this.removeUserFromOrganization(userId, organizationId)
    }

    /**
     * Update user role in an organization
     * @param {string} userId - User ID
     * @param {string} organizationId - Organization ID
     * @param {string} role - New role
     * @returns {Promise<OrganizationMember>}
     */
    async updateUserRole(userId: string, organizationId: string, role: string): Promise<OrganizationMember> {
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
     * Update a member's role in an organization (alternative method signature matching organizationMembersService)
     * @param {string} organizationId - Organization ID
     * @param {string} userId - User ID
     * @param {Partial<OrganizationMember>} updateData - Data to update
     * @returns {Promise<OrganizationMember>}
     */
    async updateOrganizationMember(
        organizationId: string,
        userId: string,
        updateData: Partial<OrganizationMember>
    ): Promise<OrganizationMember> {
        try {
            await this.ensureInitialized()
            
            const member = await this.getOrganizationMember(organizationId, userId)
            
            // Only allow updating role
            if (updateData.role) {
                member.role = updateData.role
            }
            
            await this.userOrgRepository!.save(member)
            
            // Fetch the updated member with relations
            return this.getOrganizationMember(organizationId, userId)
        } catch (error: any) {
            logger.error(`[UserOrganizationService] Update organization member error: ${error.message}`)
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: userOrganizationService.updateOrganizationMember - ${getErrorMessage(error)}`
            )
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
                    userId
                } as any,
                relations: ['organization', 'user'],
                // Filter active users in the application code since isActive is now a computed property
                // based on user.status
            })

            // Filter by active users
            const activeUserMemberships = memberships.filter(member => member.isActive)

            // Extract organizations
            return memberships.map((membership: OrganizationMember) => membership.organization)
        } catch (error: any) {
            logger.error(`[UserOrganizationService] Get user organizations error: ${error.message}`)
            throw error
        }
    }
    
    /**
     * Get user organization memberships (alternative method signature matching organizationMembersService)
     * @param {string} userId - User ID
     * @returns {Promise<OrganizationMember[]>}
     */
    async getUserOrganizationMemberships(userId: string): Promise<OrganizationMember[]> {
        try {
            await this.ensureInitialized()
            
            return await this.userOrgRepository!.find({
                where: {
                    userId
                } as any,
                relations: ['organization']
            })
        } catch (error: any) {
            logger.error(`[UserOrganizationService] Get user organization memberships error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: userOrganizationService.getUserOrganizationMemberships - ${getErrorMessage(error)}`
            )
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
                    organizationId
                } as any,
                relations: ['user']
            })

            // Filter for active users since isActive is now a computed property
            const activeMembers = memberships.filter(member => member.isActive)

            // Extract users and filter out any undefined values
            return activeMembers
                .map((membership) => membership.user)
                .filter((user): user is UserProfile => user !== undefined)
        } catch (error: any) {
            logger.error(`[UserOrganizationService] Get organization members error: ${error.message}`)
            throw error
        }
    }
    
    /**
     * Get organization member
     * @param {string} organizationId - Organization ID
     * @param {string} userId - User ID
     * @returns {Promise<OrganizationMember>}
     */
    async getOrganizationMember(organizationId: string, userId: string): Promise<OrganizationMember> {
        try {
            await this.ensureInitialized()
            
            const dbResponse = await this.userOrgRepository!.findOne({
                where: {
                    organizationId,
                    userId
                } as any,
                relations: ['organization']
            })
            
            if (!dbResponse) {
                throw new InternalFastflowError(
                    StatusCodes.NOT_FOUND,
                    `User ${userId} is not a member of organization ${organizationId}`
                )
            }
            
            return dbResponse
        } catch (error: any) {
            logger.error(`[UserOrganizationService] Get organization member error: ${error.message}`)
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: userOrganizationService.getOrganizationMember - ${getErrorMessage(error)}`
            )
        }
    }
    
    /**
     * Get organization member by email
     * @param {string} organizationId - Organization ID
     * @param {string} email - User email
     * @returns {Promise<OrganizationMember>}
     */
    async getOrganizationMemberByEmail(organizationId: string, email: string): Promise<OrganizationMember> {
        try {
            await this.ensureInitialized()
            
            // First, find the user with the given email
            const user = await this.userProfileRepository!.findOne({ where: { email } as any })
            
            if (!user) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, `User with email ${email} not found`)
            }
            
            // Then find the organization member
            return this.getOrganizationMember(organizationId, user.id)
        } catch (error: any) {
            logger.error(`[UserOrganizationService] Get organization member by email error: ${error.message}`)
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: userOrganizationService.getOrganizationMemberByEmail - ${getErrorMessage(error)}`
            )
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
                    organizationId
                } as any,
                relations: ['user']
            })

            // Check if membership exists and user is active
            return !!(membership && membership.isActive)
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
                    organizationId
                } as any,
                relations: ['user']
            })

            // Return role only if membership exists and user is active
            return (membership && membership.isActive) ? membership.role : null
        } catch (error: any) {
            logger.error(`[UserOrganizationService] Get user role error: ${error.message}`)
            throw error
        }
    }
}

export default UserOrganizationService
