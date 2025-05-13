import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration to update user_profile table columns to camelCase and match the UserProfile entity (Postgres)
 */
export class UserProfileCamelCaseMigration1746841100000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists
        const tableExists = await queryRunner.hasTable("user_profile");
        if (!tableExists) {
            // Create table with correct camelCase columns
            await queryRunner.query(`
                CREATE TABLE user_profile (
                    id uuid PRIMARY KEY NOT NULL,
                    firstName varchar(255),
                    lastName varchar(255),
                    displayName varchar(255),
                    avatarUrl varchar(255),
                    phoneNumber varchar(20),
                    status varchar(50) NOT NULL DEFAULT 'ACTIVE',
                    preferences jsonb,
                    metadata jsonb,
                    lastLogin timestamp,
                    createdAt timestamp NOT NULL DEFAULT now(),
                    updatedAt timestamp NOT NULL DEFAULT now()
                )
            `);
            await queryRunner.query(`
                CREATE INDEX IDX_USER_PROFILE_STATUS ON user_profile (status)
            `);
            return;
        }

        // Rename columns from snake_case to camelCase if they exist
        const table = await queryRunner.getTable("user_profile");
        if (table) {
            const columns = table.columns;
            const renameMap: Record<string, string> = {
                first_name: "firstName",
                last_name: "lastName",
                display_name: "displayName",
                avatar_url: "avatarUrl",
                phone_number: "phoneNumber",
                last_login: "lastLogin",
                created_at: "createdAt",
                updated_at: "updatedAt"
            };
            for (const [oldName, newName] of Object.entries(renameMap)) {
                if (columns.find((col: any) => col.name === oldName) && !columns.find((col: any) => col.name === newName)) {
                    await queryRunner.query(`ALTER TABLE user_profile RENAME COLUMN "${oldName}" TO "${newName}"`);
                }
            }
        }

        // Change column types/defaults to match entity
        await queryRunner.query(`ALTER TABLE user_profile ALTER COLUMN id TYPE uuid`);
        await queryRunner.query(`ALTER TABLE user_profile ALTER COLUMN firstName TYPE varchar(255)`);
        await queryRunner.query(`ALTER TABLE user_profile ALTER COLUMN lastName TYPE varchar(255)`);
        await queryRunner.query(`ALTER TABLE user_profile ALTER COLUMN displayName TYPE varchar(255)`);
        await queryRunner.query(`ALTER TABLE user_profile ALTER COLUMN avatarUrl TYPE varchar(255)`);
        await queryRunner.query(`ALTER TABLE user_profile ALTER COLUMN phoneNumber TYPE varchar(20)`);
        await queryRunner.query(`ALTER TABLE user_profile ALTER COLUMN status TYPE varchar(50)`);
        await queryRunner.query(`ALTER TABLE user_profile ALTER COLUMN status SET DEFAULT 'ACTIVE'`);
        await queryRunner.query(`ALTER TABLE user_profile ALTER COLUMN preferences TYPE jsonb USING preferences::jsonb`);
        await queryRunner.query(`ALTER TABLE user_profile ALTER COLUMN metadata TYPE jsonb USING metadata::jsonb`);
        await queryRunner.query(`ALTER TABLE user_profile ALTER COLUMN lastLogin TYPE timestamp`);
        await queryRunner.query(`ALTER TABLE user_profile ALTER COLUMN createdAt TYPE timestamp`);
        await queryRunner.query(`ALTER TABLE user_profile ALTER COLUMN createdAt SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE user_profile ALTER COLUMN updatedAt TYPE timestamp`);
        await queryRunner.query(`ALTER TABLE user_profile ALTER COLUMN updatedAt SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert camelCase columns to snake_case
        const tableExists = await queryRunner.hasTable("user_profile");
        if (!tableExists) return;

        const table = await queryRunner.getTable("user_profile");
        if (table) {
            const columns = table.columns;
            const renameMap: Record<string, string> = {
                firstName: "first_name",
                lastName: "last_name",
                displayName: "display_name",
                avatarUrl: "avatar_url",
                phoneNumber: "phone_number",
                lastLogin: "last_login",
                createdAt: "created_at",
                updatedAt: "updated_at"
            };
            for (const [oldName, newName] of Object.entries(renameMap)) {
                if (columns.find((col: any) => col.name === oldName) && !columns.find((col: any) => col.name === newName)) {
                    await queryRunner.query(`ALTER TABLE user_profile RENAME COLUMN "${oldName}" TO "${newName}"`);
                }
            }
        }
        // Optionally, revert column types if needed (not strictly necessary for rollback)
    }
}
