/**
 * Resource Permission Service Tests
 * 
 * This module contains tests for the resource permission service.
 */

import { ResourcePermissionService } from '../services/ResourcePermissionService'
import { ResourcePermission } from '../database/entities/ResourcePermission'
import { getRepository } from 'typeorm'

// Mock TypeORM repository
jest.mock('typeorm', () => ({
    getRepository: jest.fn()
}))

// Define mock repository type
type MockRepository = {
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
    count: jest.Mock;
}

describe('ResourcePermissionService', () => {
    let resourcePermissionService: ResourcePermissionService
    let mockRepository: MockRepository

    beforeEach(() => {
        // Create mock repository
        mockRepository = {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            count: jest.fn()
        } as MockRepository;

        // Set up the mock implementation for getRepository
        (getRepository as jest.Mock).mockReturnValue(mockRepository)

        // Create service instance
        resourcePermissionService = new ResourcePermissionService()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('assignPermission', () => {
        it('should create a new permission if it does not exist', async () => {
            // Mock repository findOne to return null (permission doesn't exist)
            mockRepository.findOne.mockResolvedValue(null)

            // Mock repository save to return the saved permission
            const savedPermission = {
                id: 'perm-123',
                userId: 'user-123',
                resourceType: 'chatflow',
                resourceId: 'flow-123',
                permission: 'read'
            }
            mockRepository.save.mockResolvedValue(savedPermission)

            // Call the method
            const result = await resourcePermissionService.assignPermission(
                'user-123',
                'chatflow',
                'flow-123',
                'read'
            )

            // Verify repository methods were called correctly
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: {
                    userId: 'user-123',
                    resourceType: 'chatflow',
                    resourceId: 'flow-123',
                    permission: 'read'
                }
            })
            expect(mockRepository.save).toHaveBeenCalled()

            // Verify the result
            expect(result).toEqual(savedPermission)
        })

        it('should return existing permission if it already exists', async () => {
            // Mock repository findOne to return an existing permission
            const existingPermission = {
                id: 'perm-123',
                userId: 'user-123',
                resourceType: 'chatflow',
                resourceId: 'flow-123',
                permission: 'read'
            }
            mockRepository.findOne.mockResolvedValue(existingPermission)

            // Call the method
            const result = await resourcePermissionService.assignPermission(
                'user-123',
                'chatflow',
                'flow-123',
                'read'
            )

            // Verify repository methods were called correctly
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: {
                    userId: 'user-123',
                    resourceType: 'chatflow',
                    resourceId: 'flow-123',
                    permission: 'read'
                }
            })
            expect(mockRepository.save).not.toHaveBeenCalled()

            // Verify the result
            expect(result).toEqual(existingPermission)
        })
    })

    describe('removePermission', () => {
        it('should remove an existing permission', async () => {
            // Mock repository delete to return success
            mockRepository.delete.mockResolvedValue({ affected: 1 })

            // Call the method
            const result = await resourcePermissionService.removePermission(
                'user-123',
                'chatflow',
                'flow-123',
                'read'
            )

            // Verify repository methods were called correctly
            expect(mockRepository.delete).toHaveBeenCalledWith({
                userId: 'user-123',
                resourceType: 'chatflow',
                resourceId: 'flow-123',
                permission: 'read'
            })

            // Verify the result
            expect(result).toBe(true)
        })

        it('should return false if permission does not exist', async () => {
            // Mock repository delete to return no affected rows
            mockRepository.delete.mockResolvedValue({ affected: 0 })

            // Call the method
            const result = await resourcePermissionService.removePermission(
                'user-123',
                'chatflow',
                'flow-123',
                'read'
            )

            // Verify repository methods were called correctly
            expect(mockRepository.delete).toHaveBeenCalledWith({
                userId: 'user-123',
                resourceType: 'chatflow',
                resourceId: 'flow-123',
                permission: 'read'
            })

            // Verify the result
            expect(result).toBe(false)
        })
    })

    describe('getResourcePermissions', () => {
        it('should return permissions for a resource', async () => {
            // Mock repository find to return permissions
            const permissions = [
                { id: 'perm-1', permission: 'read' },
                { id: 'perm-2', permission: 'write' }
            ]
            mockRepository.find.mockResolvedValue(permissions)

            // Call the method
            const result = await resourcePermissionService.getResourcePermissions(
                'user-123',
                'chatflow',
                'flow-123'
            )

            // Verify repository methods were called correctly
            expect(mockRepository.find).toHaveBeenCalledWith({
                where: {
                    userId: 'user-123',
                    resourceType: 'chatflow',
                    resourceId: 'flow-123'
                }
            })

            // Verify the result
            expect(result).toEqual(['read', 'write'])
        })
    })

    describe('hasResourcePermission', () => {
        it('should return true if user has direct resource permission', async () => {
            // Mock repository count to return 1 (permission exists)
            mockRepository.count.mockResolvedValue(1)

            // Call the method
            const result = await resourcePermissionService.hasResourcePermission(
                'user-123',
                'chatflow',
                'flow-123',
                'read'
            )

            // Verify repository methods were called correctly
            expect(mockRepository.count).toHaveBeenCalledWith({
                where: {
                    userId: 'user-123',
                    resourceType: 'chatflow',
                    resourceId: 'flow-123',
                    permission: 'read'
                }
            })

            // Verify the result
            expect(result).toBe(true)
        })
    })

    describe('getResourcesWithPermission', () => {
        it('should return resources with a specific permission', async () => {
            // Mock repository find to return permissions
            const permissions = [
                { resourceId: 'flow-1' },
                { resourceId: 'flow-2' }
            ]
            mockRepository.find.mockResolvedValue(permissions)

            // Call the method
            const result = await resourcePermissionService.getResourcesWithPermission(
                'user-123',
                'chatflow',
                'read'
            )

            // Verify repository methods were called correctly
            expect(mockRepository.find).toHaveBeenCalledWith({
                where: {
                    userId: 'user-123',
                    resourceType: 'chatflow',
                    permission: 'read'
                }
            })

            // Verify the result
            expect(result).toEqual(['flow-1', 'flow-2'])
        })
    })

    describe('getUsersWithPermission', () => {
        it('should return users with a specific permission for a resource', async () => {
            // Mock repository find to return permissions
            const permissions = [
                { userId: 'user-1' },
                { userId: 'user-2' }
            ]
            mockRepository.find.mockResolvedValue(permissions)

            // Call the method
            const result = await resourcePermissionService.getUsersWithPermission(
                'chatflow',
                'flow-123',
                'read'
            )

            // Verify repository methods were called correctly
            expect(mockRepository.find).toHaveBeenCalledWith({
                where: {
                    resourceType: 'chatflow',
                    resourceId: 'flow-123',
                    permission: 'read'
                }
            })

            // Verify the result
            expect(result).toEqual(['user-1', 'user-2'])
        })
    })
})