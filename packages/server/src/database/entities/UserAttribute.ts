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

    @Column({ type: 'jsonb' })
    value: any

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date
}