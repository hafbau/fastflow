import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Migration to add the scope column to the permission table for MariaDB
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
            // Add scope column with ENUM type
            await queryRunner.query(`
                ALTER TABLE \`permission\` ADD COLUMN \`scope\` ENUM('system', 'organization', 'workspace', 'resource') DEFAULT 'resource'
            `)
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists
        const tableExists = await queryRunner.hasTable('permission')
        if (!tableExists) {
            return
        }
        
        // Check if scope column exists before dropping
        const table = await queryRunner.getTable('permission')
        if (table && table.findColumnByName('scope')) {
            await queryRunner.query(`
                ALTER TABLE \`permission\` DROP COLUMN \`scope\`
            `)
        }
    }
}