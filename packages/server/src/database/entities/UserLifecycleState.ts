import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { UserProfile } from './UserProfile'

/**
 * User lifecycle state enum
 */
export enum UserLifecycleStateType {
    INVITED = 'INVITED',
    REGISTERED = 'REGISTERED',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
    DELETED = 'DELETED'
}

/**
 * User lifecycle state entity
 * Tracks the state changes of a user throughout their lifecycle
 */
@Entity('user_lifecycle_state')
export class UserLifecycleState {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ name: 'user_id' })
    userId: string

    @ManyToOne(() => UserProfile)
    @JoinColumn({ name: 'user_id' })
    user: UserProfile

    @Column({
        type: 'enum',
        enum: UserLifecycleStateType,
        default: UserLifecycleStateType.INVITED
    })
    state: UserLifecycleStateType

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>

    @Column({ name: 'changed_by', nullable: true })
    changedBy: string

    @ManyToOne(() => UserProfile, { nullable: true })
    @JoinColumn({ name: 'changed_by' })
    changedByUser: UserProfile

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date
}