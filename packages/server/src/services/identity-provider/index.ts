import { Request, Response } from 'express'
import { Repository, getRepository } from 'typeorm'
import { 
    IdentityProvider, 
    IdentityProviderType, 
    IdentityProviderStatus 
} from '../../database/entities/IdentityProvider'
import { IdentityProviderAttribute } from '../../database/entities/IdentityProviderAttribute'
import { IdentityProviderSession } from '../../database/entities/IdentityProviderSession'
import { identityProviderFactory } from './IdentityProviderFactory'
import { IIdentityProvider, UserProfile, AuthenticationResult, ProviderConfig } from './interfaces'
import logger from '../../utils/logger'
import { supabaseAdmin } from '../../utils/supabase'
import auditLogsService from '../audit-logs'
import { v4 as uuidv4 } from 'uuid'

/**
 * Service for managing identity providers and handling authentication
 */
class IdentityProviderService {
    private identityProviderRepo: Repository<IdentityProvider>
    private attributeRepo: Repository<IdentityProviderAttribute>
    private sessionRepo: Repository<IdentityProviderSession>
    private providers: Map<string, IIdentityProvider> = new Map()
    
    /**
     * Initialize the service
     */
    async initialize() {
        this.identityProviderRepo = getRepository(IdentityProvider)
        this.attributeRepo = getRepository(IdentityProviderAttribute)
        this.sessionRepo = getRepository(IdentityProviderSession)
        
        // Load all active providers
        await this.loadActiveProviders()
    }
    
    /**
     * Load all active identity providers
     */
    async loadActiveProviders() {
        try {
            const providers = await this.identityProviderRepo.find({
                where: { status: IdentityProviderStatus.ACTIVE },
                relations: ['attributes']
            })
            
            logger.info(`Loading ${providers.length} active identity providers`)
            
            for (const provider of providers) {
                await this.initializeProvider(provider)
            }
        } catch (error) {
            logger.error(`Failed to load active providers: ${error}`)
        }
    }
    
    /**
     * Initialize a provider instance
     * @param provider Identity provider configuration
     */
    async initializeProvider(provider: IdentityProvider) {
        try {
            // Get attributes for this provider
            const attributes = await this.attributeRepo.find({
                where: { identityProviderId: provider.id }
            })
            
            // Create provider instance
            const providerInstance = identityProviderFactory.createProvider(provider.type)
            
            // Initialize provider
            const success = await providerInstance.initialize({
                identityProvider: provider,
                attributes
            })
            
            if (success) {
                this.providers.set(provider.id, providerInstance)
                logger.info(`Successfully initialized provider: ${provider.name} (${provider.id})`)
            } else {
                logger.error(`Failed to initialize provider: ${provider.name} (${provider.id})`)
            }
        } catch (error) {
            logger.error(`Error initializing provider ${provider.id}: ${error}`)
        }
    }
    
    /**
     * Get a provider instance by ID
     * @param providerId Identity provider ID
     */
    getProvider(providerId: string): IIdentityProvider | undefined {
        return this.providers.get(providerId)
    }
    
    /**
     * Create a new identity provider
     * @param data Provider data
     * @param userId User ID creating the provider
     */
    async createProvider(data: Partial<IdentityProvider>, userId: string): Promise<IdentityProvider> {
        const provider = this.identityProviderRepo.create({
            ...data,
            createdBy: userId,
            updatedBy: userId
        })
        
        await this.identityProviderRepo.save(provider)
        
        // Log provider creation
        await auditLogsService.logUserAction(
            userId,
            'identity_provider_create',
            'identity_provider',
            provider.id,
            { providerId: provider.id, name: provider.name, type: provider.type },
            undefined
        )
        
        return provider
    }
    
    /**
     * Update an identity provider
     * @param id Provider ID
     * @param data Updated provider data
     * @param userId User ID updating the provider
     */
    async updateProvider(id: string, data: Partial<IdentityProvider>, userId: string): Promise<IdentityProvider> {
        const provider = await this.identityProviderRepo.findOne({ where: { id } })
        if (!provider) {
            throw new Error(`Identity provider not found: ${id}`)
        }
        
        // Update provider
        Object.assign(provider, {
            ...data,
            updatedBy: userId,
            updatedAt: new Date()
        })
        
        await this.identityProviderRepo.save(provider)
        
        // Log provider update
        await auditLogsService.logUserAction(
            userId,
            'identity_provider_update',
            'identity_provider',
            provider.id,
            { providerId: provider.id, name: provider.name, type: provider.type },
            undefined
        )
        
        // If provider is active, reinitialize it
        if (provider.status === IdentityProviderStatus.ACTIVE) {
            await this.initializeProvider(provider)
        } else {
            // If provider is inactive, remove it from the map
            this.providers.delete(provider.id)
        }
        
        return provider
    }
    
    /**
     * Delete an identity provider
     * @param id Provider ID
     * @param userId User ID deleting the provider
     */
    async deleteProvider(id: string, userId: string): Promise<boolean> {
        const provider = await this.identityProviderRepo.findOne({ where: { id } })
        if (!provider) {
            throw new Error(`Identity provider not found: ${id}`)
        }
        
        // Log provider deletion
        await auditLogsService.logUserAction(
            userId,
            'identity_provider_delete',
            'identity_provider',
            provider.id,
            { providerId: provider.id, name: provider.name, type: provider.type },
            undefined
        )
        
        // Remove provider from map
        this.providers.delete(provider.id)
        
        // Delete provider
        await this.identityProviderRepo.remove(provider)
        
        return true
    }
    
    /**
     * Get all identity providers for an organization
     * @param organizationId Organization ID
     */
    async getProvidersForOrganization(organizationId: string): Promise<IdentityProvider[]> {
        return this.identityProviderRepo.find({
            where: { organizationId },
            order: { name: 'ASC' }
        })
    }
    
    /**
     * Get an identity provider by ID
     * @param id Provider ID
     */
    async getProviderById(id: string): Promise<IdentityProvider | undefined> {
        const provider = await this.identityProviderRepo.findOne({
            where: { id },
            relations: ['attributes']
        });
        return provider || undefined;
    }
    
    /**
     * Initiate authentication with an identity provider
     * @param providerId Provider ID
     * @param req Express request
     * @param res Express response
     */
    async initiateAuthentication(providerId: string, req: Request, res: Response): Promise<void> {
        const provider = this.getProvider(providerId)
        if (!provider) {
            res.status(404).json({ error: 'Identity provider not found or not active' })
            return
        }
        
        try {
            await provider.initiateAuthentication(req, res)
        } catch (error) {
            logger.error(`Authentication initiation error: ${error}`)
            res.status(500).json({ error: 'Failed to initiate authentication' })
        }
    }
    
    /**
     * Handle authentication callback from an identity provider
     * @param providerId Provider ID
     * @param req Express request
     * @param res Express response
     */
    async handleCallback(providerId: string, req: Request, res: Response): Promise<void> {
        const provider = this.getProvider(providerId)
        if (!provider) {
            res.status(404).json({ error: 'Identity provider not found or not active' })
            return
        }
        
        try {
            // Process the callback
            const result = await provider.handleCallback(req, res)
            
            if (!result.success) {
                logger.error(`Authentication failed: ${result.error}`)
                res.redirect(`/auth/error?error=${encodeURIComponent(result.error || 'Authentication failed')}`)
                return
            }
            
            // Get the provider configuration
            const providerConfig = await this.getProviderById(providerId)
            if (!providerConfig) {
                res.redirect('/auth/error?error=Provider%20configuration%20not%20found')
                return
            }
            
            // Save the session
            const session = await this.saveSession(result.session as IdentityProviderSession)
            
            // Provision or update the user
            const user = await this.provisionUser(result.user!, providerConfig, session)
            
            if (!user) {
                res.redirect('/auth/error?error=Failed%20to%20provision%20user')
                return
            }
            
            // Create a Supabase session
            const { data, error } = await supabaseAdmin!.auth.admin.generateLink({
                type: 'magiclink',
                email: user.email,
                options: {
                    redirectTo: result.redirectUrl || '/'
                }
            })
            
            if (error) {
                logger.error(`Failed to generate Supabase session: ${error.message}`)
                res.redirect('/auth/error?error=Failed%20to%20create%20session')
                return
            }
            
            // Redirect to the sign-in URL
            res.redirect(data.properties.action_link)
        } catch (error) {
            logger.error(`Authentication callback error: ${error}`)
            res.redirect('/auth/error?error=Authentication%20failed')
        }
    }
    
    /**
     * Save an identity provider session
     * @param session Session data
     */
    async saveSession(session: IdentityProviderSession): Promise<IdentityProviderSession> {
        return this.sessionRepo.save(session)
    }
    
    /**
     * Provision or update a user based on identity provider data
     * @param profile User profile from identity provider
     * @param provider Identity provider configuration
     * @param session Identity provider session
     */
    async provisionUser(
        profile: UserProfile, 
        provider: IdentityProvider,
        session: IdentityProviderSession
    ): Promise<{ id: string, email: string } | null> {
        try {
            // Check if user exists
            // Use the appropriate parameters based on Supabase version
            // Use the correct method to find a user by email
            const { data: existingUser, error: findError } = await supabaseAdmin!.auth.admin.listUsers()
            
            // Filter the users by email manually
            const matchingUser = existingUser?.users?.find(user => user.email === profile.email)
            
            if (findError) {
                logger.error(`Error finding user: ${findError.message}`)
                return null
            }
            
            let userId: string
            
            // If user exists, update their metadata
            if (matchingUser) {
                const user = matchingUser
                userId = user.id
                
                // Update user metadata
                const { data: updateData, error: updateError } = await supabaseAdmin!.auth.admin.updateUserById(
                    user.id,
                    {
                        user_metadata: {
                            ...user.user_metadata,
                            full_name: profile.fullName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
                            idp: provider.id,
                            idp_type: provider.type,
                            external_id: session.externalId,
                            ...profile.metadata
                        }
                    }
                )
                
                if (updateError) {
                    logger.error(`Error updating user: ${updateError.message}`)
                    return null
                }
                
                // Update session with user ID
                session.userId = user.id
                await this.sessionRepo.save(session)
                
                return { id: user.id, email: user.email! }
            } 
            // If user doesn't exist and JIT provisioning is enabled, create the user
            else if (provider.justInTimeProvisioning) {
                // Generate a random password
                const password = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10)
                
                // Create user
                const { data: createData, error: createError } = await supabaseAdmin!.auth.admin.createUser({
                    email: profile.email,
                    password,
                    email_confirm: true,
                    user_metadata: {
                        full_name: profile.fullName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
                        idp: provider.id,
                        idp_type: provider.type,
                        external_id: session.externalId,
                        ...profile.metadata
                    }
                })
                
                if (createError) {
                    logger.error(`Error creating user: ${createError.message}`)
                    return null
                }
                
                userId = createData.user.id
                
                // Update session with user ID
                session.userId = createData.user.id
                await this.sessionRepo.save(session)
                
                // Log user provisioning
                await auditLogsService.logUserAction(
                    createData.user.id,
                    'user_provision',
                    'user',
                    createData.user.id,
                    { 
                        email: profile.email, 
                        providerId: provider.id,
                        providerType: provider.type
                    },
                    undefined
                )
                
                return { id: createData.user.id, email: createData.user.email! }
            } else {
                logger.error(`User not found and JIT provisioning is disabled: ${profile.email}`)
                return null
            }
        } catch (error) {
            logger.error(`Error provisioning user: ${error}`)
            return null
        }
    }
    
    /**
     * Logout a user from an identity provider
     * @param providerId Provider ID
     * @param sessionId Session ID
     * @param req Express request
     * @param res Express response
     */
    async logout(providerId: string, sessionId: string, req: Request, res: Response): Promise<void> {
        const provider = this.getProvider(providerId)
        if (!provider) {
            res.redirect('/')
            return
        }
        
        try {
            // Get the session
            const session = await this.sessionRepo.findOne({ where: { id: sessionId } })
            if (!session) {
                res.redirect('/')
                return
            }
            
            // Mark session as inactive
            session.active = false
            await this.sessionRepo.save(session)
            
            // Logout from identity provider
            await provider.logout(req, res, session)
        } catch (error) {
            logger.error(`Logout error: ${error}`)
            res.redirect('/')
        }
    }
    
    /**
     * Generate service provider metadata
     * @param providerId Provider ID
     */
    async generateServiceProviderMetadata(providerId: string): Promise<string> {
        const provider = this.getProvider(providerId)
        if (!provider) {
            throw new Error('Identity provider not found or not active')
        }
        
        return provider.generateServiceProviderMetadata()
    }
    
    /**
     * Parse identity provider metadata
     * @param providerId Provider ID
     * @param metadata Metadata XML or JSON
     */
    async parseIdentityProviderMetadata(providerId: string, metadata: string): Promise<any> {
        const provider = this.getProvider(providerId)
        if (!provider) {
            throw new Error('Identity provider not found or not active')
        }
        
        return provider.parseIdentityProviderMetadata(metadata)
    }
    
    /**
     * Test an identity provider configuration
     * @param config Provider configuration
     */
    async testProvider(config: ProviderConfig): Promise<boolean> {
        try {
            const providerInstance = identityProviderFactory.createProvider(config.identityProvider.type)
            return await providerInstance.initialize(config)
        } catch (error) {
            logger.error(`Provider test failed: ${error}`)
            return false
        }
    }
    
    /**
     * Synchronize user attributes from an identity provider
     * @param providerId Provider ID
     */
    async synchronizeUsers(providerId: string): Promise<number> {
        // This would implement synchronization with external directory
        // For now, just return 0 (no users synchronized)
        return 0
    }
}

// Create singleton instance
const identityProviderService = new IdentityProviderService()

export default identityProviderService