import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm'
import { AccessReviewItem } from './AccessReviewItem'

/**
 * Access Review Action Type
 */
export enum AccessReviewActionType {
    APPROVE = 'approve',
    REJECT = 'reject',
    REVOKE_ACCESS = 'revoke_access',
    MODIFY_PERMISSION = 'modify_permission',
    DEACTIVATE_USER = 'deactivate_user',
    ESCALATE = 'escalate',
    COMMENT = 'comment'
}

/**
 * Access Review Action Status
 */
export enum AccessReviewActionStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

/**
 * Access Review Action entity
 * Represents an action taken on an access review item
 */
@Entity('access_review_action')
export class AccessReviewAction {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    reviewItemId: string

    @ManyToOne(() => AccessReviewItem, item => item.actions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'reviewItemId' })
    reviewItem: AccessReviewItem

    @Column({
        type: 'enum',
        enum: AccessReviewActionType
    })
    type: AccessReviewActionType

    @Column({
        type: 'enum',
        enum: AccessReviewActionStatus,
        default: AccessReviewActionStatus.PENDING
    })
    status: AccessReviewActionStatus

    @Column({ type: 'uuid' })
    performedBy: string

    @Column({ type: 'text', nullable: true })
    notes?: string

    @Column({ type: 'jsonb', nullable: true })
    metadata?: Record<string, any>

    @Column({ type: 'timestamp', nullable: true })
    completedAt?: Date

    @Column({ type: 'text', nullable: true })
    errorMessage?: string

    @CreateDateColumn()
    createdAt: Date
}

export default AccessReviewAction