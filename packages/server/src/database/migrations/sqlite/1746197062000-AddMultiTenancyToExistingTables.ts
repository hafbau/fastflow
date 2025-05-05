import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMultiTenancyToExistingTables1746197062000 implements MigrationInterface {
    name = 'AddMultiTenancyToExistingTables1746197062000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add organizationId and workspaceId to ChatFlow table
        await queryRunner.query(`
            ALTER TABLE "chat_flow" ADD COLUMN "organizationId" varchar
        `)
        await queryRunner.query(`
            ALTER TABLE "chat_flow" ADD COLUMN "workspaceId" varchar
        `)

        // Add organizationId and workspaceId to Credential table
        await queryRunner.query(`
            ALTER TABLE "credential" ADD COLUMN "organizationId" varchar
        `)
        await queryRunner.query(`
            ALTER TABLE "credential" ADD COLUMN "workspaceId" varchar
        `)

        // Add organizationId and workspaceId to Tool table
        await queryRunner.query(`
            ALTER TABLE "tool" ADD COLUMN "organizationId" varchar
        `)
        await queryRunner.query(`
            ALTER TABLE "tool" ADD COLUMN "workspaceId" varchar
        `)

        // Add organizationId and workspaceId to Assistant table
        await queryRunner.query(`
            ALTER TABLE "assistant" ADD COLUMN "organizationId" varchar
        `)
        await queryRunner.query(`
            ALTER TABLE "assistant" ADD COLUMN "workspaceId" varchar
        `)

        // Add organizationId and workspaceId to Variable table
        await queryRunner.query(`
            ALTER TABLE "variable" ADD COLUMN "organizationId" varchar
        `)
        await queryRunner.query(`
            ALTER TABLE "variable" ADD COLUMN "workspaceId" varchar
        `)

        // Add organizationId and workspaceId to DocumentStore table
        await queryRunner.query(`
            ALTER TABLE "document_store" ADD COLUMN "organizationId" varchar
        `)
        await queryRunner.query(`
            ALTER TABLE "document_store" ADD COLUMN "workspaceId" varchar
        `)

        // Add organizationId and workspaceId to ApiKey table
        await queryRunner.query(`
            ALTER TABLE "apikey" ADD COLUMN "organizationId" varchar
        `)
        await queryRunner.query(`
            ALTER TABLE "apikey" ADD COLUMN "workspaceId" varchar
        `)

        // Add organizationId and workspaceId to CustomTemplate table
        await queryRunner.query(`
            ALTER TABLE "custom_template" ADD COLUMN "organizationId" varchar
        `)
        await queryRunner.query(`
            ALTER TABLE "custom_template" ADD COLUMN "workspaceId" varchar
        `)

        // Create foreign key constraints
        // Note: SQLite doesn't support ALTER TABLE ADD CONSTRAINT, so we need to use PRAGMA foreign_keys
        // and ensure the references are correct when adding the columns

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_chat_flow_organization" ON "chat_flow" ("organizationId")`)
        await queryRunner.query(`CREATE INDEX "IDX_chat_flow_workspace" ON "chat_flow" ("workspaceId")`)
        await queryRunner.query(`CREATE INDEX "IDX_credential_organization" ON "credential" ("organizationId")`)
        await queryRunner.query(`CREATE INDEX "IDX_credential_workspace" ON "credential" ("workspaceId")`)
        await queryRunner.query(`CREATE INDEX "IDX_tool_organization" ON "tool" ("organizationId")`)
        await queryRunner.query(`CREATE INDEX "IDX_tool_workspace" ON "tool" ("workspaceId")`)
        await queryRunner.query(`CREATE INDEX "IDX_assistant_organization" ON "assistant" ("organizationId")`)
        await queryRunner.query(`CREATE INDEX "IDX_assistant_workspace" ON "assistant" ("workspaceId")`)
        await queryRunner.query(`CREATE INDEX "IDX_variable_organization" ON "variable" ("organizationId")`)
        await queryRunner.query(`CREATE INDEX "IDX_variable_workspace" ON "variable" ("workspaceId")`)
        await queryRunner.query(`CREATE INDEX "IDX_document_store_organization" ON "document_store" ("organizationId")`)
        await queryRunner.query(`CREATE INDEX "IDX_document_store_workspace" ON "document_store" ("workspaceId")`)
        await queryRunner.query(`CREATE INDEX "IDX_api_key_organization" ON "apikey" ("organizationId")`)
        await queryRunner.query(`CREATE INDEX "IDX_api_key_workspace" ON "apikey" ("workspaceId")`)
        await queryRunner.query(`CREATE INDEX "IDX_custom_template_organization" ON "custom_template" ("organizationId")`)
        await queryRunner.query(`CREATE INDEX "IDX_custom_template_workspace" ON "custom_template" ("workspaceId")`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_chat_flow_organization"`)
        await queryRunner.query(`DROP INDEX "IDX_chat_flow_workspace"`)
        await queryRunner.query(`DROP INDEX "IDX_credential_organization"`)
        await queryRunner.query(`DROP INDEX "IDX_credential_workspace"`)
        await queryRunner.query(`DROP INDEX "IDX_tool_organization"`)
        await queryRunner.query(`DROP INDEX "IDX_tool_workspace"`)
        await queryRunner.query(`DROP INDEX "IDX_assistant_organization"`)
        await queryRunner.query(`DROP INDEX "IDX_assistant_workspace"`)
        await queryRunner.query(`DROP INDEX "IDX_variable_organization"`)
        await queryRunner.query(`DROP INDEX "IDX_variable_workspace"`)
        await queryRunner.query(`DROP INDEX "IDX_document_store_organization"`)
        await queryRunner.query(`DROP INDEX "IDX_document_store_workspace"`)
        await queryRunner.query(`DROP INDEX "IDX_api_key_organization"`)
        await queryRunner.query(`DROP INDEX "IDX_api_key_workspace"`)
        await queryRunner.query(`DROP INDEX "IDX_custom_template_organization"`)
        await queryRunner.query(`DROP INDEX "IDX_custom_template_workspace"`)

        // SQLite doesn't support DROP COLUMN, so we would need to recreate the tables
        // This is a simplified version that assumes the migration will not be rolled back
        // In a real scenario, we would need to create new tables, copy data, drop old tables, and rename new tables
        
        // For demonstration purposes, we'll just show the concept:
        // 1. Create new tables without the columns
        // 2. Copy data from old tables to new tables
        // 3. Drop old tables
        // 4. Rename new tables to original names
        
        // This is just a placeholder for the down migration
        await queryRunner.query(`-- SQLite doesn't support DROP COLUMN, would need table recreation`)
    }
}