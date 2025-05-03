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
import { Workspace } from './Workspace'
import { Organization } from './Organization'
import { UserProfile } from './UserProfile'

/**
 * WorkspaceMember entity
 * Represents a member of a workspace
 */
@Entity()
@Unique(['workspaceId', 'userId'])
export class WorkspaceMember {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    workspaceId: string

    @ManyToOne(() => Workspace, workspace => workspace.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'workspaceId' })
    workspace: Workspace

    @Column({ type: 'uuid' })
    organizationId: string

    @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationId' })
    organization: Organization

    @Column({ type: 'uuid' })
    userId: string
    
    @ManyToOne(() => UserProfile)
    @JoinColumn({ name: 'userId' })
    user: UserProfile

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