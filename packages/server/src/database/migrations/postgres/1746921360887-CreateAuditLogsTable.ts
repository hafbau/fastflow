import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuditLogsTable1746921360887 implements MigrationInterface {
    name = 'CreateAuditLogsTable1746921360887'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" character varying NOT NULL, "userId" character varying, "action" character varying NOT NULL, "resourceType" character varying NOT NULL, "resourceId" character varying, "metadata" text, "ipAddress" character varying, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "audit_logs"`);
    }
}
