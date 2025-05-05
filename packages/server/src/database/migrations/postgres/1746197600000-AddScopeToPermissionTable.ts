import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Migration to add the scope column to the permission table for PostgreSQL
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
            // Create enum type if it doesn't exist
            await queryRunner.query(`
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission_scope_enum') THEN
                        CREATE TYPE "permission_scope_enum" AS ENUM ('system', 'organization', 'workspace', 'resource');
                    END IF;
                END
                $$;
            `)
            
            // Add scope column
            await queryRunner.query(`
                ALTER TABLE "permission" ADD COLUMN "scope" "permission_scope_enum" DEFAULT 'resource'
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
                ALTER TABLE "permission" DROP COLUMN "scope"
            `)
        }
    }
}