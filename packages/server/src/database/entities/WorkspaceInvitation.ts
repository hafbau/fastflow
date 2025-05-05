import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm'
import { Workspace } from './Workspace'
import { Organization } from './Organization'

/**
 * WorkspaceInvitation entity
 * Represents an invitation to join a workspace
 */
@Entity()
export class WorkspaceInvitation {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    workspaceId: string

    @ManyToOne(() => Workspace, workspace => workspace.invitations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'workspaceId' })
    workspace: Workspace

    @Column({ type: 'uuid' })
    organizationId: string

    @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
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