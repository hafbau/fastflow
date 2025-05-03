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

/**
 * Organization Settings entity
 * Represents settings for an organization
 */
@Entity()
export class OrganizationSettings {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    organizationId: string

    @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationId' })
    organization: Organization

    @Column({ length: 50, default: 'light' })
    theme: string

    @Column({ length: 50, default: 'member' })
    defaultRole: string

    @Column({ default: false })
    allowPublicWorkspaces: boolean

    @Column({ default: false })
    allowMemberInvites: boolean

    @Column({ default: 10 })
    maxWorkspaces: number

    @Column({ default: 10 })
    maxMembersPerWorkspace: number

    @Column({ type: 'json', nullable: true })
    settings: any

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}