import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm'

export class CreateAnalyticsTables1746196963000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create analytics_metric table
        await queryRunner.createTable(
            new Table({
                name: 'analytics_metric',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()'
                    },
                    {
                        name: 'metricType',
                        type: 'enum',
                        enum: ['access_pattern', 'permission_usage', 'authentication', 'compliance', 'security']
                    },
                    {
                        name: 'metricName',
                        type: 'varchar',
                        length: '100'
                    },
                    {
                        name: 'value',
                        type: 'float'
                    },
                    {
                        name: 'granularity',
                        type: 'enum',
                        enum: ['hourly', 'daily', 'weekly', 'monthly']
                    },
                    {
                        name: 'timestamp',
                        type: 'timestamp'
                    },
                    {
                        name: 'organizationId',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'workspaceId',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'userId',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'resourceType',
                        type: 'varchar',
                        length: '100',
                        isNullable: true
                    },
                    {
                        name: 'resourceId',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'dimensions',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'metadata',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'now()'
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'now()'
                    }
                ]
            }),
            true
        )

        // Create analytics_report table
        await queryRunner.createTable(
            new Table({
                name: 'analytics_report',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()'
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255'
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'reportType',
                        type: 'enum',
                        enum: ['access_pattern', 'permission_usage', 'authentication', 'compliance', 'security', 'custom']
                    },
                    {
                        name: 'createdBy',
                        type: 'uuid'
                    },
                    {
                        name: 'organizationId',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'workspaceId',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'parameters',
                        type: 'jsonb'
                    },
                    {
                        name: 'data',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'filePath',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'format',
                        type: 'enum',
                        enum: ['json', 'csv', 'pdf'],
                        default: "'json'"
                    },
                    {
                        name: 'isScheduled',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'scheduleFrequency',
                        type: 'enum',
                        enum: ['daily', 'weekly', 'monthly', 'quarterly'],
                        isNullable: true
                    },
                    {
                        name: 'nextRunTime',
                        type: 'timestamp',
                        isNullable: true
                    },
                    {
                        name: 'lastRunTime',
                        type: 'timestamp',
                        isNullable: true
                    },
                    {
                        name: 'recipients',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'isActive',
                        type: 'boolean',
                        default: true
                    },
                    {
                        name: 'metadata',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'now()'
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'now()'
                    }
                ]
            }),
            true
        )

        // Create analytics_dashboard table
        await queryRunner.createTable(
            new Table({
                name: 'analytics_dashboard',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()'
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255'
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'dashboardType',
                        type: 'enum',
                        enum: ['access_pattern', 'permission_usage', 'authentication', 'compliance', 'security', 'custom']
                    },
                    {
                        name: 'createdBy',
                        type: 'uuid'
                    },
                    {
                        name: 'organizationId',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'workspaceId',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'visibility',
                        type: 'enum',
                        enum: ['private', 'organization', 'public'],
                        default: "'private'"
                    },
                    {
                        name: 'layout',
                        type: 'jsonb'
                    },
                    {
                        name: 'filters',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'timeRange',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'refreshRate',
                        type: 'integer',
                        default: 0
                    },
                    {
                        name: 'isActive',
                        type: 'boolean',
                        default: true
                    },
                    {
                        name: 'metadata',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'now()'
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'now()'
                    }
                ]
            }),
            true
        )

        // Create analytics_widget table
        await queryRunner.createTable(
            new Table({
                name: 'analytics_widget',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()'
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255'
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'widgetType',
                        type: 'enum',
                        enum: ['line_chart', 'bar_chart', 'pie_chart', 'table', 'metric', 'heatmap', 'gauge', 'timeline', 'map', 'custom']
                    },
                    {
                        name: 'dashboardId',
                        type: 'uuid'
                    },
                    {
                        name: 'dataSourceType',
                        type: 'enum',
                        enum: ['metric', 'audit_log', 'access_review', 'permission', 'custom_query']
                    },
                    {
                        name: 'query',
                        type: 'jsonb'
                    },
                    {
                        name: 'visualization',
                        type: 'jsonb'
                    },
                    {
                        name: 'layout',
                        type: 'jsonb'
                    },
                    {
                        name: 'refreshRate',
                        type: 'integer',
                        default: 0
                    },
                    {
                        name: 'isActive',
                        type: 'boolean',
                        default: true
                    },
                    {
                        name: 'metadata',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'now()'
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'now()'
                    }
                ],
                foreignKeys: [
                    {
                        columnNames: ['dashboardId'],
                        referencedTableName: 'analytics_dashboard',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE'
                    }
                ]
            }),
            true
        )

        // Create analytics_alert table
        await queryRunner.createTable(
            new Table({
                name: 'analytics_alert',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()'
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255'
                    },
                    {
                        name: 'description',
                        type: 'text'
                    },
                    {
                        name: 'alertType',
                        type: 'enum',
                        enum: [
                            'authentication_failure',
                            'permission_denial',
                            'suspicious_activity',
                            'policy_violation',
                            'dormant_account',
                            'excessive_permission',
                            'compliance_issue',
                            'custom'
                        ]
                    },
                    {
                        name: 'severity',
                        type: 'enum',
                        enum: ['info', 'low', 'medium', 'high', 'critical'],
                        default: "'medium'"
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['active', 'acknowledged', 'resolved', 'dismissed'],
                        default: "'active'"
                    },
                    {
                        name: 'detectedAt',
                        type: 'timestamp'
                    },
                    {
                        name: 'organizationId',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'workspaceId',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'userId',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'resourceType',
                        type: 'varchar',
                        length: '100',
                        isNullable: true
                    },
                    {
                        name: 'resourceId',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'context',
                        type: 'jsonb'
                    },
                    {
                        name: 'acknowledgedBy',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'acknowledgedAt',
                        type: 'timestamp',
                        isNullable: true
                    },
                    {
                        name: 'resolvedBy',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'resolvedAt',
                        type: 'timestamp',
                        isNullable: true
                    },
                    {
                        name: 'resolutionNotes',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'metadata',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'now()'
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'now()'
                    }
                ]
            }),
            true
        )

        // Create indexes
        await queryRunner.createIndex(
            'analytics_metric',
            new TableIndex({
                name: 'IDX_ANALYTICS_METRIC_TIMESTAMP',
                columnNames: ['timestamp']
            })
        )

        await queryRunner.createIndex(
            'analytics_metric',
            new TableIndex({
                name: 'IDX_ANALYTICS_METRIC_TYPE_NAME',
                columnNames: ['metricType', 'metricName']
            })
        )

        await queryRunner.createIndex(
            'analytics_metric',
            new TableIndex({
                name: 'IDX_ANALYTICS_METRIC_ORGANIZATION',
                columnNames: ['organizationId']
            })
        )

        await queryRunner.createIndex(
            'analytics_report',
            new TableIndex({
                name: 'IDX_ANALYTICS_REPORT_TYPE',
                columnNames: ['reportType']
            })
        )

        await queryRunner.createIndex(
            'analytics_report',
            new TableIndex({
                name: 'IDX_ANALYTICS_REPORT_ORGANIZATION',
                columnNames: ['organizationId']
            })
        )

        await queryRunner.createIndex(
            'analytics_dashboard',
            new TableIndex({
                name: 'IDX_ANALYTICS_DASHBOARD_TYPE',
                columnNames: ['dashboardType']
            })
        )

        await queryRunner.createIndex(
            'analytics_dashboard',
            new TableIndex({
                name: 'IDX_ANALYTICS_DASHBOARD_ORGANIZATION',
                columnNames: ['organizationId']
            })
        )

        await queryRunner.createIndex(
            'analytics_alert',
            new TableIndex({
                name: 'IDX_ANALYTICS_ALERT_TYPE',
                columnNames: ['alertType']
            })
        )

        await queryRunner.createIndex(
            'analytics_alert',
            new TableIndex({
                name: 'IDX_ANALYTICS_ALERT_STATUS',
                columnNames: ['status']
            })
        )

        await queryRunner.createIndex(
            'analytics_alert',
            new TableIndex({
                name: 'IDX_ANALYTICS_ALERT_DETECTED_AT',
                columnNames: ['detectedAt']
            })
        )

        await queryRunner.createIndex(
            'analytics_alert',
            new TableIndex({
                name: 'IDX_ANALYTICS_ALERT_ORGANIZATION',
                columnNames: ['organizationId']
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.dropIndex('analytics_metric', 'IDX_ANALYTICS_METRIC_TIMESTAMP')
        await queryRunner.dropIndex('analytics_metric', 'IDX_ANALYTICS_METRIC_TYPE_NAME')
        await queryRunner.dropIndex('analytics_metric', 'IDX_ANALYTICS_METRIC_ORGANIZATION')
        await queryRunner.dropIndex('analytics_report', 'IDX_ANALYTICS_REPORT_TYPE')
        await queryRunner.dropIndex('analytics_report', 'IDX_ANALYTICS_REPORT_ORGANIZATION')
        await queryRunner.dropIndex('analytics_dashboard', 'IDX_ANALYTICS_DASHBOARD_TYPE')
        await queryRunner.dropIndex('analytics_dashboard', 'IDX_ANALYTICS_DASHBOARD_ORGANIZATION')
        await queryRunner.dropIndex('analytics_alert', 'IDX_ANALYTICS_ALERT_TYPE')
        await queryRunner.dropIndex('analytics_alert', 'IDX_ANALYTICS_ALERT_STATUS')
        await queryRunner.dropIndex('analytics_alert', 'IDX_ANALYTICS_ALERT_DETECTED_AT')
        await queryRunner.dropIndex('analytics_alert', 'IDX_ANALYTICS_ALERT_ORGANIZATION')

        // Drop tables
        await queryRunner.dropTable('analytics_alert')
        await queryRunner.dropTable('analytics_widget')
        await queryRunner.dropTable('analytics_dashboard')
        await queryRunner.dropTable('analytics_report')
        await queryRunner.dropTable('analytics_metric')
    }
}