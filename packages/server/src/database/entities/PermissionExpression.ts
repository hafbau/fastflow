import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Permission } from './Permission'

/**
 * Expression types for permission evaluation
 */
export enum ExpressionType {
    ATTRIBUTE = 'attribute',
    CONDITION = 'condition',
    TIME_BASED = 'time_based',
    COMPOSITE = 'composite'
}

/**
 * Operators for permission expressions
 */
export enum ExpressionOperator {
    // Comparison operators
    EQUALS = 'eq',
    NOT_EQUALS = 'neq',
    GREATER_THAN = 'gt',
    GREATER_THAN_OR_EQUALS = 'gte',
    LESS_THAN = 'lt',
    LESS_THAN_OR_EQUALS = 'lte',
    IN = 'in',
    NOT_IN = 'not_in',
    CONTAINS = 'contains',
    NOT_CONTAINS = 'not_contains',
    STARTS_WITH = 'starts_with',
    ENDS_WITH = 'ends_with',
    
    // Logical operators
    AND = 'and',
    OR = 'or',
    NOT = 'not'
}

/**
 * Permission Expression entity
 * Stores expressions for evaluating complex permission rules
 */
@Entity('permission_expression')
export class PermissionExpression {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ length: 100 })
    name: string

    @Column({ type: 'text', nullable: true })
    description?: string

    @Column({
        type: 'varchar',
        enum: ExpressionType,
        default: ExpressionType.CONDITION
    })
    type: ExpressionType

    @Column({ type: 'simple-json' })
    expression: any

    @Column({ type: 'uuid', nullable: true })
    permissionId?: string

    @ManyToOne(() => Permission, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'permissionId' })
    permission?: Permission

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date
}