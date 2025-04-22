import { MigrationInterface, QueryRunner } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

export class MigrateExistingDataToScreenModel1716500000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get all existing UIFlows
        const uiFlows = await queryRunner.query(`SELECT id, name FROM ui_flow`)

        // For each UIFlow, create a default Screen
        for (const uiFlow of uiFlows) {
            const uiFlowId = uiFlow.id
            const screenName = `${uiFlow.name} - Main Screen`
            const screenPath = `/screens/${uiFlowId}/main`
            const screenId = uuidv4()
            
            // Create default screen for this UIFlow
            await queryRunner.query(
                `INSERT INTO screen (id, path, title, description, uiFlowId, createdDate, updatedDate) 
                 VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                [screenId, screenPath, screenName, `Default screen for ${uiFlow.name}`, uiFlowId]
            )
            
            // Currently there's no direct relationship between UIComponent and UIFlow,
            // so we don't need to update UIComponents here.
            // When the UI for managing screens is implemented, actual component-to-screen 
            // associations will be made.
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // When rolling back, we'll just remove all screens
        // The main schema migration will handle the foreign key constraints
        await queryRunner.query(`DELETE FROM screen`)
    }
} 