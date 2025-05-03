import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { UserProfile } from './UserProfile'
import { Organization } from './Organization'

/**
 * User organization membership entity
 * Represents a user's membership in an organization
 */
@Entity('user_organization')
export class UserOrganization {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    userId: string

    @Column({ type: 'uuid' })
    organizationId: string

    @Column({ length: 50, default: 'member' })
    role: string

    @Column({ default: true })
    isActive: boolean

    @Column({ type: 'jsonb', nullable: true })
    metadata?: Record<string, any>

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => UserProfile)
    @JoinColumn({ name: 'userId' })
    user: UserProfile

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organizationId' })
    organization: Organization
}

export default UserOrganization