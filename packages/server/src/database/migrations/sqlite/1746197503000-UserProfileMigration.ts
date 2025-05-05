import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Migration to create the user_profile table for SQLite
 */
export class UserProfileMigration1746197503000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if table already exists
        const tableExists = await queryRunner.hasTable('user_profile')
        if (tableExists) {
            return
        }

        // Create table using direct SQL for SQLite compatibility with no hyphens
        await queryRunner.query(`
            CREATE TABLE user_profile (
                id varchar PRIMARY KEY NOT NULL,
                first_name varchar(255),
                last_name varchar(255),
                display_name varchar(255),
                avatar_url varchar(255),
                phone_number varchar(20),
                status varchar(50) NOT NULL DEFAULT 'ACTIVE',
                preferences text,
                metadata text,
                last_login datetime,
                created_at datetime NOT NULL DEFAULT (datetime('now')),
                updated_at datetime NOT NULL DEFAULT (datetime('now'))
            )
        `)

        // Create index on status for faster filtering
        await queryRunner.query(`
            CREATE INDEX IDX_USER_PROFILE_STATUS ON user_profile (status)
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists before dropping
        const tableExists = await queryRunner.hasTable('user_profile')
        if (tableExists) {
            await queryRunner.query('DROP TABLE user_profile')
        }
    }
}