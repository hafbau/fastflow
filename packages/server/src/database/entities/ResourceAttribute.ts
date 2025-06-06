import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

/**
 * Resource Attribute entity
 * Stores attributes for resources that can be used in attribute-based access control
 */
@Entity('resource_attribute')
export class ResourceAttribute {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ length: 100 })
    resourceType: string

    @Column({ type: 'uuid' })
    resourceId: string

    @Column({ length: 100 })
    key: string

    @Column({ type: 'simple-json' })
    value: any

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date
}