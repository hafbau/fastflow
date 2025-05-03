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
 * Identity provider interface
 */
export interface IdentityProvider {
    id: string
    name: string
    slug: string
    type: IdentityProviderType
    status: IdentityProviderStatus
    organizationId: string
    config: any
    metadata: any
    isDefault: boolean
    justInTimeProvisioning: boolean
    autoCreateOrganizations: boolean
    autoCreateWorkspaces: boolean
    defaultRole: string
    lastSyncAt?: Date
    syncInterval: number
    createdAt: Date
    updatedAt: Date
    createdBy?: string
    updatedBy?: string
}

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
 * Identity provider attribute mapping interface
 */
export interface IdentityProviderAttribute {
    id: string
    identityProviderId: string
    sourceAttribute: string
    mappingType: AttributeMappingType
    targetAttribute?: string
    required: boolean
    enabled: boolean
    transformationRules?: any
    createdAt: Date
    updatedAt: Date
}