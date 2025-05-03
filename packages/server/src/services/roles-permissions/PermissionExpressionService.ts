import { getRepository } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import logger from '../../utils/logger'
import { PermissionExpression, ExpressionType, ExpressionOperator } from '../../database/entities/PermissionExpression'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import attributeService from './AttributeService'
import { createClient } from 'redis'
import config from '../../config'

/**
 * Service for managing and evaluating permission expressions
 */
export class PermissionExpressionService {
    private expressionRepository: any
    private redisClient: any

    /**
     * Constructor
     */
    constructor() {
        const appServer = getRunningExpressApp()
        this.expressionRepository = appServer.AppDataSource.getRepository(PermissionExpression)
        
        // Initialize Redis client if needed
        // this.initializeRedisClient()
    }

    /**
     * Initialize Redis client for caching
     */
    private async initializeRedisClient() {
        try {
            this.redisClient = createClient({
                url: 'redis://localhost:6379' // Default Redis URL
            })
            
            await this.redisClient.connect()
            
            this.redisClient.on('error', (err: any) => {
                logger.error(`[PermissionExpressionService] Redis client error: ${err.message}`)
            })
        } catch (error: any) {
            logger.error(`[PermissionExpressionService] Redis client initialization error: ${error.message}`)
        }
    }

    /**
     * Get cache key for expression evaluation
     */
    private getCacheKey(expressionId: string, context: any): string {
        // Create a deterministic string representation of the context
        const contextStr = JSON.stringify(context, Object.keys(context).sort())
        const contextHash = Buffer.from(contextStr).toString('base64')
        return `expression:${expressionId}:${contextHash}`
    }

    /**
     * Create a new permission expression
     */
    async createExpression(expressionData: Partial<PermissionExpression>): Promise<PermissionExpression> {
        try {
            // Validate expression
            this.validateExpression(expressionData.expression)
            
            const expression = this.expressionRepository.create(expressionData)
            return await this.expressionRepository.save(expression)
        } catch (error: any) {
            logger.error(`[PermissionExpressionService] Create expression error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to create expression: ${error.message}`
            )
        }
    }

    /**
     * Get a permission expression by ID
     */
    async getExpressionById(id: string): Promise<PermissionExpression> {
        try {
            const expression = await this.expressionRepository.findOne({
                where: { id }
            })
            
            if (!expression) {
                throw new InternalFastflowError(
                    StatusCodes.NOT_FOUND,
                    `Expression with ID ${id} not found`
                )
            }
            
            return expression
        } catch (error: any) {
            if (error instanceof InternalFastflowError) throw error
            
            logger.error(`[PermissionExpressionService] Get expression error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to get expression: ${error.message}`
            )
        }
    }

    /**
     * Update a permission expression
     */
    async updateExpression(id: string, expressionData: Partial<PermissionExpression>): Promise<PermissionExpression> {
        try {
            const expression = await this.getExpressionById(id)
            
            // Validate expression if provided
            if (expressionData.expression) {
                this.validateExpression(expressionData.expression)
            }
            
            Object.assign(expression, expressionData)
            return await this.expressionRepository.save(expression)
        } catch (error: any) {
            if (error instanceof InternalFastflowError) throw error
            
            logger.error(`[PermissionExpressionService] Update expression error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to update expression: ${error.message}`
            )
        }
    }

    /**
     * Delete a permission expression
     */
    async deleteExpression(id: string): Promise<void> {
        try {
            const result = await this.expressionRepository.delete(id)
            
            if (result.affected === 0) {
                throw new InternalFastflowError(
                    StatusCodes.NOT_FOUND,
                    `Expression with ID ${id} not found`
                )
            }
        } catch (error: any) {
            if (error instanceof InternalFastflowError) throw error
            
            logger.error(`[PermissionExpressionService] Delete expression error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to delete expression: ${error.message}`
            )
        }
    }

    /**
     * Evaluate a permission expression
     */
    async evaluateExpression(
        expressionId: string,
        context: {
            userId: string,
            resourceType?: string,
            resourceId?: string,
            organizationId?: string,
            workspaceId?: string,
            [key: string]: any
        }
    ): Promise<boolean> {
        try {
            // Check cache first
            if (this.redisClient) {
                const cacheKey = this.getCacheKey(expressionId, context)
                const cachedResult = await this.redisClient.get(cacheKey)
                
                if (cachedResult !== null) {
                    return cachedResult === 'true'
                }
            }
            
            const expression = await this.getExpressionById(expressionId)
            const result = await this.evaluate(expression.expression, context)
            
            // Cache the result
            if (this.redisClient) {
                const cacheKey = this.getCacheKey(expressionId, context)
                await this.redisClient.set(cacheKey, result.toString(), {
                    EX: 60 // Cache for 1 minute
                })
            }
            
            return result
        } catch (error: any) {
            logger.error(`[PermissionExpressionService] Evaluate expression error: ${error.message}`)
            return false // Default to deny on error
        }
    }

    /**
     * Evaluate an expression object directly
     */
    async evaluateExpressionObject(
        expression: any,
        context: {
            userId: string,
            resourceType?: string,
            resourceId?: string,
            organizationId?: string,
            workspaceId?: string,
            [key: string]: any
        }
    ): Promise<boolean> {
        try {
            return this.evaluate(expression, context);
        } catch (error: any) {
            logger.error(`[PermissionExpressionService] Evaluate expression object error: ${error.message}`)
            return false // Default to deny on error
        }
    }

    /**
     * Evaluate an expression object
     */
    private async evaluate(
        expression: any,
        context: {
            userId: string,
            resourceType?: string,
            resourceId?: string,
            organizationId?: string,
            workspaceId?: string,
            [key: string]: any
        }
    ): Promise<boolean> {
        try {
            // Handle different expression types
            if (!expression || typeof expression !== 'object') {
                return false
            }
            
            // Handle attribute expressions
            if (expression.type === ExpressionType.ATTRIBUTE) {
                return this.evaluateAttributeExpression(expression, context)
            }
            
            // Handle time-based expressions
            if (expression.type === ExpressionType.TIME_BASED) {
                return this.evaluateTimeBasedExpression(expression, context)
            }
            
            // Handle condition expressions
            if (expression.type === ExpressionType.CONDITION) {
                return this.evaluateConditionExpression(expression, context)
            }
            
            // Handle composite expressions
            if (expression.type === ExpressionType.COMPOSITE) {
                return this.evaluateCompositeExpression(expression, context)
            }
            
            // Handle operator expressions (implicit conditions)
            if (expression.operator) {
                return this.evaluateOperatorExpression(expression, context)
            }
            
            return false
        } catch (error: any) {
            logger.error(`[PermissionExpressionService] Expression evaluation error: ${error.message}`)
            return false // Default to deny on error
        }
    }

    /**
     * Evaluate an attribute-based expression
     */
    private async evaluateAttributeExpression(
        expression: any,
        context: any
    ): Promise<boolean> {
        try {
            const { attributeType, attributeKey, operator, value } = expression
            
            let attributeValue: any = null
            
            // Get attribute value based on type
            if (attributeType === 'resource' && context.resourceType && context.resourceId) {
                attributeValue = await attributeService.getResourceAttribute(
                    context.resourceType,
                    context.resourceId,
                    attributeKey
                )
            } else if (attributeType === 'user' && context.userId) {
                attributeValue = await attributeService.getUserAttribute(
                    context.userId,
                    attributeKey
                )
            } else if (attributeType === 'environment') {
                attributeValue = await attributeService.getEnvironmentAttribute(
                    attributeKey,
                    context.organizationId,
                    context.workspaceId
                )
            } else if (attributeType === 'context' && context[attributeKey] !== undefined) {
                attributeValue = context[attributeKey]
            }
            
            // Compare attribute value with expected value
            return this.compareValues(attributeValue, value, operator)
        } catch (error: any) {
            logger.error(`[PermissionExpressionService] Attribute expression evaluation error: ${error.message}`)
            return false
        }
    }

    /**
     * Evaluate a time-based expression
     */
    private async evaluateTimeBasedExpression(
        expression: any,
        context: any
    ): Promise<boolean> {
        try {
            const { timeType, startTime, endTime, schedule } = expression
            const now = new Date()
            
            // Simple time window check
            if (timeType === 'window' && startTime && endTime) {
                const start = new Date(startTime)
                const end = new Date(endTime)
                return now >= start && now <= end
            }
            
            // Recurring schedule check
            if (timeType === 'recurring' && schedule) {
                return this.checkSchedule(schedule, now)
            }
            
            // Business hours check
            if (timeType === 'business_hours') {
                const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.
                const hours = now.getHours()
                
                // Default business hours: Monday-Friday, 9am-5pm
                const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
                const isBusinessHours = hours >= 9 && hours < 17
                
                return isWeekday && isBusinessHours
            }
            
            return false
        } catch (error: any) {
            logger.error(`[PermissionExpressionService] Time-based expression evaluation error: ${error.message}`)
            return false
        }
    }

    /**
     * Evaluate a condition expression
     */
    private async evaluateConditionExpression(
        expression: any,
        context: any
    ): Promise<boolean> {
        try {
            // Condition expressions are just operator expressions with a type
            return this.evaluateOperatorExpression(expression, context)
        } catch (error: any) {
            logger.error(`[PermissionExpressionService] Condition expression evaluation error: ${error.message}`)
            return false
        }
    }

    /**
     * Evaluate a composite expression
     */
    private async evaluateCompositeExpression(
        expression: any,
        context: any
    ): Promise<boolean> {
        try {
            const { operator, expressions } = expression
            
            if (!Array.isArray(expressions) || expressions.length === 0) {
                return false
            }
            
            if (operator === ExpressionOperator.AND) {
                // All expressions must evaluate to true
                for (const expr of expressions) {
                    if (!(await this.evaluate(expr, context))) {
                        return false
                    }
                }
                return true
            } else if (operator === ExpressionOperator.OR) {
                // At least one expression must evaluate to true
                for (const expr of expressions) {
                    if (await this.evaluate(expr, context)) {
                        return true
                    }
                }
                return false
            } else if (operator === ExpressionOperator.NOT) {
                // Negate the result of the first expression
                return !(await this.evaluate(expressions[0], context))
            }
            
            return false
        } catch (error: any) {
            logger.error(`[PermissionExpressionService] Composite expression evaluation error: ${error.message}`)
            return false
        }
    }

    /**
     * Evaluate an operator expression
     */
    private async evaluateOperatorExpression(
        expression: any,
        context: any
    ): Promise<boolean> {
        try {
            const { operator, left, right } = expression
            
            // Handle logical operators
            if (operator === ExpressionOperator.AND || operator === ExpressionOperator.OR || operator === ExpressionOperator.NOT) {
                return this.evaluateCompositeExpression({
                    operator,
                    expressions: operator === ExpressionOperator.NOT ? [left] : [left, right]
                }, context)
            }
            
            // Handle comparison operators
            let leftValue = left
            let rightValue = right
            
            // Resolve values if they are attribute references
            if (typeof left === 'object' && left !== null) {
                leftValue = await this.evaluate(left, context)
            }
            
            if (typeof right === 'object' && right !== null) {
                rightValue = await this.evaluate(right, context)
            }
            
            return this.compareValues(leftValue, rightValue, operator)
        } catch (error: any) {
            logger.error(`[PermissionExpressionService] Operator expression evaluation error: ${error.message}`)
            return false
        }
    }

    /**
     * Compare values using the specified operator
     */
    private compareValues(left: any, right: any, operator: string): boolean {
        try {
            switch (operator) {
                case ExpressionOperator.EQUALS:
                    return left === right
                case ExpressionOperator.NOT_EQUALS:
                    return left !== right
                case ExpressionOperator.GREATER_THAN:
                    return left > right
                case ExpressionOperator.GREATER_THAN_OR_EQUALS:
                    return left >= right
                case ExpressionOperator.LESS_THAN:
                    return left < right
                case ExpressionOperator.LESS_THAN_OR_EQUALS:
                    return left <= right
                case ExpressionOperator.IN:
                    return Array.isArray(right) && right.includes(left)
                case ExpressionOperator.NOT_IN:
                    return !Array.isArray(right) || !right.includes(left)
                case ExpressionOperator.CONTAINS:
                    if (typeof left === 'string' && typeof right === 'string') {
                        return left.includes(right)
                    } else if (Array.isArray(left)) {
                        return left.includes(right)
                    }
                    return false
                case ExpressionOperator.NOT_CONTAINS:
                    if (typeof left === 'string' && typeof right === 'string') {
                        return !left.includes(right)
                    } else if (Array.isArray(left)) {
                        return !left.includes(right)
                    }
                    return true
                case ExpressionOperator.STARTS_WITH:
                    return typeof left === 'string' && typeof right === 'string' && left.startsWith(right)
                case ExpressionOperator.ENDS_WITH:
                    return typeof left === 'string' && typeof right === 'string' && left.endsWith(right)
                default:
                    return false
            }
        } catch (error: any) {
            logger.error(`[PermissionExpressionService] Compare values error: ${error.message}`)
            return false
        }
    }

    /**
     * Check if a date matches a schedule
     */
    private checkSchedule(schedule: any, date: Date): boolean {
        try {
            const { days, hours, months, daysOfMonth } = schedule
            
            // Check day of week (0 = Sunday, 1 = Monday, etc.)
            if (Array.isArray(days) && days.length > 0) {
                if (!days.includes(date.getDay())) {
                    return false
                }
            }
            
            // Check hour of day (0-23)
            if (Array.isArray(hours) && hours.length > 0) {
                if (!hours.includes(date.getHours())) {
                    return false
                }
            }
            
            // Check month (0 = January, 11 = December)
            if (Array.isArray(months) && months.length > 0) {
                if (!months.includes(date.getMonth())) {
                    return false
                }
            }
            
            // Check day of month (1-31)
            if (Array.isArray(daysOfMonth) && daysOfMonth.length > 0) {
                if (!daysOfMonth.includes(date.getDate())) {
                    return false
                }
            }
            
            return true
        } catch (error: any) {
            logger.error(`[PermissionExpressionService] Check schedule error: ${error.message}`)
            return false
        }
    }

    /**
     * Validate an expression
     */
    private validateExpression(expression: any): void {
        if (!expression || typeof expression !== 'object') {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'Invalid expression: must be an object'
            )
        }
        
        // Validate based on expression type
        if (expression.type === ExpressionType.ATTRIBUTE) {
            this.validateAttributeExpression(expression)
        } else if (expression.type === ExpressionType.TIME_BASED) {
            this.validateTimeBasedExpression(expression)
        } else if (expression.type === ExpressionType.CONDITION) {
            this.validateConditionExpression(expression)
        } else if (expression.type === ExpressionType.COMPOSITE) {
            this.validateCompositeExpression(expression)
        } else if (expression.operator) {
            this.validateOperatorExpression(expression)
        } else {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'Invalid expression: missing type or operator'
            )
        }
    }

    /**
     * Validate an attribute expression
     */
    private validateAttributeExpression(expression: any): void {
        const { attributeType, attributeKey, operator, value } = expression
        
        if (!attributeType || !attributeKey || !operator) {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'Invalid attribute expression: missing required fields'
            )
        }
        
        if (!['resource', 'user', 'environment', 'context'].includes(attributeType)) {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'Invalid attribute expression: invalid attribute type'
            )
        }
        
        this.validateOperator(operator)
    }

    /**
     * Validate a time-based expression
     */
    private validateTimeBasedExpression(expression: any): void {
        const { timeType } = expression
        
        if (!timeType) {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'Invalid time-based expression: missing timeType'
            )
        }
        
        if (!['window', 'recurring', 'business_hours'].includes(timeType)) {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'Invalid time-based expression: invalid timeType'
            )
        }
        
        if (timeType === 'window') {
            if (!expression.startTime || !expression.endTime) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Invalid time-based expression: window requires startTime and endTime'
                )
            }
        } else if (timeType === 'recurring') {
            if (!expression.schedule) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Invalid time-based expression: recurring requires schedule'
                )
            }
        }
    }

    /**
     * Validate a condition expression
     */
    private validateConditionExpression(expression: any): void {
        this.validateOperatorExpression(expression)
    }

    /**
     * Validate a composite expression
     */
    private validateCompositeExpression(expression: any): void {
        const { operator, expressions } = expression
        
        if (!operator || !expressions) {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'Invalid composite expression: missing operator or expressions'
            )
        }
        
        if (![ExpressionOperator.AND, ExpressionOperator.OR, ExpressionOperator.NOT].includes(operator)) {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'Invalid composite expression: invalid logical operator'
            )
        }
        
        if (!Array.isArray(expressions) || expressions.length === 0) {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'Invalid composite expression: expressions must be a non-empty array'
            )
        }
        
        if (operator === ExpressionOperator.NOT && expressions.length !== 1) {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'Invalid composite expression: NOT operator requires exactly one expression'
            )
        }
        
        // Validate each sub-expression
        for (const expr of expressions) {
            this.validateExpression(expr)
        }
    }

    /**
     * Validate an operator expression
     */
    private validateOperatorExpression(expression: any): void {
        const { operator, left, right } = expression
        
        if (!operator || left === undefined) {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'Invalid operator expression: missing operator or left operand'
            )
        }
        
        this.validateOperator(operator)
        
        // Logical operators are handled by validateCompositeExpression
        if ([ExpressionOperator.AND, ExpressionOperator.OR, ExpressionOperator.NOT].includes(operator)) {
            this.validateCompositeExpression({
                operator,
                expressions: operator === ExpressionOperator.NOT ? [left] : [left, right]
            })
            return
        }
        
        // For comparison operators, right operand is required
        if (right === undefined) {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'Invalid operator expression: missing right operand for comparison'
            )
        }
        
        // Validate operands if they are expressions
        if (typeof left === 'object' && left !== null) {
            this.validateExpression(left)
        }
        
        if (typeof right === 'object' && right !== null) {
            this.validateExpression(right)
        }
    }

    /**
     * Validate an operator
     */
    private validateOperator(operator: string): void {
        const validOperators = Object.values(ExpressionOperator)
        
        if (!validOperators.includes(operator as ExpressionOperator)) {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                `Invalid operator: ${operator}`
            )
        }
    }
}

export const permissionExpressionService = new PermissionExpressionService()
export default permissionExpressionService