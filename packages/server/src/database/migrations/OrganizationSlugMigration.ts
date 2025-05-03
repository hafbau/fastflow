import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm'

/**
 * Migration to add slug column to organization table
 */
export class OrganizationSlugMigration implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the column already exists
        const table = await queryRunner.getTable('organization')
        const slugColumn = table?.findColumnByName('slug')

        if (!slugColumn) {
            // Add slug column
            await queryRunner.addColumn(
                'organization',
                new TableColumn({
                    name: 'slug',
                    type: 'varchar',
                    length: '255',
                    isNullable: true // Initially allow null for existing records
                })
            )

            // Generate slugs for existing organizations
            await queryRunner.query(`
                UPDATE organization
                SET slug = LOWER(REPLACE(name, ' ', '-'))
                WHERE slug IS NULL
            `)

            // Make slug column not nullable
            await queryRunner.changeColumn(
                'organization',
                'slug',
                new TableColumn({
                    name: 'slug',
                    type: 'varchar',
                    length: '255',
                    isNullable: false
                })
            )

            // Add unique index
            await queryRunner.createIndex(
                'organization',
                new TableIndex({
                    name: 'IDX_ORGANIZATION_SLUG',
                    columnNames: ['slug'],
                    isUnique: true
                })
            )
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop index
        await queryRunner.dropIndex('organization', 'IDX_ORGANIZATION_SLUG')

        // Drop column
        await queryRunner.dropColumn('organization', 'slug')
    }
}