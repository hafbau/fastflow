import { Role, RoleType } from '../../database/entities/Role'
import { Permission, PermissionScope } from '../../database/entities/Permission'
import { roleService } from './RoleService'
import { permissionService } from './PermissionService'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'

/**
 * Initialize default permissions
 */
const initializePermissions = async (): Promise<Map<string, Permission>> => {
    const permissionMap = new Map<string, Permission>()
    
    // Define resource types
    const resourceTypes = [
        'organization',
        'workspace',
        'user',
        'role',
        'permission',
        'chatflow',
        'credential',
        'tool',
        'assistant',
        'variable',
        'audit'
    ]
    
    // Define actions
    const actions = {
        read: 'read',
        create: 'create',
        update: 'update',
        delete: 'delete',
        execute: 'execute',
        manage: 'manage',
        share: 'share',
        assign: 'assign'
    }
    
    // Create permissions for each resource type
    for (const resourceType of resourceTypes) {
        // Create CRUD permissions
        const crudPermissions = [
            {
                name: `${resourceType}:${actions.read}`,
                resourceType,
                action: actions.read,
                description: `Read ${resourceType}`,
                scope: PermissionScope.RESOURCE
            },
            {
                name: `${resourceType}:${actions.create}`,
                resourceType,
                action: actions.create,
                description: `Create ${resourceType}`,
                scope: PermissionScope.ORGANIZATION
            },
            {
                name: `${resourceType}:${actions.update}`,
                resourceType,
                action: actions.update,
                description: `Update ${resourceType}`,
                scope: PermissionScope.RESOURCE
            },
            {
                name: `${resourceType}:${actions.delete}`,
                resourceType,
                action: actions.delete,
                description: `Delete ${resourceType}`,
                scope: PermissionScope.RESOURCE
            }
        ]
        
        // Add additional permissions based on resource type
        if (resourceType === 'chatflow') {
            crudPermissions.push({
                name: `${resourceType}:${actions.execute}`,
                resourceType,
                action: actions.execute,
                description: `Execute ${resourceType}`,
                scope: PermissionScope.RESOURCE
            })
        }
        
        if (['chatflow', 'credential', 'assistant'].includes(resourceType)) {
            crudPermissions.push({
                name: `${resourceType}:${actions.share}`,
                resourceType,
                action: actions.share,
                description: `Share ${resourceType}`,
                scope: PermissionScope.RESOURCE
            })
        }
        
        if (['organization', 'workspace'].includes(resourceType)) {
            crudPermissions.push({
                name: `${resourceType}:${actions.manage}`,
                resourceType,
                action: actions.manage,
                description: `Manage ${resourceType}`,
                scope: PermissionScope.RESOURCE
            })
        }
        
        if (['role', 'permission'].includes(resourceType)) {
            crudPermissions.push({
                name: `${resourceType}:${actions.assign}`,
                resourceType,
                action: actions.assign,
                description: `Assign ${resourceType}`,
                scope: PermissionScope.RESOURCE
            })
        }
        
        // Create permissions in database
        for (const permissionData of crudPermissions) {
            try {
                // Check if permission already exists
                let permission: Permission
                try {
                    permission = await permissionService.getPermissionByName(permissionData.name)
                } catch (error) {
                    // Create permission if it doesn't exist
                    permission = await permissionService.createPermission(permissionData)
                }
                
                permissionMap.set(permissionData.name, permission)
            } catch (error) {
                console.error(`Error creating permission ${permissionData.name}:`, error)
            }
        }
    }
    
    return permissionMap
}

/**
 * Initialize system roles
 */
const initializeSystemRoles = async (permissionMap: Map<string, Permission>): Promise<void> => {
    // Define system roles
    const systemRoles = [
        {
            name: 'Admin',
            description: 'Administrator with full access',
            type: RoleType.SYSTEM,
            permissions: [
                // Organization permissions
                'organization:read',
                'organization:create',
                'organization:update',
                'organization:delete',
                'organization:manage',
                
                // Workspace permissions
                'workspace:read',
                'workspace:create',
                'workspace:update',
                'workspace:delete',
                'workspace:manage',
                
                // User permissions
                'user:read',
                'user:create',
                'user:update',
                'user:delete',
                
                // Role permissions
                'role:read',
                'role:create',
                'role:update',
                'role:delete',
                'role:assign',
                
                // Permission permissions
                'permission:read',
                'permission:create',
                'permission:update',
                'permission:delete',
                'permission:assign',
                
                // Chatflow permissions
                'chatflow:read',
                'chatflow:create',
                'chatflow:update',
                'chatflow:delete',
                'chatflow:execute',
                'chatflow:share',
                
                // Credential permissions
                'credential:read',
                'credential:create',
                'credential:update',
                'credential:delete',
                'credential:share',
                
                // Tool permissions
                'tool:read',
                'tool:create',
                'tool:update',
                'tool:delete',
                
                // Assistant permissions
                'assistant:read',
                'assistant:create',
                'assistant:update',
                'assistant:delete',
                'assistant:share',
                
                // Variable permissions
                'variable:read',
                'variable:create',
                'variable:update',
                'variable:delete',
                
                // Audit log permissions
                'audit:read',
                'audit:create'
            ]
        },
        {
            name: 'Member',
            description: 'Regular member with standard access',
            type: RoleType.SYSTEM,
            permissions: [
                // Organization permissions
                'organization:read',
                
                // Workspace permissions
                'workspace:read',
                
                // User permissions
                'user:read',
                
                // Chatflow permissions
                'chatflow:read',
                'chatflow:create',
                'chatflow:update',
                'chatflow:execute',
                
                // Credential permissions
                'credential:read',
                'credential:create',
                'credential:update',
                
                // Tool permissions
                'tool:read',
                
                // Assistant permissions
                'assistant:read',
                'assistant:create',
                'assistant:update',
                
                // Variable permissions
                'variable:read',
                'variable:create',
                'variable:update',
                
                // Audit log permissions
                'audit:read'
            ]
        },
        {
            name: 'Viewer',
            description: 'Viewer with read-only access',
            type: RoleType.SYSTEM,
            permissions: [
                // Organization permissions
                'organization:read',
                
                // Workspace permissions
                'workspace:read',
                
                // User permissions
                'user:read',
                
                // Chatflow permissions
                'chatflow:read',
                'chatflow:execute',
                
                // Credential permissions
                'credential:read',
                
                // Tool permissions
                'tool:read',
                
                // Assistant permissions
                'assistant:read',
                
                // Variable permissions
                'variable:read',
                
                // Audit log permissions
                'audit:read'
            ]
        }
    ]
    
    // Create system roles
    for (const roleData of systemRoles) {
        try {
            // Check if role already exists
            let role: Role | undefined
            try {
                const existingRoles = await roleService.getSystemRoles()
                role = existingRoles.find(r => r.name === roleData.name)
                
                if (!role) {
                    // Create role if it doesn't exist
                    role = await roleService.createRole({
                        name: roleData.name,
                        description: roleData.description,
                        type: roleData.type
                    })
                }
            } catch (error) {
                // Create role if it doesn't exist
                role = await roleService.createRole({
                    name: roleData.name,
                    description: roleData.description,
                    type: roleData.type
                })
            }
            
            // Assign permissions to role
            for (const permissionName of roleData.permissions) {
                const permission = permissionMap.get(permissionName)
                if (permission) {
                    await roleService.assignPermissionToRole(role.id, permission.id)
                }
            }
        } catch (error) {
            console.error(`Error creating role ${roleData.name}:`, error)
        }
    }
}

/**
 * Initialize roles and permissions
 */
export const initializeRolesAndPermissions = async (): Promise<void> => {
    try {
        console.log('Initializing roles and permissions...')
        
        // Initialize permissions
        const permissionMap = await initializePermissions()
        
        // Initialize system roles
        await initializeSystemRoles(permissionMap)
        
        console.log('Roles and permissions initialized successfully')
    } catch (error) {
        console.error('Error initializing roles and permissions:', error)
    }
}