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
 * Identity provider attribute mapping type
 */
export enum AttributeMappingType {
    EMAIL = 'email',
    FULL_NAME = 'full_name',
    FIRST_NAME = 'first_name',
    LAST_NAME = 'last_name',
    ROLE = 'role',
    ORGANIZATION = 'organization',
    WORKSPACE = 'workspace',
    CUSTOM = 'custom'
}

/**
 * Identity provider attribute entity
 * Maps attributes from identity provider to user profile
 */
@Entity('identity_provider_attributes')
export class IdentityProviderAttribute {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column('uuid')
    identityProviderId: string

    @ManyToOne(() => IdentityProvider, provider => provider.attributes)
    @JoinColumn({ name: 'identityProviderId' })
    identityProvider: IdentityProvider

    @Column({ length: 255 })
    sourceAttribute: string

    @Column({
        type: 'varchar',
        enum: AttributeMappingType,
        default: AttributeMappingType.CUSTOM
    })
    mappingType: AttributeMappingType

    @Column({ length: 255, nullable: true })
    targetAttribute: string

    @Column('boolean', { default: false })
    required: boolean

    @Column('boolean', { default: true })
    enabled: boolean

    @Column('jsonb', { nullable: true })
    transformationRules: any

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}