import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Migration to add the name column to the permission table for SQLite
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
                ALTER TABLE permission ADD COLUMN "name" varchar(150)
            `)
            
            // Update existing permissions with name
            await queryRunner.query(`
                UPDATE permission SET "name" = "resourceType" || ':' || "action" WHERE "name" IS NULL
            `)
            
            // Add unique constraint
            await queryRunner.query(`
                CREATE UNIQUE INDEX IF NOT EXISTS "UQ_permission_name" ON "permission" ("name")
            `)
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // SQLite doesn't support dropping columns directly
        // This is left empty as it's not advised to roll back this migration
    }
}