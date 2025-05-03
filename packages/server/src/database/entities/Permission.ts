import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'

/**
 * Permission scope levels
 */
export enum PermissionScope {
    SYSTEM = 'system',
    ORGANIZATION = 'organization',
    WORKSPACE = 'workspace',
    RESOURCE = 'resource'
}

/**
 * Permission entity
 * Represents a permission that can be assigned to roles
 */
@Entity('permission')
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ length: 100 })
    resourceType: string

    @Column({ length: 50 })
    action: string

    @Column({
        type: 'enum',
        enum: PermissionScope,
        default: PermissionScope.RESOURCE
    })
    scope: PermissionScope

    @Column({ type: 'text', nullable: true })
    description?: string

    /**
     * Permission name in format: {resourceType}:{action}
     * e.g., flows:read, credentials:write
     */
    @Column({ length: 150, unique: true })
    name: string

    @OneToMany('RolePermission', 'permission')
    roles: any[]
}