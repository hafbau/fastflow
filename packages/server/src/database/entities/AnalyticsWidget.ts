import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { AnalyticsDashboard } from './AnalyticsDashboard'

/**
 * Widget types
 */
export enum WidgetType {
    LINE_CHART = 'line_chart',
    BAR_CHART = 'bar_chart',
    PIE_CHART = 'pie_chart',
    TABLE = 'table',
    METRIC = 'metric',
    HEATMAP = 'heatmap',
    GAUGE = 'gauge',
    TIMELINE = 'timeline',
    MAP = 'map',
    CUSTOM = 'custom'
}

/**
 * Data source types
 */
export enum DataSourceType {
    METRIC = 'metric',
    AUDIT_LOG = 'audit_log',
    ACCESS_REVIEW = 'access_review',
    PERMISSION = 'permission',
    CUSTOM_QUERY = 'custom_query'
}

/**
 * AnalyticsWidget entity
 * Represents a widget in an analytics dashboard
 */
@Entity('analytics_widget')
export class AnalyticsWidget {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ length: 255 })
    name: string

    @Column({ type: 'text', nullable: true })
    description?: string

    @Column({
        type: 'varchar',
        enum: WidgetType
    })
    widgetType: WidgetType

    @Column({ type: 'uuid' })
    dashboardId: string

    @ManyToOne(() => AnalyticsDashboard, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'dashboardId' })
    dashboard: AnalyticsDashboard

    @Column({
        type: 'varchar',
        enum: DataSourceType
    })
    dataSourceType: DataSourceType

    /**
     * Query configuration for the widget
     * Contains the query parameters to fetch data for the widget
     */
    @Column({ type: 'simple-json' })
    query: Record<string, any>

    /**
     * Visualization configuration for the widget
     * Contains settings for how the data should be visualized
     */
    @Column({ type: 'simple-json' })
    visualization: Record<string, any>

    /**
     * Position and size in the dashboard layout
     */
    @Column({ type: 'simple-json' })
    layout: {
        x: number;
        y: number;
        w: number;
        h: number;
    }

    /**
     * Refresh rate in seconds
     * 0 means use dashboard refresh rate
     */
    @Column({ type: 'integer', default: 0 })
    refreshRate: number

    @Column({ type: 'boolean', default: true })
    isActive: boolean

    @Column({ type: 'simple-json', nullable: true })
    metadata?: Record<string, any>

    @CreateDateColumn({ type: 'datetime' })
    createdAt: Date

    @UpdateDateColumn({ type: 'datetime' })
    updatedAt: Date
}

export default AnalyticsWidget