import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateMultiTenancyTables1746196962000 implements MigrationInterface {
    name = 'CreateMultiTenancyTables1746196962000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create organization table
        await queryRunner.query(`
            CREATE TABLE "organization" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "slug" character varying(255) NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "createdBy" uuid,
                CONSTRAINT "UQ_organization_slug" UNIQUE ("slug"),
                CONSTRAINT "PK_organization" PRIMARY KEY ("id")
            )
        `)

        // Create workspace table
        await queryRunner.query(`
            CREATE TABLE "workspace" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "slug" character varying(255) NOT NULL,
                "organizationId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "createdBy" uuid,
                CONSTRAINT "PK_workspace" PRIMARY KEY ("id")
            )
        `)

        // Create organization_member table
        await queryRunner.query(`
            CREATE TABLE "organization_member" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "organizationId" uuid NOT NULL,
                "userId" uuid NOT NULL,
                "role" character varying(50) NOT NULL DEFAULT 'member',
                "joined_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_organization_member" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_organization_member_org_user" UNIQUE ("organizationId", "userId")
            )
        `)

        // Create workspace_member table
        await queryRunner.query(`
            CREATE TABLE "workspace_member" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "workspaceId" uuid NOT NULL,
                "userId" uuid NOT NULL,
                "role" character varying(50) NOT NULL DEFAULT 'member',
                "joined_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_workspace_member" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_workspace_member_workspace_user" UNIQUE ("workspaceId", "userId")
            )
        `)

        // Create role table
        await queryRunner.query(`
            CREATE TABLE "role" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "description" text,
                "organizationId" uuid,
                CONSTRAINT "PK_role" PRIMARY KEY ("id")
            )
        `)

        // Create permission table
        await queryRunner.query(`
            CREATE TABLE "permission" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "resourceType" character varying(100) NOT NULL,
                "action" character varying(50) NOT NULL,
                "description" text,
                CONSTRAINT "PK_permission" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_permission_resource_action" UNIQUE ("resourceType", "action")
            )
        `)

        // Create role_permission table
        await queryRunner.query(`
            CREATE TABLE "role_permission" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "roleId" uuid NOT NULL,
                "permissionId" uuid NOT NULL,
                CONSTRAINT "PK_role_permission" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_role_permission_role_permission" UNIQUE ("roleId", "permissionId")
            )
        `)

        // Create user_role table
        await queryRunner.query(`
            CREATE TABLE "user_role" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "roleId" uuid NOT NULL,
                "workspaceId" uuid,
                CONSTRAINT "PK_user_role" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_user_role_user_role_workspace" UNIQUE ("userId", "roleId", "workspaceId")
            )
        `)

        // Create resource_permission table
        await queryRunner.query(`
            CREATE TABLE "resource_permission" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "resourceType" character varying(100) NOT NULL,
                "resourceId" uuid NOT NULL,
                "userId" uuid NOT NULL,
                "permission" character varying(50) NOT NULL,
                CONSTRAINT "PK_resource_permission" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_resource_permission_resource_user_permission" UNIQUE ("resourceType", "resourceId", "userId", "permission")
            )
        `)

        // Create audit_log table
        await queryRunner.query(`
            CREATE TABLE "audit_log" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "timestamp" TIMESTAMP NOT NULL,
                "userId" uuid,
                "action" character varying(50) NOT NULL,
                "resourceType" character varying(100) NOT NULL,
                "resourceId" uuid,
                "metadata" jsonb,
                "ipAddress" character varying(50),
                CONSTRAINT "PK_audit_log" PRIMARY KEY ("id")
            )
        `)

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "workspace" 
            ADD CONSTRAINT "FK_workspace_organization" 
            FOREIGN KEY ("organizationId") 
            REFERENCES "organization"("id") 
            ON DELETE CASCADE
        `)

        await queryRunner.query(`
            ALTER TABLE "organization_member" 
            ADD CONSTRAINT "FK_organization_member_organization" 
            FOREIGN KEY ("organizationId") 
            REFERENCES "organization"("id") 
            ON DELETE CASCADE
        `)

        await queryRunner.query(`
            ALTER TABLE "workspace_member" 
            ADD CONSTRAINT "FK_workspace_member_workspace" 
            FOREIGN KEY ("workspaceId") 
            REFERENCES "workspace"("id") 
            ON DELETE CASCADE
        `)

        await queryRunner.query(`
            ALTER TABLE "role" 
            ADD CONSTRAINT "FK_role_organization" 
            FOREIGN KEY ("organizationId") 
            REFERENCES "organization"("id") 
            ON DELETE CASCADE
        `)

        await queryRunner.query(`
            ALTER TABLE "role_permission" 
            ADD CONSTRAINT "FK_role_permission_role" 
            FOREIGN KEY ("roleId") 
            REFERENCES "role"("id") 
            ON DELETE CASCADE
        `)

        await queryRunner.query(`
            ALTER TABLE "role_permission" 
            ADD CONSTRAINT "FK_role_permission_permission" 
            FOREIGN KEY ("permissionId") 
            REFERENCES "permission"("id") 
            ON DELETE CASCADE
        `)

        await queryRunner.query(`
            ALTER TABLE "user_role" 
            ADD CONSTRAINT "FK_user_role_role" 
            FOREIGN KEY ("roleId") 
            REFERENCES "role"("id") 
            ON DELETE CASCADE
        `)

        await queryRunner.query(`
            ALTER TABLE "user_role" 
            ADD CONSTRAINT "FK_user_role_workspace" 
            FOREIGN KEY ("workspaceId") 
            REFERENCES "workspace"("id") 
            ON DELETE CASCADE
        `)

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_organization_slug" ON "organization" ("slug")`)
        await queryRunner.query(`CREATE INDEX "IDX_workspace_organization" ON "workspace" ("organizationId")`)
        await queryRunner.query(`CREATE INDEX "IDX_workspace_slug" ON "workspace" ("slug")`)
        await queryRunner.query(`CREATE INDEX "IDX_organization_member_org" ON "organization_member" ("organizationId")`)
        await queryRunner.query(`CREATE INDEX "IDX_organization_member_user" ON "organization_member" ("userId")`)
        await queryRunner.query(`CREATE INDEX "IDX_workspace_member_workspace" ON "workspace_member" ("workspaceId")`)
        await queryRunner.query(`CREATE INDEX "IDX_workspace_member_user" ON "workspace_member" ("userId")`)
        await queryRunner.query(`CREATE INDEX "IDX_role_organization" ON "role" ("organizationId")`)
        await queryRunner.query(`CREATE INDEX "IDX_role_permission_role" ON "role_permission" ("roleId")`)
        await queryRunner.query(`CREATE INDEX "IDX_role_permission_permission" ON "role_permission" ("permissionId")`)
        await queryRunner.query(`CREATE INDEX "IDX_user_role_user" ON "user_role" ("userId")`)
        await queryRunner.query(`CREATE INDEX "IDX_user_role_role" ON "user_role" ("roleId")`)
        await queryRunner.query(`CREATE INDEX "IDX_user_role_workspace" ON "user_role" ("workspaceId")`)
        await queryRunner.query(`CREATE INDEX "IDX_resource_permission_resource" ON "resource_permission" ("resourceType", "resourceId")`)
        await queryRunner.query(`CREATE INDEX "IDX_resource_permission_user" ON "resource_permission" ("userId")`)
        await queryRunner.query(`CREATE INDEX "IDX_audit_log_timestamp" ON "audit_log" ("timestamp")`)
        await queryRunner.query(`CREATE INDEX "IDX_audit_log_user" ON "audit_log" ("userId")`)
        await queryRunner.query(`CREATE INDEX "IDX_audit_log_resource" ON "audit_log" ("resourceType", "resourceId")`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first
        await queryRunner.query(`ALTER TABLE "workspace" DROP CONSTRAINT "FK_workspace_organization"`)
        await queryRunner.query(`ALTER TABLE "organization_member" DROP CONSTRAINT "FK_organization_member_organization"`)
        await queryRunner.query(`ALTER TABLE "workspace_member" DROP CONSTRAINT "FK_workspace_member_workspace"`)
        await queryRunner.query(`ALTER TABLE "role" DROP CONSTRAINT "FK_role_organization"`)
        await queryRunner.query(`ALTER TABLE "role_permission" DROP CONSTRAINT "FK_role_permission_role"`)
        await queryRunner.query(`ALTER TABLE "role_permission" DROP CONSTRAINT "FK_role_permission_permission"`)
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_user_role_role"`)
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_user_role_workspace"`)

        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_organization_slug"`)
        await queryRunner.query(`DROP INDEX "IDX_workspace_organization"`)
        await queryRunner.query(`DROP INDEX "IDX_workspace_slug"`)
        await queryRunner.query(`DROP INDEX "IDX_organization_member_org"`)
        await queryRunner.query(`DROP INDEX "IDX_organization_member_user"`)
        await queryRunner.query(`DROP INDEX "IDX_workspace_member_workspace"`)
        await queryRunner.query(`DROP INDEX "IDX_workspace_member_user"`)
        await queryRunner.query(`DROP INDEX "IDX_role_organization"`)
        await queryRunner.query(`DROP INDEX "IDX_role_permission_role"`)
        await queryRunner.query(`DROP INDEX "IDX_role_permission_permission"`)
        await queryRunner.query(`DROP INDEX "IDX_user_role_user"`)
        await queryRunner.query(`DROP INDEX "IDX_user_role_role"`)
        await queryRunner.query(`DROP INDEX "IDX_user_role_workspace"`)
        await queryRunner.query(`DROP INDEX "IDX_resource_permission_resource"`)
        await queryRunner.query(`DROP INDEX "IDX_resource_permission_user"`)
        await queryRunner.query(`DROP INDEX "IDX_audit_log_timestamp"`)
        await queryRunner.query(`DROP INDEX "IDX_audit_log_user"`)
        await queryRunner.query(`DROP INDEX "IDX_audit_log_resource"`)

        // Drop tables in reverse order of creation
        await queryRunner.query(`DROP TABLE "audit_log"`)
        await queryRunner.query(`DROP TABLE "resource_permission"`)
        await queryRunner.query(`DROP TABLE "user_role"`)
        await queryRunner.query(`DROP TABLE "role_permission"`)
        await queryRunner.query(`DROP TABLE "permission"`)
        await queryRunner.query(`DROP TABLE "role"`)
        await queryRunner.query(`DROP TABLE "workspace_member"`)
        await queryRunner.query(`DROP TABLE "organization_member"`)
        await queryRunner.query(`DROP TABLE "workspace"`)
        await queryRunner.query(`DROP TABLE "organization"`)
    }
}