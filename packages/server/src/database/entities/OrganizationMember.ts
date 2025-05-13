import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique
} from 'typeorm'
import { Organization } from './Organization'
import { UserProfile } from './UserProfile'

/**
 * OrganizationMember entity
 * Represents a member of an organization
 */
@Entity('organization_member')
@Unique(['organizationId', 'userId'])
export class OrganizationMember {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    organizationId: string

    @Column({ type: 'uuid' })
    userId: string

    @Column({ length: 50, default: 'member' })
    role: string

    @CreateDateColumn({ name: 'joined_at' })
    joinedAt: Date

    // Relationships
    @ManyToOne(() => Organization, organization => organization.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationId' })
    organization: Organization

    @ManyToOne(() => UserProfile, { eager: false })
    @JoinColumn({ name: 'userId' })
    user?: UserProfile

    /**
     * Virtual property that reflects the user's active status
     * @returns {boolean} True if the user status is 'ACTIVE'
     */
    get isActive(): boolean {
        return this.user?.status === 'ACTIVE';
    }
}
