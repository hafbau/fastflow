import { 
    Entity, 
    Column, 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm'
import { IdentityProvider } from './IdentityProvider'

/**
 * Identity provider session entity
 * Stores session information for identity provider authentication
 */
@Entity('identity_provider_sessions')
export class IdentityProviderSession {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column('uuid')
    identityProviderId: string

    @ManyToOne(() => IdentityProvider, provider => provider.sessions)
    @JoinColumn({ name: 'identityProviderId' })
    identityProvider: IdentityProvider

    @Column('uuid')
    userId: string

    @Column({ length: 255 })
    externalId: string

    @Column('jsonb')
    sessionData: any

    @Column('jsonb', { default: {} })
    metadata: any

    @Column('timestamp')
    expiresAt: Date

    @Column('boolean', { default: true })
    active: boolean

    @Column({ length: 45, nullable: true })
    ipAddress: string

    @Column({ length: 255, nullable: true })
    userAgent: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}