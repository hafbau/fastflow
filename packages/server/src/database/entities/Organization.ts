import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
} from 'typeorm'
import { Workspace } from './Workspace'
import { OrganizationMember } from './OrganizationMember'
import { OrganizationInvitation } from './OrganizationInvitation'
import { OrganizationSettings } from './OrganizationSettings'
import { Role } from './Role'

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

    @Column({ type: 'text', nullable: true })
    description?: string

    @Column({ length: 255, nullable: true })
    logoUrl?: string

    @Column({ type: 'uuid', nullable: true })
    createdBy?: string

    @Column({ default: true })
    isActive: boolean

    @OneToMany(() => Workspace, workspace => workspace.organization)
    workspaces: Workspace[]

    @OneToMany(() => OrganizationMember, member => member.organization)
    members: OrganizationMember[]

    @OneToMany(() => OrganizationInvitation, invitation => invitation.organization)
    invitations: OrganizationInvitation[]

    @OneToMany(() => OrganizationSettings, settings => settings.organization)
    settings: OrganizationSettings[]
    
    @OneToMany('Role', 'organization')
    roles: any[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}