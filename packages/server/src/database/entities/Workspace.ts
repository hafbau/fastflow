import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany
} from 'typeorm'
import { Organization } from './Organization'
import { WorkspaceMember } from './WorkspaceMember'
import { UserRole } from './UserRole'
import { Invitation } from './Invitation'

/**
 * Workspace entity
 * Represents a workspace within an organization
 */
@Entity()
export class Workspace {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ length: 255 })
    name: string

    @Column({ length: 255 })
    slug: string

    @Column({ type: 'uuid' })
    organizationId: string

    @Column({ type: 'uuid', nullable: true })
    createdBy?: string

    @CreateDateColumn()
    createdAt: Date

    // Relationships
    @ManyToOne(() => Organization, organization => organization.workspaces)
    @JoinColumn({ name: 'organizationId' })
    organization: Organization

    @OneToMany(() => WorkspaceMember, member => member.workspace)
    members: WorkspaceMember[]

    @OneToMany(() => UserRole, userRole => userRole.workspace)
    userRoles: UserRole[]

    @OneToMany(() => Invitation, invitation => invitation.workspace)
    invitations: Invitation[]
}
