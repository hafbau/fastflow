import { getRepository } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../errors/InternalFastflowError'
import logger from '../utils/logger'
import { AccessReview, AccessReviewStatus, AccessReviewType, AccessReviewScope } from '../database/entities/AccessReview'
import { AccessReviewItem, AccessReviewItemStatus, AccessReviewItemType } from '../database/entities/AccessReviewItem'
import { AccessReviewAction, AccessReviewActionType, AccessReviewActionStatus } from '../database/entities/AccessReviewAction'
import { AccessReviewSchedule, AccessReviewFrequency, AccessReviewScheduleStatus } from '../database/entities/AccessReviewSchedule'
import { UserProfile } from '../database/entities/UserProfile'
import { Role } from '../database/entities/Role'
import { UserRole } from '../database/entities/UserRole'
import { ResourcePermission } from '../database/entities/ResourcePermission'
import { Organization } from '../database/entities/Organization'
import { Workspace } from '../database/entities/Workspace'
import rolesPermissionsService from './RolesPermissionsService'
import auditLogsService from './audit-logs'

/**
 * Service for managing access reviews
 */
export class AccessReviewService {
    private accessReviewRepository: any
    private accessReviewItemRepository: any
    private accessReviewActionRepository: any
    private accessReviewScheduleRepository: any
    private userProfileRepository: any
    private userRoleRepository: any
    private resourcePermissionRepository: any
    private organizationRepository: any
    private workspaceRepository: any

    constructor() {
        this.accessReviewRepository = getRepository(AccessReview)
        this.accessReviewItemRepository = getRepository(AccessReviewItem)
        this.accessReviewActionRepository = getRepository(AccessReviewAction)
        this.accessReviewScheduleRepository = getRepository(AccessReviewSchedule)
        this.userProfileRepository = getRepository(UserProfile)
        this.userRoleRepository = getRepository(UserRole)
        this.resourcePermissionRepository = getRepository(ResourcePermission)
        this.organizationRepository = getRepository(Organization)
        this.workspaceRepository = getRepository(Workspace)
    }

    /**
     * Create a new access review
     * @param reviewData The access review data
     * @returns The created access review
     */
    async createAccessReview(reviewData: Partial<AccessReview>): Promise<AccessReview> {
        try {
            // Validate required fields
            if (!reviewData.name) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Access review name is required'
                )
            }

            if (!reviewData.createdBy) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Created by user ID is required'
                )
            }

            // Validate organization or workspace exists if provided
            if (reviewData.organizationId) {
                const organization = await this.organizationRepository.findOne(reviewData.organizationId)
                if (!organization) {
                    throw new InternalFastflowError(
                        StatusCodes.BAD_REQUEST,
                        `Organization with ID ${reviewData.organizationId} not found`
                    )
                }
            }

            if (reviewData.workspaceId) {
                const workspace = await this.workspaceRepository.findOne(reviewData.workspaceId)
                if (!workspace) {
                    throw new InternalFastflowError(
                        StatusCodes.BAD_REQUEST,
                        `Workspace with ID ${reviewData.workspaceId} not found`
                    )
                }
            }

            // Create the access review
            const accessReview = this.accessReviewRepository.create({
                ...reviewData,
                status: reviewData.status || AccessReviewStatus.PENDING,
                type: reviewData.type || AccessReviewType.AD_HOC,
                scope: reviewData.scope || AccessReviewScope.ORGANIZATION
            })

            const savedReview = await this.accessReviewRepository.save(accessReview)

            // Log the creation
            await auditLogsService.logUserAction(
                reviewData.createdBy,
                'create',
                'access_review',
                savedReview.id,
                { reviewName: savedReview.name }
            )

            return savedReview
        } catch (error: any) {
            logger.error(`[AccessReviewService] Create access review error: ${error.message}`)
            throw error
        }
    }

    /**
     * Get all access reviews
     * @param filters Optional filters
     * @returns List of access reviews
     */
    async getAllAccessReviews(filters: any = {}): Promise<AccessReview[]> {
        try {
            const query: any = {}

            if (filters.status) {
                query.status = filters.status
            }

            if (filters.type) {
                query.type = filters.type
            }

            if (filters.organizationId) {
                query.organizationId = filters.organizationId
            }

            if (filters.workspaceId) {
                query.workspaceId = filters.workspaceId
            }

            if (filters.assignedTo) {
                query.assignedTo = filters.assignedTo
            }

            const accessReviews = await this.accessReviewRepository.find({
                where: query,
                order: {
                    createdAt: 'DESC'
                }
            })

            return accessReviews
        } catch (error: any) {
            logger.error(`[AccessReviewService] Get all access reviews error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to get access reviews'
            )
        }
    }

    /**
     * Get an access review by ID
     * @param id The access review ID
     * @returns The access review
     */
    async getAccessReviewById(id: string): Promise<AccessReview> {
        try {
            const accessReview = await this.accessReviewRepository.findOne(id, {
                relations: ['items', 'items.actions']
            })

            if (!accessReview) {
                throw new InternalFastflowError(
                    StatusCodes.NOT_FOUND,
                    `Access review with ID ${id} not found`
                )
            }

            return accessReview
        } catch (error: any) {
            logger.error(`[AccessReviewService] Get access review by ID error: ${error.message}`)
            if (error instanceof InternalFastflowError) {
                throw error
            }
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to get access review'
            )
        }
    }

    /**
     * Update an access review
     * @param id The access review ID
     * @param updateData The update data
     * @param userId The user ID performing the update
     * @returns The updated access review
     */
    async updateAccessReview(id: string, updateData: Partial<AccessReview>, userId: string): Promise<AccessReview> {
        try {
            const accessReview = await this.getAccessReviewById(id)

            // Update fields
            Object.assign(accessReview, updateData)

            // If status is being changed to completed, set completedDate
            if (updateData.status === AccessReviewStatus.COMPLETED && accessReview.status !== AccessReviewStatus.COMPLETED) {
                accessReview.completedDate = new Date()
            }

            const updatedReview = await this.accessReviewRepository.save(accessReview)

            // Log the update
            await auditLogsService.logUserAction(
                userId,
                'update',
                'access_review',
                id,
                { reviewName: updatedReview.name, updatedFields: Object.keys(updateData) }
            )

            return updatedReview
        } catch (error: any) {
            logger.error(`[AccessReviewService] Update access review error: ${error.message}`)
            if (error instanceof InternalFastflowError) {
                throw error
            }
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to update access review'
            )
        }
    }

    /**
     * Delete an access review
     * @param id The access review ID
     * @param userId The user ID performing the deletion
     * @returns True if successful
     */
    async deleteAccessReview(id: string, userId: string): Promise<boolean> {
        try {
            const accessReview = await this.getAccessReviewById(id)

            // Log the deletion
            await auditLogsService.logUserAction(
                userId,
                'delete',
                'access_review',
                id,
                { reviewName: accessReview.name }
            )

            await this.accessReviewRepository.remove(accessReview)
            return true
        } catch (error: any) {
            logger.error(`[AccessReviewService] Delete access review error: ${error.message}`)
            if (error instanceof InternalFastflowError) {
                throw error
            }
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to delete access review'
            )
        }
    }

    /**
     * Generate review items for an access review
     * @param reviewId The access review ID
     * @param options Generation options
     * @param userId The user ID performing the generation
     * @returns The number of items generated
     */
    async generateReviewItems(
        reviewId: string,
        options: {
            includeUserRoles?: boolean;
            includeResourcePermissions?: boolean;
            includeDormantAccounts?: boolean;
            includeExcessivePermissions?: boolean;
            lastLoginThresholdDays?: number;
        },
        userId: string
    ): Promise<number> {
        try {
            const accessReview = await this.getAccessReviewById(reviewId)
            let itemsGenerated = 0

            // Generate user role review items
            if (options.includeUserRoles !== false) {
                const userRoleItems = await this.generateUserRoleReviewItems(accessReview)
                itemsGenerated += userRoleItems
            }

            // Generate resource permission review items
            if (options.includeResourcePermissions !== false) {
                const resourcePermissionItems = await this.generateResourcePermissionReviewItems(accessReview)
                itemsGenerated += resourcePermissionItems
            }

            // Generate dormant account review items
            if (options.includeDormantAccounts === true) {
                const dormantAccountItems = await this.generateDormantAccountReviewItems(
                    accessReview,
                    options.lastLoginThresholdDays || 90
                )
                itemsGenerated += dormantAccountItems
            }

            // Generate excessive permission review items
            if (options.includeExcessivePermissions === true) {
                const excessivePermissionItems = await this.generateExcessivePermissionReviewItems(accessReview)
                itemsGenerated += excessivePermissionItems
            }

            // Update the review status to in progress
            await this.updateAccessReview(
                reviewId,
                { status: AccessReviewStatus.IN_PROGRESS, startDate: new Date() },
                userId
            )

            // Log the item generation
            await auditLogsService.logUserAction(
                userId,
                'generate_items',
                'access_review',
                reviewId,
                { reviewName: accessReview.name, itemsGenerated }
            )

            return itemsGenerated
        } catch (error: any) {
            logger.error(`[AccessReviewService] Generate review items error: ${error.message}`)
            if (error instanceof InternalFastflowError) {
                throw error
            }
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to generate review items'
            )
        }
    }

    /**
     * Generate user role review items
     * @param accessReview The access review
     * @returns The number of items generated
     */
    private async generateUserRoleReviewItems(accessReview: AccessReview): Promise<number> {
        let query: any = {}

        // Filter by organization or workspace if specified
        if (accessReview.scope === AccessReviewScope.ORGANIZATION && accessReview.organizationId) {
            query = { organizationId: accessReview.organizationId, workspaceId: null }
        } else if (accessReview.scope === AccessReviewScope.WORKSPACE && accessReview.workspaceId) {
            query = { workspaceId: accessReview.workspaceId }
        }

        // Get all user roles based on the scope
        const userRoles = await this.userRoleRepository.find({
            where: query,
            relations: ['role']
        })

        // Create review items for each user role
        const reviewItems: AccessReviewItem[] = []

        for (const userRole of userRoles) {
            const reviewItem = this.accessReviewItemRepository.create({
                reviewId: accessReview.id,
                type: AccessReviewItemType.USER_ROLE,
                status: AccessReviewItemStatus.PENDING,
                userId: userRole.userId,
                roleId: userRole.roleId,
                metadata: {
                    roleName: userRole.role?.name,
                    organizationId: userRole.organizationId,
                    workspaceId: userRole.workspaceId
                }
            })

            reviewItems.push(reviewItem)
        }

        if (reviewItems.length > 0) {
            await this.accessReviewItemRepository.save(reviewItems)
        }

        return reviewItems.length
    }

    /**
     * Generate resource permission review items
     * @param accessReview The access review
     * @returns The number of items generated
     */
    private async generateResourcePermissionReviewItems(accessReview: AccessReview): Promise<number> {
        // Get all resource permissions
        const resourcePermissions = await this.resourcePermissionRepository.find()

        // Create review items for each resource permission
        const reviewItems: AccessReviewItem[] = []

        for (const permission of resourcePermissions) {
            const reviewItem = this.accessReviewItemRepository.create({
                reviewId: accessReview.id,
                type: AccessReviewItemType.RESOURCE_PERMISSION,
                status: AccessReviewItemStatus.PENDING,
                userId: permission.userId,
                resourceId: permission.resourceId,
                resourceType: permission.resourceType,
                permission: permission.permission
            })

            reviewItems.push(reviewItem)
        }

        if (reviewItems.length > 0) {
            await this.accessReviewItemRepository.save(reviewItems)
        }

        return reviewItems.length
    }

    /**
     * Generate dormant account review items
     * @param accessReview The access review
     * @param thresholdDays Number of days without login to consider an account dormant
     * @returns The number of items generated
     */
    private async generateDormantAccountReviewItems(accessReview: AccessReview, thresholdDays: number): Promise<number> {
        const thresholdDate = new Date()
        thresholdDate.setDate(thresholdDate.getDate() - thresholdDays)

        // Find users who haven't logged in since the threshold date
        const dormantUsers = await this.userProfileRepository.find({
            where: [
                { lastLogin: null },
                { lastLogin: { $lt: thresholdDate } }
            ]
        })

        // Create review items for each dormant user
        const reviewItems: AccessReviewItem[] = []

        for (const user of dormantUsers) {
            const reviewItem = this.accessReviewItemRepository.create({
                reviewId: accessReview.id,
                type: AccessReviewItemType.DORMANT_ACCOUNT,
                status: AccessReviewItemStatus.PENDING,
                userId: user.id,
                isRisky: true,
                riskReason: `User has not logged in for more than ${thresholdDays} days`,
                metadata: {
                    lastLogin: user.lastLogin,
                    thresholdDays
                }
            })

            reviewItems.push(reviewItem)
        }

        if (reviewItems.length > 0) {
            await this.accessReviewItemRepository.save(reviewItems)
        }

        return reviewItems.length
    }

    /**
     * Generate excessive permission review items
     * @param accessReview The access review
     * @returns The number of items generated
     */
    private async generateExcessivePermissionReviewItems(accessReview: AccessReview): Promise<number> {
        // This is a placeholder for a more sophisticated excessive permission detection algorithm
        // In a real implementation, this would analyze user permissions and identify users with
        // potentially excessive permissions based on various heuristics

        // For now, we'll just identify users with multiple roles as potentially having excessive permissions
        const userRoleCounts = await this.userRoleRepository
            .createQueryBuilder('userRole')
            .select('userRole.userId')
            .addSelect('COUNT(userRole.id)', 'roleCount')
            .groupBy('userRole.userId')
            .having('COUNT(userRole.id) > 1')
            .getRawMany()

        // Create review items for users with multiple roles
        const reviewItems: AccessReviewItem[] = []

        for (const userRoleCount of userRoleCounts) {
            const userId = userRoleCount.userId
            const roleCount = parseInt(userRoleCount.roleCount)

            // Get the user's roles
            const userRoles = await this.userRoleRepository.find({
                where: { userId },
                relations: ['role']
            })

            const roleNames = userRoles.map((ur: UserRole) => ur.role?.name).filter(Boolean)

            const reviewItem = this.accessReviewItemRepository.create({
                reviewId: accessReview.id,
                type: AccessReviewItemType.EXCESSIVE_PERMISSION,
                status: AccessReviewItemStatus.PENDING,
                userId,
                isRisky: true,
                riskReason: `User has ${roleCount} roles which may indicate excessive permissions`,
                metadata: {
                    roleCount,
                    roleNames
                }
            })

            reviewItems.push(reviewItem)
        }

        if (reviewItems.length > 0) {
            await this.accessReviewItemRepository.save(reviewItems)
        }

        return reviewItems.length
    }
/**
     * Get review items for an access review
     * @param reviewId The access review ID
     * @param filters Optional filters
     * @returns List of review items
     */
    async getReviewItems(reviewId: string, filters: any = {}): Promise<AccessReviewItem[]> {
        try {
            const query: any = { reviewId }

            if (filters.status) {
                query.status = filters.status
            }

            if (filters.type) {
                query.type = filters.type
            }

            if (filters.userId) {
                query.userId = filters.userId
            }

            if (filters.isRisky !== undefined) {
                query.isRisky = filters.isRisky
            }

            const reviewItems = await this.accessReviewItemRepository.find({
                where: query,
                relations: ['actions'],
                order: {
                    createdAt: 'DESC'
                }
            })

            return reviewItems
        } catch (error: any) {
            logger.error(`[AccessReviewService] Get review items error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to get review items'
            )
        }
    }

    /**
     * Get a review item by ID
     * @param id The review item ID
     * @returns The review item
     */
    async getReviewItemById(id: string): Promise<AccessReviewItem> {
        try {
            const reviewItem = await this.accessReviewItemRepository.findOne(id, {
                relations: ['actions']
            })

            if (!reviewItem) {
                throw new InternalFastflowError(
                    StatusCodes.NOT_FOUND,
                    `Review item with ID ${id} not found`
                )
            }

            return reviewItem
        } catch (error: any) {
            logger.error(`[AccessReviewService] Get review item by ID error: ${error.message}`)
            if (error instanceof InternalFastflowError) {
                throw error
            }
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to get review item'
            )
        }
    }

    /**
     * Update a review item
     * @param id The review item ID
     * @param updateData The update data
     * @param userId The user ID performing the update
     * @returns The updated review item
     */
    async updateReviewItem(id: string, updateData: Partial<AccessReviewItem>, userId: string): Promise<AccessReviewItem> {
        try {
            const reviewItem = await this.getReviewItemById(id)

            // Update fields
            Object.assign(reviewItem, updateData)

            // If status is being updated, set reviewedBy and reviewedAt
            if (updateData.status && reviewItem.status !== updateData.status) {
                reviewItem.reviewedBy = userId
                reviewItem.reviewedAt = new Date()
            }

            const updatedItem = await this.accessReviewItemRepository.save(reviewItem)

            // Log the update
            await auditLogsService.logUserAction(
                userId,
                'update',
                'access_review_item',
                id,
                { 
                    reviewId: updatedItem.reviewId,
                    status: updatedItem.status,
                    updatedFields: Object.keys(updateData)
                }
            )

            return updatedItem
        } catch (error: any) {
            logger.error(`[AccessReviewService] Update review item error: ${error.message}`)
            if (error instanceof InternalFastflowError) {
                throw error
            }
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to update review item'
            )
        }
    }

    /**
     * Create a review action
     * @param actionData The action data
     * @returns The created action
     */
    async createReviewAction(actionData: Partial<AccessReviewAction>): Promise<AccessReviewAction> {
        try {
            // Validate required fields
            if (!actionData.reviewItemId) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Review item ID is required'
                )
            }

            if (!actionData.type) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Action type is required'
                )
            }

            if (!actionData.performedBy) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Performed by user ID is required'
                )
            }

            // Verify the review item exists
            const reviewItem = await this.getReviewItemById(actionData.reviewItemId)

            // Create the action
            const action = this.accessReviewActionRepository.create({
                ...actionData,
                status: actionData.status || AccessReviewActionStatus.PENDING
            })

            const savedAction = await this.accessReviewActionRepository.save(action)

            // Update the review item status based on the action type
            let newStatus: AccessReviewItemStatus | undefined

            switch (actionData.type) {
                case AccessReviewActionType.APPROVE:
                    newStatus = AccessReviewItemStatus.APPROVED
                    break
                case AccessReviewActionType.REJECT:
                    newStatus = AccessReviewItemStatus.REJECTED
                    break
                case AccessReviewActionType.ESCALATE:
                    newStatus = AccessReviewItemStatus.NEEDS_INVESTIGATION
                    break
            }

            if (newStatus) {
                await this.updateReviewItem(
                    reviewItem.id,
                    { status: newStatus },
                    actionData.performedBy
                )
            }

            // Execute the action if it requires system changes
            if (actionData.status !== AccessReviewActionStatus.PENDING) {
                await this.executeReviewAction(savedAction.id)
            }

            // Log the action creation
            await auditLogsService.logUserAction(
                actionData.performedBy,
                'create',
                'access_review_action',
                savedAction.id,
                { 
                    reviewItemId: savedAction.reviewItemId,
                    actionType: savedAction.type
                }
            )

            return savedAction
        } catch (error: any) {
            logger.error(`[AccessReviewService] Create review action error: ${error.message}`)
            if (error instanceof InternalFastflowError) {
                throw error
            }
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to create review action'
            )
        }
    }

    /**
     * Execute a review action
     * @param actionId The action ID
     * @returns The updated action
     */
    async executeReviewAction(actionId: string): Promise<AccessReviewAction> {
        try {
            const action = await this.accessReviewActionRepository.findOne(actionId, {
                relations: ['reviewItem']
            })

            if (!action) {
                throw new InternalFastflowError(
                    StatusCodes.NOT_FOUND,
                    `Review action with ID ${actionId} not found`
                )
            }

            // Skip if already completed or failed
            if (
                action.status === AccessReviewActionStatus.COMPLETED ||
                action.status === AccessReviewActionStatus.FAILED
            ) {
                return action
            }

            // Execute the action based on its type
            try {
                switch (action.type) {
                    case AccessReviewActionType.REVOKE_ACCESS:
                        await this.executeRevokeAccessAction(action)
                        break
                    case AccessReviewActionType.MODIFY_PERMISSION:
                        await this.executeModifyPermissionAction(action)
                        break
                    case AccessReviewActionType.DEACTIVATE_USER:
                        await this.executeDeactivateUserAction(action)
                        break
                    // Other action types don't require system changes
                    default:
                        break
                }

                // Mark as completed
                action.status = AccessReviewActionStatus.COMPLETED
                action.completedAt = new Date()
            } catch (error: any) {
                // Mark as failed
                action.status = AccessReviewActionStatus.FAILED
                action.errorMessage = error.message
                logger.error(`[AccessReviewService] Execute action error: ${error.message}`)
            }

            return await this.accessReviewActionRepository.save(action)
        } catch (error: any) {
            logger.error(`[AccessReviewService] Execute review action error: ${error.message}`)
            if (error instanceof InternalFastflowError) {
                throw error
            }
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to execute review action'
            )
        }
    }

    /**
     * Execute a revoke access action
     * @param action The review action
     */
    private async executeRevokeAccessAction(action: AccessReviewAction): Promise<void> {
        const reviewItem = action.reviewItem

        if (!reviewItem) {
            throw new Error('Review item not found')
        }

        if (reviewItem.type === AccessReviewItemType.USER_ROLE && reviewItem.roleId) {
            // Revoke role from user
            await this.userRoleRepository.delete({
                userId: reviewItem.userId,
                roleId: reviewItem.roleId
            })
        } else if (reviewItem.type === AccessReviewItemType.RESOURCE_PERMISSION && reviewItem.resourceId) {
            // Revoke resource permission
            await this.resourcePermissionRepository.delete({
                userId: reviewItem.userId,
                resourceId: reviewItem.resourceId,
                resourceType: reviewItem.resourceType,
                permission: reviewItem.permission
            })
        }
    }

    /**
     * Execute a modify permission action
     * @param action The review action
     */
    private async executeModifyPermissionAction(action: AccessReviewAction): Promise<void> {
        // This would implement permission modification logic
        // For now, it's a placeholder
        throw new Error('Modify permission action not implemented')
    }

    /**
     * Execute a deactivate user action
     * @param action The review action
     */
    private async executeDeactivateUserAction(action: AccessReviewAction): Promise<void> {
        const reviewItem = action.reviewItem

        if (!reviewItem) {
            throw new Error('Review item not found')
        }

        // Update user status to inactive
        const userProfile = await this.userProfileRepository.findOne(reviewItem.userId)
        if (!userProfile) {
            throw new Error('User profile not found')
        }

        userProfile.status = 'INACTIVE'
        await this.userProfileRepository.save(userProfile)
    }
/**
     * Create a scheduled access review
     * @param scheduleData The schedule data
     * @returns The created schedule
     */
    async createAccessReviewSchedule(scheduleData: Partial<AccessReviewSchedule>): Promise<AccessReviewSchedule> {
        try {
            // Validate required fields
            if (!scheduleData.name) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Schedule name is required'
                )
            }

            if (!scheduleData.createdBy) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Created by user ID is required'
                )
            }

            if (!scheduleData.assignedTo) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Assigned to user ID is required'
                )
            }

            // Validate organization or workspace exists if provided
            if (scheduleData.organizationId) {
                const organization = await this.organizationRepository.findOne(scheduleData.organizationId)
                if (!organization) {
                    throw new InternalFastflowError(
                        StatusCodes.BAD_REQUEST,
                        `Organization with ID ${scheduleData.organizationId} not found`
                    )
                }
            }

            if (scheduleData.workspaceId) {
                const workspace = await this.workspaceRepository.findOne(scheduleData.workspaceId)
                if (!workspace) {
                    throw new InternalFastflowError(
                        StatusCodes.BAD_REQUEST,
                        `Workspace with ID ${scheduleData.workspaceId} not found`
                    )
                }
            }

            // Calculate next run date based on frequency
            const nextRunAt = this.calculateNextRunDate(
                scheduleData.frequency || AccessReviewFrequency.QUARTERLY
            )

            // Create the schedule
            const schedule = this.accessReviewScheduleRepository.create({
                ...scheduleData,
                status: scheduleData.status || AccessReviewScheduleStatus.ACTIVE,
                frequency: scheduleData.frequency || AccessReviewFrequency.QUARTERLY,
                scope: scheduleData.scope || AccessReviewScope.ORGANIZATION,
                nextRunAt
            })

            const savedSchedule = await this.accessReviewScheduleRepository.save(schedule)

            // Log the creation
            await auditLogsService.logUserAction(
                scheduleData.createdBy,
                'create',
                'access_review_schedule',
                savedSchedule.id,
                { scheduleName: savedSchedule.name }
            )

            return savedSchedule
        } catch (error: any) {
            logger.error(`[AccessReviewService] Create access review schedule error: ${error.message}`)
            if (error instanceof InternalFastflowError) {
                throw error
            }
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to create access review schedule'
            )
        }
    }

    /**
     * Get all access review schedules
     * @param filters Optional filters
     * @returns List of access review schedules
     */
    async getAllAccessReviewSchedules(filters: any = {}): Promise<AccessReviewSchedule[]> {
        try {
            const query: any = {}

            if (filters.status) {
                query.status = filters.status
            }

            if (filters.frequency) {
                query.frequency = filters.frequency
            }

            if (filters.organizationId) {
                query.organizationId = filters.organizationId
            }

            if (filters.workspaceId) {
                query.workspaceId = filters.workspaceId
            }

            if (filters.assignedTo) {
                query.assignedTo = filters.assignedTo
            }

            const schedules = await this.accessReviewScheduleRepository.find({
                where: query,
                order: {
                    createdAt: 'DESC'
                }
            })

            return schedules
        } catch (error: any) {
            logger.error(`[AccessReviewService] Get all access review schedules error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to get access review schedules'
            )
        }
    }

    /**
     * Get an access review schedule by ID
     * @param id The schedule ID
     * @returns The access review schedule
     */
    async getAccessReviewScheduleById(id: string): Promise<AccessReviewSchedule> {
        try {
            const schedule = await this.accessReviewScheduleRepository.findOne(id)

            if (!schedule) {
                throw new InternalFastflowError(
                    StatusCodes.NOT_FOUND,
                    `Access review schedule with ID ${id} not found`
                )
            }

            return schedule
        } catch (error: any) {
            logger.error(`[AccessReviewService] Get access review schedule by ID error: ${error.message}`)
            if (error instanceof InternalFastflowError) {
                throw error
            }
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to get access review schedule'
            )
        }
    }

    /**
     * Update an access review schedule
     * @param id The schedule ID
     * @param updateData The update data
     * @param userId The user ID performing the update
     * @returns The updated schedule
     */
    async updateAccessReviewSchedule(id: string, updateData: Partial<AccessReviewSchedule>, userId: string): Promise<AccessReviewSchedule> {
        try {
            const schedule = await this.getAccessReviewScheduleById(id)

            // Update fields
            Object.assign(schedule, updateData)

            // If frequency is updated, recalculate next run date
            if (updateData.frequency && schedule.frequency !== updateData.frequency) {
                schedule.nextRunAt = this.calculateNextRunDate(updateData.frequency)
            }

            const updatedSchedule = await this.accessReviewScheduleRepository.save(schedule)

            // Log the update
            await auditLogsService.logUserAction(
                userId,
                'update',
                'access_review_schedule',
                id,
                { scheduleName: updatedSchedule.name, updatedFields: Object.keys(updateData) }
            )

            return updatedSchedule
        } catch (error: any) {
            logger.error(`[AccessReviewService] Update access review schedule error: ${error.message}`)
            if (error instanceof InternalFastflowError) {
                throw error
            }
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to update access review schedule'
            )
        }
    }

    /**
     * Delete an access review schedule
     * @param id The schedule ID
     * @param userId The user ID performing the deletion
     * @returns True if successful
     */
    async deleteAccessReviewSchedule(id: string, userId: string): Promise<boolean> {
        try {
            const schedule = await this.getAccessReviewScheduleById(id)

            // Log the deletion
            await auditLogsService.logUserAction(
                userId,
                'delete',
                'access_review_schedule',
                id,
                { scheduleName: schedule.name }
            )

            await this.accessReviewScheduleRepository.remove(schedule)
            return true
        } catch (error: any) {
            logger.error(`[AccessReviewService] Delete access review schedule error: ${error.message}`)
            if (error instanceof InternalFastflowError) {
                throw error
            }
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to delete access review schedule'
            )
        }
    }

    /**
     * Run scheduled access reviews
     * @returns The number of reviews created
     */
    async runScheduledAccessReviews(): Promise<number> {
        try {
            const now = new Date()

            // Find schedules that are due to run
            const dueSchedules = await this.accessReviewScheduleRepository.find({
                where: {
                    status: AccessReviewScheduleStatus.ACTIVE,
                    nextRunAt: { $lte: now }
                }
            })

            let reviewsCreated = 0

            for (const schedule of dueSchedules) {
                // Create a new access review based on the schedule
                const accessReview = await this.createAccessReview({
                    name: `${schedule.name} - ${now.toISOString().split('T')[0]}`,
                    description: `Scheduled review generated from schedule: ${schedule.name}`,
                    type: AccessReviewType.SCHEDULED,
                    scope: schedule.scope,
                    organizationId: schedule.organizationId,
                    workspaceId: schedule.workspaceId,
                    createdBy: schedule.createdBy,
                    assignedTo: schedule.assignedTo,
                    dueDate: this.calculateDueDate(now, schedule.durationDays || 7),
                    settings: schedule.settings
                })

                // Generate review items
                await this.generateReviewItems(
                    accessReview.id,
                    {
                        includeUserRoles: true,
                        includeResourcePermissions: true,
                        includeDormantAccounts: schedule.settings?.includeDormantAccounts || false,
                        includeExcessivePermissions: schedule.settings?.includeExcessivePermissions || false,
                        lastLoginThresholdDays: schedule.settings?.lastLoginThresholdDays || 90
                    },
                    schedule.createdBy
                )

                // Update the schedule's last run and next run dates
                schedule.lastRunAt = now
                schedule.nextRunAt = this.calculateNextRunDate(schedule.frequency, now)
                await this.accessReviewScheduleRepository.save(schedule)

                reviewsCreated++
            }

            return reviewsCreated
        } catch (error: any) {
            logger.error(`[AccessReviewService] Run scheduled access reviews error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to run scheduled access reviews'
            )
        }
    }

    /**
     * Calculate the next run date based on frequency
     * @param frequency The frequency
     * @param fromDate The date to calculate from (default: now)
     * @returns The next run date
     */
    private calculateNextRunDate(frequency: AccessReviewFrequency, fromDate: Date = new Date()): Date {
        const nextRunDate = new Date(fromDate)

        switch (frequency) {
            case AccessReviewFrequency.DAILY:
                nextRunDate.setDate(nextRunDate.getDate() + 1)
                break
            case AccessReviewFrequency.WEEKLY:
                nextRunDate.setDate(nextRunDate.getDate() + 7)
                break
            case AccessReviewFrequency.MONTHLY:
                nextRunDate.setMonth(nextRunDate.getMonth() + 1)
                break
            case AccessReviewFrequency.QUARTERLY:
                nextRunDate.setMonth(nextRunDate.getMonth() + 3)
                break
            case AccessReviewFrequency.SEMI_ANNUALLY:
                nextRunDate.setMonth(nextRunDate.getMonth() + 6)
                break
            case AccessReviewFrequency.ANNUALLY:
                nextRunDate.setFullYear(nextRunDate.getFullYear() + 1)
                break
        }

        return nextRunDate
    }

    /**
     * Calculate the due date based on duration days
     * @param fromDate The date to calculate from
     * @param durationDays The duration in days
     * @returns The due date
     */
    private calculateDueDate(fromDate: Date, durationDays: number): Date {
        const dueDate = new Date(fromDate)
        dueDate.setDate(dueDate.getDate() + durationDays)
        return dueDate
    }
}

// Create and export the service instance
const accessReviewService = new AccessReviewService()
export default accessReviewService