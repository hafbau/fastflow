import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm'
import { Organization } from './Organization'

/**
 * OrganizationInvitation entity
 * Represents an invitation to join an organization
 */
@Entity()
export class OrganizationInvitation {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    organizationId: string

    @ManyToOne(() => Organization, organization => organization.invitations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationId' })
    organization: Organization

    @Column({ length: 255 })
    email: string

    @Column({ length: 50, default: 'member' })
    role: string

    @Column({ length: 255, unique: true })
    token: string

    @Column({ type: 'datetime' })
    expiresAt: Date

    @Column({ length: 50, default: 'pending' })
    status: string

    @Column({ type: 'uuid', nullable: true })
    invitedBy: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}