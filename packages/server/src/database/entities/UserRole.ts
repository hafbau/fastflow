import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Role } from './Role'
import { Workspace } from './Workspace'

/**
 * UserRole entity
 * Represents the assignment of a role to a user
 */
@Entity('user_role')
export class UserRole {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    userId: string

    @Column({ type: 'uuid' })
    roleId: string

    @ManyToOne('Role', 'userRoles')
    @JoinColumn({ name: 'roleId' })
    role: Role

    @Column({ type: 'uuid', nullable: true })
    workspaceId?: string

    @ManyToOne('Workspace', 'userRoles', { nullable: true })
    @JoinColumn({ name: 'workspaceId' })
    workspace?: Workspace
}