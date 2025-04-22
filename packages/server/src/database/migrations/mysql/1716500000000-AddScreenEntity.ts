import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class AddScreenEntity1716500000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Screen table
        await queryRunner.createTable(
            new Table({
                name: 'screen',
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
                        name: 'path',
                        type: 'varchar',
                        length: '255'
                    },
                    {
                        name: 'queryParameters',
                        type: 'json',
                        isNullable: true
                    },
                    {
                        name: 'pathParameters',
                        type: 'json',
                        isNullable: true
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        length: '255'
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'metadata',
                        type: 'json',
                        isNullable: true
                    },
                    {
                        name: 'uiFlowId',
                        type: 'varchar',
                        length: '36'
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

        // Add foreign key for Screen to UIFlow
        await queryRunner.createForeignKey(
            'screen',
            new TableForeignKey({
                columnNames: ['uiFlowId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'ui_flow',
                onDelete: 'CASCADE'
            })
        )

        // Add screenId column to ui_component table
        await queryRunner.query(`ALTER TABLE \`ui_component\` ADD \`screenId\` varchar(36) NULL`)

        // Add foreign key for UIComponent to Screen
        await queryRunner.createForeignKey(
            'ui_component',
            new TableForeignKey({
                columnNames: ['screenId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'screen',
                onDelete: 'SET NULL'
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key from ui_component to screen
        const uiComponentTable = await queryRunner.getTable('ui_component')
        if (uiComponentTable) {
            const screenForeignKey = uiComponentTable.foreignKeys.find(fk => fk.columnNames.indexOf('screenId') !== -1)
            if (screenForeignKey) {
                await queryRunner.dropForeignKey('ui_component', screenForeignKey)
            }
        }

        // Drop screenId column from ui_component
        await queryRunner.query(`ALTER TABLE \`ui_component\` DROP COLUMN \`screenId\``)

        // Drop foreign key from screen to ui_flow
        const screenTable = await queryRunner.getTable('screen')
        if (screenTable) {
            const uiFlowForeignKey = screenTable.foreignKeys.find(fk => fk.columnNames.indexOf('uiFlowId') !== -1)
            if (uiFlowForeignKey) {
                await queryRunner.dropForeignKey('screen', uiFlowForeignKey)
            }
        }

        // Drop screen table
        await queryRunner.dropTable('screen')
    }
} 