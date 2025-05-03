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
    @Column()
    @Index()
    userId: string

    /**
     * Permission ID
     */
    @Column()
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
    @Column({ nullable: true })
    @Index()
    resourceType?: string

    /**
     * Resource ID (optional)
     */
    @Column({ nullable: true })
    @Index()
    resourceId?: string

    /**
     * Expression for condition evaluation
     * Stored as JSON
     */
    @Column({ type: 'json' })
    expression: any

    /**
     * Description of the condition
     */
    @Column({ nullable: true })
    description?: string

    /**
     * Whether the conditional permission is active
     */
    @Column({ default: true })
    isActive: boolean

    /**
     * Created by user ID
     */
    @Column({ nullable: true })
    createdBy?: string

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