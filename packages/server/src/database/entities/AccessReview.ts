import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm'

/**
 * Access review status
 */
export enum AccessReviewStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    OVERDUE = 'overdue',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

/**
 * Access review scope
 */
export enum AccessReviewScope {
    ORGANIZATION = 'organization',
    WORKSPACE = 'workspace',
    RESOURCE = 'resource',
    USER = 'user'
}

/**
 * Access review type
 */
export enum AccessReviewType {
    AD_HOC = 'ad_hoc',
    SCHEDULED = 'scheduled'
}

/**
 * Access review entity
 */
@Entity('access_reviews')
export class AccessReview {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false
    })
    name: string

    @Column({
        type: 'text',
        nullable: true
    })
    description?: string

    @Column({
        type: 'varchar',
        enum: AccessReviewStatus,
        default: AccessReviewStatus.PENDING,
        nullable: false
    })
    @Index()
    status: AccessReviewStatus

    @Column({
        type: 'uuid',
        nullable: false
    })
    @Index()
    userId: string

    @Column({
        type: 'uuid',
        nullable: true
    })
    @Index()
    reviewerId?: string

    @Column({
        type: 'uuid',
        nullable: true
    })
    @Index()
    organizationId?: string

    @Column({
        type: 'uuid',
        nullable: true
    })
    @Index()
    workspaceId?: string

    @Column({
        type: 'uuid',
        nullable: true
    })
    @Index()
    resourceId?: string

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true
    })
    @Index()
    resourceType?: string

    @Column({
        type: 'datetime',
        nullable: false
    })
    @Index()
    dueDate: Date

    @Column({
        type: 'datetime',
        nullable: true
    })
    completedDate?: Date

    @Column({
        type: 'text',
        nullable: true
    })
    reviewNotes?: string

    @Column({
        type: 'simple-json',
        nullable: true,
        default: {}
    })
    metadata?: Record<string, any>

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @Column({
        type: 'uuid',
        nullable: false
    })
    createdBy: string

    @Column({
        type: 'varchar',
        enum: AccessReviewType,
        default: AccessReviewType.AD_HOC,
        nullable: false
    })
    type: AccessReviewType

    @Column({
        type: 'varchar',
        enum: AccessReviewScope,
        default: AccessReviewScope.ORGANIZATION,
        nullable: false
    })
    scope: AccessReviewScope

    @Column({
        type: 'datetime',
        nullable: true
    })
    startDate?: Date

    @Column({
        type: 'uuid',
        nullable: true
    })
    assignedTo?: string

    @Column({
        type: 'simple-json',
        nullable: true
    })
    settings?: Record<string, any>

    // Relationship with AccessReviewItem
    @OneToMany('AccessReviewItem', 'review')
    items: any[]
}