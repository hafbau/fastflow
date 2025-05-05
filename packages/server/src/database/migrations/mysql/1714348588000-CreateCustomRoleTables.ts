import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

/**
 * Migration to create custom role tables for MySQL
 */
export class CreateCustomRoleTables1714348588000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create custom_role table
        await queryRunner.createTable(
            new Table({
                name: 'custom_role',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '100'
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: ['system', 'custom'],
                        default: "'custom'"
                    },
                    {
                        name: 'organizationId',
                        type: 'varchar',
                        length: '36',
                        isNullable: true
                    },
                    {
                        name: 'parentRoleId',
                        type: 'varchar',
                        length: '36',
                        isNullable: true
                    },
                    {
                        name: 'priority',
                        type: 'int',
                        default: 0
                    },
                    {
                        name: 'version',
                        type: 'int',
                        default: 1
                    },
                    {
                        name: 'isTemplate',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'templateId',
                        type: 'varchar',
                        length: '36',
                        isNullable: true
                    }
                ],
                engine: 'InnoDB'
            }),
            true
        )

        // Add foreign keys
        await queryRunner.createForeignKey(
            'custom_role',
            new TableForeignKey({
                columnNames: ['organizationId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'organization',
                onDelete: 'CASCADE'
            })
        )

        await queryRunner.createForeignKey(
            'custom_role',
            new TableForeignKey({
                columnNames: ['parentRoleId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'role',
                onDelete: 'SET NULL'
            })
        )

        await queryRunner.createForeignKey(
            'custom_role',
            new TableForeignKey({
                columnNames: ['templateId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'custom_role',
                onDelete: 'SET NULL'
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys first
        const table = await queryRunner.getTable('custom_role')
        if (table) {
            const foreignKeys = table.foreignKeys
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey('custom_role', foreignKey)
            }
        }

        // Drop the table
        await queryRunner.dropTable('custom_role')
    }
}