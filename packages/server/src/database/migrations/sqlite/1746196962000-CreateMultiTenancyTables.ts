import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateMultiTenancyTables1746196962000 implements MigrationInterface {
    name = 'CreateMultiTenancyTables1746196962000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create organization table
        await queryRunner.query(`
            CREATE TABLE "organization" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar(255) NOT NULL,
                "slug" varchar(255) NOT NULL UNIQUE,
                "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
                "createdBy" varchar
            )
        `)

        // Create workspace table
        await queryRunner.query(`
            CREATE TABLE "workspace" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar(255) NOT NULL,
                "slug" varchar(255) NOT NULL,
                "organizationId" varchar NOT NULL,
                "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
                "createdBy" varchar,
                CONSTRAINT "FK_workspace_organization" FOREIGN KEY ("organizationId") REFERENCES "organization" ("id") ON DELETE CASCADE
            )
        `)

        // Create organization_member table
        await queryRunner.query(`
            CREATE TABLE "organization_member" (
                "id" varchar PRIMARY KEY NOT NULL,
                "organizationId" varchar NOT NULL,
                "userId" varchar NOT NULL,
                "role" varchar(50) NOT NULL DEFAULT 'member',
                "joined_at" datetime NOT NULL DEFAULT (datetime('now')),
                CONSTRAINT "UQ_organization_member_org_user" UNIQUE ("organizationId", "userId"),
                CONSTRAINT "FK_organization_member_organization" FOREIGN KEY ("organizationId") REFERENCES "organization" ("id") ON DELETE CASCADE
            )
        `)

        // Create workspace_member table
        await queryRunner.query(`
            CREATE TABLE "workspace_member" (
                "id" varchar PRIMARY KEY NOT NULL,
                "workspaceId" varchar NOT NULL,
                "userId" varchar NOT NULL,
                "role" varchar(50) NOT NULL DEFAULT 'member',
                "joined_at" datetime NOT NULL DEFAULT (datetime('now')),
                CONSTRAINT "UQ_workspace_member_workspace_user" UNIQUE ("workspaceId", "userId"),
                CONSTRAINT "FK_workspace_member_workspace" FOREIGN KEY ("workspaceId") REFERENCES "workspace" ("id") ON DELETE CASCADE
            )
        `)

        // Create role table
        await queryRunner.query(`
            CREATE TABLE "role" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar(100) NOT NULL,
                "description" text,
                "organizationId" varchar,
                CONSTRAINT "FK_role_organization" FOREIGN KEY ("organizationId") REFERENCES "organization" ("id") ON DELETE CASCADE
            )
        `)

        // Create permission table
        await queryRunner.query(`
            CREATE TABLE "permission" (
                "id" varchar PRIMARY KEY NOT NULL,
                "resourceType" varchar(100) NOT NULL,
                "action" varchar(50) NOT NULL,
                "description" text,
                CONSTRAINT "UQ_permission_resource_action" UNIQUE ("resourceType", "action")
            )
        `)

        // Create role_permission table
        await queryRunner.query(`
            CREATE TABLE "role_permission" (
                "id" varchar PRIMARY KEY NOT NULL,
                "roleId" varchar NOT NULL,
                "permissionId" varchar NOT NULL,
                CONSTRAINT "UQ_role_permission_role_permission" UNIQUE ("roleId", "permissionId"),
                CONSTRAINT "FK_role_permission_role" FOREIGN KEY ("roleId") REFERENCES "role" ("id") ON DELETE CASCADE,
                CONSTRAINT "FK_role_permission_permission" FOREIGN KEY ("permissionId") REFERENCES "permission" ("id") ON DELETE CASCADE
            )
        `)

        // Create user_role table
        await queryRunner.query(`
            CREATE TABLE "user_role" (
                "id" varchar PRIMARY KEY NOT NULL,
                "userId" varchar NOT NULL,
                "roleId" varchar NOT NULL,
                "workspaceId" varchar,
                CONSTRAINT "UQ_user_role_user_role_workspace" UNIQUE ("userId", "roleId", "workspaceId"),
                CONSTRAINT "FK_user_role_role" FOREIGN KEY ("roleId") REFERENCES "role" ("id") ON DELETE CASCADE,
                CONSTRAINT "FK_user_role_workspace" FOREIGN KEY ("workspaceId") REFERENCES "workspace" ("id") ON DELETE CASCADE
            )
        `)

        // Create resource_permission table
        await queryRunner.query(`
            CREATE TABLE "resource_permission" (
                "id" varchar PRIMARY KEY NOT NULL,
                "resourceType" varchar(100) NOT NULL,
                "resourceId" varchar NOT NULL,
                "userId" varchar NOT NULL,
                "permission" varchar(50) NOT NULL,
                CONSTRAINT "UQ_resource_permission_resource_user_permission" UNIQUE ("resourceType", "resourceId", "userId", "permission")
            )
        `)

        // Create audit_log table
        await queryRunner.query(`
            CREATE TABLE "audit_log" (
                "id" varchar PRIMARY KEY NOT NULL,
                "timestamp" datetime NOT NULL,
                "userId" varchar,
                "action" varchar(50) NOT NULL,
                "resourceType" varchar(100) NOT NULL,
                "resourceId" varchar,
                "metadata" text,
                "ipAddress" varchar(50)
            )
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
        await queryRunner.query(`CREATE INDEX "IDX_resource_permission_resource_type" ON "resource_permission" ("resourceType")`)
        await queryRunner.query(`CREATE INDEX "IDX_resource_permission_resource_id" ON "resource_permission" ("resourceId")`)
        await queryRunner.query(`CREATE INDEX "IDX_resource_permission_user" ON "resource_permission" ("userId")`)
        await queryRunner.query(`CREATE INDEX "IDX_audit_log_timestamp" ON "audit_log" ("timestamp")`)
        await queryRunner.query(`CREATE INDEX "IDX_audit_log_user" ON "audit_log" ("userId")`)
        await queryRunner.query(`CREATE INDEX "IDX_audit_log_resource_type" ON "audit_log" ("resourceType")`)
        await queryRunner.query(`CREATE INDEX "IDX_audit_log_resource_id" ON "audit_log" ("resourceId")`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
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
        await queryRunner.query(`DROP INDEX "IDX_resource_permission_resource_type"`)
        await queryRunner.query(`DROP INDEX "IDX_resource_permission_resource_id"`)
        await queryRunner.query(`DROP INDEX "IDX_resource_permission_user"`)
        await queryRunner.query(`DROP INDEX "IDX_audit_log_timestamp"`)
        await queryRunner.query(`DROP INDEX "IDX_audit_log_user"`)
        await queryRunner.query(`DROP INDEX "IDX_audit_log_resource_type"`)
        await queryRunner.query(`DROP INDEX "IDX_audit_log_resource_id"`)

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