import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'

/**
 * User profile entity
 * Stores additional user information that isn't stored in Supabase Auth
 */
@Entity('user_profile')
export class UserProfile {
    @PrimaryColumn({ type: 'uuid' })
    id: string // This is the Supabase Auth user ID

    @Column({ length: 255, nullable: true })
    firstName?: string

    @Column({ length: 255, nullable: true })
    lastName?: string

    @Column({ length: 255, nullable: true })
    displayName?: string

    @Column({ length: 255, nullable: true })
    avatarUrl?: string

    @Column({ length: 20, nullable: true })
    phoneNumber?: string

    @Column({ length: 50, default: 'ACTIVE' })
    status: string

    @Column({ type: 'simple-json', nullable: true })
    preferences?: Record<string, any>

    @Column({ type: 'simple-json', nullable: true })
    metadata?: Record<string, any>

    @Column({ type: 'datetime', nullable: true })
    lastLogin?: Date

    @CreateDateColumn({ type: 'datetime' })
    createdAt: Date

    @UpdateDateColumn({ type: 'datetime' })
    updatedAt: Date
}

export default UserProfile