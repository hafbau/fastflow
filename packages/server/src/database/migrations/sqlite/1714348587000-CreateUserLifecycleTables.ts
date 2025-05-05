import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateUserLifecycleTables1714348587000 implements MigrationInterface {
    name = 'CreateUserLifecycleTables1714348587000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create user_lifecycle_state table
        await queryRunner.query(`
            CREATE TABLE "user_lifecycle_state" (
                "id" varchar PRIMARY KEY NOT NULL,
                "user_id" varchar NOT NULL,
                "state" varchar NOT NULL DEFAULT 'INVITED',
                "metadata" text,
                "changed_by" varchar,
                "created_at" datetime NOT NULL DEFAULT (datetime('now')),
                "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY ("user_id") REFERENCES "user_profile" ("id") ON DELETE CASCADE,
                FOREIGN KEY ("changed_by") REFERENCES "user_profile" ("id") ON DELETE SET NULL
            )
        `)

        // Create provisioning_rule table
        await queryRunner.query(`
            CREATE TABLE "provisioning_rule" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "description" text,
                "type" varchar NOT NULL,
                "trigger" varchar NOT NULL,
                "conditions" text NOT NULL,
                "actions" text NOT NULL,
                "organization_id" varchar,
                "workspace_id" varchar,
                "status" varchar NOT NULL DEFAULT 'DRAFT',
                "created_by" varchar NOT NULL,
                "updated_by" varchar,
                "created_at" datetime NOT NULL DEFAULT (datetime('now')),
                "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY ("organization_id") REFERENCES "organization" ("id") ON DELETE CASCADE,
                FOREIGN KEY ("workspace_id") REFERENCES "workspace" ("id") ON DELETE CASCADE
            )
        `)

        // Create provisioning_action table
        await queryRunner.query(`
            CREATE TABLE "provisioning_action" (
                "id" varchar PRIMARY KEY NOT NULL,
                "type" varchar NOT NULL,
                "parameters" text NOT NULL,
                "target_user_id" varchar,
                "rule_id" varchar,
                "status" varchar NOT NULL DEFAULT 'PENDING',
                "status_message" text,
                "initiated_by" varchar NOT NULL,
                "approved_by" varchar,
                "approval_date" datetime,
                "created_at" datetime NOT NULL DEFAULT (datetime('now')),
                "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
                "completed_at" datetime,
                FOREIGN KEY ("target_user_id") REFERENCES "user_profile" ("id") ON DELETE SET NULL,
                FOREIGN KEY ("rule_id") REFERENCES "provisioning_rule" ("id") ON DELETE SET NULL,
                FOREIGN KEY ("initiated_by") REFERENCES "user_profile" ("id") ON DELETE NO ACTION,
                FOREIGN KEY ("approved_by") REFERENCES "user_profile" ("id") ON DELETE SET NULL
            )
        `)

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_user_lifecycle_state_user_id" ON "user_lifecycle_state" ("user_id")`)
        await queryRunner.query(`CREATE INDEX "IDX_user_lifecycle_state_state" ON "user_lifecycle_state" ("state")`)
        await queryRunner.query(`CREATE INDEX "IDX_provisioning_rule_org" ON "provisioning_rule" ("organization_id")`)
        await queryRunner.query(`CREATE INDEX "IDX_provisioning_rule_workspace" ON "provisioning_rule" ("workspace_id")`)
        await queryRunner.query(`CREATE INDEX "IDX_provisioning_rule_status" ON "provisioning_rule" ("status")`)
        await queryRunner.query(`CREATE INDEX "IDX_provisioning_rule_type" ON "provisioning_rule" ("type")`)
        await queryRunner.query(`CREATE INDEX "IDX_provisioning_action_target" ON "provisioning_action" ("target_user_id")`)
        await queryRunner.query(`CREATE INDEX "IDX_provisioning_action_rule" ON "provisioning_action" ("rule_id")`)
        await queryRunner.query(`CREATE INDEX "IDX_provisioning_action_status" ON "provisioning_action" ("status")`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_user_lifecycle_state_user_id"`)
        await queryRunner.query(`DROP INDEX "IDX_user_lifecycle_state_state"`)
        await queryRunner.query(`DROP INDEX "IDX_provisioning_rule_org"`)
        await queryRunner.query(`DROP INDEX "IDX_provisioning_rule_workspace"`)
        await queryRunner.query(`DROP INDEX "IDX_provisioning_rule_status"`)
        await queryRunner.query(`DROP INDEX "IDX_provisioning_rule_type"`)
        await queryRunner.query(`DROP INDEX "IDX_provisioning_action_target"`)
        await queryRunner.query(`DROP INDEX "IDX_provisioning_action_rule"`)
        await queryRunner.query(`DROP INDEX "IDX_provisioning_action_status"`)

        // Drop tables in reverse order of creation
        await queryRunner.query(`DROP TABLE "provisioning_action"`)
        await queryRunner.query(`DROP TABLE "provisioning_rule"`)
        await queryRunner.query(`DROP TABLE "user_lifecycle_state"`)
    }
}