import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm'
import { Organization } from './Organization'
import { Workspace } from './Workspace'
import { AccessReviewScope } from './AccessReview'

/**
 * Access Review Schedule Frequency
 */
export enum AccessReviewFrequency {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    SEMI_ANNUALLY = 'semi_annually',
    ANNUALLY = 'annually'
}

/**
 * Access Review Schedule Status
 */
export enum AccessReviewScheduleStatus {
    ACTIVE = 'active',
    PAUSED = 'paused',
    COMPLETED = 'completed'
}

/**
 * Access Review Schedule entity
 * Represents a scheduled recurring access review
 */
@Entity('access_review_schedule')
export class AccessReviewSchedule {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ length: 255 })
    name: string

    @Column({ type: 'text', nullable: true })
    description?: string

    @Column({
        type: 'varchar',
        enum: AccessReviewFrequency,
        default: AccessReviewFrequency.QUARTERLY
    })
    frequency: AccessReviewFrequency

    @Column({
        type: 'varchar',
        enum: AccessReviewScheduleStatus,
        default: AccessReviewScheduleStatus.ACTIVE
    })
    status: AccessReviewScheduleStatus

    @Column({
        type: 'varchar',
        enum: AccessReviewScope,
        default: AccessReviewScope.ORGANIZATION
    })
    scope: AccessReviewScope

    @Column({ type: 'uuid', nullable: true })
    organizationId?: string

    @ManyToOne(() => Organization, { nullable: true })
    @JoinColumn({ name: 'organizationId' })
    organization?: Organization

    @Column({ type: 'uuid', nullable: true })
    workspaceId?: string

    @ManyToOne(() => Workspace, { nullable: true })
    @JoinColumn({ name: 'workspaceId' })
    workspace?: Workspace

    @Column({ type: 'uuid' })
    createdBy: string

    @Column({ type: 'uuid' })
    assignedTo: string

    @Column({ type: 'integer', default: 7 })
    durationDays: number

    @Column({ type: 'datetime', nullable: true })
    lastRunAt?: Date

    @Column({ type: 'datetime', nullable: true })
    nextRunAt?: Date

    @Column({ type: 'simple-json', nullable: true })
    settings?: Record<string, any>

    @Column({ type: 'simple-json', nullable: true })
    metadata?: Record<string, any>

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

export default AccessReviewSchedule