import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

/**
 * Migration to update the workspace_member table for MySQL
 */
export class WorkspaceMemberMigration1746197504000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists
        const table = await queryRunner.getTable('workspace_member')
        if (!table) {
            return
        }
        
        // Check if isActive column already exists
        const isActiveColumn = table.findColumnByName('isActive')
        if (!isActiveColumn) {
            // Add isActive column
            await queryRunner.addColumn(
                'workspace_member',
                new TableColumn({
                    name: 'isActive',
                    type: 'boolean',
                    default: true
                })
            )
        }

        // Check if updatedAt column already exists
        const updatedAtColumn = table.findColumnByName('updatedAt')
        if (!updatedAtColumn) {
            // Add updatedAt column
            await queryRunner.addColumn(
                'workspace_member',
                new TableColumn({
                    name: 'updatedAt',
                    type: 'datetime',
                    default: 'CURRENT_TIMESTAMP(6)'
                })
            )
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists
        const table = await queryRunner.getTable('workspace_member')
        if (!table) {
            return
        }
        
        // Check if updatedAt column exists before dropping
        const updatedAtColumn = table.findColumnByName('updatedAt')
        if (updatedAtColumn) {
            // Remove updatedAt column
            await queryRunner.dropColumn('workspace_member', 'updatedAt')
        }

        // Check if isActive column exists before dropping
        const isActiveColumn = table.findColumnByName('isActive')
        if (isActiveColumn) {
            // Remove isActive column
            await queryRunner.dropColumn('workspace_member', 'isActive')
        }
    }
}