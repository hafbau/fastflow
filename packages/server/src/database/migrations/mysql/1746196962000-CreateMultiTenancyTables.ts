import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateMultiTenancyTables1746196962000 implements MigrationInterface {
    name = 'CreateMultiTenancyTables1746196962000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create organization table
        await queryRunner.query(`
            CREATE TABLE \`organization\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`slug\` varchar(255) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`createdBy\` varchar(36) NULL,
                UNIQUE INDEX \`IDX_organization_slug\` (\`slug\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `)

        // Create workspace table
        await queryRunner.query(`
            CREATE TABLE \`workspace\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`slug\` varchar(255) NOT NULL,
                \`organizationId\` varchar(36) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`createdBy\` varchar(36) NULL,
                INDEX \`IDX_workspace_organization\` (\`organizationId\`),
                INDEX \`IDX_workspace_slug\` (\`slug\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `)

        // Create organization_member table
        await queryRunner.query(`
            CREATE TABLE \`organization_member\` (
                \`id\` varchar(36) NOT NULL,
                \`organizationId\` varchar(36) NOT NULL,
                \`userId\` varchar(36) NOT NULL,
                \`role\` varchar(50) NOT NULL DEFAULT 'member',
                \`joined_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                INDEX \`IDX_organization_member_org\` (\`organizationId\`),
                INDEX \`IDX_organization_member_user\` (\`userId\`),
                UNIQUE INDEX \`IDX_organization_member_org_user\` (\`organizationId\`, \`userId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `)

        // Create workspace_member table
        await queryRunner.query(`
            CREATE TABLE \`workspace_member\` (
                \`id\` varchar(36) NOT NULL,
                \`workspaceId\` varchar(36) NOT NULL,
                \`userId\` varchar(36) NOT NULL,
                \`role\` varchar(50) NOT NULL DEFAULT 'member',
                \`joined_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                INDEX \`IDX_workspace_member_workspace\` (\`workspaceId\`),
                INDEX \`IDX_workspace_member_user\` (\`userId\`),
                UNIQUE INDEX \`IDX_workspace_member_workspace_user\` (\`workspaceId\`, \`userId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `)

        // Create role table
        await queryRunner.query(`
            CREATE TABLE \`role\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(100) NOT NULL,
                \`description\` text NULL,
                \`organizationId\` varchar(36) NULL,
                INDEX \`IDX_role_organization\` (\`organizationId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `)

        // Create permission table
        await queryRunner.query(`
            CREATE TABLE \`permission\` (
                \`id\` varchar(36) NOT NULL,
                \`resourceType\` varchar(100) NOT NULL,
                \`action\` varchar(50) NOT NULL,
                \`description\` text NULL,
                UNIQUE INDEX \`IDX_permission_resource_action\` (\`resourceType\`, \`action\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `)

        // Create role_permission table
        await queryRunner.query(`
            CREATE TABLE \`role_permission\` (
                \`id\` varchar(36) NOT NULL,
                \`roleId\` varchar(36) NOT NULL,
                \`permissionId\` varchar(36) NOT NULL,
                INDEX \`IDX_role_permission_role\` (\`roleId\`),
                INDEX \`IDX_role_permission_permission\` (\`permissionId\`),
                UNIQUE INDEX \`IDX_role_permission_role_permission\` (\`roleId\`, \`permissionId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `)

        // Create user_role table
        await queryRunner.query(`
            CREATE TABLE \`user_role\` (
                \`id\` varchar(36) NOT NULL,
                \`userId\` varchar(36) NOT NULL,
                \`roleId\` varchar(36) NOT NULL,
                \`workspaceId\` varchar(36) NULL,
                INDEX \`IDX_user_role_user\` (\`userId\`),
                INDEX \`IDX_user_role_role\` (\`roleId\`),
                INDEX \`IDX_user_role_workspace\` (\`workspaceId\`),
                UNIQUE INDEX \`IDX_user_role_user_role_workspace\` (\`userId\`, \`roleId\`, \`workspaceId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `)

        // Create resource_permission table
        await queryRunner.query(`
            CREATE TABLE \`resource_permission\` (
                \`id\` varchar(36) NOT NULL,
                \`resourceType\` varchar(100) NOT NULL,
                \`resourceId\` varchar(36) NOT NULL,
                \`userId\` varchar(36) NOT NULL,
                \`permission\` varchar(50) NOT NULL,
                INDEX \`IDX_resource_permission_resource\` (\`resourceType\`, \`resourceId\`),
                INDEX \`IDX_resource_permission_user\` (\`userId\`),
                UNIQUE INDEX \`IDX_resource_permission_resource_user_permission\` (\`resourceType\`, \`resourceId\`, \`userId\`, \`permission\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `)

        // Create audit_log table
        await queryRunner.query(`
            CREATE TABLE \`audit_log\` (
                \`id\` varchar(36) NOT NULL,
                \`timestamp\` datetime NOT NULL,
                \`userId\` varchar(36) NULL,
                \`action\` varchar(50) NOT NULL,
                \`resourceType\` varchar(100) NOT NULL,
                \`resourceId\` varchar(36) NULL,
                \`metadata\` json NULL,
                \`ipAddress\` varchar(50) NULL,
                INDEX \`IDX_audit_log_timestamp\` (\`timestamp\`),
                INDEX \`IDX_audit_log_user\` (\`userId\`),
                INDEX \`IDX_audit_log_resource\` (\`resourceType\`, \`resourceId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `)

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE \`workspace\` 
            ADD CONSTRAINT \`FK_workspace_organization\` 
            FOREIGN KEY (\`organizationId\`) 
            REFERENCES \`organization\`(\`id\`) 
            ON DELETE CASCADE
        `)

        await queryRunner.query(`
            ALTER TABLE \`organization_member\` 
            ADD CONSTRAINT \`FK_organization_member_organization\` 
            FOREIGN KEY (\`organizationId\`) 
            REFERENCES \`organization\`(\`id\`) 
            ON DELETE CASCADE
        `)

        await queryRunner.query(`
            ALTER TABLE \`workspace_member\` 
            ADD CONSTRAINT \`FK_workspace_member_workspace\` 
            FOREIGN KEY (\`workspaceId\`) 
            REFERENCES \`workspace\`(\`id\`) 
            ON DELETE CASCADE
        `)

        await queryRunner.query(`
            ALTER TABLE \`role\` 
            ADD CONSTRAINT \`FK_role_organization\` 
            FOREIGN KEY (\`organizationId\`) 
            REFERENCES \`organization\`(\`id\`) 
            ON DELETE CASCADE
        `)

        await queryRunner.query(`
            ALTER TABLE \`role_permission\` 
            ADD CONSTRAINT \`FK_role_permission_role\` 
            FOREIGN KEY (\`roleId\`) 
            REFERENCES \`role\`(\`id\`) 
            ON DELETE CASCADE
        `)

        await queryRunner.query(`
            ALTER TABLE \`role_permission\` 
            ADD CONSTRAINT \`FK_role_permission_permission\` 
            FOREIGN KEY (\`permissionId\`) 
            REFERENCES \`permission\`(\`id\`) 
            ON DELETE CASCADE
        `)

        await queryRunner.query(`
            ALTER TABLE \`user_role\` 
            ADD CONSTRAINT \`FK_user_role_role\` 
            FOREIGN KEY (\`roleId\`) 
            REFERENCES \`role\`(\`id\`) 
            ON DELETE CASCADE
        `)

        await queryRunner.query(`
            ALTER TABLE \`user_role\` 
            ADD CONSTRAINT \`FK_user_role_workspace\` 
            FOREIGN KEY (\`workspaceId\`) 
            REFERENCES \`workspace\`(\`id\`) 
            ON DELETE CASCADE
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first
        await queryRunner.query(`ALTER TABLE \`user_role\` DROP FOREIGN KEY \`FK_user_role_workspace\``)
        await queryRunner.query(`ALTER TABLE \`user_role\` DROP FOREIGN KEY \`FK_user_role_role\``)
        await queryRunner.query(`ALTER TABLE \`role_permission\` DROP FOREIGN KEY \`FK_role_permission_permission\``)
        await queryRunner.query(`ALTER TABLE \`role_permission\` DROP FOREIGN KEY \`FK_role_permission_role\``)
        await queryRunner.query(`ALTER TABLE \`role\` DROP FOREIGN KEY \`FK_role_organization\``)
        await queryRunner.query(`ALTER TABLE \`workspace_member\` DROP FOREIGN KEY \`FK_workspace_member_workspace\``)
        await queryRunner.query(`ALTER TABLE \`organization_member\` DROP FOREIGN KEY \`FK_organization_member_organization\``)
        await queryRunner.query(`ALTER TABLE \`workspace\` DROP FOREIGN KEY \`FK_workspace_organization\``)

        // Drop tables in reverse order of creation
        await queryRunner.query(`DROP TABLE \`audit_log\``)
        await queryRunner.query(`DROP TABLE \`resource_permission\``)
        await queryRunner.query(`DROP TABLE \`user_role\``)
        await queryRunner.query(`DROP TABLE \`role_permission\``)
        await queryRunner.query(`DROP TABLE \`permission\``)
        await queryRunner.query(`DROP TABLE \`role\``)
        await queryRunner.query(`DROP TABLE \`workspace_member\``)
        await queryRunner.query(`DROP TABLE \`organization_member\``)
        await queryRunner.query(`DROP TABLE \`workspace\``)
        await queryRunner.query(`DROP TABLE \`organization\``)
    }
}