import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Role } from './Role'
import { Permission } from './Permission'

/**
 * RolePermission entity
 * Represents the many-to-many relationship between roles and permissions
 */
@Entity('role_permission')
export class RolePermission {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    roleId: string

    @ManyToOne('Role', 'permissions')
    @JoinColumn({ name: 'roleId' })
    role: Role

    @Column({ type: 'uuid' })
    permissionId: string

    @ManyToOne('Permission', 'roles')
    @JoinColumn({ name: 'permissionId' })
    permission: Permission
}