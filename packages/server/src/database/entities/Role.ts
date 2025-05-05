import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { Organization } from './Organization'

/**
 * Role types
 */
export enum RoleType {
    SYSTEM = 'system',
    CUSTOM = 'custom'
}

/**
 * Role entity
 * Represents a role that can be assigned to users
 */
@Entity('role')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ length: 100 })
    name: string

    @Column({ type: 'text', nullable: true })
    description?: string

    @Column({
        type: 'varchar',
        enum: RoleType,
        default: RoleType.CUSTOM,
        nullable: true // Make it nullable to handle existing records without this field
    })
    type?: RoleType

    @Column({ type: 'uuid', nullable: true })
    organizationId?: string

    @ManyToOne(() => Organization, organization => organization.roles, { nullable: true })
    @JoinColumn({ name: 'organizationId' })
    organization?: Organization

    @OneToMany('RolePermission', 'role')
    permissions: any[]

    @OneToMany('UserRole', 'role')
    userRoles: any[]
}