import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class AddUIEntities1716474000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create UIComponent table
        await queryRunner.createTable(
            new Table({
                name: 'ui_component',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid'
                    },
                    {
                        name: 'name',
                        type: 'varchar'
                    },
                    {
                        name: 'description',
                        type: 'varchar',
                        isNullable: true
                    },
                    {
                        name: 'type',
                        type: 'varchar'
                    },
                    {
                        name: 'category',
                        type: 'varchar'
                    },
                    {
                        name: 'schema',
                        type: 'text'
                    },
                    {
                        name: 'template',
                        type: 'text'
                    },
                    {
                        name: 'icon',
                        type: 'varchar',
                        isNullable: true
                    },
                    {
                        name: 'createdDate',
                        type: 'datetime',
                        default: 'datetime(\'now\')'
                    },
                    {
                        name: 'updatedDate',
                        type: 'datetime',
                        default: 'datetime(\'now\')'
                    }
                ]
            }),
            true
        )

        // Create UIFlow table
        await queryRunner.createTable(
            new Table({
                name: 'ui_flow',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid'
                    },
                    {
                        name: 'name',
                        type: 'varchar'
                    },
                    {
                        name: 'description',
                        type: 'varchar',
                        isNullable: true
                    },
                    {
                        name: 'flowData',
                        type: 'text'
                    },
                    {
                        name: 'chatflowId',
                        type: 'uuid'
                    },
                    {
                        name: 'isPublic',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'deployed',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'createdDate',
                        type: 'datetime',
                        default: 'datetime(\'now\')'
                    },
                    {
                        name: 'updatedDate',
                        type: 'datetime',
                        default: 'datetime(\'now\')'
                    }
                ]
            }),
            true
        )

        // Add foreign key for UIFlow to ChatFlow
        await queryRunner.createForeignKey(
            'ui_flow',
            new TableForeignKey({
                columnNames: ['chatflowId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'chatflow',
                onDelete: 'CASCADE'
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key first
        const uiFlowTable = await queryRunner.getTable('ui_flow')
        const foreignKey = uiFlowTable?.foreignKeys.find(fk => fk.columnNames.indexOf('chatflowId') !== -1)
        if (foreignKey) {
            await queryRunner.dropForeignKey('ui_flow', foreignKey)
        }

        // Drop tables
        await queryRunner.dropTable('ui_flow')
        await queryRunner.dropTable('ui_component')
    }
} 