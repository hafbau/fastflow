import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import organizationsService from '../../services/organizations'
import organizationMembersService from '../../services/organization-members'
import { Organization } from '../../database/entities/Organization'
import { OrganizationMember } from '../../database/entities/OrganizationMember'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import logger from '../../utils/logger'
import organizationSettingsController from '../../controllers/organization-settings'

// Use the globally extended Request type that includes the UserProfile
import { UserProfile } from '../../database/entities/UserProfile'

interface AuthenticatedRequest extends Request {
    user?: UserProfile
}

/**
 * Get all organizations
 */
const getAllOrganizations = async (req: Request, res: Response) => {
    try {
        const organizations = await organizationsService.getAllOrganizations()
        return res.status(StatusCodes.OK).json(organizations)
    } catch (error) {
        logger.error(`[OrganizationsController] getAllOrganizations error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get organizations' })
    }
}

/**
 * Get organization by ID
 */
const getOrganizationById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const organization = await organizationsService.getOrganizationById(id)
        return res.status(StatusCodes.OK).json(organization)
    } catch (error) {
        logger.error(`[OrganizationsController] getOrganizationById error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get organization' })
    }
}

/**
 * Get organization by slug
 */
const getOrganizationBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params
        const organization = await organizationsService.getOrganizationBySlug(slug)
        return res.status(StatusCodes.OK).json(organization)
    } catch (error) {
        logger.error(`[OrganizationsController] getOrganizationBySlug error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get organization' })
    }
}

/**
 * Create a new organization
 */
const createOrganization = async (req: Request, res: Response) => {
    try {
        const organizationData: Partial<Organization> = req.body
        
        // Set creator information if user is authenticated
        const authReq = req as AuthenticatedRequest
        if (authReq.user && authReq.user.id) {
            organizationData.createdBy = authReq.user.id
        }
        
        const organization = await organizationsService.createOrganization(organizationData)
        
        // Add the creator as an admin member
        if (authReq.user && authReq.user.id) {
            await organizationMembersService.addOrganizationMember({
                organizationId: organization.id,
                userId: authReq.user.id,
                role: 'admin'
            })
        }
        
        return res.status(StatusCodes.CREATED).json(organization)
    } catch (error) {
        logger.error(`[OrganizationsController] createOrganization error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create organization' })
    }
}

/**
 * Update an organization
 */
const updateOrganization = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const updateData: Partial<Organization> = req.body
        
        // Prevent updating critical fields
        delete updateData.id
        delete updateData.createdAt
        
        const organization = await organizationsService.updateOrganization(id, updateData)
        return res.status(StatusCodes.OK).json(organization)
    } catch (error) {
        logger.error(`[OrganizationsController] updateOrganization error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update organization' })
    }
}

/**
 * Delete an organization
 */
const deleteOrganization = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        await organizationsService.deleteOrganization(id)
        return res.status(StatusCodes.NO_CONTENT).send()
    } catch (error) {
        logger.error(`[OrganizationsController] deleteOrganization error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete organization' })
    }
}

/**
 * Get organization members
 */
const getOrganizationMembers = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const members = await organizationMembersService.getOrganizationMembers(id)
        return res.status(StatusCodes.OK).json(members)
    } catch (error) {
        logger.error(`[OrganizationsController] getOrganizationMembers error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get organization members' })
    }
}

/**
 * Add a member to an organization
 */
const addOrganizationMember = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const memberData: Partial<OrganizationMember> = req.body
        
        // Ensure organizationId is set correctly
        memberData.organizationId = id
        
        const member = await organizationMembersService.addOrganizationMember(memberData)
        return res.status(StatusCodes.CREATED).json(member)
    } catch (error) {
        logger.error(`[OrganizationsController] addOrganizationMember error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to add organization member' })
    }
}

/**
 * Update an organization member
 */
const updateOrganizationMember = async (req: Request, res: Response) => {
    try {
        const { id, userId } = req.params
        const updateData: Partial<OrganizationMember> = req.body
        
        // Prevent updating critical fields
        delete updateData.id
        delete updateData.organizationId
        delete updateData.userId
        
        const member = await organizationMembersService.updateOrganizationMember(id, userId, updateData)
        return res.status(StatusCodes.OK).json(member)
    } catch (error) {
        logger.error(`[OrganizationsController] updateOrganizationMember error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update organization member' })
    }
}

/**
 * Remove a member from an organization
 */
const removeOrganizationMember = async (req: Request, res: Response) => {
    try {
        const { id, userId } = req.params
        await organizationMembersService.removeOrganizationMember(id, userId)
        return res.status(StatusCodes.NO_CONTENT).send()
    } catch (error) {
        logger.error(`[OrganizationsController] removeOrganizationMember error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to remove organization member' })
    }
}

/**
 * Update organization settings
 * 
 * This method is deprecated - use the organization-settings controller directly instead
 * This implementation now redirects to the proper service for compatibility
 */
const updateOrganizationSettings = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        
        // Redirect to the proper organization settings service
        return organizationSettingsController.updateOrganizationSettings(req, res)
    } catch (error) {
        logger.error(`[OrganizationsController] updateOrganizationSettings error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update organization settings' })
    }
}

export default {
    getAllOrganizations,
    getOrganizationById,
    getOrganizationBySlug,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizationMembers,
    addOrganizationMember,
    updateOrganizationMember,
    removeOrganizationMember,
    updateOrganizationSettings
}