import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm'

/**
 * Migration to create the user_profile table for MySQL
 */
export class UserProfileMigration1746197503000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if table already exists
        const tableExists = await queryRunner.hasTable('user_profile')
        if (tableExists) {
            return
        }

        await queryRunner.createTable(
            new Table({
                name: 'user_profile',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                        comment: 'Supabase Auth user ID'
                    },
                    {
                        name: 'firstName',
                        type: 'varchar',
                        length: '255',
                        isNullable: true
                    },
                    {
                        name: 'lastName',
                        type: 'varchar',
                        length: '255',
                        isNullable: true
                    },
                    {
                        name: 'displayName',
                        type: 'varchar',
                        length: '255',
                        isNullable: true
                    },
                    {
                        name: 'avatarUrl',
                        type: 'varchar',
                        length: '255',
                        isNullable: true
                    },
                    {
                        name: 'phoneNumber',
                        type: 'varchar',
                        length: '20',
                        isNullable: true
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        length: '50',
                        default: "'ACTIVE'"
                    },
                    {
                        name: 'preferences',
                        type: 'json',
                        isNullable: true
                    },
                    {
                        name: 'metadata',
                        type: 'json',
                        isNullable: true
                    },
                    {
                        name: 'lastLogin',
                        type: 'datetime',
                        isNullable: true
                    },
                    {
                        name: 'createdAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP(6)'
                    },
                    {
                        name: 'updatedAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP(6)'
                    }
                ],
                engine: 'InnoDB'
            }),
            true
        )

        // Create index on status for faster filtering
        await queryRunner.createIndex(
            'user_profile',
            new TableIndex({
                name: 'IDX_USER_PROFILE_STATUS',
                columnNames: ['status']
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists before dropping
        const tableExists = await queryRunner.hasTable('user_profile')
        if (tableExists) {
            await queryRunner.dropTable('user_profile')
        }
    }
}