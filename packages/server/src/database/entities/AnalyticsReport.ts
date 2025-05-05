import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from 'typeorm'

/**
 * Report type enum
 */
export enum ReportType {
    ACCESS = 'access',
    PERMISSIONS = 'permissions',
    COMPLIANCE = 'compliance',
    SECURITY = 'security',
    CUSTOM = 'custom'
}

/**
 * Report format enum
 */
export enum ReportFormat {
    PDF = 'pdf',
    CSV = 'csv',
    JSON = 'json',
    HTML = 'html'
}

/**
 * Report schedule enum
 */
export enum ReportSchedule {
    ONCE = 'once',
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly'
}

/**
 * Analytics Report Entity
 * Stores reports for analytics
 */
@Entity('analytics_reports')
export class AnalyticsReport {
    /**
     * Primary key
     */
    @PrimaryGeneratedColumn('uuid')
    id: string

    /**
     * Report name
     */
    @Column({
        type: 'varchar',
        length: 255,
        nullable: false
    })
    name: string

    /**
     * Report description
     */
    @Column({
        type: 'text',
        nullable: true
    })
    description?: string

    /**
     * Report type
     */
    @Column({
        type: 'varchar',
        enum: ReportType,
        nullable: false
    })
    @Index()
    reportType: ReportType

    /**
     * Report format
     */
    @Column({
        type: 'varchar',
        enum: ReportFormat,
        nullable: false,
        default: ReportFormat.PDF
    })
    format: ReportFormat

    /**
     * Report schedule
     */
    @Column({
        type: 'varchar',
        enum: ReportSchedule,
        nullable: false,
        default: ReportSchedule.ONCE
    })
    schedule: ReportSchedule

    /**
     * Last generated timestamp
     */
    @Column({
        type: 'datetime',
        nullable: true
    })
    lastGeneratedAt?: Date

    /**
     * Next scheduled timestamp
     */
    @Column({
        type: 'datetime',
        nullable: true
    })
    nextScheduledAt?: Date

    /**
     * Report configuration
     */
    @Column({
        type: 'simple-json',
        nullable: false
    })
    configuration: Record<string, any>

    /**
     * Report filters
     */
    @Column({
        type: 'simple-json',
        nullable: true
    })
    filters?: Record<string, any>

    /**
     * Report data
     */
    @Column({
        type: 'simple-json',
        nullable: true
    })
    data?: Record<string, any>

    /**
     * File path
     */
    @Column({
        type: 'varchar',
        length: 255,
        nullable: true
    })
    filePath?: string

    /**
     * Creator user ID
     */
    @Column({
        type: 'varchar',
        length: 100,
        nullable: false
    })
    @Index()
    createdBy: string

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
     * Recipients
     */
    @Column({
        type: 'simple-json',
        nullable: true
    })
    recipients?: string[]

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