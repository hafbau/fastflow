import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique
} from 'typeorm'
import { Organization } from './Organization'

/**
 * OrganizationMember entity
 * Represents a member of an organization
 */
@Entity()
@Unique(['organizationId', 'userId'])
export class OrganizationMember {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    organizationId: string

    @ManyToOne(() => Organization, organization => organization.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationId' })
    organization: Organization

    @Column({ type: 'uuid' })
    userId: string

    @Column({ length: 50, default: 'member' })
    role: string

    @Column({ default: true })
    isActive: boolean

    @Column({ type: 'json', nullable: true })
    permissions: any

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}