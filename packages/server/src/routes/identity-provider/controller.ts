import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { getRepository } from 'typeorm'
import { IdentityProvider, IdentityProviderStatus } from '../../database/entities/IdentityProvider'
import { IdentityProviderAttribute } from '../../database/entities/IdentityProviderAttribute'
import identityProviderService from '../../services/identity-provider'
import logger from '../../utils/logger'
import { InternalFastflowError } from '../../errors/InternalFastflowError'

/**
 * Controller for identity provider routes
 */
const identityProviderController = {
    /**
     * Initiate authentication with an identity provider
     */
    initiateAuthentication: async (req: Request, res: Response) => {
        try {
            const { providerId } = req.params
            await identityProviderService.initiateAuthentication(providerId, req, res)
        } catch (error) {
            logger.error(`Authentication initiation error: ${error}`)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                error: 'Failed to initiate authentication' 
            })
        }
    },
    
    /**
     * Handle callback from an identity provider
     */
    handleCallback: async (req: Request, res: Response) => {
        try {
            const { providerId } = req.params
            await identityProviderService.handleCallback(providerId, req, res)
        } catch (error) {
            logger.error(`Authentication callback error: ${error}`)
            res.redirect('/auth/error?error=Authentication%20failed')
        }
    },
    
    /**
     * Get service provider metadata
     */
    getServiceProviderMetadata: async (req: Request, res: Response) => {
        try {
            const { providerId } = req.params
            const metadata = await identityProviderService.generateServiceProviderMetadata(providerId)
            
            res.header('Content-Type', 'application/xml')
            res.send(metadata)
        } catch (error) {
            logger.error(`Error generating metadata: ${error}`)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                error: 'Failed to generate metadata' 
            })
        }
    },
    
    /**
     * Logout from an identity provider
     */
    logout: async (req: Request, res: Response) => {
        try {
            const { providerId, sessionId } = req.params
            await identityProviderService.logout(providerId, sessionId, req, res)
        } catch (error) {
            logger.error(`Logout error: ${error}`)
            res.redirect('/')
        }
    },
    
    /**
     * Handle logout callback from an identity provider
     */
    handleLogoutCallback: async (req: Request, res: Response) => {
        // Simply redirect to home page after logout
        res.redirect('/')
    },
    
    /**
     * Get all identity providers for an organization
     */
    getProvidersForOrganization: async (req: Request, res: Response) => {
        try {
            const { organizationId } = req.params
            const providers = await identityProviderService.getProvidersForOrganization(organizationId)
            
            res.json(providers)
        } catch (error) {
            logger.error(`Error getting providers: ${error}`)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                error: 'Failed to get identity providers' 
            })
        }
    },
    
    /**
     * Get an identity provider by ID
     */
    getProviderById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const provider = await identityProviderService.getProviderById(id)
            
            if (!provider) {
                res.status(StatusCodes.NOT_FOUND).json({ error: 'Identity provider not found' })
                return
            }
            
            res.json(provider)
        } catch (error) {
            logger.error(`Error getting provider: ${error}`)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                error: 'Failed to get identity provider' 
            })
        }
    },
    
    /**
     * Create a new identity provider
     */
    createProvider: async (req: Request, res: Response) => {
        try {
            const data = req.body
            const userId = (req as any).user.id
            
            // Validate required fields
            if (!data.name || !data.type || !data.organizationId) {
                res.status(StatusCodes.BAD_REQUEST).json({ 
                    error: 'Missing required fields: name, type, organizationId' 
                })
                return
            }
            
            // Create provider
            const provider = await identityProviderService.createProvider(data, userId)
            
            res.status(StatusCodes.CREATED).json(provider)
        } catch (error) {
            logger.error(`Error creating provider: ${error}`)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                error: 'Failed to create identity provider' 
            })
        }
    },
    
    /**
     * Update an identity provider
     */
    updateProvider: async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const data = req.body
            const userId = (req as any).user.id
            
            // Update provider
            const provider = await identityProviderService.updateProvider(id, data, userId)
            
            res.json(provider)
        } catch (error) {
            logger.error(`Error updating provider: ${error}`)
            
            if (error instanceof InternalFastflowError) {
                res.status(error.statusCode).json({ error: error.message })
            } else {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                    error: 'Failed to update identity provider' 
                })
            }
        }
    },
    
    /**
     * Delete an identity provider
     */
    deleteProvider: async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const userId = (req as any).user.id
            
            // Delete provider
            await identityProviderService.deleteProvider(id, userId)
            
            res.status(StatusCodes.NO_CONTENT).send()
        } catch (error) {
            logger.error(`Error deleting provider: ${error}`)
            
            if (error instanceof InternalFastflowError) {
                res.status(error.statusCode).json({ error: error.message })
            } else {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                    error: 'Failed to delete identity provider' 
                })
            }
        }
    },
    
    /**
     * Test an identity provider configuration
     */
    testProvider: async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const config = req.body
            
            // Get provider
            const provider = await identityProviderService.getProviderById(id)
            if (!provider) {
                res.status(StatusCodes.NOT_FOUND).json({ error: 'Identity provider not found' })
                return
            }
            
            // Merge config with provider
            const testConfig = {
                identityProvider: {
                    ...provider,
                    ...config.identityProvider
                },
                attributes: config.attributes || []
            }
            
            // Test provider
            const success = await identityProviderService.testProvider(testConfig)
            
            res.json({ success })
        } catch (error) {
            logger.error(`Error testing provider: ${error}`)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                error: 'Failed to test identity provider' 
            })
        }
    },
    
    /**
     * Parse identity provider metadata
     */
    parseIdentityProviderMetadata: async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const { metadata } = req.body
            
            if (!metadata) {
                res.status(StatusCodes.BAD_REQUEST).json({ error: 'Metadata is required' })
                return
            }
            
            // Parse metadata
            const parsedMetadata = await identityProviderService.parseIdentityProviderMetadata(id, metadata)
            
            res.json(parsedMetadata)
        } catch (error) {
            logger.error(`Error parsing metadata: ${error}`)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                error: 'Failed to parse identity provider metadata' 
            })
        }
    },
    
    /**
     * Synchronize users from an identity provider
     */
    synchronizeUsers: async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            
            // Synchronize users
            const count = await identityProviderService.synchronizeUsers(id)
            
            res.json({ count })
        } catch (error) {
            logger.error(`Error synchronizing users: ${error}`)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                error: 'Failed to synchronize users' 
            })
        }
    },
    
    /**
     * Get attribute mappings for an identity provider
     */
    getAttributeMappings: async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const attributeRepo = getRepository(IdentityProviderAttribute)
            
            const attributes = await attributeRepo.find({
                where: { identityProviderId: id },
                order: { createdAt: 'ASC' }
            })
            
            res.json(attributes)
        } catch (error) {
            logger.error(`Error getting attribute mappings: ${error}`)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                error: 'Failed to get attribute mappings' 
            })
        }
    },
    
    /**
     * Create an attribute mapping for an identity provider
     */
    createAttributeMapping: async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const data = req.body
            
            // Validate required fields
            if (!data.sourceAttribute || !data.mappingType) {
                res.status(StatusCodes.BAD_REQUEST).json({ 
                    error: 'Missing required fields: sourceAttribute, mappingType' 
                })
                return
            }
            
            const attributeRepo = getRepository(IdentityProviderAttribute)
            
            // Create attribute mapping
            const attribute = attributeRepo.create({
                ...data,
                identityProviderId: id
            })
            
            await attributeRepo.save(attribute)
            
            res.status(StatusCodes.CREATED).json(attribute)
        } catch (error) {
            logger.error(`Error creating attribute mapping: ${error}`)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                error: 'Failed to create attribute mapping' 
            })
        }
    },
    
    /**
     * Update an attribute mapping for an identity provider
     */
    updateAttributeMapping: async (req: Request, res: Response) => {
        try {
            const { id, attributeId } = req.params
            const data = req.body
            
            const attributeRepo = getRepository(IdentityProviderAttribute)
            
            // Get attribute mapping
            const attribute = await attributeRepo.findOne({ 
                where: { 
                    id: attributeId, 
                    identityProviderId: id 
                } 
            })
            
            if (!attribute) {
                res.status(StatusCodes.NOT_FOUND).json({ error: 'Attribute mapping not found' })
                return
            }
            
            // Update attribute mapping
            Object.assign(attribute, data)
            await attributeRepo.save(attribute)
            
            res.json(attribute)
        } catch (error) {
            logger.error(`Error updating attribute mapping: ${error}`)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                error: 'Failed to update attribute mapping' 
            })
        }
    },
    
    /**
     * Delete an attribute mapping for an identity provider
     */
    deleteAttributeMapping: async (req: Request, res: Response) => {
        try {
            const { id, attributeId } = req.params
            
            const attributeRepo = getRepository(IdentityProviderAttribute)
            
            // Get attribute mapping
            const attribute = await attributeRepo.findOne({ 
                where: { 
                    id: attributeId, 
                    identityProviderId: id 
                } 
            })
            
            if (!attribute) {
                res.status(StatusCodes.NOT_FOUND).json({ error: 'Attribute mapping not found' })
                return
            }
            
            // Delete attribute mapping
            await attributeRepo.remove(attribute)
            
            res.status(StatusCodes.NO_CONTENT).send()
        } catch (error) {
            logger.error(`Error deleting attribute mapping: ${error}`)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                error: 'Failed to delete attribute mapping' 
            })
        }
    }
}

export default identityProviderController