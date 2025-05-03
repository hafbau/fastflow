import { 
    Entity, 
    Column, 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn
} from 'typeorm'
import { Organization } from './Organization'
import { IdentityProviderAttribute } from './IdentityProviderAttribute'
import { IdentityProviderSession } from './IdentityProviderSession'

/**
 * Identity provider types
 */
export enum IdentityProviderType {
    SAML = 'saml',
    OIDC = 'oidc'
}

/**
 * Identity provider status
 */
export enum IdentityProviderStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    TESTING = 'testing',
    ERROR = 'error'
}

/**
 * Identity provider entity
 */
@Entity('identity_providers')
export class IdentityProvider {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ length: 255 })
    name: string

    @Column({ length: 255, unique: true })
    slug: string

    @Column({
        type: 'enum',
        enum: IdentityProviderType,
        default: IdentityProviderType.SAML
    })
    type: IdentityProviderType

    @Column({
        type: 'enum',
        enum: IdentityProviderStatus,
        default: IdentityProviderStatus.INACTIVE
    })
    status: IdentityProviderStatus

    @Column('uuid')
    organizationId: string

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organizationId' })
    organization: Organization

    @Column('jsonb')
    config: any

    @Column('jsonb', { nullable: true })
    metadata: any

    @Column('boolean', { default: false })
    isDefault: boolean

    @Column('boolean', { default: true })
    justInTimeProvisioning: boolean

    @Column('boolean', { default: false })
    autoCreateOrganizations: boolean

    @Column('boolean', { default: false })
    autoCreateWorkspaces: boolean

    @Column({ length: 50, default: 'member' })
    defaultRole: string

    @Column('timestamp', { nullable: true })
    lastSyncAt: Date

    @Column('integer', { default: 0 })
    syncInterval: number

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @Column('uuid', { nullable: true })
    createdBy: string

    @Column('uuid', { nullable: true })
    updatedBy: string

    @OneToMany(() => IdentityProviderAttribute, attribute => attribute.identityProvider)
    attributes: IdentityProviderAttribute[]

    @OneToMany(() => IdentityProviderSession, session => session.identityProvider)
    sessions: IdentityProviderSession[]
}