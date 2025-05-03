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
 * Time-based permission types
 */
export enum TimeBasedPermissionType {
    TEMPORARY = 'temporary',
    SCHEDULED = 'scheduled',
    RECURRING = 'recurring'
}

/**
 * TimeBasedPermission entity
 * Stores time-based permissions with various scheduling options
 */
@Entity()
export class TimeBasedPermission {
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
     * Type of time-based permission
     */
    @Column({
        type: 'enum',
        enum: TimeBasedPermissionType,
        default: TimeBasedPermissionType.TEMPORARY
    })
    type: TimeBasedPermissionType

    /**
     * Start time for the permission
     */
    @Column({ type: 'timestamp' })
    @Index()
    startTime: Date

    /**
     * End time for the permission (optional for recurring)
     */
    @Column({ type: 'timestamp', nullable: true })
    @Index()
    endTime?: Date

    /**
     * Schedule for recurring permissions
     * Stored as JSON with the following structure:
     * {
     *   days: number[], // 0-6 (Sunday to Saturday)
     *   hours: number[], // 0-23
     *   months: number[], // 0-11 (January to December)
     *   daysOfMonth: number[] // 1-31
     * }
     */
    @Column({ type: 'json', nullable: true })
    schedule?: any

    /**
     * Reason for granting this time-based permission
     */
    @Column({ nullable: true })
    reason?: string

    /**
     * Whether the time-based permission is active
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