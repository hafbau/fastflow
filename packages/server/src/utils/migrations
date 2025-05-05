import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMissingTypeColumnToRoleTable1746197501000 implements MigrationInterface {
    name = 'AddMissingTypeColumnToRoleTable1746197501000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the column already exists to prevent errors on retry
        const table = await queryRunner.getTable('role')
        if (table && !table.findColumnByName('type')) {
            await queryRunner.query(`ALTER TABLE "role" ADD COLUMN "type" varchar DEFAULT 'custom'`)
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "type"`)
    }
}