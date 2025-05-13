import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration to update user_profile table columns to camelCase and match the UserProfile entity (MySQL)
 */
export class UserProfileCamelCaseMigration1746841100000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists
        const tableExists = await queryRunner.hasTable("user_profile");
        if (!tableExists) {
            // Create table with correct camelCase columns
            await queryRunner.query(`
                CREATE TABLE user_profile (
                    id varchar(36) PRIMARY KEY NOT NULL,
                    firstName varchar(255) NULL,
                    lastName varchar(255) NULL,
                    displayName varchar(255) NULL,
                    avatarUrl varchar(255) NULL,
                    phoneNumber varchar(20) NULL,
                    status varchar(50) NOT NULL DEFAULT 'ACTIVE',
                    preferences json NULL,
                    metadata json NULL,
                    lastLogin datetime NULL,
                    createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updatedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
                    await queryRunner.query(`ALTER TABLE user_profile CHANGE \`${oldName}\` \`${newName}\` varchar(255) NULL`);
                }
            }
        }

        // Change column types/defaults to match entity
        await queryRunner.query(`ALTER TABLE user_profile MODIFY id varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE user_profile MODIFY firstName varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE user_profile MODIFY lastName varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE user_profile MODIFY displayName varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE user_profile MODIFY avatarUrl varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE user_profile MODIFY phoneNumber varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE user_profile MODIFY status varchar(50) NOT NULL DEFAULT 'ACTIVE'`);
        await queryRunner.query(`ALTER TABLE user_profile MODIFY preferences json NULL`);
        await queryRunner.query(`ALTER TABLE user_profile MODIFY metadata json NULL`);
        await queryRunner.query(`ALTER TABLE user_profile MODIFY lastLogin datetime NULL`);
        await queryRunner.query(`ALTER TABLE user_profile MODIFY createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE user_profile MODIFY updatedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
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
                    await queryRunner.query(`ALTER TABLE user_profile CHANGE \`${oldName}\` \`${newName}\` varchar(255) NULL`);
                }
            }
        }
        // Optionally, revert column types if needed (not strictly necessary for rollback)
    }
}
