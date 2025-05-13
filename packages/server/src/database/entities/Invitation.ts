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
import { Workspace } from './Workspace'

/**
 * Invitation entity
 * Represents an invitation to join an organization or workspace
 */
@Entity()
export class Invitation {
    @PrimaryGeneratedColumn('uuid')
    id: string

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

    @Column({ type: 'uuid' })
    organizationId: string

    @ManyToOne(() => Organization, organization => organization.invitations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationId' })
    organization: Organization

    @Column({ type: 'uuid', nullable: true })
    workspaceId: string

    @ManyToOne(() => Workspace, workspace => workspace.invitations, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'workspaceId' })
    workspace: Workspace

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    /**
     * Determine the invitation type
     * @returns 'organization' or 'workspace'
     */
    get invitationType(): 'organization' | 'workspace' {
        return this.workspaceId ? 'workspace' : 'organization'
    }
}