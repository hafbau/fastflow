import { getRepository, Repository } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuidv4 } from 'uuid'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { Invitation } from '../../database/entities/Invitation'
import { Organization } from '../../database/entities/Organization'
import { Workspace } from '../../database/entities/Workspace'
import { UserProfile } from '../../database/entities/UserProfile'
import { OrganizationMember } from '../../database/entities/OrganizationMember'
import { WorkspaceMember } from '../../database/entities/WorkspaceMember'
import logger from '../../utils/logger'
import { getInitializedDataSource } from '../../DataSource'
import { getErrorMessage } from '../../errors/utils'

/**
 * Service for managing invitations to organizations and workspaces
 */
export class InvitationService {
    private invitationRepository: Repository<Invitation> | null = null
    private organizationRepository: Repository<Organization> | null = null
    private workspaceRepository: Repository<Workspace> | null = null
    private userProfileRepository: Repository<UserProfile> | null = null
    private organizationMemberRepository: Repository<OrganizationMember> | null = null
    private workspaceMemberRepository: Repository<WorkspaceMember> | null = null
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
            this.invitationRepository = dataSource.getRepository(Invitation)
            this.organizationRepository = dataSource.getRepository(Organization)
            this.workspaceRepository = dataSource.getRepository(Workspace)
            this.userProfileRepository = dataSource.getRepository(UserProfile)
            this.organizationMemberRepository = dataSource.getRepository(OrganizationMember)
            this.workspaceMemberRepository = dataSource.getRepository(WorkspaceMember)
            
            this.isInitialized = true
        } catch (error) {
            logger.error('Failed to initialize InvitationService repositories', error)
            throw error
        }
    }

    /**
     * Get all invitations for an organization
     * @param {string} organizationId - Organization ID
     * @param {boolean} includeWorkspaceInvitations - Whether to include workspace invitations
     * @returns {Promise<Invitation[]>}
     */
    async getOrganizationInvitations(
        organizationId: string,
        includeWorkspaceInvitations = false
    ): Promise<Invitation[]> {
        try {
            await this.ensureInitialized()
            
            // Verify organization exists
            const organization = await this.organizationRepository!.findOne({
                where: { id: organizationId } as any
            })
            
            if (!organization) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, 'Organization not found')
            }
            
            let query = this.invitationRepository!.createQueryBuilder('invitation')
                .leftJoinAndSelect('invitation.organization', 'organization')
                .where('invitation.organizationId = :organizationId', { organizationId })
            
            if (includeWorkspaceInvitations) {
                // Include workspace invitations (if includeWorkspaceInvitations=true)
                query = query
                    .leftJoinAndSelect('invitation.workspace', 'workspace')
                    .orWhere(qb => {
                        const subQuery = qb
                            .subQuery()
                            .select('workspace.id')
                            .from(Workspace, 'workspace')
                            .where('workspace.organizationId = :organizationId')
                            .getQuery()
                        return 'invitation.workspaceId IN ' + subQuery
                    })
            } else {
                // Only direct organization invitations (workspaceId IS NULL)
                query = query.andWhere('invitation.workspaceId IS NULL')
            }
            
            return await query.getMany()
        } catch (error) {
            logger.error(`[InvitationService] Get organization invitations error: ${error}`)
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: invitationService.getOrganizationInvitations - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Get all invitations for a workspace
     * @param {string} workspaceId - Workspace ID
     * @returns {Promise<Invitation[]>}
     */
    async getWorkspaceInvitations(workspaceId: string): Promise<Invitation[]> {
        try {
            await this.ensureInitialized()
            
            // Verify workspace exists
            const workspace = await this.workspaceRepository!.findOne({
                where: { id: workspaceId } as any
            })
            
            if (!workspace) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, 'Workspace not found')
            }
            
            return await this.invitationRepository!.find({
                where: { workspaceId } as any,
                relations: ['organization', 'workspace']
            })
        } catch (error) {
            logger.error(`[InvitationService] Get workspace invitations error: ${error}`)
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: invitationService.getWorkspaceInvitations - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Get invitation by ID
     * @param {string} invitationId - Invitation ID
     * @returns {Promise<Invitation>}
     */
    async getInvitationById(invitationId: string): Promise<Invitation> {
        try {
            await this.ensureInitialized()
            
            const invitation = await this.invitationRepository!.findOne({
                where: { id: invitationId } as any,
                relations: ['organization', 'workspace']
            })
            
            if (!invitation) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, `Invitation with ID ${invitationId} not found`)
            }
            
            return invitation
        } catch (error) {
            logger.error(`[InvitationService] Get invitation by ID error: ${error}`)
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: invitationService.getInvitationById - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Get invitation by token
     * @param {string} token - Invitation token
     * @returns {Promise<Invitation>}
     */
    async getInvitationByToken(token: string): Promise<Invitation> {
        try {
            await this.ensureInitialized()
            
            const invitation = await this.invitationRepository!.findOne({
                where: { token } as any,
                relations: ['organization', 'workspace']
            })
            
            if (!invitation) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, `Invitation with token ${token} not found`)
            }
            
            return invitation
        } catch (error) {
            logger.error(`[InvitationService] Get invitation by token error: ${error}`)
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: invitationService.getInvitationByToken - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Get invitation by email for an organization
     * @param {string} organizationId - Organization ID
     * @param {string} email - User email
     * @returns {Promise<Invitation>}
     */
    async getOrganizationInvitationByEmail(organizationId: string, email: string): Promise<Invitation> {
        try {
            await this.ensureInitialized()
            
            const invitation = await this.invitationRepository!.findOne({
                where: {
                    organizationId,
                    email,
                    workspaceId: null
                } as any,
                relations: ['organization']
            })
            
            if (!invitation) {
                throw new InternalFastflowError(
                    StatusCodes.NOT_FOUND, 
                    `Invitation for email ${email} in organization ${organizationId} not found`
                )
            }
            
            return invitation
        } catch (error) {
            logger.error(`[InvitationService] Get organization invitation by email error: ${error}`)
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: invitationService.getOrganizationInvitationByEmail - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Get invitation by email for a workspace
     * @param {string} workspaceId - Workspace ID
     * @param {string} email - User email
     * @returns {Promise<Invitation>}
     */
    async getWorkspaceInvitationByEmail(workspaceId: string, email: string): Promise<Invitation> {
        try {
            await this.ensureInitialized()
            
            const invitation = await this.invitationRepository!.findOne({
                where: {
                    workspaceId,
                    email
                } as any,
                relations: ['organization', 'workspace']
            })
            
            if (!invitation) {
                throw new InternalFastflowError(
                    StatusCodes.NOT_FOUND, 
                    `Invitation for email ${email} in workspace ${workspaceId} not found`
                )
            }
            
            return invitation
        } catch (error) {
            logger.error(`[InvitationService] Get workspace invitation by email error: ${error}`)
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: invitationService.getWorkspaceInvitationByEmail - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Create a new invitation
     * @param {Partial<Invitation>} invitationData - Invitation data
     * @returns {Promise<Invitation>}
     */
    async createInvitation(invitationData: Partial<Invitation>): Promise<Invitation> {
        try {
            await this.ensureInitialized()
            
            // Validate required fields
            if (!invitationData.email) {
                throw new InternalFastflowError(StatusCodes.BAD_REQUEST, 'Email is required')
            }
            
            if (!invitationData.organizationId) {
                throw new InternalFastflowError(StatusCodes.BAD_REQUEST, 'Organization ID is required')
            }
            
            // Check if organization exists
            const organization = await this.organizationRepository!.findOne({
                where: { id: invitationData.organizationId } as any
            })
            
            if (!organization) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, 'Organization not found')
            }
            
            // If workspaceId is provided, check if workspace exists and belongs to the organization
            if (invitationData.workspaceId) {
                const workspace = await this.workspaceRepository!.findOne({
                    where: { id: invitationData.workspaceId } as any
                })
                
                if (!workspace) {
                    throw new InternalFastflowError(StatusCodes.NOT_FOUND, 'Workspace not found')
                }
                
                if (workspace.organizationId !== invitationData.organizationId) {
                    throw new InternalFastflowError(
                        StatusCodes.BAD_REQUEST,
                        'Workspace does not belong to the specified organization'
                    )
                }
            }
            
            // Set default values
            if (!invitationData.role) {
                invitationData.role = 'member'
            }
            
            if (!invitationData.token) {
                invitationData.token = uuidv4()
            }
            
            if (!invitationData.status) {
                invitationData.status = 'pending'
            }
            
            if (!invitationData.expiresAt) {
                const expiresAt = new Date()
                expiresAt.setDate(expiresAt.getDate() + 7) // Expire in 7 days
                invitationData.expiresAt = expiresAt
            }
            
            // Create the invitation
            const newInvitation = this.invitationRepository!.create(invitationData)
            await this.invitationRepository!.save(newInvitation)
            
            // Return the complete invitation with relations
            return this.getInvitationById(newInvitation.id)
        } catch (error) {
            logger.error(`[InvitationService] Create invitation error: ${error}`)
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: invitationService.createInvitation - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Update an invitation
     * @param {string} invitationId - Invitation ID
     * @param {Partial<Invitation>} updateData - Update data
     * @returns {Promise<Invitation>}
     */
    async updateInvitation(invitationId: string, updateData: Partial<Invitation>): Promise<Invitation> {
        try {
            await this.ensureInitialized()
            
            // Get the invitation
            const invitation = await this.getInvitationById(invitationId)
            
            // Apply updates
            Object.keys(updateData).forEach(key => {
                // Skip id, organizationId, workspaceId, and readonly fields
                if (key !== 'id' && key !== 'organizationId' && key !== 'workspaceId') {
                    (invitation as any)[key] = (updateData as any)[key]
                }
            })
            
            // Save the updated invitation
            await this.invitationRepository!.save(invitation)
            
            // Return the updated invitation with relations
            return this.getInvitationById(invitationId)
        } catch (error) {
            logger.error(`[InvitationService] Update invitation error: ${error}`)
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: invitationService.updateInvitation - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Cancel an invitation
     * @param {string} invitationId - Invitation ID
     * @returns {Promise<void>}
     */
    async cancelInvitation(invitationId: string): Promise<void> {
        try {
            await this.ensureInitialized()
            
            // Verify invitation exists
            await this.getInvitationById(invitationId)
            
            // Update status to canceled
            await this.invitationRepository!.update(invitationId, { status: 'canceled' })
        } catch (error) {
            logger.error(`[InvitationService] Cancel invitation error: ${error}`)
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: invitationService.cancelInvitation - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Resend an invitation
     * @param {string} invitationId - Invitation ID
     * @returns {Promise<Invitation>}
     */
    async resendInvitation(invitationId: string): Promise<Invitation> {
        try {
            await this.ensureInitialized()
            
            // Get the invitation
            const invitation = await this.getInvitationById(invitationId)
            
            // Check if the invitation is still pending
            if (invitation.status !== 'pending') {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Can only resend pending invitations'
                )
            }
            
            // Reset expiration date
            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + 7) // Expire in 7 days
            
            return this.updateInvitation(invitationId, { expiresAt })
        } catch (error) {
            logger.error(`[InvitationService] Resend invitation error: ${error}`)
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: invitationService.resendInvitation - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Accept an invitation
     * @param {string} token - Invitation token
     * @param {string} userId - User ID
     * @returns {Promise<void>}
     */
    async acceptInvitation(token: string, userId: string): Promise<void> {
        try {
            await this.ensureInitialized()
            
            // Get the invitation
            const invitation = await this.getInvitationByToken(token)
            
            // Check if invitation is still valid
            if (invitation.status !== 'pending') {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Invitation has already been used or canceled'
                )
            }
            
            // Check if invitation has expired
            if (new Date() > invitation.expiresAt) {
                throw new InternalFastflowError(StatusCodes.BAD_REQUEST, 'Invitation has expired')
            }
            
            // Check if user exists
            const user = await this.userProfileRepository!.findOne({
                where: { id: userId } as any
            })
            
            if (!user) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, 'User not found')
            }
            
            // Determine invitation type and add user to organization/workspace
            if (invitation.invitationType === 'organization') {
                // Check if user is already a member of the organization
                const existingMembership = await this.organizationMemberRepository!.findOne({
                    where: {
                        organizationId: invitation.organizationId,
                        userId
                    } as any
                })
                
                if (!existingMembership) {
                    // Add user to organization
                    const orgMember = this.organizationMemberRepository!.create({
                        organizationId: invitation.organizationId,
                        userId,
                        role: invitation.role
                    })
                    
                    await this.organizationMemberRepository!.save(orgMember)
                }
            } else {
                // This is a workspace invitation
                
                // Check if user is already a member of the organization
                let orgMembership = await this.organizationMemberRepository!.findOne({
                    where: {
                        organizationId: invitation.organizationId,
                        userId
                    } as any
                })
                
                if (!orgMembership) {
                    // Add user to organization first (with basic member role)
                    const orgMember = this.organizationMemberRepository!.create({
                        organizationId: invitation.organizationId,
                        userId,
                        role: 'member'
                    })
                    
                    await this.organizationMemberRepository!.save(orgMember)
                }
                
                // Check if user is already a member of the workspace
                if (invitation.workspaceId) { // TypeScript guard
                    const existingWorkspaceMembership = await this.workspaceMemberRepository!.findOne({
                        where: {
                            workspaceId: invitation.workspaceId,
                            userId
                        } as any
                    })
                    
                    if (!existingWorkspaceMembership) {
                        // Add user to workspace
                        const workspaceMember = this.workspaceMemberRepository!.create({
                            workspaceId: invitation.workspaceId,
                            userId,
                            role: invitation.role
                        })
                        
                        await this.workspaceMemberRepository!.save(workspaceMember)
                    }
                }
            }
            
            // Mark invitation as accepted
            await this.updateInvitation(invitation.id, { status: 'accepted' })
        } catch (error) {
            logger.error(`[InvitationService] Accept invitation error: ${error}`)
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: invitationService.acceptInvitation - ${getErrorMessage(error)}`
            )
        }
    }
}

export default new InvitationService()