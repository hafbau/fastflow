import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Migration to add the scope column to the permission table for SQLite
 */
export class AddScopeToPermissionTable1746197600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists
        const tableExists = await queryRunner.hasTable('permission')
        if (!tableExists) {
            return
        }
        
        // Check if scope column already exists
        const table = await queryRunner.getTable('permission')
        if (table && !table.findColumnByName('scope')) {
            // Add scope column
            await queryRunner.query(`
                ALTER TABLE permission ADD COLUMN "scope" varchar DEFAULT 'resource'
            `)
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // SQLite doesn't support dropping columns directly
        // We would need to recreate the table without the column
        // This is left empty as it's not advised to roll back this migration
    }
}