import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Organization } from './Organization'
import { Workspace } from './Workspace'

/**
 * Provisioning rule type enum
 */
export enum ProvisioningRuleType {
    USER_ONBOARDING = 'USER_ONBOARDING',
    ROLE_CHANGE = 'ROLE_CHANGE',
    USER_OFFBOARDING = 'USER_OFFBOARDING'
}

/**
 * Provisioning rule trigger enum
 */
export enum ProvisioningRuleTrigger {
    EVENT = 'EVENT',
    SCHEDULE = 'SCHEDULE',
    CONDITION = 'CONDITION'
}

/**
 * Provisioning rule status enum
 */
export enum ProvisioningRuleStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DRAFT = 'DRAFT'
}

/**
 * Provisioning rule entity
 * Defines rules for automated provisioning/deprovisioning
 */
@Entity('provisioning_rule')
export class ProvisioningRule {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column({ type: 'text', nullable: true })
    description: string

    @Column({
        type: 'varchar',
        enum: ProvisioningRuleType
    })
    type: ProvisioningRuleType

    @Column({
        type: 'varchar',
        enum: ProvisioningRuleTrigger
    })
    trigger: ProvisioningRuleTrigger

    @Column({ type: 'simple-json' })
    conditions: Record<string, any>

    @Column({ type: 'simple-json' })
    actions: Record<string, any>

    @Column({ name: 'organization_id', nullable: true })
    organizationId: string

    @ManyToOne(() => Organization, { nullable: true })
    @JoinColumn({ name: 'organization_id' })
    organization: Organization

    @Column({ name: 'workspace_id', nullable: true })
    workspaceId: string

    @ManyToOne(() => Workspace, { nullable: true })
    @JoinColumn({ name: 'workspace_id' })
    workspace: Workspace

    @Column({
        type: 'varchar',
        enum: ProvisioningRuleStatus,
        default: ProvisioningRuleStatus.DRAFT
    })
    status: ProvisioningRuleStatus

    @Column({ name: 'created_by' })
    createdBy: string

    @Column({ name: 'updated_by', nullable: true })
    updatedBy: string

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date
}