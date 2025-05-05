import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index
} from 'typeorm'
import { Permission } from './Permission'

/**
 * ConditionalPermission entity
 * Stores conditional permissions based on attribute expressions
 */
@Entity()
export class ConditionalPermission {
    @PrimaryGeneratedColumn('uuid')
    id: string

    /**
     * User ID
     */
    @Column({ type: 'varchar' })
    @Index()
    userId: string

    /**
     * Permission ID
     */
    @Column({ type: 'varchar' })
    @Index()
    permissionId: string

    /**
     * Permission relation
     */
    @ManyToOne(() => Permission)
    @JoinColumn({ name: 'permissionId' })
    permission: Permission

    /**
     * Resource type (optional)
     */
    @Column({ nullable: true, type: 'varchar' })
    @Index()
    resourceType?: string

    /**
     * Resource ID (optional)
     */
    @Column({ nullable: true, type: 'varchar' })
    @Index()
    resourceId?: string

    /**
     * Expression for condition evaluation
     * Stored as JSON
     */
    @Column({ type: 'simple-json' })
    expression: any

    /**
     * Description of the condition
     */
    @Column({ nullable: true, type: 'varchar' })
    description?: string

    /**
     * Whether the conditional permission is active
     */
    @Column({ default: true, type: 'boolean' })
    isActive: boolean

    /**
     * Created by user ID
     */
    @Column({ nullable: true, type: 'varchar' })
    createdBy?: string

    /**
     * Created at timestamp
     */
    @CreateDateColumn({ type: 'datetime' })
    createdAt: Date

    /**
     * Updated at timestamp
     */
    @UpdateDateColumn({ type: 'datetime' })
    updatedAt: Date
}