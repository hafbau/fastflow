import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn
} from 'typeorm'
import { Organization } from './Organization'
import { WorkspaceMember } from './WorkspaceMember'
import { WorkspaceInvitation } from './WorkspaceInvitation'
import { WorkspaceSettings } from './WorkspaceSettings'
import { UserRole } from './UserRole'

/**
 * Workspace entity
 * Represents a workspace within an organization
 */
@Entity()
export class Workspace {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    organizationId: string

    @ManyToOne(() => Organization, organization => organization.workspaces, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationId' })
    organization: Organization

    @Column({ length: 255 })
    name: string

    @Column({ length: 255 })
    slug: string

    @Column({ type: 'text', nullable: true })
    description?: string

    @Column({ length: 255, nullable: true })
    iconUrl?: string

    @Column({ type: 'uuid', nullable: true })
    createdBy?: string

    @Column({ default: true })
    isActive: boolean

    @OneToMany(() => WorkspaceMember, member => member.workspace)
    members: WorkspaceMember[]

    @OneToMany(() => WorkspaceInvitation, invitation => invitation.workspace)
    invitations: WorkspaceInvitation[]

    @OneToMany(() => WorkspaceSettings, settings => settings.workspace)
    settings: WorkspaceSettings[]
    
    @OneToMany('UserRole', 'workspace')
    userRoles: any[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}