import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from 'typeorm'

/**
 * Metric type enum
 */
export enum MetricType {
    RESOURCE_USAGE = 'resource_usage',
    USER_ACTIVITY = 'user_activity',
    PERMISSION_USAGE = 'permission_usage',
    ACCESS_PATTERN = 'access_pattern',
    SECURITY = 'security',
    COMPLIANCE = 'compliance',
    PERFORMANCE = 'performance'
}

/**
 * Time granularity enum
 */
export enum TimeGranularity {
    HOURLY = 'hourly',
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly'
}

/**
 * Analytics Metric Entity
 * Stores metrics for analytics
 */
@Entity('analytics_metrics')
export class AnalyticsMetric {
    /**
     * Primary key
     */
    @PrimaryGeneratedColumn('uuid')
    id: string

    /**
     * Metric type
     */
    @Column({
        type: 'enum',
        enum: MetricType,
        nullable: false
    })
    @Index()
    metricType: MetricType

    /**
     * Metric name
     */
    @Column({
        type: 'varchar',
        length: 100,
        nullable: false
    })
    @Index()
    metricName: string

    /**
     * Metric value
     */
    @Column({
        type: 'float',
        nullable: false
    })
    value: number

    /**
     * Timestamp
     */
    @Column({
        type: 'timestamp',
        nullable: false
    })
    @Index()
    timestamp: Date

    /**
     * Time granularity
     */
    @Column({
        type: 'enum',
        enum: TimeGranularity,
        nullable: false,
        default: TimeGranularity.HOURLY
    })
    @Index()
    granularity: TimeGranularity

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
     * Additional dimensions
     */
    @Column({
        type: 'jsonb',
        nullable: true
    })
    dimensions?: Record<string, any>

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