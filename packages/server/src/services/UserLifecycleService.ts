import { Repository } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../errors/InternalFastflowError'
import logger from '../utils/logger'
import { UserLifecycleState, UserLifecycleStateType } from '../database/entities/UserLifecycleState'
import { ProvisioningAction, ProvisioningActionType, ProvisioningActionStatus } from '../database/entities/ProvisioningAction'
import { ProvisioningRule, ProvisioningRuleType, ProvisioningRuleTrigger, ProvisioningRuleStatus } from '../database/entities/ProvisioningRule'
import { UserProfile } from '../database/entities/UserProfile'
import { UserRole } from '../database/entities/UserRole'
import { UserService, UserStatus } from './UserService'
import { UserOrganizationService } from './UserOrganizationService'
import { WorkspaceMemberService } from './WorkspaceMemberService'
import auditLogsService from './audit-logs'
import { getInitializedDataSource } from '../DataSource'

/**
 * User lifecycle event types
 */
export enum UserLifecycleEventType {
    USER_CREATED = 'USER_CREATED',
    USER_INVITED = 'USER_INVITED',
    USER_REGISTERED = 'USER_REGISTERED',
    USER_ACTIVATED = 'USER_ACTIVATED',
    USER_DEACTIVATED = 'USER_DEACTIVATED',
    USER_DELETED = 'USER_DELETED',
    ROLE_ASSIGNED = 'ROLE_ASSIGNED',
    ROLE_REMOVED = 'ROLE_REMOVED',
    ORGANIZATION_JOINED = 'ORGANIZATION_JOINED',
    ORGANIZATION_LEFT = 'ORGANIZATION_LEFT',
    WORKSPACE_JOINED = 'WORKSPACE_JOINED',
    WORKSPACE_LEFT = 'WORKSPACE_LEFT'
}

/**
 * User lifecycle event interface
 */
export interface UserLifecycleEvent {
    type: UserLifecycleEventType;
    userId: string;
    triggeredBy: string;
    metadata?: Record<string, any>;
}

/**
 * Service for managing user lifecycle
 */
export class UserLifecycleService {
    // Repository instances
    private userLifecycleStateRepository: Repository<UserLifecycleState> | null = null
    private provisioningActionRepository: Repository<ProvisioningAction> | null = null
    private provisioningRuleRepository: Repository<ProvisioningRule> | null = null
    private userProfileRepository: Repository<UserProfile> | null = null
    private userRoleRepository: Repository<UserRole> | null = null
    
    // Services
    private userService: UserService
    private userOrganizationService: UserOrganizationService
    private workspaceMemberService: WorkspaceMemberService
    
    // Initialization flag
    private isInitialized: boolean = false

    /**
     * Constructor
     */
    constructor() {
        // Services can be instantiated immediately, they will handle their own lazy initialization
        this.userService = new UserService()
        this.userOrganizationService = new UserOrganizationService()
        this.workspaceMemberService = new WorkspaceMemberService()
        // Repositories will be initialized lazily when needed
    }
    
    /**
     * Initialize repositories lazily to avoid connection issues
     */
    private async ensureInitialized(): Promise<void> {
        if (this.isInitialized) {
            return
        }
        
        try {
            // Get initialized data source
            const dataSource = await getInitializedDataSource()
            
            // Get repositories
            this.userLifecycleStateRepository = dataSource.getRepository(UserLifecycleState)
            this.provisioningActionRepository = dataSource.getRepository(ProvisioningAction)
            this.provisioningRuleRepository = dataSource.getRepository(ProvisioningRule)
            this.userProfileRepository = dataSource.getRepository(UserProfile)
            this.userRoleRepository = dataSource.getRepository(UserRole)
            
            // Mark as initialized
            this.isInitialized = true
        } catch (error) {
            logger.error('Failed to initialize UserLifecycleService repositories', error)
            throw error
        }
    }

    /**
     * Handle user lifecycle event
     * @param event User lifecycle event
     * @returns Promise<void>
     */
    async handleLifecycleEvent(event: UserLifecycleEvent): Promise<void> {
        try {
            logger.info(`[UserLifecycleService] Handling lifecycle event: ${event.type} for user ${event.userId}`)

            // Log the event
            await auditLogsService.logUserAction(
                event.triggeredBy,
                'lifecycle_event',
                'user',
                event.userId,
                { eventType: event.type, metadata: event.metadata }
            )

            // Update user lifecycle state
            await this.updateUserLifecycleState(event)

            // Find applicable rules
            const rules = await this.findApplicableRules(event)

            // Execute rules
            for (const rule of rules) {
                await this.executeRule(rule, event)
            }
        } catch (error: any) {
            logger.error(`[UserLifecycleService] Error handling lifecycle event: ${error.message}`)
            throw error
        }
    }

    /**
     * Update user lifecycle state based on event
     * @param event User lifecycle event
     * @returns Promise<UserLifecycleState>
     */
    private async updateUserLifecycleState(event: UserLifecycleEvent): Promise<UserLifecycleState | undefined> {
        await this.ensureInitialized()
        
        let newState: UserLifecycleStateType | null = null

        // Determine new state based on event type
        switch (event.type) {
            case UserLifecycleEventType.USER_INVITED:
                newState = UserLifecycleStateType.INVITED
                break
            case UserLifecycleEventType.USER_REGISTERED:
                newState = UserLifecycleStateType.REGISTERED
                break
            case UserLifecycleEventType.USER_ACTIVATED:
                newState = UserLifecycleStateType.ACTIVE
                break
            case UserLifecycleEventType.USER_DEACTIVATED:
                newState = UserLifecycleStateType.INACTIVE
                break
            case UserLifecycleEventType.USER_DELETED:
                newState = UserLifecycleStateType.DELETED
                break
            default:
                // Other events don't change the lifecycle state
                return undefined
        }

        if (newState) {
            // Create new lifecycle state record
            const lifecycleState = this.userLifecycleStateRepository!.create({
                userId: event.userId,
                state: newState,
                changedBy: event.triggeredBy,
                metadata: event.metadata
            })

            return await this.userLifecycleStateRepository!.save(lifecycleState)
        }

        return undefined
    }

    /**
     * Find rules applicable to the event
     * @param event User lifecycle event
     * @returns Promise<ProvisioningRule[]>
     */
    private async findApplicableRules(event: UserLifecycleEvent): Promise<ProvisioningRule[]> {
        await this.ensureInitialized()
        
        // Find rules triggered by events
        const rules = await this.provisioningRuleRepository!.find({
            where: {
                trigger: ProvisioningRuleTrigger.EVENT,
                status: ProvisioningRuleStatus.ACTIVE
            }
        })

        // Filter rules based on conditions
        return rules.filter((rule: ProvisioningRule) => {
            // Check if rule applies to this event type
            if (rule.conditions.eventTypes && !rule.conditions.eventTypes.includes(event.type)) {
                return false
            }

            // Check organization condition if present
            if (rule.conditions.organizationId && event.metadata?.organizationId) {
                if (rule.conditions.organizationId !== event.metadata.organizationId) {
                    return false
                }
            }

            // Check workspace condition if present
            if (rule.conditions.workspaceId && event.metadata?.workspaceId) {
                if (rule.conditions.workspaceId !== event.metadata.workspaceId) {
                    return false
                }
            }

            // Check role condition if present
            if (rule.conditions.roleId && event.metadata?.roleId) {
                if (rule.conditions.roleId !== event.metadata.roleId) {
                    return false
                }
            }

            return true
        })
    }

    /**
     * Execute a provisioning rule
     * @param rule Provisioning rule
     * @param event User lifecycle event
     * @returns Promise<void>
     */
    private async executeRule(rule: ProvisioningRule, event: UserLifecycleEvent): Promise<void> {
        await this.ensureInitialized()
        
        logger.info(`[UserLifecycleService] Executing rule: ${rule.name} for user ${event.userId}`)

        // Create actions for each action defined in the rule
        const actions = Array.isArray(rule.actions) ? rule.actions : Object.values(rule.actions);
        
        for (const actionDef of actions) {
            const action = this.provisioningActionRepository!.create({
                type: actionDef.type,
                parameters: actionDef.parameters,
                targetUserId: event.userId,
                ruleId: rule.id,
                status: actionDef.requiresApproval ? ProvisioningActionStatus.REQUIRES_APPROVAL : ProvisioningActionStatus.PENDING,
                initiatedBy: event.triggeredBy
            })

            await this.provisioningActionRepository!.save(action)

            // If action doesn't require approval, execute it immediately
            if (!actionDef.requiresApproval) {
                await this.executeAction(action)
            }
        }
    }

    /**
     * Execute a provisioning action
     * @param action Provisioning action
     * @returns Promise<ProvisioningAction>
     */
    async executeAction(action: ProvisioningAction): Promise<ProvisioningAction> {
        await this.ensureInitialized()
        
        try {
            // Update action status to in progress
            action.status = ProvisioningActionStatus.IN_PROGRESS
            await this.provisioningActionRepository!.save(action)

            // Execute action based on type
            switch (action.type) {
                case ProvisioningActionType.USER_ACTIVATION:
                    await this.executeUserActivationAction(action)
                    break
                case ProvisioningActionType.USER_DEACTIVATION:
                    await this.executeUserDeactivationAction(action)
                    break
                case ProvisioningActionType.ROLE_ASSIGNMENT:
                    await this.executeRoleAssignmentAction(action)
                    break
                case ProvisioningActionType.ROLE_REMOVAL:
                    await this.executeRoleRemovalAction(action)
                    break
                case ProvisioningActionType.ORGANIZATION_ASSIGNMENT:
                    await this.executeOrganizationAssignmentAction(action)
                    break
                case ProvisioningActionType.ORGANIZATION_REMOVAL:
                    await this.executeOrganizationRemovalAction(action)
                    break
                case ProvisioningActionType.WORKSPACE_ASSIGNMENT:
                    await this.executeWorkspaceAssignmentAction(action)
                    break
                case ProvisioningActionType.WORKSPACE_REMOVAL:
                    await this.executeWorkspaceRemovalAction(action)
                    break
                case ProvisioningActionType.NOTIFICATION:
                    await this.executeNotificationAction(action)
                    break
                default:
                    throw new InternalFastflowError(
                        StatusCodes.BAD_REQUEST,
                        `Unsupported action type: ${action.type}`
                    )
            }

            // Update action status to completed
            action.status = ProvisioningActionStatus.COMPLETED
            action.completedAt = new Date()
            await this.provisioningActionRepository!.save(action)

            return action
        } catch (error: any) {
            // Update action status to failed
            action.status = ProvisioningActionStatus.FAILED
            action.statusMessage = error.message
            await this.provisioningActionRepository!.save(action)

            logger.error(`[UserLifecycleService] Error executing action: ${error.message}`)
            throw error
        }
    }

    /**
     * Execute user activation action
     * @param action Provisioning action
     * @returns Promise<void>
     */
    private async executeUserActivationAction(action: ProvisioningAction): Promise<void> {
        await this.ensureInitialized()
        await this.userService.updateUserStatus(action.targetUserId, UserStatus.ACTIVE)
    }

    /**
     * Execute user deactivation action
     * @param action Provisioning action
     * @returns Promise<void>
     */
    private async executeUserDeactivationAction(action: ProvisioningAction): Promise<void> {
        await this.ensureInitialized()
        await this.userService.updateUserStatus(action.targetUserId, UserStatus.INACTIVE)
    }

    /**
     * Execute role assignment action
     * @param action Provisioning action
     * @returns Promise<void>
     */
    private async executeRoleAssignmentAction(action: ProvisioningAction): Promise<void> {
        await this.ensureInitialized()
        
        const { roleId, workspaceId } = action.parameters

        // Create user role
        const userRole = this.userRoleRepository!.create({
            userId: action.targetUserId,
            roleId,
            workspaceId: workspaceId || null
        })

        await this.userRoleRepository!.save(userRole)
    }

    /**
     * Execute role removal action
     * @param action Provisioning action
     * @returns Promise<void>
     */
    private async executeRoleRemovalAction(action: ProvisioningAction): Promise<void> {
        await this.ensureInitialized()
        
        const { roleId, workspaceId } = action.parameters

        // Find user role
        const userRole = await this.userRoleRepository!.findOne({
            where: {
                userId: action.targetUserId,
                roleId,
                workspaceId: workspaceId || null
            }
        })

        if (userRole) {
            await this.userRoleRepository!.remove(userRole)
        }
    }

    /**
     * Execute organization assignment action
     * @param action Provisioning action
     * @returns Promise<void>
     */
    private async executeOrganizationAssignmentAction(action: ProvisioningAction): Promise<void> {
        const { organizationId, role } = action.parameters
        await this.userOrganizationService.addUserToOrganization(
            action.targetUserId,
            organizationId,
            role || 'member'
        )
    }

    /**
     * Execute organization removal action
     * @param action Provisioning action
     * @returns Promise<void>
     */
    private async executeOrganizationRemovalAction(action: ProvisioningAction): Promise<void> {
        const { organizationId } = action.parameters
        await this.userOrganizationService.removeUserFromOrganization(
            action.targetUserId,
            organizationId
        )
    }

    /**
     * Execute workspace assignment action
     * @param action Provisioning action
     * @returns Promise<void>
     */
    private async executeWorkspaceAssignmentAction(action: ProvisioningAction): Promise<void> {
        const { workspaceId, role } = action.parameters
        await this.workspaceMemberService.addUserToWorkspace(
            action.targetUserId,
            workspaceId,
            role || 'member'
        )
    }

    /**
     * Execute workspace removal action
     * @param action Provisioning action
     * @returns Promise<void>
     */
    private async executeWorkspaceRemovalAction(action: ProvisioningAction): Promise<void> {
        const { workspaceId } = action.parameters
        await this.workspaceMemberService.removeUserFromWorkspace(
            action.targetUserId,
            workspaceId
        )
    }

    /**
     * Execute notification action
     * @param action Provisioning action
     * @returns Promise<void>
     */
    private async executeNotificationAction(action: ProvisioningAction): Promise<void> {
        // This is a placeholder for sending notifications
        // In a real implementation, this would integrate with a notification system
        logger.info(`[UserLifecycleService] Notification: ${action.parameters.message} for user ${action.targetUserId}`)
    }

    /**
     * Get user lifecycle state history
     * @param userId User ID
     * @returns Promise<UserLifecycleState[]>
     */
    async getUserLifecycleStateHistory(userId: string): Promise<UserLifecycleState[]> {
        try {
            await this.ensureInitialized()
            
            return await this.userLifecycleStateRepository!.find({
                where: { userId },
                order: { createdAt: 'DESC' }
            })
        } catch (error: any) {
            logger.error(`[UserLifecycleService] Error getting user lifecycle state history: ${error.message}`)
            throw error
        }
    }

    /**
     * Get user's current lifecycle state
     * @param userId User ID
     * @returns Promise<UserLifecycleState>
     */
    async getUserCurrentLifecycleState(userId: string): Promise<UserLifecycleState | undefined> {
        try {
            await this.ensureInitialized()
            
            const states = await this.userLifecycleStateRepository!.find({
                where: { userId },
                order: { createdAt: 'DESC' },
                take: 1
            })

            return states.length > 0 ? states[0] : undefined
        } catch (error: any) {
            logger.error(`[UserLifecycleService] Error getting user current lifecycle state: ${error.message}`)
            throw error
        }
    }

    /**
     * Get provisioning actions for a user
     * @param userId User ID
     * @param status Optional status filter
     * @returns Promise<ProvisioningAction[]>
     */
    async getUserProvisioningActions(userId: string, status?: ProvisioningActionStatus): Promise<ProvisioningAction[]> {
        try {
            await this.ensureInitialized()
            
            const query: any = { targetUserId: userId }
            
            if (status) {
                query.status = status
            }

            return await this.provisioningActionRepository!.find({
                where: query,
                order: { createdAt: 'DESC' }
            })
        } catch (error: any) {
            logger.error(`[UserLifecycleService] Error getting user provisioning actions: ${error.message}`)
            throw error
        }
    }

    /**
     * Get pending approval actions
     * @returns Promise<ProvisioningAction[]>
     */
    async getPendingApprovalActions(): Promise<ProvisioningAction[]> {
        try {
            await this.ensureInitialized()
            
            return await this.provisioningActionRepository!.find({
                where: { status: ProvisioningActionStatus.REQUIRES_APPROVAL },
                order: { createdAt: 'ASC' }
            })
        } catch (error: any) {
            logger.error(`[UserLifecycleService] Error getting pending approval actions: ${error.message}`)
            throw error
        }
    }

    /**
     * Approve a provisioning action
     * @param actionId Action ID
     * @param approvedBy User ID of the approver
     * @returns Promise<ProvisioningAction>
     */
    async approveAction(actionId: string, approvedBy: string): Promise<ProvisioningAction> {
        try {
            await this.ensureInitialized()
            
            const action = await this.provisioningActionRepository!.findOne({
                where: { id: actionId }
            })

            if (!action) {
                throw new InternalFastflowError(
                    StatusCodes.NOT_FOUND,
                    `Provisioning action with ID ${actionId} not found`
                )
            }

            if (action.status !== ProvisioningActionStatus.REQUIRES_APPROVAL) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    `Action is not in a state that requires approval`
                )
            }

            // Update action status
            action.status = ProvisioningActionStatus.APPROVED
            action.approvedBy = approvedBy
            action.approvalDate = new Date()
            await this.provisioningActionRepository!.save(action)

            // Execute the action
            return await this.executeAction(action)
        } catch (error: any) {
            logger.error(`[UserLifecycleService] Error approving action: ${error.message}`)
            throw error
        }
    }

    /**
     * Reject a provisioning action
     * @param actionId Action ID
     * @param rejectedBy User ID of the rejector
     * @param reason Rejection reason
     * @returns Promise<ProvisioningAction>
     */
    async rejectAction(actionId: string, rejectedBy: string, reason: string): Promise<ProvisioningAction> {
        try {
            await this.ensureInitialized()
            
            const action = await this.provisioningActionRepository!.findOne({
                where: { id: actionId }
            })

            if (!action) {
                throw new InternalFastflowError(
                    StatusCodes.NOT_FOUND,
                    `Provisioning action with ID ${actionId} not found`
                )
            }

            if (action.status !== ProvisioningActionStatus.REQUIRES_APPROVAL) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    `Action is not in a state that requires approval`
                )
            }

            // Update action status
            action.status = ProvisioningActionStatus.REJECTED
            action.approvedBy = rejectedBy
            action.approvalDate = new Date()
            action.statusMessage = reason
            await this.provisioningActionRepository!.save(action)

            return action
        } catch (error: any) {
            logger.error(`[UserLifecycleService] Error rejecting action: ${error.message}`)
            throw error
        }
    }

    /**
     * Create a provisioning rule
     * @param ruleData Rule data
     * @returns Promise<ProvisioningRule>
     */
    async createProvisioningRule(ruleData: Partial<ProvisioningRule>): Promise<ProvisioningRule> {
        try {
            await this.ensureInitialized()
            
            // Validate required fields
            if (!ruleData.name) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Rule name is required'
                )
            }

            if (!ruleData.type) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Rule type is required'
                )
            }

            if (!ruleData.trigger) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Rule trigger is required'
                )
            }

            if (!ruleData.conditions) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Rule conditions are required'
                )
            }

            if (!ruleData.actions || !Array.isArray(ruleData.actions) || ruleData.actions.length === 0) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Rule must have at least one action'
                )
            }

            // Create the rule
            const rule = this.provisioningRuleRepository!.create(ruleData)
            return await this.provisioningRuleRepository!.save(rule)
        } catch (error: any) {
            logger.error(`[UserLifecycleService] Error creating provisioning rule: ${error.message}`)
            throw error
        }
    }

    /**
     * Get all provisioning rules
     * @param filters Optional filters
     * @returns Promise<ProvisioningRule[]>
     */
    async getAllProvisioningRules(filters: any = {}): Promise<ProvisioningRule[]> {
        try {
            await this.ensureInitialized()
            
            const query: any = {}

            if (filters.type) {
                query.type = filters.type
            }

            if (filters.trigger) {
                query.trigger = filters.trigger
            }

            if (filters.status) {
                query.status = filters.status
            }

            if (filters.organizationId) {
                query.organizationId = filters.organizationId
            }

            if (filters.workspaceId) {
                query.workspaceId = filters.workspaceId
            }

            return await this.provisioningRuleRepository!.find({
                where: query,
                order: { createdAt: 'DESC' }
            })
        } catch (error: any) {
            logger.error(`[UserLifecycleService] Error getting provisioning rules: ${error.message}`)
            throw error
        }
    }

    /**
     * Get a provisioning rule by ID
     * @param ruleId Rule ID
     * @returns Promise<ProvisioningRule>
     */
    async getProvisioningRuleById(ruleId: string): Promise<ProvisioningRule> {
        try {
            await this.ensureInitialized()
            
            const rule = await this.provisioningRuleRepository!.findOne({
                where: { id: ruleId }
            })

            if (!rule) {
                throw new InternalFastflowError(
                    StatusCodes.NOT_FOUND,
                    `Provisioning rule with ID ${ruleId} not found`
                )
            }

            return rule
        } catch (error: any) {
            logger.error(`[UserLifecycleService] Error getting provisioning rule: ${error.message}`)
            throw error
        }
    }

    /**
     * Update a provisioning rule
     * @param ruleId Rule ID
     * @param updateData Update data
     * @returns Promise<ProvisioningRule>
     */
    async updateProvisioningRule(ruleId: string, updateData: Partial<ProvisioningRule>): Promise<ProvisioningRule> {
        try {
            await this.ensureInitialized()
            
            const rule = await this.getProvisioningRuleById(ruleId)

            // Update fields
            Object.assign(rule, updateData)

            return await this.provisioningRuleRepository!.save(rule)
        } catch (error: any) {
            logger.error(`[UserLifecycleService] Error updating provisioning rule: ${error.message}`)
            throw error
        }
    }

    /**
     * Delete a provisioning rule
     * @param ruleId Rule ID
     * @returns Promise<boolean>
     */
    async deleteProvisioningRule(ruleId: string): Promise<boolean> {
        try {
            await this.ensureInitialized()
            
            const rule = await this.getProvisioningRuleById(ruleId)
            await this.provisioningRuleRepository!.remove(rule)
            return true
        } catch (error: any) {
            logger.error(`[UserLifecycleService] Error deleting provisioning rule: ${error.message}`)
            throw error
        }
    }
}

export default new UserLifecycleService()