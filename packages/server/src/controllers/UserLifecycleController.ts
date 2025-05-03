import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import userLifecycleService, { UserLifecycleEventType } from '../services/UserLifecycleService'
import { ProvisioningRuleType, ProvisioningRuleTrigger, ProvisioningRuleStatus } from '../database/entities/ProvisioningRule'
import { ProvisioningActionStatus } from '../database/entities/ProvisioningAction'
import logger from '../utils/logger'
import auditLogsService from '../services/audit-logs'

/**
 * Controller for user lifecycle management
 */
export class UserLifecycleController {
    /**
     * Trigger a user lifecycle event
     * @param req Request
     * @param res Response
     */
    async triggerLifecycleEvent(req: Request, res: Response): Promise<void> {
        try {
            const { type, userId, metadata } = req.body
            
            if (!req.user) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: 'Authentication required'
                })
                return
            }
            
            const triggeredBy = req.user.id

            if (!type || !userId) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'Event type and user ID are required'
                })
                return
            }

            // Validate event type
            if (!Object.values(UserLifecycleEventType).includes(type)) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: `Invalid event type: ${type}`
                })
                return
            }

            // Handle the lifecycle event
            await userLifecycleService.handleLifecycleEvent({
                type,
                userId,
                triggeredBy,
                metadata
            })

            // Log the action
            await auditLogsService.logUserAction(
                triggeredBy,
                'trigger_lifecycle_event',
                'user',
                userId,
                { eventType: type }
            )

            res.status(StatusCodes.OK).json({
                message: 'Lifecycle event processed successfully'
            })
        } catch (error: any) {
            logger.error(`[UserLifecycleController] Error triggering lifecycle event: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message || 'Internal server error'
            })
        }
    }

    /**
     * Get user lifecycle state history
     * @param req Request
     * @param res Response
     */
    async getUserLifecycleStateHistory(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params

            if (!userId) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'User ID is required'
                })
                return
            }

            const history = await userLifecycleService.getUserLifecycleStateHistory(userId)

            res.status(StatusCodes.OK).json(history)
        } catch (error: any) {
            logger.error(`[UserLifecycleController] Error getting user lifecycle state history: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message || 'Internal server error'
            })
        }
    }

    /**
     * Get user's current lifecycle state
     * @param req Request
     * @param res Response
     */
    async getUserCurrentLifecycleState(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params

            if (!userId) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'User ID is required'
                })
                return
            }

            const state = await userLifecycleService.getUserCurrentLifecycleState(userId)

            if (!state) {
                res.status(StatusCodes.NOT_FOUND).json({
                    message: 'No lifecycle state found for user'
                })
                return
            }

            res.status(StatusCodes.OK).json(state)
        } catch (error: any) {
            logger.error(`[UserLifecycleController] Error getting user current lifecycle state: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message || 'Internal server error'
            })
        }
    }

    /**
     * Get user provisioning actions
     * @param req Request
     * @param res Response
     */
    async getUserProvisioningActions(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params
            const { status } = req.query

            if (!userId) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'User ID is required'
                })
                return
            }

            const actions = await userLifecycleService.getUserProvisioningActions(
                userId,
                status as ProvisioningActionStatus
            )

            res.status(StatusCodes.OK).json(actions)
        } catch (error: any) {
            logger.error(`[UserLifecycleController] Error getting user provisioning actions: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message || 'Internal server error'
            })
        }
    }

    /**
     * Get pending approval actions
     * @param req Request
     * @param res Response
     */
    async getPendingApprovalActions(req: Request, res: Response): Promise<void> {
        try {
            const actions = await userLifecycleService.getPendingApprovalActions()
            res.status(StatusCodes.OK).json(actions)
        } catch (error: any) {
            logger.error(`[UserLifecycleController] Error getting pending approval actions: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message || 'Internal server error'
            })
        }
    }

    /**
     * Approve a provisioning action
     * @param req Request
     * @param res Response
     */
    async approveAction(req: Request, res: Response): Promise<void> {
        try {
            const { actionId } = req.params
            
            if (!req.user) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: 'Authentication required'
                })
                return
            }
            
            const approvedBy = req.user.id

            if (!actionId) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'Action ID is required'
                })
                return
            }

            const action = await userLifecycleService.approveAction(actionId, approvedBy)

            // Log the action
            await auditLogsService.logUserAction(
                approvedBy,
                'approve_provisioning_action',
                'provisioning_action',
                actionId,
                { actionType: action.type }
            )

            res.status(StatusCodes.OK).json(action)
        } catch (error: any) {
            logger.error(`[UserLifecycleController] Error approving action: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message || 'Internal server error'
            })
        }
    }

    /**
     * Reject a provisioning action
     * @param req Request
     * @param res Response
     */
    async rejectAction(req: Request, res: Response): Promise<void> {
        try {
            const { actionId } = req.params
            const { reason } = req.body
            
            if (!req.user) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: 'Authentication required'
                })
                return
            }
            
            const rejectedBy = req.user.id

            if (!actionId) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'Action ID is required'
                })
                return
            }

            if (!reason) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'Rejection reason is required'
                })
                return
            }

            const action = await userLifecycleService.rejectAction(actionId, rejectedBy, reason)

            // Log the action
            await auditLogsService.logUserAction(
                rejectedBy,
                'reject_provisioning_action',
                'provisioning_action',
                actionId,
                { actionType: action.type, reason }
            )

            res.status(StatusCodes.OK).json(action)
        } catch (error: any) {
            logger.error(`[UserLifecycleController] Error rejecting action: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message || 'Internal server error'
            })
        }
    }

    /**
     * Create a provisioning rule
     * @param req Request
     * @param res Response
     */
    async createProvisioningRule(req: Request, res: Response): Promise<void> {
        try {
            const { name, description, type, trigger, conditions, actions, organizationId, workspaceId, status } = req.body
            
            if (!req.user) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: 'Authentication required'
                })
                return
            }
            
            const createdBy = req.user.id

            // Validate required fields
            if (!name || !type || !trigger || !conditions || !actions) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'Name, type, trigger, conditions, and actions are required'
                })
                return
            }

            // Validate type
            if (!Object.values(ProvisioningRuleType).includes(type)) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: `Invalid rule type: ${type}`
                })
                return
            }

            // Validate trigger
            if (!Object.values(ProvisioningRuleTrigger).includes(trigger)) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: `Invalid rule trigger: ${trigger}`
                })
                return
            }

            // Create the rule
            const rule = await userLifecycleService.createProvisioningRule({
                name,
                description,
                type,
                trigger,
                conditions,
                actions,
                organizationId,
                workspaceId,
                status: status || ProvisioningRuleStatus.DRAFT,
                createdBy
            })

            // Log the action
            await auditLogsService.logUserAction(
                createdBy,
                'create_provisioning_rule',
                'provisioning_rule',
                rule.id,
                { ruleName: rule.name, ruleType: rule.type }
            )

            res.status(StatusCodes.CREATED).json(rule)
        } catch (error: any) {
            logger.error(`[UserLifecycleController] Error creating provisioning rule: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message || 'Internal server error'
            })
        }
    }

    /**
     * Get all provisioning rules
     * @param req Request
     * @param res Response
     */
    async getAllProvisioningRules(req: Request, res: Response): Promise<void> {
        try {
            const { type, trigger, status, organizationId, workspaceId } = req.query

            const filters: any = {}

            if (type) filters.type = type
            if (trigger) filters.trigger = trigger
            if (status) filters.status = status
            if (organizationId) filters.organizationId = organizationId
            if (workspaceId) filters.workspaceId = workspaceId

            const rules = await userLifecycleService.getAllProvisioningRules(filters)

            res.status(StatusCodes.OK).json(rules)
        } catch (error: any) {
            logger.error(`[UserLifecycleController] Error getting provisioning rules: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message || 'Internal server error'
            })
        }
    }

    /**
     * Get a provisioning rule by ID
     * @param req Request
     * @param res Response
     */
    async getProvisioningRuleById(req: Request, res: Response): Promise<void> {
        try {
            const { ruleId } = req.params

            if (!ruleId) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'Rule ID is required'
                })
                return
            }

            const rule = await userLifecycleService.getProvisioningRuleById(ruleId)

            res.status(StatusCodes.OK).json(rule)
        } catch (error: any) {
            logger.error(`[UserLifecycleController] Error getting provisioning rule: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message || 'Internal server error'
            })
        }
    }

    /**
     * Update a provisioning rule
     * @param req Request
     * @param res Response
     */
    async updateProvisioningRule(req: Request, res: Response): Promise<void> {
        try {
            const { ruleId } = req.params
            const { name, description, type, trigger, conditions, actions, organizationId, workspaceId, status } = req.body
            
            if (!req.user) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: 'Authentication required'
                })
                return
            }
            
            const updatedBy = req.user.id

            if (!ruleId) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'Rule ID is required'
                })
                return
            }

            // Update the rule
            const updateData: any = { updatedBy }

            if (name) updateData.name = name
            if (description !== undefined) updateData.description = description
            if (type) updateData.type = type
            if (trigger) updateData.trigger = trigger
            if (conditions) updateData.conditions = conditions
            if (actions) updateData.actions = actions
            if (organizationId !== undefined) updateData.organizationId = organizationId
            if (workspaceId !== undefined) updateData.workspaceId = workspaceId
            if (status) updateData.status = status

            const rule = await userLifecycleService.updateProvisioningRule(ruleId, updateData)

            // Log the action
            await auditLogsService.logUserAction(
                updatedBy,
                'update_provisioning_rule',
                'provisioning_rule',
                ruleId,
                { ruleName: rule.name, updatedFields: Object.keys(updateData) }
            )

            res.status(StatusCodes.OK).json(rule)
        } catch (error: any) {
            logger.error(`[UserLifecycleController] Error updating provisioning rule: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message || 'Internal server error'
            })
        }
    }

    /**
     * Delete a provisioning rule
     * @param req Request
     * @param res Response
     */
    async deleteProvisioningRule(req: Request, res: Response): Promise<void> {
        try {
            const { ruleId } = req.params
            
            if (!req.user) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: 'Authentication required'
                })
                return
            }
            
            const deletedBy = req.user.id

            if (!ruleId) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'Rule ID is required'
                })
                return
            }

            // Get the rule before deleting it for logging
            const rule = await userLifecycleService.getProvisioningRuleById(ruleId)

            // Delete the rule
            await userLifecycleService.deleteProvisioningRule(ruleId)

            // Log the action
            await auditLogsService.logUserAction(
                deletedBy,
                'delete_provisioning_rule',
                'provisioning_rule',
                ruleId,
                { ruleName: rule.name }
            )

            res.status(StatusCodes.OK).json({
                message: 'Provisioning rule deleted successfully'
            })
        } catch (error: any) {
            logger.error(`[UserLifecycleController] Error deleting provisioning rule: ${error.message}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message || 'Internal server error'
            })
        }
    }
}

export default new UserLifecycleController()