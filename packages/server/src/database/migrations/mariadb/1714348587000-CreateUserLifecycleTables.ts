import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateUserLifecycleTables1714348587000 implements MigrationInterface {
    name = 'CreateUserLifecycleTables1714348587000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create user_lifecycle_state table
        await queryRunner.query(`
            CREATE TABLE \`user_lifecycle_state\` (
                \`id\` varchar(36) NOT NULL,
                \`user_id\` varchar(36) NOT NULL,
                \`state\` ENUM('INVITED', 'REGISTERED', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED') NOT NULL DEFAULT 'INVITED',
                \`metadata\` json NULL,
                \`changed_by\` varchar(36) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_user_lifecycle_state_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user_profile\` (\`id\`) ON DELETE CASCADE,
                CONSTRAINT \`FK_user_lifecycle_state_changed_by\` FOREIGN KEY (\`changed_by\`) REFERENCES \`user_profile\` (\`id\`) ON DELETE SET NULL
            ) ENGINE=InnoDB
        `)

        // Create provisioning_rule table
        await queryRunner.query(`
            CREATE TABLE \`provisioning_rule\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`description\` text NULL,
                \`type\` ENUM('USER_ONBOARDING', 'ROLE_CHANGE', 'USER_OFFBOARDING') NOT NULL,
                \`trigger\` ENUM('EVENT', 'SCHEDULE', 'CONDITION') NOT NULL,
                \`conditions\` json NOT NULL,
                \`actions\` json NOT NULL,
                \`organization_id\` varchar(36) NULL,
                \`workspace_id\` varchar(36) NULL,
                \`status\` ENUM('ACTIVE', 'INACTIVE', 'DRAFT') NOT NULL DEFAULT 'DRAFT',
                \`created_by\` varchar(36) NOT NULL,
                \`updated_by\` varchar(36) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_provisioning_rule_organization\` FOREIGN KEY (\`organization_id\`) REFERENCES \`organization\` (\`id\`) ON DELETE CASCADE,
                CONSTRAINT \`FK_provisioning_rule_workspace\` FOREIGN KEY (\`workspace_id\`) REFERENCES \`workspace\` (\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `)

        // Create provisioning_action table
        await queryRunner.query(`
            CREATE TABLE \`provisioning_action\` (
                \`id\` varchar(36) NOT NULL,
                \`type\` ENUM('USER_CREATION', 'USER_ACTIVATION', 'USER_DEACTIVATION', 'USER_DELETION', 'ROLE_ASSIGNMENT', 'ROLE_REMOVAL', 'ORGANIZATION_ASSIGNMENT', 'ORGANIZATION_REMOVAL', 'WORKSPACE_ASSIGNMENT', 'WORKSPACE_REMOVAL', 'PERMISSION_ASSIGNMENT', 'PERMISSION_REMOVAL', 'NOTIFICATION', 'CUSTOM') NOT NULL,
                \`parameters\` json NOT NULL,
                \`target_user_id\` varchar(36) NULL,
                \`rule_id\` varchar(36) NULL,
                \`status\` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'REQUIRES_APPROVAL', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
                \`status_message\` text NULL,
                \`initiated_by\` varchar(36) NOT NULL,
                \`approved_by\` varchar(36) NULL,
                \`approval_date\` datetime NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`completed_at\` datetime NULL,
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_provisioning_action_target_user\` FOREIGN KEY (\`target_user_id\`) REFERENCES \`user_profile\` (\`id\`) ON DELETE SET NULL,
                CONSTRAINT \`FK_provisioning_action_rule\` FOREIGN KEY (\`rule_id\`) REFERENCES \`provisioning_rule\` (\`id\`) ON DELETE SET NULL,
                CONSTRAINT \`FK_provisioning_action_initiated_by\` FOREIGN KEY (\`initiated_by\`) REFERENCES \`user_profile\` (\`id\`) ON DELETE NO ACTION,
                CONSTRAINT \`FK_provisioning_action_approved_by\` FOREIGN KEY (\`approved_by\`) REFERENCES \`user_profile\` (\`id\`) ON DELETE SET NULL
            ) ENGINE=InnoDB
        `)

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX \`IDX_user_lifecycle_state_user_id\` ON \`user_lifecycle_state\` (\`user_id\`)`)
        await queryRunner.query(`CREATE INDEX \`IDX_user_lifecycle_state_state\` ON \`user_lifecycle_state\` (\`state\`)`)
        await queryRunner.query(`CREATE INDEX \`IDX_provisioning_rule_org\` ON \`provisioning_rule\` (\`organization_id\`)`)
        await queryRunner.query(`CREATE INDEX \`IDX_provisioning_rule_workspace\` ON \`provisioning_rule\` (\`workspace_id\`)`)
        await queryRunner.query(`CREATE INDEX \`IDX_provisioning_rule_status\` ON \`provisioning_rule\` (\`status\`)`)
        await queryRunner.query(`CREATE INDEX \`IDX_provisioning_rule_type\` ON \`provisioning_rule\` (\`type\`)`)
        await queryRunner.query(`CREATE INDEX \`IDX_provisioning_action_target\` ON \`provisioning_action\` (\`target_user_id\`)`)
        await queryRunner.query(`CREATE INDEX \`IDX_provisioning_action_rule\` ON \`provisioning_action\` (\`rule_id\`)`)
        await queryRunner.query(`CREATE INDEX \`IDX_provisioning_action_status\` ON \`provisioning_action\` (\`status\`)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX \`IDX_user_lifecycle_state_user_id\` ON \`user_lifecycle_state\``)
        await queryRunner.query(`DROP INDEX \`IDX_user_lifecycle_state_state\` ON \`user_lifecycle_state\``)
        await queryRunner.query(`DROP INDEX \`IDX_provisioning_rule_org\` ON \`provisioning_rule\``)
        await queryRunner.query(`DROP INDEX \`IDX_provisioning_rule_workspace\` ON \`provisioning_rule\``)
        await queryRunner.query(`DROP INDEX \`IDX_provisioning_rule_status\` ON \`provisioning_rule\``)
        await queryRunner.query(`DROP INDEX \`IDX_provisioning_rule_type\` ON \`provisioning_rule\``)
        await queryRunner.query(`DROP INDEX \`IDX_provisioning_action_target\` ON \`provisioning_action\``)
        await queryRunner.query(`DROP INDEX \`IDX_provisioning_action_rule\` ON \`provisioning_action\``)
        await queryRunner.query(`DROP INDEX \`IDX_provisioning_action_status\` ON \`provisioning_action\``)

        // Drop tables
        await queryRunner.query(`DROP TABLE \`provisioning_action\``)
        await queryRunner.query(`DROP TABLE \`provisioning_rule\``)
        await queryRunner.query(`DROP TABLE \`user_lifecycle_state\``)
    }
}