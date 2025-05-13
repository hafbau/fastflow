import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique
} from 'typeorm'
import { Workspace } from './Workspace'
import { UserProfile } from './UserProfile'

/**
 * WorkspaceMember entity
 * Represents a member of a workspace
 */
@Entity('workspace_member')
@Unique(['workspaceId', 'userId'])
export class WorkspaceMember {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    workspaceId: string

    @Column({ type: 'uuid' })
    userId: string

    @Column({ length: 50, default: 'member' })
    role: string

    @CreateDateColumn({ name: 'joined_at' })
    joinedAt: Date

    // Relationships
    @ManyToOne(() => Workspace, workspace => workspace.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'workspaceId' })
    workspace: Workspace

    @ManyToOne(() => UserProfile, { eager: false })
    @JoinColumn({ name: 'userId' })
    user: UserProfile

    /**
     * Virtual property that reflects the user's active status
     * @returns {boolean} True if the user status is 'ACTIVE'
     */
    get isActive(): boolean {
        return this.user?.status === 'ACTIVE';
    }
}
