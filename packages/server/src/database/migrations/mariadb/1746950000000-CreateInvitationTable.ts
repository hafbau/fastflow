import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm'

export class CreateInvitationTable1746950000000 implements MigrationInterface {
    name = 'CreateInvitationTable1746950000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'invitation',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid()'
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        length: '255'
                    },
                    {
                        name: 'role',
                        type: 'varchar',
                        length: '50',
                        default: "'member'"
                    },
                    {
                        name: 'token',
                        type: 'varchar',
                        length: '255',
                        isUnique: true
                    },
                    {
                        name: 'expiresAt',
                        type: 'datetime'
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        length: '50',
                        default: "'pending'"
                    },
                    {
                        name: 'invitedBy',
                        type: 'varchar',
                        length: '36',
                        isNullable: true
                    },
                    {
                        name: 'organizationId',
                        type: 'varchar',
                        length: '36'
                    },
                    {
                        name: 'workspaceId',
                        type: 'varchar',
                        length: '36',
                        isNullable: true
                    },
                    {
                        name: 'createdAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP'
                    },
                    {
                        name: 'updatedAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP'
                    }
                ]
            }),
            true
        )

        // Create indexes
        await queryRunner.createIndex(
            'invitation',
            new TableIndex({
                name: 'IDX_INVITATION_TOKEN',
                columnNames: ['token']
            })
        )

        await queryRunner.createIndex(
            'invitation',
            new TableIndex({
                name: 'IDX_INVITATION_ORG_EMAIL',
                columnNames: ['organizationId', 'email']
            })
        )

        await queryRunner.createIndex(
            'invitation',
            new TableIndex({
                name: 'IDX_INVITATION_WORKSPACE_EMAIL',
                columnNames: ['workspaceId', 'email']
            })
        )

        // Create foreign keys
        await queryRunner.createForeignKey(
            'invitation',
            new TableForeignKey({
                columnNames: ['organizationId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'organization',
                onDelete: 'CASCADE'
            })
        )

        await queryRunner.createForeignKey(
            'invitation',
            new TableForeignKey({
                columnNames: ['workspaceId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'workspace',
                onDelete: 'CASCADE'
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('invitation')
        
        // Drop foreign keys
        const foreignKeys = table?.foreignKeys ?? []
        for (const foreignKey of foreignKeys) {
            await queryRunner.dropForeignKey('invitation', foreignKey)
        }
        
        // Drop indexes
        await queryRunner.dropIndex('invitation', 'IDX_INVITATION_TOKEN')
        await queryRunner.dropIndex('invitation', 'IDX_INVITATION_ORG_EMAIL')
        await queryRunner.dropIndex('invitation', 'IDX_INVITATION_WORKSPACE_EMAIL')
        
        // Drop table
        await queryRunner.dropTable('invitation')
    }
}