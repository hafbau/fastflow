import { StatusCodes } from 'http-status-codes'
import { Organization } from '../../database/entities/Organization'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'

/**
 * Get all organizations
 */
const getAllOrganizations = async (): Promise<Organization[]> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(Organization).find({
            order: {
                name: 'ASC'
            }
        })
        return dbResponse
    } catch (error) {
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationsService.getAllOrganizations - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get organization by ID
 */
const getOrganizationById = async (organizationId: string): Promise<Organization> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(Organization).findOneBy({
            id: organizationId
        })
        if (!dbResponse) {
            throw new InternalFastflowError(StatusCodes.NOT_FOUND, `Organization ${organizationId} not found`)
        }
        return dbResponse
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationsService.getOrganizationById - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get organization by slug
 */
const getOrganizationBySlug = async (slug: string): Promise<Organization> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(Organization).findOneBy({
            slug: slug
        })
        if (!dbResponse) {
            throw new InternalFastflowError(StatusCodes.NOT_FOUND, `Organization with slug ${slug} not found`)
        }
        return dbResponse
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationsService.getOrganizationBySlug - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Create a new organization
 */
const createOrganization = async (organization: Partial<Organization>): Promise<Organization> => {
    try {
        const appServer = getRunningExpressApp()
        const newOrganization = appServer.AppDataSource.getRepository(Organization).create(organization)
        const dbResponse = await appServer.AppDataSource.getRepository(Organization).save(newOrganization)
        return dbResponse
    } catch (error) {
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationsService.createOrganization - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Update an organization
 */
const updateOrganization = async (organizationId: string, updateData: Partial<Organization>): Promise<Organization> => {
    try {
        const appServer = getRunningExpressApp()
        const organization = await getOrganizationById(organizationId)
        const updatedOrganization = appServer.AppDataSource.getRepository(Organization).merge(organization, updateData)
        const dbResponse = await appServer.AppDataSource.getRepository(Organization).save(updatedOrganization)
        return dbResponse
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationsService.updateOrganization - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Delete an organization
 */
const deleteOrganization = async (organizationId: string): Promise<void> => {
    try {
        const appServer = getRunningExpressApp()
        await getOrganizationById(organizationId) // Check if organization exists
        await appServer.AppDataSource.getRepository(Organization).delete({ id: organizationId })
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationsService.deleteOrganization - ${getErrorMessage(error)}`
        )
    }
}

export default {
    getAllOrganizations,
    getOrganizationById,
    getOrganizationBySlug,
    createOrganization,
    updateOrganization,
    deleteOrganization
}