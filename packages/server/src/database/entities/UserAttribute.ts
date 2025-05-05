import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

/**
 * User Attribute entity
 * Stores attributes for users that can be used in attribute-based access control
 */
@Entity('user_attribute')
export class UserAttribute {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    userId: string

    @Column({ length: 100 })
    key: string

    @Column({ type: 'simple-json' })
    value: any

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date
}