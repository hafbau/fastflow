import { MigrationInterface, QueryRunner } from 'typeorm'

export class FixUIComponentScreenId1716600000000 implements MigrationInterface {
    name = 'FixUIComponentScreenId1716600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            // Check if the screenId column exists in the ui_component table
            const hasColumn = await this.columnExists(queryRunner, 'ui_component', 'screenId')
            
            if (!hasColumn) {
                // Add screenId column if it doesn't exist
                await queryRunner.query(`ALTER TABLE "ui_component" ADD COLUMN "screenId" varchar NULL`)
                
                // Add index for the screenId column
                await queryRunner.query(`CREATE INDEX "IDX_ui_component_screenId" ON "ui_component" ("screenId")`)
            }
        } catch (error) {
            console.error('Error applying FixUIComponentScreenId migration:', error)
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No action needed on rollback since SQLite doesn't support dropping columns
    }

    private async columnExists(queryRunner: QueryRunner, table: string, column: string): Promise<boolean> {
        try {
            const result = await queryRunner.query(
                `SELECT count(*) as count FROM pragma_table_info('${table}') WHERE name='${column}'`
            )
            return result[0].count > 0
        } catch (error) {
            return false
        }
    }
} 