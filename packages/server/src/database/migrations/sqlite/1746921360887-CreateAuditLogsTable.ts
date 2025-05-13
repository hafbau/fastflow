import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuditLogsTable1746921360887 implements MigrationInterface {
    name = 'CreateAuditLogsTable1746921360887'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" varchar PRIMARY KEY NOT NULL, "userId" varchar, "action" varchar NOT NULL, "resourceType" varchar NOT NULL, "resourceId" varchar, "metadata" text, "ipAddress" varchar, "timestamp" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "audit_logs"`);
    }
}
