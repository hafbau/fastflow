import { StatusCodes } from 'http-status-codes'
import { OrganizationMember } from '../../database/entities/OrganizationMember'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import organizationsService from '../organizations'

/**
 * Get all members of an organization
 */
const getOrganizationMembers = async (organizationId: string): Promise<OrganizationMember[]> => {
    try {
        // Verify organization exists
        await organizationsService.getOrganizationById(organizationId)
        
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(OrganizationMember).find({
            where: {
                organizationId: organizationId
            },
            relations: ['organization']
        })
        return dbResponse
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationMembersService.getOrganizationMembers - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get organizations for a user
 */
const getUserOrganizations = async (userId: string): Promise<OrganizationMember[]> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(OrganizationMember).find({
            where: {
                userId: userId
            },
            relations: ['organization']
        })
        return dbResponse
    } catch (error) {
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationMembersService.getUserOrganizations - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get a specific organization member
 */
const getOrganizationMember = async (organizationId: string, userId: string): Promise<OrganizationMember> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(OrganizationMember).findOne({
            where: {
                organizationId: organizationId,
                userId: userId
            },
            relations: ['organization']
        })
        if (!dbResponse) {
            throw new InternalFastflowError(StatusCodes.NOT_FOUND, `User ${userId} is not a member of organization ${organizationId}`)
        }
        return dbResponse
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationMembersService.getOrganizationMember - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get organization member by email
 */
const getOrganizationMemberByEmail = async (organizationId: string, email: string): Promise<OrganizationMember> => {
    try {
        const appServer = getRunningExpressApp()
        
        // First, find the user with the given email
        const userRepository = appServer.AppDataSource.getRepository('user')
        const user = await userRepository.findOne({ where: { email } })
        
        if (!user) {
            throw new InternalFastflowError(StatusCodes.NOT_FOUND, `User with email ${email} not found`)
        }
        
        // Then find the organization member
        return getOrganizationMember(organizationId, user.id)
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationMembersService.getOrganizationMemberByEmail - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Add a member to an organization
 */
const addOrganizationMember = async (member: Partial<OrganizationMember>): Promise<OrganizationMember> => {
    try {
        const appServer = getRunningExpressApp()
        
        // Verify organization exists
        if (member.organizationId) {
            await organizationsService.getOrganizationById(member.organizationId)
        }
        
        // Check if member already exists
        try {
            const existingMember = await getOrganizationMember(member.organizationId!, member.userId!)
            if (existingMember) {
                throw new InternalFastflowError(
                    StatusCodes.CONFLICT,
                    `User ${member.userId} is already a member of organization ${member.organizationId}`
                )
            }
        } catch (error) {
            // If error is NOT_FOUND, that's good - we can proceed
            if (!(error instanceof InternalFastflowError && error.statusCode === StatusCodes.NOT_FOUND)) {
                throw error
            }
        }
        
        const newMember = appServer.AppDataSource.getRepository(OrganizationMember).create(member)
        const dbResponse = await appServer.AppDataSource.getRepository(OrganizationMember).save(newMember)
        
        // Fetch the complete member with relations
        return getOrganizationMember(dbResponse.organizationId, dbResponse.userId)
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationMembersService.addOrganizationMember - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Update a member's role in an organization
 */
const updateOrganizationMember = async (
    organizationId: string,
    userId: string,
    updateData: Partial<OrganizationMember>
): Promise<OrganizationMember> => {
    try {
        const appServer = getRunningExpressApp()
        const member = await getOrganizationMember(organizationId, userId)
        
        // Only allow updating role
        if (updateData.role) {
            member.role = updateData.role
        }
        
        await appServer.AppDataSource.getRepository(OrganizationMember).save(member)
        
        // Fetch the updated member with relations
        return getOrganizationMember(organizationId, userId)
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationMembersService.updateOrganizationMember - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Remove a member from an organization
 */
const removeOrganizationMember = async (organizationId: string, userId: string): Promise<void> => {
    try {
        const appServer = getRunningExpressApp()
        await getOrganizationMember(organizationId, userId) // Check if member exists
        await appServer.AppDataSource.getRepository(OrganizationMember).delete({
            organizationId: organizationId,
            userId: userId
        })
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationMembersService.removeOrganizationMember - ${getErrorMessage(error)}`
        )
    }
}

export default {
    getOrganizationMembers,
    getUserOrganizations,
    getOrganizationMember,
    getOrganizationMemberByEmail,
    addOrganizationMember,
    updateOrganizationMember,
    removeOrganizationMember
}