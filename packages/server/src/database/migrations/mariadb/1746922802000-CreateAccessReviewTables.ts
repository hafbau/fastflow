import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateAccessReviewTables1746922802000 implements MigrationInterface {
    name = 'CreateAccessReviewTables1746922802000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create access_reviews table
        await queryRunner.query(`
            CREATE TABLE \`access_reviews\` (
                \`id\` varchar(36) PRIMARY KEY,
                \`name\` varchar(255) NOT NULL,
                \`description\` text,
                \`status\` varchar(255) NOT NULL DEFAULT 'pending',
                \`userId\` varchar(36) NOT NULL,
                \`reviewerId\` varchar(36),
                \`organizationId\` varchar(36),
                \`workspaceId\` varchar(36),
                \`resourceId\` varchar(36),
                \`resourceType\` varchar(255),
                \`dueDate\` datetime NOT NULL,
                \`completedDate\` datetime,
                \`reviewNotes\` text,
                \`metadata\` json DEFAULT ('{}'),
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`createdBy\` varchar(36) NOT NULL,
                \`type\` varchar(255) NOT NULL DEFAULT 'ad_hoc',
                \`scope\` varchar(255) NOT NULL DEFAULT 'organization',
                \`startDate\` datetime,
                \`assignedTo\` varchar(36),
                \`settings\` json
            ) ENGINE=InnoDB
        `)

        // Add indexes to access_reviews
        await queryRunner.query(`CREATE INDEX \`IDX_access_reviews_status\` ON \`access_reviews\` (\`status\`)`)
        await queryRunner.query(`CREATE INDEX \`IDX_access_reviews_userId\` ON \`access_reviews\` (\`userId\`)`)
        await queryRunner.query(`CREATE INDEX \`IDX_access_reviews_reviewerId\` ON \`access_reviews\` (\`reviewerId\`)`)
        await queryRunner.query(`CREATE INDEX \`IDX_access_reviews_organizationId\` ON \`access_reviews\` (\`organizationId\`)`)
        await queryRunner.query(`CREATE INDEX \`IDX_access_reviews_workspaceId\` ON \`access_reviews\` (\`workspaceId\`)`)
        await queryRunner.query(`CREATE INDEX \`IDX_access_reviews_resourceId\` ON \`access_reviews\` (\`resourceId\`)`)
        await queryRunner.query(`CREATE INDEX \`IDX_access_reviews_resourceType\` ON \`access_reviews\` (\`resourceType\`)`)
        await queryRunner.query(`CREATE INDEX \`IDX_access_reviews_dueDate\` ON \`access_reviews\` (\`dueDate\`)`)

        // Create access_review_item table
        await queryRunner.query(`
            CREATE TABLE \`access_review_item\` (
                \`id\` varchar(36) PRIMARY KEY,
                \`reviewId\` varchar(36) NOT NULL,
                \`type\` varchar(255) NOT NULL,
                \`status\` varchar(255) NOT NULL DEFAULT 'pending',
                \`userId\` varchar(36) NOT NULL,
                \`resourceId\` varchar(36),
                \`resourceType\` varchar(100),
                \`permission\` varchar(100),
                \`roleId\` varchar(36),
                \`notes\` text,
                \`reviewedBy\` varchar(36),
                \`reviewedAt\` datetime,
                \`metadata\` json,
                \`isRisky\` boolean NOT NULL DEFAULT false,
                \`riskReason\` text,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                CONSTRAINT \`FK_access_review_item_access_reviews\` FOREIGN KEY (\`reviewId\`) REFERENCES \`access_reviews\` (\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `)

        // Create access_review_action table
        await queryRunner.query(`
            CREATE TABLE \`access_review_action\` (
                \`id\` varchar(36) PRIMARY KEY,
                \`reviewItemId\` varchar(36) NOT NULL,
                \`type\` varchar(255) NOT NULL,
                \`status\` varchar(255) NOT NULL DEFAULT 'pending',
                \`performedBy\` varchar(36) NOT NULL,
                \`notes\` text,
                \`metadata\` json,
                \`completedAt\` datetime,
                \`errorMessage\` text,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                CONSTRAINT \`FK_access_review_action_access_review_item\` FOREIGN KEY (\`reviewItemId\`) REFERENCES \`access_review_item\` (\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `)

        // Create access_review_schedule table
        await queryRunner.query(`
            CREATE TABLE \`access_review_schedule\` (
                \`id\` varchar(36) PRIMARY KEY,
                \`name\` varchar(255) NOT NULL,
                \`description\` text,
                \`frequency\` varchar(255) NOT NULL DEFAULT 'quarterly',
                \`status\` varchar(255) NOT NULL DEFAULT 'active',
                \`scope\` varchar(255) NOT NULL DEFAULT 'organization',
                \`organizationId\` varchar(36),
                \`workspaceId\` varchar(36),
                \`createdBy\` varchar(36) NOT NULL,
                \`assignedTo\` varchar(36) NOT NULL,
                \`durationDays\` int NOT NULL DEFAULT 7,
                \`lastRunAt\` datetime,
                \`nextRunAt\` datetime,
                \`settings\` json,
                \`metadata\` json,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                CONSTRAINT \`FK_access_review_schedule_organization\` FOREIGN KEY (\`organizationId\`) REFERENCES \`organizations\` (\`id\`),
                CONSTRAINT \`FK_access_review_schedule_workspace\` FOREIGN KEY (\`workspaceId\`) REFERENCES \`workspaces\` (\`id\`)
            ) ENGINE=InnoDB
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order
        await queryRunner.query(`DROP TABLE \`access_review_schedule\``)
        await queryRunner.query(`DROP TABLE \`access_review_action\``)
        await queryRunner.query(`DROP TABLE \`access_review_item\``)
        
        // Drop indexes
        await queryRunner.query(`DROP INDEX \`IDX_access_reviews_dueDate\` ON \`access_reviews\``)
        await queryRunner.query(`DROP INDEX \`IDX_access_reviews_resourceType\` ON \`access_reviews\``)
        await queryRunner.query(`DROP INDEX \`IDX_access_reviews_resourceId\` ON \`access_reviews\``)
        await queryRunner.query(`DROP INDEX \`IDX_access_reviews_workspaceId\` ON \`access_reviews\``)
        await queryRunner.query(`DROP INDEX \`IDX_access_reviews_organizationId\` ON \`access_reviews\``)
        await queryRunner.query(`DROP INDEX \`IDX_access_reviews_reviewerId\` ON \`access_reviews\``)
        await queryRunner.query(`DROP INDEX \`IDX_access_reviews_userId\` ON \`access_reviews\``)
        await queryRunner.query(`DROP INDEX \`IDX_access_reviews_status\` ON \`access_reviews\``)
        
        // Finally drop the main table
        await queryRunner.query(`DROP TABLE \`access_reviews\``)
    }
}
