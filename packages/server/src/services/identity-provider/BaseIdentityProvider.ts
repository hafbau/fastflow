import { Request, Response } from 'express'
import { IdentityProviderType } from '../../database/entities/IdentityProvider'
import { IdentityProviderAttribute, AttributeMappingType } from '../../database/entities/IdentityProviderAttribute'
import { IdentityProviderSession } from '../../database/entities/IdentityProviderSession'
import { IIdentityProvider, UserProfile, AuthenticationResult, ProviderConfig } from './interfaces'
import logger from '../../utils/logger'

/**
 * Base class for identity providers
 */
export abstract class BaseIdentityProvider implements IIdentityProvider {
    abstract type: IdentityProviderType
    protected config!: ProviderConfig['identityProvider']
    protected attributes!: IdentityProviderAttribute[]
    
    /**
     * Initialize the identity provider
     * @param providerConfig Provider configuration
     */
    async initialize(providerConfig: ProviderConfig): Promise<boolean> {
        this.config = providerConfig.identityProvider
        this.attributes = providerConfig.attributes
        return true
    }
    
    /**
     * Generate service provider metadata
     */
    abstract generateServiceProviderMetadata(): Promise<string>
    
    /**
     * Parse identity provider metadata
     * @param metadata Metadata XML or JSON
     */
    abstract parseIdentityProviderMetadata(metadata: string): Promise<any>
    
    /**
     * Initiate authentication with the identity provider
     * @param req Express request
     * @param res Express response
     */
    abstract initiateAuthentication(req: Request, res: Response): Promise<void>
    
    /**
     * Handle callback from the identity provider
     * @param req Express request
     * @param res Express response
     */
    abstract handleCallback(req: Request, res: Response): Promise<AuthenticationResult>
    
    /**
     * Logout from the identity provider
     * @param req Express request
     * @param res Express response
     * @param session Identity provider session
     */
    abstract logout(req: Request, res: Response, session: IdentityProviderSession): Promise<void>
    
    /**
     * Validate a session
     * @param session Identity provider session
     */
    async validateSession(session: IdentityProviderSession): Promise<boolean> {
        // Check if session is active
        if (!session.active) {
            return false
        }
        
        // Check if session has expired
        if (session.expiresAt < new Date()) {
            return false
        }
        
        return true
    }
    
    /**
     * Map attributes from identity provider to user profile
     * @param attributes Attributes from identity provider
     * @param mappings Attribute mappings
     */
    protected mapAttributes(attributes: any, mappings: IdentityProviderAttribute[]): UserProfile {
        const profile: UserProfile = {
            email: '',
            firstName: '',
            lastName: '',
            fullName: '',
            metadata: {}
        }
        
        try {
            // Process each mapping
            for (const mapping of mappings) {
                if (!mapping.enabled) continue
                
                // Get attribute value
                const value = attributes[mapping.sourceAttribute]
                if (value === undefined && mapping.required) {
                    logger.warn(`Required attribute ${mapping.sourceAttribute} not found in response`)
                    continue
                }
                
                // Apply mapping based on type
                switch (mapping.mappingType) {
                    case AttributeMappingType.EMAIL:
                        profile.email = value
                        break
                    case AttributeMappingType.FIRST_NAME:
                        profile.firstName = value
                        break
                    case AttributeMappingType.LAST_NAME:
                        profile.lastName = value
                        break
                    case AttributeMappingType.FULL_NAME:
                        profile.fullName = value
                        break
                    case AttributeMappingType.ROLE:
                        profile.role = value
                        break
                    case AttributeMappingType.ORGANIZATION:
                        profile.organization = value
                        break
                    case AttributeMappingType.WORKSPACE:
                        profile.workspace = value
                        break
                    case AttributeMappingType.CUSTOM:
                        if (mapping.targetAttribute) {
                            // Ensure metadata is initialized
                            if (!profile.metadata) {
                                profile.metadata = {};
                            }
                            profile.metadata[mapping.targetAttribute] = value
                        }
                        break
                }
            }
            
            // If full name is not set but first and last name are, combine them
            if (!profile.fullName && (profile.firstName || profile.lastName)) {
                profile.fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
            }
            
            // If first and last name are not set but full name is, try to split it
            if (profile.fullName && (!profile.firstName && !profile.lastName)) {
                const nameParts = profile.fullName.split(' ')
                if (nameParts.length > 1) {
                    profile.firstName = nameParts[0]
                    profile.lastName = nameParts.slice(1).join(' ')
                } else {
                    profile.firstName = profile.fullName
                }
            }
        } catch (error) {
            logger.error(`Error mapping attributes: ${error}`)
        }
        
        return profile
    }
    
    /**
     * Create a success result
     * @param user User profile
     * @param session Identity provider session
     * @param redirectUrl Redirect URL
     */
    protected createSuccessResult(
        user: UserProfile, 
        session: IdentityProviderSession, 
        redirectUrl: string
    ): AuthenticationResult {
        return {
            success: true,
            user,
            session,
            redirectUrl
        }
    }
    
    /**
     * Create an error result
     * @param error Error message
     */
    protected createErrorResult(error: string): AuthenticationResult {
        return {
            success: false,
            error
        }
    }
}