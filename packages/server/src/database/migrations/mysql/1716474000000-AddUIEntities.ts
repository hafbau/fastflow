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
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid'
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255'
                    },
                    {
                        name: 'description',
                        type: 'varchar',
                        length: '255',
                        isNullable: true
                    },
                    {
                        name: 'type',
                        type: 'varchar',
                        length: '255'
                    },
                    {
                        name: 'category',
                        type: 'varchar',
                        length: '255'
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
                        length: '255',
                        isNullable: true
                    },
                    {
                        name: 'createdDate',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    },
                    {
                        name: 'updatedDate',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP'
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
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid'
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255'
                    },
                    {
                        name: 'description',
                        type: 'varchar',
                        length: '255',
                        isNullable: true
                    },
                    {
                        name: 'flowData',
                        type: 'text'
                    },
                    {
                        name: 'chatflowId',
                        type: 'varchar',
                        length: '36'
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
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    },
                    {
                        name: 'updatedDate',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP'
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