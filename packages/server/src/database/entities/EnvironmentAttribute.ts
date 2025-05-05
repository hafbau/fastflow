import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

/**
 * Environment Attribute entity
 * Stores attributes related to the environment (time, location, system state, etc.)
 * that can be used in attribute-based access control
 */
@Entity('environment_attribute')
export class EnvironmentAttribute {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ length: 100 })
    key: string

    @Column({ type: 'simple-json' })
    value: any

    @Column({ type: 'uuid', nullable: true })
    organizationId?: string

    @Column({ type: 'uuid', nullable: true })
    workspaceId?: string

    @Column({ type: 'boolean', default: true })
    isActive: boolean

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date
}