import { StatusCodes } from 'http-status-codes'
import { Like, In } from 'typeorm'
import { Organization } from '../../database/entities/Organization'
import { Workspace } from '../../database/entities/Workspace'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import organizationMembersService from '../organization-members'
import workspaceMembersService from '../workspace-members'

/**
 * Search organizations
 */
const searchOrganizations = async (
    userId: string,
    query: string,
    options: { limit?: number; offset?: number } = {}
): Promise<{ items: Organization[]; total: number }> => {
    try {
        const appServer = getRunningExpressApp()
        
        // Get organizations the user is a member of
        const userOrganizations = await organizationMembersService.getUserOrganizations(userId)
        const organizationIds = userOrganizations.map((org) => org.organizationId)
        
        if (organizationIds.length === 0) {
            return { items: [], total: 0 }
        }
        
        // Build search query
        const searchConditions = [
            { id: In(organizationIds) },
            { name: Like(`%${query}%`) }
        ]
        
        // If query is empty, just filter by user's organizations
        const whereCondition = query ? [
            { id: In(organizationIds), name: Like(`%${query}%`) },
            { id: In(organizationIds), description: Like(`%${query}%`) }
        ] : { id: In(organizationIds) }
        
        // Get total count
        const total = await appServer.AppDataSource.getRepository(Organization).count({
            where: whereCondition
        })
        
        // Get paginated results
        const items = await appServer.AppDataSource.getRepository(Organization).find({
            where: whereCondition,
            order: {
                name: 'ASC'
            },
            skip: options.offset || 0,
            take: options.limit || 10
        })
        
        return { items, total }
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: searchService.searchOrganizations - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Search workspaces
 */
const searchWorkspaces = async (
    userId: string,
    query: string,
    options: { organizationId?: string; limit?: number; offset?: number } = {}
): Promise<{ items: Workspace[]; total: number }> => {
    try {
        const appServer = getRunningExpressApp()
        
        // Get workspaces the user is a member of
        const userWorkspaces = await workspaceMembersService.getUserWorkspaces(userId)
        const workspaceIds = userWorkspaces.map((ws) => ws.workspaceId)
        
        if (workspaceIds.length === 0) {
            return { items: [], total: 0 }
        }
        
        // Build search query
        let whereCondition: any = { id: In(workspaceIds) }
        
        // Filter by organization if specified
        if (options.organizationId) {
            whereCondition = { ...whereCondition, organizationId: options.organizationId }
        }
        
        // Add search term if provided
        if (query) {
            whereCondition = [
                { ...whereCondition, name: Like(`%${query}%`) },
                { ...whereCondition, description: Like(`%${query}%`) }
            ]
        }
        
        // Get total count
        const total = await appServer.AppDataSource.getRepository(Workspace).count({
            where: whereCondition
        })
        
        // Get paginated results
        const items = await appServer.AppDataSource.getRepository(Workspace).find({
            where: whereCondition,
            relations: ['organization'],
            order: {
                name: 'ASC'
            },
            skip: options.offset || 0,
            take: options.limit || 10
        })
        
        return { items, total }
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: searchService.searchWorkspaces - ${getErrorMessage(error)}`
        )
    }
}

export default {
    searchOrganizations,
    searchWorkspaces
}