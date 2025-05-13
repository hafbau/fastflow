import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Migration to update user_profile table columns to camelCase and match the UserProfile entity (SQLite)
 */
export class UserProfileCamelCaseMigration1746841100000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists
        const tableExists = await queryRunner.hasTable('user_profile')
        if (!tableExists) {
            // Create table with correct camelCase columns
            await queryRunner.query(`
                CREATE TABLE user_profile (
                    id varchar PRIMARY KEY NOT NULL,
                    firstName varchar(255),
                    lastName varchar(255),
                    displayName varchar(255),
                    avatarUrl varchar(255),
                    phoneNumber varchar(20),
                    status varchar(50) NOT NULL DEFAULT 'ACTIVE',
                    preferences text,
                    metadata text,
                    lastLogin datetime,
                    createdAt datetime NOT NULL DEFAULT (datetime('now')),
                    updatedAt datetime NOT NULL DEFAULT (datetime('now'))
                )
            `)
            await queryRunner.query(`
                CREATE INDEX IDX_USER_PROFILE_STATUS ON user_profile (status)
            `)
            return
        }

        // If table exists, rename columns from snake_case to camelCase
        // SQLite does not support ALTER TABLE RENAME COLUMN before v3.25.0, so use a temp table approach
        await queryRunner.query(`
            ALTER TABLE user_profile RENAME TO user_profile_old
        `)
        await queryRunner.query(`
            CREATE TABLE user_profile (
                id varchar PRIMARY KEY NOT NULL,
                firstName varchar(255),
                lastName varchar(255),
                displayName varchar(255),
                avatarUrl varchar(255),
                phoneNumber varchar(20),
                status varchar(50) NOT NULL DEFAULT 'ACTIVE',
                preferences text,
                metadata text,
                lastLogin datetime,
                createdAt datetime NOT NULL DEFAULT (datetime('now')),
                updatedAt datetime NOT NULL DEFAULT (datetime('now'))
            )
        `)
        await queryRunner.query(`
            INSERT INTO user_profile (
                id, firstName, lastName, displayName, avatarUrl, phoneNumber, status, preferences, metadata, lastLogin, createdAt, updatedAt
            )
            SELECT
                id,
                first_name,
                last_name,
                display_name,
                avatar_url,
                phone_number,
                status,
                preferences,
                metadata,
                last_login,
                created_at,
                updated_at
            FROM user_profile_old
        `)
        await queryRunner.query(`
            DROP TABLE user_profile_old
        `)
        await queryRunner.query(`
            CREATE INDEX IDX_USER_PROFILE_STATUS ON user_profile (status)
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert to snake_case columns (for rollback)
        const tableExists = await queryRunner.hasTable('user_profile')
        if (!tableExists) return

        await queryRunner.query(`
            ALTER TABLE user_profile RENAME TO user_profile_new
        `)
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
        await queryRunner.query(`
            INSERT INTO user_profile (
                id, first_name, last_name, display_name, avatar_url, phone_number, status, preferences, metadata, last_login, created_at, updated_at
            )
            SELECT
                id,
                firstName,
                lastName,
                displayName,
                avatarUrl,
                phoneNumber,
                status,
                preferences,
                metadata,
                lastLogin,
                createdAt,
                updatedAt
            FROM user_profile_new
        `)
        await queryRunner.query(`
            DROP TABLE user_profile_new
        `)
        await queryRunner.query(`
            CREATE INDEX IDX_USER_PROFILE_STATUS ON user_profile (status)
        `)
    }
}
