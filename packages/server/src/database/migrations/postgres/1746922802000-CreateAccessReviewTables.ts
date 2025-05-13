import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateAccessReviewTables1746922802000 implements MigrationInterface {
    name = 'CreateAccessReviewTables1746922802000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create access_reviews table
        await queryRunner.query(`
            CREATE TABLE "access_reviews" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(255) NOT NULL,
                "description" text,
                "status" varchar NOT NULL DEFAULT 'pending',
                "userId" uuid NOT NULL,
                "reviewerId" uuid,
                "organizationId" uuid,
                "workspaceId" uuid,
                "resourceId" uuid,
                "resourceType" varchar(255),
                "dueDate" TIMESTAMP NOT NULL,
                "completedDate" TIMESTAMP,
                "reviewNotes" text,
                "metadata" jsonb DEFAULT '{}',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "createdBy" uuid NOT NULL,
                "type" varchar NOT NULL DEFAULT 'ad_hoc',
                "scope" varchar NOT NULL DEFAULT 'organization',
                "startDate" TIMESTAMP,
                "assignedTo" uuid,
                "settings" jsonb
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
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "reviewId" uuid NOT NULL,
                "type" varchar NOT NULL,
                "status" varchar NOT NULL DEFAULT 'pending',
                "userId" uuid NOT NULL,
                "resourceId" uuid,
                "resourceType" varchar(100),
                "permission" varchar(100),
                "roleId" uuid,
                "notes" text,
                "reviewedBy" uuid,
                "reviewedAt" TIMESTAMP,
                "metadata" jsonb,
                "isRisky" boolean NOT NULL DEFAULT false,
                "riskReason" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "FK_access_review_item_access_reviews" FOREIGN KEY ("reviewId") REFERENCES "access_reviews" ("id") ON DELETE CASCADE
            )
        `)

        // Create access_review_action table
        await queryRunner.query(`
            CREATE TABLE "access_review_action" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "reviewItemId" uuid NOT NULL,
                "type" varchar NOT NULL,
                "status" varchar NOT NULL DEFAULT 'pending',
                "performedBy" uuid NOT NULL,
                "notes" text,
                "metadata" jsonb,
                "completedAt" TIMESTAMP,
                "errorMessage" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "FK_access_review_action_access_review_item" FOREIGN KEY ("reviewItemId") REFERENCES "access_review_item" ("id") ON DELETE CASCADE
            )
        `)

        // Create access_review_schedule table
        await queryRunner.query(`
            CREATE TABLE "access_review_schedule" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(255) NOT NULL,
                "description" text,
                "frequency" varchar NOT NULL DEFAULT 'quarterly',
                "status" varchar NOT NULL DEFAULT 'active',
                "scope" varchar NOT NULL DEFAULT 'organization',
                "organizationId" uuid,
                "workspaceId" uuid,
                "createdBy" uuid NOT NULL,
                "assignedTo" uuid NOT NULL,
                "durationDays" integer NOT NULL DEFAULT 7,
                "lastRunAt" TIMESTAMP,
                "nextRunAt" TIMESTAMP,
                "settings" jsonb,
                "metadata" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `)

        // Add foreign keys for access_review_schedule
        await queryRunner.query(`
            ALTER TABLE "access_review_schedule" 
            ADD CONSTRAINT "FK_access_review_schedule_organization" 
            FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE NO ACTION
        `)

        await queryRunner.query(`
            ALTER TABLE "access_review_schedule" 
            ADD CONSTRAINT "FK_access_review_schedule_workspace" 
            FOREIGN KEY ("workspaceId") REFERENCES "workspaces" ("id") ON DELETE NO ACTION
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys first
        await queryRunner.query(`ALTER TABLE "access_review_schedule" DROP CONSTRAINT "FK_access_review_schedule_workspace"`)
        await queryRunner.query(`ALTER TABLE "access_review_schedule" DROP CONSTRAINT "FK_access_review_schedule_organization"`)
        
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
