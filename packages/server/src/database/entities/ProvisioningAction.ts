import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { UserProfile } from './UserProfile'
import { ProvisioningRule } from './ProvisioningRule'

/**
 * Provisioning action type enum
 */
export enum ProvisioningActionType {
    USER_CREATION = 'USER_CREATION',
    USER_ACTIVATION = 'USER_ACTIVATION',
    USER_DEACTIVATION = 'USER_DEACTIVATION',
    USER_DELETION = 'USER_DELETION',
    ROLE_ASSIGNMENT = 'ROLE_ASSIGNMENT',
    ROLE_REMOVAL = 'ROLE_REMOVAL',
    ORGANIZATION_ASSIGNMENT = 'ORGANIZATION_ASSIGNMENT',
    ORGANIZATION_REMOVAL = 'ORGANIZATION_REMOVAL',
    WORKSPACE_ASSIGNMENT = 'WORKSPACE_ASSIGNMENT',
    WORKSPACE_REMOVAL = 'WORKSPACE_REMOVAL',
    PERMISSION_ASSIGNMENT = 'PERMISSION_ASSIGNMENT',
    PERMISSION_REMOVAL = 'PERMISSION_REMOVAL',
    NOTIFICATION = 'NOTIFICATION',
    CUSTOM = 'CUSTOM'
}

/**
 * Provisioning action status enum
 */
export enum ProvisioningActionStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
    REQUIRES_APPROVAL = 'REQUIRES_APPROVAL',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

/**
 * Provisioning action entity
 * Tracks provisioning actions performed by the system
 */
@Entity('provisioning_action')
export class ProvisioningAction {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({
        type: 'varchar',
        enum: ProvisioningActionType
    })
    type: ProvisioningActionType

    @Column({ type: 'simple-json' })
    parameters: Record<string, any>

    @Column({ name: 'target_user_id', nullable: true })
    targetUserId: string

    @ManyToOne(() => UserProfile, { nullable: true })
    @JoinColumn({ name: 'target_user_id' })
    targetUser: UserProfile

    @Column({ name: 'rule_id', nullable: true })
    ruleId: string

    @ManyToOne(() => ProvisioningRule, { nullable: true })
    @JoinColumn({ name: 'rule_id' })
    rule: ProvisioningRule

    @Column({
        type: 'varchar',
        enum: ProvisioningActionStatus,
        default: ProvisioningActionStatus.PENDING
    })
    status: ProvisioningActionStatus

    @Column({ type: 'text', nullable: true })
    statusMessage: string

    @Column({ name: 'initiated_by' })
    initiatedBy: string

    @ManyToOne(() => UserProfile)
    @JoinColumn({ name: 'initiated_by' })
    initiatedByUser: UserProfile

    @Column({ name: 'approved_by', nullable: true })
    approvedBy: string

    @ManyToOne(() => UserProfile, { nullable: true })
    @JoinColumn({ name: 'approved_by' })
    approvedByUser: UserProfile

    @Column({ name: 'approval_date', nullable: true })
    approvalDate: Date

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date

    @Column({ name: 'completed_at', nullable: true })
    completedAt: Date
}