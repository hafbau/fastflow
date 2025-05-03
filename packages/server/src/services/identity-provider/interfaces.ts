import { Request, Response } from 'express'
import { IdentityProvider } from '../../database/entities/IdentityProvider'
import { IdentityProviderAttribute } from '../../database/entities/IdentityProviderAttribute'
import { IdentityProviderSession } from '../../database/entities/IdentityProviderSession'

/**
 * User profile interface
 */
export interface UserProfile {
    email: string
    firstName?: string
    lastName?: string
    fullName?: string
    role?: string
    organization?: string
    workspace?: string
    metadata?: Record<string, any>
}

/**
 * Authentication result interface
 */
export interface AuthenticationResult {
    success: boolean
    user?: UserProfile
    session?: IdentityProviderSession
    redirectUrl?: string
    error?: string
}

/**
 * Provider configuration interface
 */
export interface ProviderConfig {
    identityProvider: IdentityProvider
    attributes: IdentityProviderAttribute[]
}

/**
 * Identity provider factory interface
 */
export interface IdentityProviderFactory {
    createProvider(type: string): IIdentityProvider
}

/**
 * Identity provider interface
 */
export interface IIdentityProvider {
    /**
     * Initialize the identity provider
     * @param providerConfig Provider configuration
     */
    initialize(providerConfig: ProviderConfig): Promise<boolean>
    
    /**
     * Generate service provider metadata
     */
    generateServiceProviderMetadata(): Promise<string>
    
    /**
     * Parse identity provider metadata
     * @param metadata Metadata XML or JSON
     */
    parseIdentityProviderMetadata(metadata: string): Promise<any>
    
    /**
     * Initiate authentication with the identity provider
     * @param req Express request
     * @param res Express response
     */
    initiateAuthentication(req: Request, res: Response): Promise<void>
    
    /**
     * Handle callback from the identity provider
     * @param req Express request
     * @param res Express response
     */
    handleCallback(req: Request, res: Response): Promise<AuthenticationResult>
    
    /**
     * Logout from the identity provider
     * @param req Express request
     * @param res Express response
     * @param session Identity provider session
     */
    logout(req: Request, res: Response, session: IdentityProviderSession): Promise<void>
    
    /**
     * Validate a session
     * @param session Identity provider session
     */
    validateSession?(session: IdentityProviderSession): Promise<boolean>
}