import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals'
import { CustomRoleService } from '../services/roles-permissions/CustomRoleService'
import { CustomRole } from '../database/entities/CustomRole'
import { Role, RoleType } from '../database/entities/Role'
import { RolePermission } from '../database/entities/RolePermission'
import { Permission } from '../database/entities/Permission'
import { InternalFastflowError } from '../errors/InternalFastflowError'

// Mock dependencies
jest.mock('../utils/getRunningExpressApp', () => ({
    getRunningExpressApp: jest.fn().mockReturnValue({
        AppDataSource: {
            getRepository: jest.fn()
        }
    })
}))

jest.mock('../services/organizations', () => ({
    getOrganizationById: jest.fn().mockImplementation(async (id) => {
        if (id === 'invalid-org') {
            throw new Error('Organization not found')
        }
        return { id, name: 'Test Organization' }
    })
}))

describe('CustomRoleService', () => {
    let customRoleService: CustomRoleService
    let mockRepository: any
    let mockRolePermissionRepository: any
    
    const mockCustomRoles = [
        {
            id: 'role-1',
            name: 'Custom Role 1',
            description: 'Test custom role 1',
            type: RoleType.CUSTOM,
            organizationId: 'org-1',
            parentRoleId: null,
            priority: 0,
            version: 1,
            isTemplate: false,
            templateId: null
        },
        {
            id: 'role-2',
            name: 'Custom Role 2',
            description: 'Test custom role 2',
            type: RoleType.CUSTOM,
            organizationId: 'org-1',
            parentRoleId: 'role-1',
            priority: 1,
            version: 1,
            isTemplate: false,
            templateId: null
        },
        {
            id: 'template-1',
            name: 'Template Role',
            description: 'Test template role',
            type: RoleType.CUSTOM,
            organizationId: 'org-1',
            parentRoleId: null,
            priority: 0,
            version: 1,
            isTemplate: true,
            templateId: null
        }
    ]
    
    const mockPermissions = [
        {
            id: 'perm-1',
            name: 'resource:read',
            resourceType: 'resource',
            action: 'read',
            description: 'Read resource'
        },
        {
            id: 'perm-2',
            name: 'resource:write',
            resourceType: 'resource',
            action: 'write',
            description: 'Write resource'
        }
    ]
    
    const mockRolePermissions = [
        {
            id: 'rp-1',
            roleId: 'role-1',
            permissionId: 'perm-1',
            permission: mockPermissions[0]
        },
        {
            id: 'rp-2',
            roleId: 'template-1',
            permissionId: 'perm-1',
            permission: mockPermissions[0]
        },
        {
            id: 'rp-3',
            roleId: 'template-1',
            permissionId: 'perm-2',
            permission: mockPermissions[1]
        }
    ]
    
    beforeEach(() => {
        // Create mock repository
        mockRepository = {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            merge: jest.fn(),
            delete: jest.fn()
        }
        
        mockRolePermissionRepository = {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn()
        }
        
        // Mock getRepository to return our mock repository
        const getRunningExpressApp = require('../utils/getRunningExpressApp').getRunningExpressApp
        getRunningExpressApp().AppDataSource.getRepository = jest.fn().mockImplementation((entity) => {
            if (entity === RolePermission) {
                return mockRolePermissionRepository
            }
            return mockRepository
        })
        
        // Create service instance
        customRoleService = new CustomRoleService()
    })
    
    afterEach(() => {
        jest.clearAllMocks()
    })
    
    describe('getAllCustomRoles', () => {
        it('should return all custom roles', async () => {
            mockRepository.find.mockResolvedValue(mockCustomRoles)
            
            const result = await customRoleService.getAllCustomRoles()
            
            expect(mockRepository.find).toHaveBeenCalled()
            expect(result).toEqual(mockCustomRoles)
            expect(result.length).toBe(3)
        })
    })
    
    describe('getCustomRolesByOrganizationId', () => {
        it('should return custom roles for an organization', async () => {
            mockRepository.find.mockResolvedValue([mockCustomRoles[0], mockCustomRoles[1]])
            
            const result = await customRoleService.getCustomRolesByOrganizationId('org-1')
            
            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { organizationId: 'org-1' },
                order: { name: 'ASC' },
                relations: ['organization', 'parentRole', 'template']
            })
            expect(result.length).toBe(2)
        })
        
        it('should throw an error for invalid organization ID', async () => {
            await expect(customRoleService.getCustomRolesByOrganizationId('invalid-org'))
                .rejects.toThrow()
        })
    })
    
    describe('getCustomRoleById', () => {
        it('should return a custom role by ID', async () => {
            mockRepository.findOne.mockResolvedValue(mockCustomRoles[0])
            
            const result = await customRoleService.getCustomRoleById('role-1')
            
            expect(mockRepository.findOne).toHaveBeenCalled()
            expect(result).toEqual(mockCustomRoles[0])
        })
        
        it('should throw an error for non-existent role', async () => {
            mockRepository.findOne.mockResolvedValue(null)
            
            await expect(customRoleService.getCustomRoleById('non-existent'))
                .rejects.toThrow(InternalFastflowError)
        })
    })
    
    describe('createCustomRole', () => {
        it('should create a new custom role', async () => {
            const newRole = {
                name: 'New Custom Role',
                description: 'New custom role description',
                organizationId: 'org-1'
            }
            
            mockRepository.create.mockReturnValue(newRole)
            mockRepository.save.mockResolvedValue({ id: 'new-role', ...newRole })
            mockRepository.findOne.mockResolvedValue({ id: 'new-role', ...newRole })
            
            const result = await customRoleService.createCustomRole(newRole)
            
            expect(mockRepository.create).toHaveBeenCalled()
            expect(mockRepository.save).toHaveBeenCalled()
            expect(result.name).toBe(newRole.name)
            expect(result.type).toBe(RoleType.CUSTOM)
        })
    })
    
    describe('createRoleTemplate', () => {
        it('should create a new role template', async () => {
            const templateData = {
                name: 'New Template',
                description: 'New template description',
                organizationId: 'org-1'
            }
            
            mockRepository.create.mockReturnValue({ ...templateData, isTemplate: true })
            mockRepository.save.mockResolvedValue({ id: 'new-template', ...templateData, isTemplate: true })
            mockRepository.findOne.mockResolvedValue({ id: 'new-template', ...templateData, isTemplate: true })
            
            const result = await customRoleService.createRoleTemplate(templateData)
            
            expect(mockRepository.create).toHaveBeenCalled()
            expect(mockRepository.save).toHaveBeenCalled()
            expect(result.name).toBe(templateData.name)
            expect(result.isTemplate).toBe(true)
        })
    })
    
    describe('createRoleFromTemplate', () => {
        it('should create a new role from a template', async () => {
            const templateRole = mockCustomRoles[2]
            const newRoleData = {
                name: 'Role From Template',
                organizationId: 'org-1'
            }
            
            mockRepository.findOne.mockResolvedValue(templateRole)
            mockRepository.create.mockReturnValue({ 
                ...newRoleData, 
                templateId: templateRole.id,
                isTemplate: false
            })
            mockRepository.save.mockResolvedValue({ 
                id: 'new-role-from-template', 
                ...newRoleData, 
                templateId: templateRole.id,
                isTemplate: false
            })
            
            mockRolePermissionRepository.find.mockResolvedValue([
                mockRolePermissions[1],
                mockRolePermissions[2]
            ])
            
            const result = await customRoleService.createRoleFromTemplate(templateRole.id, newRoleData)
            
            expect(mockRepository.create).toHaveBeenCalled()
            expect(mockRepository.save).toHaveBeenCalled()
            expect(mockRolePermissionRepository.find).toHaveBeenCalled()
            expect(result.name).toBe(newRoleData.name)
            expect(result.templateId).toBe(templateRole.id)
        })
        
        it('should throw an error if template does not exist', async () => {
            mockRepository.findOne.mockResolvedValue(null)
            
            await expect(customRoleService.createRoleFromTemplate('non-existent', { name: 'Test' }))
                .rejects.toThrow(InternalFastflowError)
        })
        
        it('should throw an error if role is not a template', async () => {
            mockRepository.findOne.mockResolvedValue({ ...mockCustomRoles[0], isTemplate: false })
            
            await expect(customRoleService.createRoleFromTemplate('role-1', { name: 'Test' }))
                .rejects.toThrow(InternalFastflowError)
        })
    })
    
    describe('getEffectiveRolePermissions', () => {
        it('should return direct permissions for a role without parent', async () => {
            mockRepository.findOne.mockResolvedValue(mockCustomRoles[0])
            mockRolePermissionRepository.find.mockResolvedValue([mockRolePermissions[0]])
            
            const result = await customRoleService.getEffectiveRolePermissions('role-1')
            
            expect(result.length).toBe(1)
            expect(result[0].permission).toEqual(mockPermissions[0])
            expect(result[0].source).toBe('direct')
        })
        
        it('should return combined permissions for a role with parent', async () => {
            // First call for the role itself
            mockRepository.findOne.mockResolvedValueOnce(mockCustomRoles[1])
            // Second call for the parent role
            mockRepository.findOne.mockResolvedValueOnce(mockCustomRoles[0])
            
            // Direct permissions for the role (none)
            mockRolePermissionRepository.find.mockResolvedValueOnce([])
            // Parent role permissions
            mockRolePermissionRepository.find.mockResolvedValueOnce([mockRolePermissions[0]])
            
            const result = await customRoleService.getEffectiveRolePermissions('role-2')
            
            expect(result.length).toBe(1)
            expect(result[0].permission).toEqual(mockPermissions[0])
            expect(result[0].source).toBe('inherited')
        })
    })
})