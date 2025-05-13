import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToMany
} from 'typeorm'
import { Workspace } from './Workspace'
import { OrganizationMember } from './OrganizationMember'
import { Role } from './Role'
import { Invitation } from './Invitation'

/**
 * Organization entity
 * Represents a top-level tenant in the multi-tenant architecture
 */
@Entity()
export class Organization {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ length: 255 })
    name: string

    @Column({ length: 255, unique: true })
    slug: string

    @Column({ type: 'uuid', nullable: true })
    createdBy?: string

    @CreateDateColumn()
    createdAt: Date

    // Relationships
    @OneToMany(() => Workspace, workspace => workspace.organization)
    workspaces: Workspace[]

    @OneToMany(() => OrganizationMember, member => member.organization)
    members: OrganizationMember[]

    @OneToMany(() => Role, role => role.organization)
    roles: Role[]

    @OneToMany(() => Invitation, invitation => invitation.organization)
    invitations: Invitation[]
}
