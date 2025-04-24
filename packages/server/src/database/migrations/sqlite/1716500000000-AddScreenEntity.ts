import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddScreenEntity1716500000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Screen table with SQLite-compatible syntax
        await queryRunner.query(`
            CREATE TABLE "screen" (
                "id" varchar PRIMARY KEY,
                "path" varchar NOT NULL,
                "queryParameters" text NULL,
                "pathParameters" text NULL,
                "title" varchar NOT NULL,
                "description" text NULL,
                "metadata" text NULL,
                "uiFlowId" varchar NOT NULL,
                "createdDate" datetime DEFAULT (datetime('now')),
                "updatedDate" datetime DEFAULT (datetime('now'))
            )
        `)

        // Add foreign key for Screen to UIFlow using SQLite syntax
        await queryRunner.query(`
            CREATE INDEX "IDX_screen_uiFlowId" ON "screen" ("uiFlowId")
        `)

        // Add screenId column to ui_component table
        await queryRunner.query(`
            ALTER TABLE "ui_component" ADD COLUMN "screenId" varchar NULL
        `)

        // Create index on screenId
        await queryRunner.query(`
            CREATE INDEX "IDX_ui_component_screenId" ON "ui_component" ("screenId")
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indices
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ui_component_screenId"`)
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_screen_uiFlowId"`)
        
        // SQLite doesn't support DROP COLUMN, so we skip the column removal

        // Drop screen table
        await queryRunner.query(`DROP TABLE IF EXISTS "screen"`)
    }
} 