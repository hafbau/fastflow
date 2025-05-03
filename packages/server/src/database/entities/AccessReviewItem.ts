import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn
} from 'typeorm'
import { AccessReview } from './AccessReview'
import { AccessReviewAction } from './AccessReviewAction'

/**
 * Access Review Item Status
 */
export enum AccessReviewItemStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    NEEDS_INVESTIGATION = 'needs_investigation'
}

/**
 * Access Review Item Type
 */
export enum AccessReviewItemType {
    USER_ROLE = 'user_role',
    RESOURCE_PERMISSION = 'resource_permission',
    DORMANT_ACCOUNT = 'dormant_account',
    EXCESSIVE_PERMISSION = 'excessive_permission'
}

/**
 * Access Review Item entity
 * Represents an individual item to be reviewed in an access review
 */
@Entity('access_review_item')
export class AccessReviewItem {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    reviewId: string

    @ManyToOne(() => AccessReview, review => review.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'reviewId' })
    review: AccessReview

    @Column({
        type: 'enum',
        enum: AccessReviewItemType
    })
    type: AccessReviewItemType

    @Column({
        type: 'enum',
        enum: AccessReviewItemStatus,
        default: AccessReviewItemStatus.PENDING
    })
    status: AccessReviewItemStatus

    @Column({ type: 'uuid' })
    userId: string

    @Column({ type: 'uuid', nullable: true })
    resourceId?: string

    @Column({ length: 100, nullable: true })
    resourceType?: string

    @Column({ length: 100, nullable: true })
    permission?: string

    @Column({ type: 'uuid', nullable: true })
    roleId?: string

    @Column({ type: 'text', nullable: true })
    notes?: string

    @Column({ type: 'uuid', nullable: true })
    reviewedBy?: string

    @Column({ type: 'timestamp', nullable: true })
    reviewedAt?: Date

    @Column({ type: 'jsonb', nullable: true })
    metadata?: Record<string, any>

    @Column({ type: 'boolean', default: false })
    isRisky: boolean

    @Column({ type: 'text', nullable: true })
    riskReason?: string

    @OneToMany(() => AccessReviewAction, action => action.reviewItem)
    actions: AccessReviewAction[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

export default AccessReviewItem