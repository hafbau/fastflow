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

/**
 * Workspace Settings entity
 * Represents settings for a workspace
 */
@Entity()
export class WorkspaceSettings {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    workspaceId: string

    @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'workspaceId' })
    workspace: Workspace

    @Column({ length: 50, default: 'light' })
    theme: string

    @Column({ length: 50, default: 'member' })
    defaultRole: string

    @Column({ default: false })
    isPublic: boolean

    @Column({ default: false })
    allowMemberInvites: boolean

    @Column({ default: 10 })
    maxMembers: number

    @Column({ type: 'json', nullable: true })
    settings: any

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}