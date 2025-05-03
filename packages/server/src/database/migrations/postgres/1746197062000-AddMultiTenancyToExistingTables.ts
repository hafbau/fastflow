import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMultiTenancyToExistingTables1746197062000 implements MigrationInterface {
    name = 'AddMultiTenancyToExistingTables1746197062000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add organizationId and workspaceId to ChatFlow table
        await queryRunner.query(`
            ALTER TABLE "chat_flow" 
            ADD COLUMN "organizationId" uuid,
            ADD COLUMN "workspaceId" uuid
        `)

        // Add organizationId and workspaceId to Credential table
        await queryRunner.query(`
            ALTER TABLE "credential" 
            ADD COLUMN "organizationId" uuid,
            ADD COLUMN "workspaceId" uuid
        `)

        // Add organizationId and workspaceId to Tool table
        await queryRunner.query(`
            ALTER TABLE "tool" 
            ADD COLUMN "organizationId" uuid,
            ADD COLUMN "workspaceId" uuid
        `)

        // Add organizationId and workspaceId to Assistant table
        await queryRunner.query(`
            ALTER TABLE "assistant" 
            ADD COLUMN "organizationId" uuid,
            ADD COLUMN "workspaceId" uuid
        `)

        // Add organizationId and workspaceId to Variable table
        await queryRunner.query(`
            ALTER TABLE "variable" 
            ADD COLUMN "organizationId" uuid,
            ADD COLUMN "workspaceId" uuid
        `)

        // Add organizationId and workspaceId to DocumentStore table
        await queryRunner.query(`
            ALTER TABLE "document_store" 
            ADD COLUMN "organizationId" uuid,
            ADD COLUMN "workspaceId" uuid
        `)

        // Add organizationId and workspaceId to ApiKey table
        await queryRunner.query(`
            ALTER TABLE "api_key" 
            ADD COLUMN "organizationId" uuid,
            ADD COLUMN "workspaceId" uuid
        `)

        // Add organizationId and workspaceId to CustomTemplate table
        await queryRunner.query(`
            ALTER TABLE "custom_template" 
            ADD COLUMN "organizationId" uuid,
            ADD COLUMN "workspaceId" uuid
        `)

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "chat_flow" 
            ADD CONSTRAINT "FK_chat_flow_organization" 
            FOREIGN KEY ("organizationId") 
            REFERENCES "organization"("id") 
            ON DELETE SET NULL
        `)

        await queryRunner.query(`
            ALTER TABLE "chat_flow" 
            ADD CONSTRAINT "FK_chat_flow_workspace" 
            FOREIGN KEY ("workspaceId") 
            REFERENCES "workspace"("id") 
            ON DELETE SET NULL
        `)

        await queryRunner.query(`
            ALTER TABLE "credential" 
            ADD CONSTRAINT "FK_credential_organization" 
            FOREIGN KEY ("organizationId") 
            REFERENCES "organization"("id") 
            ON DELETE SET NULL
        `)

        await queryRunner.query(`
            ALTER TABLE "credential" 
            ADD CONSTRAINT "FK_credential_workspace" 
            FOREIGN KEY ("workspaceId") 
            REFERENCES "workspace"("id") 
            ON DELETE SET NULL
        `)

        await queryRunner.query(`
            ALTER TABLE "tool" 
            ADD CONSTRAINT "FK_tool_organization" 
            FOREIGN KEY ("organizationId") 
            REFERENCES "organization"("id") 
            ON DELETE SET NULL
        `)

        await queryRunner.query(`
            ALTER TABLE "tool" 
            ADD CONSTRAINT "FK_tool_workspace" 
            FOREIGN KEY ("workspaceId") 
            REFERENCES "workspace"("id") 
            ON DELETE SET NULL
        `)

        await queryRunner.query(`
            ALTER TABLE "assistant" 
            ADD CONSTRAINT "FK_assistant_organization" 
            FOREIGN KEY ("organizationId") 
            REFERENCES "organization"("id") 
            ON DELETE SET NULL
        `)

        await queryRunner.query(`
            ALTER TABLE "assistant" 
            ADD CONSTRAINT "FK_assistant_workspace" 
            FOREIGN KEY ("workspaceId") 
            REFERENCES "workspace"("id") 
            ON DELETE SET NULL
        `)

        await queryRunner.query(`
            ALTER TABLE "variable" 
            ADD CONSTRAINT "FK_variable_organization" 
            FOREIGN KEY ("organizationId") 
            REFERENCES "organization"("id") 
            ON DELETE SET NULL
        `)

        await queryRunner.query(`
            ALTER TABLE "variable" 
            ADD CONSTRAINT "FK_variable_workspace" 
            FOREIGN KEY ("workspaceId") 
            REFERENCES "workspace"("id") 
            ON DELETE SET NULL
        `)

        await queryRunner.query(`
            ALTER TABLE "document_store" 
            ADD CONSTRAINT "FK_document_store_organization" 
            FOREIGN KEY ("organizationId") 
            REFERENCES "organization"("id") 
            ON DELETE SET NULL
        `)

        await queryRunner.query(`
            ALTER TABLE "document_store" 
            ADD CONSTRAINT "FK_document_store_workspace" 
            FOREIGN KEY ("workspaceId") 
            REFERENCES "workspace"("id") 
            ON DELETE SET NULL
        `)

        await queryRunner.query(`
            ALTER TABLE "api_key" 
            ADD CONSTRAINT "FK_api_key_organization" 
            FOREIGN KEY ("organizationId") 
            REFERENCES "organization"("id") 
            ON DELETE SET NULL
        `)

        await queryRunner.query(`
            ALTER TABLE "api_key" 
            ADD CONSTRAINT "FK_api_key_workspace" 
            FOREIGN KEY ("workspaceId") 
            REFERENCES "workspace"("id") 
            ON DELETE SET NULL
        `)

        await queryRunner.query(`
            ALTER TABLE "custom_template" 
            ADD CONSTRAINT "FK_custom_template_organization" 
            FOREIGN KEY ("organizationId") 
            REFERENCES "organization"("id") 
            ON DELETE SET NULL
        `)

        await queryRunner.query(`
            ALTER TABLE "custom_template" 
            ADD CONSTRAINT "FK_custom_template_workspace" 
            FOREIGN KEY ("workspaceId") 
            REFERENCES "workspace"("id") 
            ON DELETE SET NULL
        `)

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
        await queryRunner.query(`CREATE INDEX "IDX_api_key_organization" ON "api_key" ("organizationId")`)
        await queryRunner.query(`CREATE INDEX "IDX_api_key_workspace" ON "api_key" ("workspaceId")`)
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

        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "chat_flow" DROP CONSTRAINT "FK_chat_flow_organization"`)
        await queryRunner.query(`ALTER TABLE "chat_flow" DROP CONSTRAINT "FK_chat_flow_workspace"`)
        await queryRunner.query(`ALTER TABLE "credential" DROP CONSTRAINT "FK_credential_organization"`)
        await queryRunner.query(`ALTER TABLE "credential" DROP CONSTRAINT "FK_credential_workspace"`)
        await queryRunner.query(`ALTER TABLE "tool" DROP CONSTRAINT "FK_tool_organization"`)
        await queryRunner.query(`ALTER TABLE "tool" DROP CONSTRAINT "FK_tool_workspace"`)
        await queryRunner.query(`ALTER TABLE "assistant" DROP CONSTRAINT "FK_assistant_organization"`)
        await queryRunner.query(`ALTER TABLE "assistant" DROP CONSTRAINT "FK_assistant_workspace"`)
        await queryRunner.query(`ALTER TABLE "variable" DROP CONSTRAINT "FK_variable_organization"`)
        await queryRunner.query(`ALTER TABLE "variable" DROP CONSTRAINT "FK_variable_workspace"`)
        await queryRunner.query(`ALTER TABLE "document_store" DROP CONSTRAINT "FK_document_store_organization"`)
        await queryRunner.query(`ALTER TABLE "document_store" DROP CONSTRAINT "FK_document_store_workspace"`)
        await queryRunner.query(`ALTER TABLE "api_key" DROP CONSTRAINT "FK_api_key_organization"`)
        await queryRunner.query(`ALTER TABLE "api_key" DROP CONSTRAINT "FK_api_key_workspace"`)
        await queryRunner.query(`ALTER TABLE "custom_template" DROP CONSTRAINT "FK_custom_template_organization"`)
        await queryRunner.query(`ALTER TABLE "custom_template" DROP CONSTRAINT "FK_custom_template_workspace"`)

        // Drop columns
        await queryRunner.query(`ALTER TABLE "chat_flow" DROP COLUMN "organizationId", DROP COLUMN "workspaceId"`)
        await queryRunner.query(`ALTER TABLE "credential" DROP COLUMN "organizationId", DROP COLUMN "workspaceId"`)
        await queryRunner.query(`ALTER TABLE "tool" DROP COLUMN "organizationId", DROP COLUMN "workspaceId"`)
        await queryRunner.query(`ALTER TABLE "assistant" DROP COLUMN "organizationId", DROP COLUMN "workspaceId"`)
        await queryRunner.query(`ALTER TABLE "variable" DROP COLUMN "organizationId", DROP COLUMN "workspaceId"`)
        await queryRunner.query(`ALTER TABLE "document_store" DROP COLUMN "organizationId", DROP COLUMN "workspaceId"`)
        await queryRunner.query(`ALTER TABLE "api_key" DROP COLUMN "organizationId", DROP COLUMN "workspaceId"`)
        await queryRunner.query(`ALTER TABLE "custom_template" DROP COLUMN "organizationId", DROP COLUMN "workspaceId"`)
    }
}