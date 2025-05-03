import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from 'typeorm'

/**
 * Alert type enum
 */
export enum AlertType {
    SECURITY = 'security',
    COMPLIANCE = 'compliance',
    PERFORMANCE = 'performance',
    USAGE = 'usage',
    ANOMALY = 'anomaly'
}

/**
 * Alert status enum
 */
export enum AlertStatus {
    OPEN = 'open',
    ACKNOWLEDGED = 'acknowledged',
    RESOLVED = 'resolved',
    DISMISSED = 'dismissed'
}

/**
 * Alert severity enum
 */
export enum AlertSeverity {
    CRITICAL = 'critical',
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
    INFO = 'info'
}

/**
 * Analytics Alert Entity
 * Stores alerts for analytics
 */
@Entity('analytics_alerts')
export class AnalyticsAlert {
    /**
     * Primary key
     */
    @PrimaryGeneratedColumn('uuid')
    id: string

    /**
     * Alert name
     */
    @Column({
        type: 'varchar',
        length: 255,
        nullable: false
    })
    name: string

    /**
     * Alert description
     */
    @Column({
        type: 'text',
        nullable: true
    })
    description?: string

    /**
     * Alert type
     */
    @Column({
        type: 'enum',
        enum: AlertType,
        nullable: false
    })
    @Index()
    alertType: AlertType

    /**
     * Alert severity
     */
    @Column({
        type: 'enum',
        enum: AlertSeverity,
        nullable: false,
        default: AlertSeverity.MEDIUM
    })
    @Index()
    severity: AlertSeverity

    /**
     * Alert status
     */
    @Column({
        type: 'enum',
        enum: AlertStatus,
        nullable: false,
        default: AlertStatus.OPEN
    })
    @Index()
    status: AlertStatus

    /**
     * Detected at timestamp
     */
    @Column({
        type: 'timestamp',
        nullable: false
    })
    @Index()
    detectedAt: Date

    /**
     * Resolved at timestamp
     */
    @Column({
        type: 'timestamp',
        nullable: true
    })
    resolvedAt?: Date

    /**
     * Resolution details
     */
    @Column({
        type: 'text',
        nullable: true
    })
    resolution?: string

    /**
     * Organization ID
     */
    @Column({
        type: 'varchar',
        length: 100,
        nullable: true
    })
    @Index()
    organizationId?: string

    /**
     * Workspace ID
     */
    @Column({
        type: 'varchar',
        length: 100,
        nullable: true
    })
    @Index()
    workspaceId?: string

    /**
     * User ID
     */
    @Column({
        type: 'varchar',
        length: 100,
        nullable: true
    })
    @Index()
    userId?: string

    /**
     * Resource ID
     */
    @Column({
        type: 'varchar',
        length: 100,
        nullable: true
    })
    @Index()
    resourceId?: string

    /**
     * Resource type
     */
    @Column({
        type: 'varchar',
        length: 100,
        nullable: true
    })
    @Index()
    resourceType?: string

    /**
     * Alert context
     */
    @Column({
        type: 'jsonb',
        nullable: true
    })
    context?: Record<string, any>

    /**
     * Created at timestamp
     */
    @CreateDateColumn()
    createdAt: Date

    /**
     * Updated at timestamp
     */
    @UpdateDateColumn()
    updatedAt: Date
}