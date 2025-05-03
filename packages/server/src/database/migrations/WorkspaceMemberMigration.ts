import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

/**
 * Migration to update the workspace_member table
 */
export class WorkspaceMemberMigration implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add isActive column
        await queryRunner.addColumn(
            'workspace_member',
            new TableColumn({
                name: 'isActive',
                type: 'boolean',
                default: true
            })
        )

        // Add updatedAt column
        await queryRunner.addColumn(
            'workspace_member',
            new TableColumn({
                name: 'updatedAt',
                type: 'timestamp',
                default: 'now()'
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove updatedAt column
        await queryRunner.dropColumn('workspace_member', 'updatedAt')

        // Remove isActive column
        await queryRunner.dropColumn('workspace_member', 'isActive')
    }
}