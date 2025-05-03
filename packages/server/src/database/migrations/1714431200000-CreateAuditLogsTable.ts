import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm'

export class CreateAuditLogsTable1714431200000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'audit_logs',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid'
                    },
                    {
                        name: 'userId',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'action',
                        type: 'varchar',
                        length: '255'
                    },
                    {
                        name: 'resourceType',
                        type: 'varchar',
                        length: '255'
                    },
                    {
                        name: 'resourceId',
                        type: 'varchar',
                        length: '255',
                        isNullable: true
                    },
                    {
                        name: 'metadata',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'ipAddress',
                        type: 'varchar',
                        length: '255',
                        isNullable: true
                    },
                    {
                        name: 'timestamp',
                        type: 'timestamp',
                        default: 'now()'
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'now()'
                    }
                ]
            }),
            true
        )

        // Create indexes for better query performance
        await queryRunner.createIndex(
            'audit_logs',
            new TableIndex({
                name: 'IDX_AUDIT_LOGS_USER_ID',
                columnNames: ['userId']
            })
        )

        await queryRunner.createIndex(
            'audit_logs',
            new TableIndex({
                name: 'IDX_AUDIT_LOGS_ACTION',
                columnNames: ['action']
            })
        )

        await queryRunner.createIndex(
            'audit_logs',
            new TableIndex({
                name: 'IDX_AUDIT_LOGS_RESOURCE_TYPE',
                columnNames: ['resourceType']
            })
        )

        await queryRunner.createIndex(
            'audit_logs',
            new TableIndex({
                name: 'IDX_AUDIT_LOGS_RESOURCE_ID',
                columnNames: ['resourceId']
            })
        )

        await queryRunner.createIndex(
            'audit_logs',
            new TableIndex({
                name: 'IDX_AUDIT_LOGS_TIMESTAMP',
                columnNames: ['timestamp']
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_USER_ID')
        await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_ACTION')
        await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_RESOURCE_TYPE')
        await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_RESOURCE_ID')
        await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_TIMESTAMP')

        // Drop table
        await queryRunner.dropTable('audit_logs')
    }
}