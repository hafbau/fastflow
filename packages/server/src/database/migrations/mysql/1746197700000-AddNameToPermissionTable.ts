import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Migration to add the name column to the permission table for MySQL
 */
export class AddNameToPermissionTable1746197700000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists
        const tableExists = await queryRunner.hasTable('permission')
        if (!tableExists) {
            return
        }
        
        // Check if name column already exists
        const table = await queryRunner.getTable('permission')
        if (table && !table.findColumnByName('name')) {
            // Add name column
            await queryRunner.query(`
                ALTER TABLE \`permission\` ADD COLUMN \`name\` VARCHAR(150)
            `)
            
            // Update existing permissions with name
            await queryRunner.query(`
                UPDATE \`permission\` SET \`name\` = CONCAT(\`resourceType\`, ':', \`action\`) WHERE \`name\` IS NULL
            `)
            
            // Add unique constraint
            await queryRunner.query(`
                ALTER TABLE \`permission\` ADD UNIQUE INDEX \`UQ_permission_name\` (\`name\`)
            `)
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists
        const tableExists = await queryRunner.hasTable('permission')
        if (!tableExists) {
            return
        }
        
        // Check if name column exists before dropping
        const table = await queryRunner.getTable('permission')
        if (table && table.findColumnByName('name')) {
            // Drop unique constraint
            await queryRunner.query(`
                ALTER TABLE \`permission\` DROP INDEX \`UQ_permission_name\`
            `)
            
            // Drop name column
            await queryRunner.query(`
                ALTER TABLE \`permission\` DROP COLUMN \`name\`
            `)
        }
    }
}