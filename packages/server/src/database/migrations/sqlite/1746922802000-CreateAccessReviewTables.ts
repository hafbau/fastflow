import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateAccessReviewTables1746922802000 implements MigrationInterface {
    name = 'CreateAccessReviewTables1746922802000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable foreign key constraints for SQLite
        await queryRunner.query(`PRAGMA foreign_keys = ON`)

        // Create access_reviews table
        await queryRunner.query(`
            CREATE TABLE "access_reviews" (
                "id" text PRIMARY KEY,
                "name" varchar(255) NOT NULL,
                "description" text,
                "status" varchar NOT NULL DEFAULT 'pending',
                "userId" text NOT NULL,
                "reviewerId" text,
                "organizationId" text,
                "workspaceId" text,
                "resourceId" text,
                "resourceType" varchar(255),
                "dueDate" datetime NOT NULL,
                "completedDate" datetime,
                "reviewNotes" text,
                "metadata" text DEFAULT '{}',
                "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
                "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
                "createdBy" text NOT NULL,
                "type" varchar NOT NULL DEFAULT 'ad_hoc',
                "scope" varchar NOT NULL DEFAULT 'organization',
                "startDate" datetime,
                "assignedTo" text,
                "settings" text
            )
        `)

        // Add indexes to access_reviews
        await queryRunner.query(`CREATE INDEX "IDX_access_reviews_status" ON "access_reviews" ("status")`)
        await queryRunner.query(`CREATE INDEX "IDX_access_reviews_userId" ON "access_reviews" ("userId")`)
        await queryRunner.query(`CREATE INDEX "IDX_access_reviews_reviewerId" ON "access_reviews" ("reviewerId")`)
        await queryRunner.query(`CREATE INDEX "IDX_access_reviews_organizationId" ON "access_reviews" ("organizationId")`)
        await queryRunner.query(`CREATE INDEX "IDX_access_reviews_workspaceId" ON "access_reviews" ("workspaceId")`)
        await queryRunner.query(`CREATE INDEX "IDX_access_reviews_resourceId" ON "access_reviews" ("resourceId")`)
        await queryRunner.query(`CREATE INDEX "IDX_access_reviews_resourceType" ON "access_reviews" ("resourceType")`)
        await queryRunner.query(`CREATE INDEX "IDX_access_reviews_dueDate" ON "access_reviews" ("dueDate")`)

        // Create access_review_item table
        await queryRunner.query(`
            CREATE TABLE "access_review_item" (
                "id" text PRIMARY KEY,
                "reviewId" text NOT NULL,
                "type" varchar NOT NULL,
                "status" varchar NOT NULL DEFAULT 'pending',
                "userId" text NOT NULL,
                "resourceId" text,
                "resourceType" varchar(100),
                "permission" varchar(100),
                "roleId" text,
                "notes" text,
                "reviewedBy" text,
                "reviewedAt" datetime,
                "metadata" text,
                "isRisky" boolean NOT NULL DEFAULT 0,
                "riskReason" text,
                "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
                "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY ("reviewId") REFERENCES "access_reviews" ("id") ON DELETE CASCADE
            )
        `)

        // Create access_review_action table
        await queryRunner.query(`
            CREATE TABLE "access_review_action" (
                "id" text PRIMARY KEY,
                "reviewItemId" text NOT NULL,
                "type" varchar NOT NULL,
                "status" varchar NOT NULL DEFAULT 'pending',
                "performedBy" text NOT NULL,
                "notes" text,
                "metadata" text,
                "completedAt" datetime,
                "errorMessage" text,
                "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY ("reviewItemId") REFERENCES "access_review_item" ("id") ON DELETE CASCADE
            )
        `)

        // Create access_review_schedule table
        await queryRunner.query(`
            CREATE TABLE "access_review_schedule" (
                "id" text PRIMARY KEY,
                "name" varchar(255) NOT NULL,
                "description" text,
                "frequency" varchar NOT NULL DEFAULT 'quarterly',
                "status" varchar NOT NULL DEFAULT 'active',
                "scope" varchar NOT NULL DEFAULT 'organization',
                "organizationId" text,
                "workspaceId" text,
                "createdBy" text NOT NULL,
                "assignedTo" text NOT NULL,
                "durationDays" integer NOT NULL DEFAULT 7,
                "lastRunAt" datetime,
                "nextRunAt" datetime,
                "settings" text,
                "metadata" text,
                "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
                "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id"),
                FOREIGN KEY ("workspaceId") REFERENCES "workspaces" ("id")
            )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order
        await queryRunner.query(`DROP TABLE "access_review_schedule"`)
        await queryRunner.query(`DROP TABLE "access_review_action"`)
        await queryRunner.query(`DROP TABLE "access_review_item"`)
        
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_access_reviews_dueDate"`)
        await queryRunner.query(`DROP INDEX "IDX_access_reviews_resourceType"`)
        await queryRunner.query(`DROP INDEX "IDX_access_reviews_resourceId"`)
        await queryRunner.query(`DROP INDEX "IDX_access_reviews_workspaceId"`)
        await queryRunner.query(`DROP INDEX "IDX_access_reviews_organizationId"`)
        await queryRunner.query(`DROP INDEX "IDX_access_reviews_reviewerId"`)
        await queryRunner.query(`DROP INDEX "IDX_access_reviews_userId"`)
        await queryRunner.query(`DROP INDEX "IDX_access_reviews_status"`)
        
        // Finally drop the main table
        await queryRunner.query(`DROP TABLE "access_reviews"`)
    }
}
