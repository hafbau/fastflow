import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import organizationMembersService from '../../services/organization-members'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'

/**
 * Get all members of an organization
 */
const getOrganizationMembers = async (req: Request, res: Response) => {
    try {
        const organizationId = req.params.id
        const members = await organizationMembersService.getOrganizationMembers(organizationId)
        return res.json(members)
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

/**
 * Get a specific organization member
 */
const getOrganizationMember = async (req: Request, res: Response) => {
    try {
        const organizationId = req.params.id
        const userId = req.params.userId
        const member = await organizationMembersService.getOrganizationMember(organizationId, userId)
        return res.json(member)
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

/**
 * Add a member to an organization
 */
const addOrganizationMember = async (req: Request, res: Response) => {
    try {
        const organizationId = req.params.id
        const memberData = req.body
        
        // Ensure organizationId is set
        memberData.organizationId = organizationId
        
        const member = await organizationMembersService.addOrganizationMember(memberData)
        return res.status(StatusCodes.CREATED).json(member)
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

/**
 * Update a member's role in an organization
 */
const updateOrganizationMember = async (req: Request, res: Response) => {
    try {
        const organizationId = req.params.id
        const userId = req.params.userId
        const updateData = req.body
        
        const member = await organizationMembersService.updateOrganizationMember(organizationId, userId, updateData)
        return res.json(member)
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

/**
 * Remove a member from an organization
 */
const removeOrganizationMember = async (req: Request, res: Response) => {
    try {
        const organizationId = req.params.id
        const userId = req.params.userId
        
        await organizationMembersService.removeOrganizationMember(organizationId, userId)
        return res.status(StatusCodes.NO_CONTENT).send()
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

export default {
    getOrganizationMembers,
    getOrganizationMember,
    addOrganizationMember,
    updateOrganizationMember,
    removeOrganizationMember
}