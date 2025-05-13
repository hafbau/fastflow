import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuditLogsTable1746921360887 implements MigrationInterface {
    name = 'CreateAuditLogsTable1746921360887'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`audit_logs\` (\`id\` varchar(255) NOT NULL, \`userId\` varchar(255) NULL, \`action\` varchar(255) NOT NULL, \`resourceType\` varchar(255) NOT NULL, \`resourceId\` varchar(255) NULL, \`metadata\` text NULL, \`ipAddress\` varchar(255) NULL, \`timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`audit_logs\``);
    }
}
