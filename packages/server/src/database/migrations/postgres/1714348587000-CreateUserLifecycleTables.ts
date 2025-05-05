import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateUserLifecycleTables1714348587000 implements MigrationInterface {
    name = 'CreateUserLifecycleTables1714348587000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create user_lifecycle_state table
        await queryRunner.query(`
            CREATE TYPE "user_lifecycle_state_type_enum" AS ENUM (
                'INVITED',
                'REGISTERED',
                'ACTIVE',
                'INACTIVE',
                'SUSPENDED',
                'DELETED'
            )
        `)

        await queryRunner.query(`
            CREATE TABLE "user_lifecycle_state" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "state" "user_lifecycle_state_type_enum" NOT NULL DEFAULT 'INVITED',
                "metadata" jsonb,
                "changed_by" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_user_lifecycle_state" PRIMARY KEY ("id")
            )
        `)

        await queryRunner.query(`
            ALTER TABLE "user_lifecycle_state"
            ADD CONSTRAINT "FK_user_lifecycle_state_user"
            FOREIGN KEY ("user_id")
            REFERENCES "user_profile"("id")
            ON DELETE CASCADE
        `)

        await queryRunner.query(`
            ALTER TABLE "user_lifecycle_state"
            ADD CONSTRAINT "FK_user_lifecycle_state_changed_by"
            FOREIGN KEY ("changed_by")
            REFERENCES "user_profile"("id")
            ON DELETE SET NULL
        `)

        // Create provisioning_rule table
        await queryRunner.query(`
            CREATE TYPE "provisioning_rule_type_enum" AS ENUM (
                'USER_ONBOARDING',
                'ROLE_CHANGE',
                'USER_OFFBOARDING'
            )
        `)

        await queryRunner.query(`
            CREATE TYPE "provisioning_rule_trigger_enum" AS ENUM (
                'EVENT',
                'SCHEDULE',
                'CONDITION'
            )
        `)

        await queryRunner.query(`
            CREATE TYPE "provisioning_rule_status_enum" AS ENUM (
                'ACTIVE',
                'INACTIVE',
                'DRAFT'
            )
        `)

        await queryRunner.query(`
            CREATE TABLE "provisioning_rule" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" text,
                "type" "provisioning_rule_type_enum" NOT NULL,
                "trigger" "provisioning_rule_trigger_enum" NOT NULL,
                "conditions" jsonb NOT NULL,
                "actions" jsonb NOT NULL,
                "organization_id" uuid,
                "workspace_id" uuid,
                "status" "provisioning_rule_status_enum" NOT NULL DEFAULT 'DRAFT',
                "created_by" uuid NOT NULL,
                "updated_by" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_provisioning_rule" PRIMARY KEY ("id")
            )
        `)

        await queryRunner.query(`
            ALTER TABLE "provisioning_rule"
            ADD CONSTRAINT "FK_provisioning_rule_organization"
            FOREIGN KEY ("organization_id")
            REFERENCES "organization"("id")
            ON DELETE CASCADE
        `)

        await queryRunner.query(`
            ALTER TABLE "provisioning_rule"
            ADD CONSTRAINT "FK_provisioning_rule_workspace"
            FOREIGN KEY ("workspace_id")
            REFERENCES "workspace"("id")
            ON DELETE CASCADE
        `)

        // Create provisioning_action table
        await queryRunner.query(`
            CREATE TYPE "provisioning_action_type_enum" AS ENUM (
                'USER_CREATION',
                'USER_ACTIVATION',
                'USER_DEACTIVATION',
                'USER_DELETION',
                'ROLE_ASSIGNMENT',
                'ROLE_REMOVAL',
                'ORGANIZATION_ASSIGNMENT',
                'ORGANIZATION_REMOVAL',
                'WORKSPACE_ASSIGNMENT',
                'WORKSPACE_REMOVAL',
                'PERMISSION_ASSIGNMENT',
                'PERMISSION_REMOVAL',
                'NOTIFICATION',
                'CUSTOM'
            )
        `)

        await queryRunner.query(`
            CREATE TYPE "provisioning_action_status_enum" AS ENUM (
                'PENDING',
                'IN_PROGRESS',
                'COMPLETED',
                'FAILED',
                'CANCELLED',
                'REQUIRES_APPROVAL',
                'APPROVED',
                'REJECTED'
            )
        `)

        await queryRunner.query(`
            CREATE TABLE "provisioning_action" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "type" "provisioning_action_type_enum" NOT NULL,
                "parameters" jsonb NOT NULL,
                "target_user_id" uuid,
                "rule_id" uuid,
                "status" "provisioning_action_status_enum" NOT NULL DEFAULT 'PENDING',
                "status_message" text,
                "initiated_by" uuid NOT NULL,
                "approved_by" uuid,
                "approval_date" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "completed_at" TIMESTAMP,
                CONSTRAINT "PK_provisioning_action" PRIMARY KEY ("id")
            )
        `)

        await queryRunner.query(`
            ALTER TABLE "provisioning_action"
            ADD CONSTRAINT "FK_provisioning_action_target_user"
            FOREIGN KEY ("target_user_id")
            REFERENCES "user_profile"("id")
            ON DELETE SET NULL
        `)

        await queryRunner.query(`
            ALTER TABLE "provisioning_action"
            ADD CONSTRAINT "FK_provisioning_action_rule"
            FOREIGN KEY ("rule_id")
            REFERENCES "provisioning_rule"("id")
            ON DELETE SET NULL
        `)

        await queryRunner.query(`
            ALTER TABLE "provisioning_action"
            ADD CONSTRAINT "FK_provisioning_action_initiated_by"
            FOREIGN KEY ("initiated_by")
            REFERENCES "user_profile"("id")
            ON DELETE NO ACTION
        `)

        await queryRunner.query(`
            ALTER TABLE "provisioning_action"
            ADD CONSTRAINT "FK_provisioning_action_approved_by"
            FOREIGN KEY ("approved_by")
            REFERENCES "user_profile"("id")
            ON DELETE SET NULL
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop provisioning_action table and related types
        await queryRunner.query(`ALTER TABLE "provisioning_action" DROP CONSTRAINT "FK_provisioning_action_approved_by"`)
        await queryRunner.query(`ALTER TABLE "provisioning_action" DROP CONSTRAINT "FK_provisioning_action_initiated_by"`)
        await queryRunner.query(`ALTER TABLE "provisioning_action" DROP CONSTRAINT "FK_provisioning_action_rule"`)
        await queryRunner.query(`ALTER TABLE "provisioning_action" DROP CONSTRAINT "FK_provisioning_action_target_user"`)
        await queryRunner.query(`DROP TABLE "provisioning_action"`)
        await queryRunner.query(`DROP TYPE "provisioning_action_status_enum"`)
        await queryRunner.query(`DROP TYPE "provisioning_action_type_enum"`)

        // Drop provisioning_rule table and related types
        await queryRunner.query(`ALTER TABLE "provisioning_rule" DROP CONSTRAINT "FK_provisioning_rule_workspace"`)
        await queryRunner.query(`ALTER TABLE "provisioning_rule" DROP CONSTRAINT "FK_provisioning_rule_organization"`)
        await queryRunner.query(`DROP TABLE "provisioning_rule"`)
        await queryRunner.query(`DROP TYPE "provisioning_rule_status_enum"`)
        await queryRunner.query(`DROP TYPE "provisioning_rule_trigger_enum"`)
        await queryRunner.query(`DROP TYPE "provisioning_rule_type_enum"`)

        // Drop user_lifecycle_state table and related types
        await queryRunner.query(`ALTER TABLE "user_lifecycle_state" DROP CONSTRAINT "FK_user_lifecycle_state_changed_by"`)
        await queryRunner.query(`ALTER TABLE "user_lifecycle_state" DROP CONSTRAINT "FK_user_lifecycle_state_user"`)
        await queryRunner.query(`DROP TABLE "user_lifecycle_state"`)
        await queryRunner.query(`DROP TYPE "user_lifecycle_state_type_enum"`)
    }
}