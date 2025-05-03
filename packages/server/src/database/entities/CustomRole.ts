import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { Role } from './Role'

/**
 * Custom Role entity
 * Extends the base Role entity with additional properties for custom roles
 * including inheritance, hierarchy, and versioning
 */
@Entity('custom_role')
export class CustomRole extends Role {
    /**
     * Parent role ID for inheritance
     * If set, this role inherits all permissions from the parent role
     */
    @Column({ type: 'uuid', nullable: true })
    parentRoleId?: string

    /**
     * Reference to the parent role
     */
    @ManyToOne(() => Role, { nullable: true })
    @JoinColumn({ name: 'parentRoleId' })
    parentRole?: Role

    /**
     * Child roles that inherit from this role
     */
    @OneToMany(() => CustomRole, customRole => customRole.parentRole)
    childRoles?: CustomRole[]

    /**
     * Role priority for conflict resolution
     * Higher priority roles take precedence in permission conflicts
     */
    @Column({ type: 'int', default: 0 })
    priority: number

    /**
     * Version of the role
     * Used for tracking changes to the role over time
     */
    @Column({ type: 'int', default: 1 })
    version: number

    /**
     * Whether this role is a template that can be used to create new roles
     */
    @Column({ type: 'boolean', default: false })
    isTemplate: boolean

    /**
     * Template ID if this role was created from a template
     */
    @Column({ type: 'uuid', nullable: true })
    templateId?: string

    /**
     * Reference to the template role
     */
    @ManyToOne(() => CustomRole, { nullable: true })
    @JoinColumn({ name: 'templateId' })
    template?: CustomRole

    /**
     * Roles created from this template
     */
    @OneToMany(() => CustomRole, customRole => customRole.template)
    derivedRoles?: CustomRole[]
}