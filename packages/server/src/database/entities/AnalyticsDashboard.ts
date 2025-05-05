import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'

/**
 * Dashboard types
 */
export enum DashboardType {
    ACCESS_PATTERN = 'access_pattern',
    PERMISSION_USAGE = 'permission_usage',
    AUTHENTICATION = 'authentication',
    COMPLIANCE = 'compliance',
    SECURITY = 'security',
    CUSTOM = 'custom'
}

/**
 * Dashboard visibility
 */
export enum DashboardVisibility {
    PRIVATE = 'private',
    ORGANIZATION = 'organization',
    PUBLIC = 'public'
}

/**
 * AnalyticsDashboard entity
 * Represents a dashboard configuration for analytics
 */
@Entity('analytics_dashboard')
export class AnalyticsDashboard {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ length: 255 })
    name: string

    @Column({ type: 'text', nullable: true })
    description?: string

    @Column({
        type: 'varchar',
        enum: DashboardType
    })
    dashboardType: DashboardType

    @Column({ type: 'uuid' })
    createdBy: string

    @Column({ type: 'uuid', nullable: true })
    organizationId?: string

    @Column({ type: 'uuid', nullable: true })
    workspaceId?: string

    @Column({
        type: 'varchar',
        enum: DashboardVisibility,
        default: DashboardVisibility.PRIVATE
    })
    visibility: DashboardVisibility

    /**
     * Layout configuration for the dashboard
     * Contains information about widgets, their positions, sizes, and configurations
     */
    @Column({ type: 'simple-json' })
    layout: Record<string, any>

    /**
     * Filter configuration for the dashboard
     * Contains default filters applied to the dashboard
     */
    @Column({ type: 'simple-json', nullable: true })
    filters?: Record<string, any>

    /**
     * Time range configuration for the dashboard
     * Contains default time range for the dashboard
     */
    @Column({ type: 'simple-json', nullable: true })
    timeRange?: {
        start?: string;
        end?: string;
        preset?: string;
    }

    /**
     * Refresh rate in seconds
     * 0 means no auto-refresh
     */
    @Column({ type: 'integer', default: 0 })
    refreshRate: number

    @Column({ type: 'boolean', default: true })
    isActive: boolean

    @Column({ type: 'simple-json', nullable: true })
    metadata?: Record<string, any>

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

export default AnalyticsDashboard