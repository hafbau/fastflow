import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from 'typeorm'

/**
 * Attribute types
 */
export enum AttributeType {
    RESOURCE = 'resource',
    USER = 'user',
    ENVIRONMENT = 'environment'
}

/**
 * Attribute entity
 * Stores attributes for resources, users, and environment
 */
@Entity()
export class Attribute {
    @PrimaryGeneratedColumn('uuid')
    id: string

    /**
     * Type of attribute (resource, user, environment)
     */
    @Column({
        type: 'varchar',
        enum: AttributeType,
        default: AttributeType.RESOURCE
    })
    @Index()
    type: AttributeType

    /**
     * Resource type (for resource attributes)
     */
    @Column({ nullable: true })
    @Index()
    resourceType?: string

    /**
     * Resource ID (for resource attributes)
     */
    @Column({ nullable: true })
    @Index()
    resourceId?: string

    /**
     * User ID (for user attributes)
     */
    @Column({ nullable: true })
    @Index()
    userId?: string

    /**
     * Organization ID (for environment attributes)
     */
    @Column({ nullable: true })
    @Index()
    organizationId?: string

    /**
     * Workspace ID (for environment attributes)
     */
    @Column({ nullable: true })
    @Index()
    workspaceId?: string

    /**
     * Attribute key
     */
    @Column()
    @Index()
    key: string

    /**
     * Attribute value (stored as JSON)
     */
    @Column({ type: 'json' })
    value: any

    /**
     * Created at timestamp
     */
    @CreateDateColumn()
    createdAt: Date

    /**
     * Updated at timestamp
     */
    @UpdateDateColumn()
    updatedAt: Date
}