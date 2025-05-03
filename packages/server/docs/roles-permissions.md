# Roles and Permissions System

This document describes the roles and permissions system implemented in Flowstack.

## Overview

The roles and permissions system provides fine-grained access control for different resources in the application. It supports:

- Resource-based permissions
- Role-based access control
- System and custom roles
- Permission inheritance
- Organization-level role management

## Permission Model

Permissions are defined with the following attributes:

- **Resource Type**: The type of resource the permission applies to (e.g., `chatflow`, `credential`, `organization`)
- **Action**: The action that can be performed on the resource (e.g., `read`, `create`, `update`, `delete`)
- **Scope**: The scope of the permission (system, organization, workspace, resource)
- **Description**: A human-readable description of the permission

Permissions are named using the format: `{resourceType}:{action}`

## Permission Scopes

Permissions can be scoped at different levels:

- **System**: Applies to all resources of a type across the entire system
- **Organization**: Applies to all resources of a type within an organization
- **Workspace**: Applies to all resources of a type within a workspace
- **Resource**: Applies to a specific resource instance

## Roles

Roles are collections of permissions that can be assigned to users. There are two types of roles:

1. **System Roles**: Predefined roles with system-wide permissions
2. **Custom Roles**: User-defined roles that can be created at the organization level

### System Roles

The system comes with the following predefined roles:

- **Admin**: Has full access to all resources and operations
- **Member**: Has standard access to resources within their organizations and workspaces
- **Viewer**: Has read-only access to resources within their organizations and workspaces

### Custom Roles

Custom roles can be created at the organization level. They can be based on existing roles (cloned) or created from scratch.

## API Endpoints

The following API endpoints are available for managing roles and permissions:

### Roles

- `GET /api/v1/roles` - Get all roles
- `GET /api/v1/roles/system` - Get system roles
- `GET /api/v1/roles/{roleId}` - Get role by ID
- `GET /api/v1/organizations/{organizationId}/roles` - Get roles for an organization
- `POST /api/v1/organizations/{organizationId}/roles` - Create a new role for an organization
- `PUT /api/v1/roles/{roleId}` - Update a role
- `DELETE /api/v1/roles/{roleId}` - Delete a role
- `POST /api/v1/roles/{roleId}/clone` - Clone a role

### Permissions

- `GET /api/v1/permissions` - Get all permissions
- `GET /api/v1/permissions/{permissionId}` - Get permission by ID
- `GET /api/v1/roles/{roleId}/permissions` - Get permissions for a role
- `POST /api/v1/roles/{roleId}/permissions/{permissionId}` - Assign a permission to a role
- `DELETE /api/v1/roles/{roleId}/permissions/{permissionId}` - Remove a permission from a role

### User Roles

- `GET /api/v1/users/{userId}/roles` - Get roles for a user

## Usage Examples

### Checking Permissions

To check if a user has permission to perform an action on a resource:

```typescript
const hasPermission = await permissionService.hasPermission(
    userId,
    resourceType,
    resourceId,
    action
);

if (hasPermission) {
    // User has permission, proceed with action
} else {
    // User does not have permission, deny access
}
```

### Assigning Roles

To assign a role to a user:

```typescript
await rolesPermissionsService.assignRoleToUser(userId, roleId);
```

### Creating Custom Roles

To create a custom role for an organization:

```typescript
const role = await rolesPermissionsService.createRole({
    name: 'Custom Role',
    description: 'A custom role for the organization',
    organizationId: 'org-123'
});
```

## Implementation Details

The roles and permissions system is implemented using the following components:

- **Permission Entity**: Represents a permission in the system
- **Role Entity**: Represents a role in the system
- **RolePermission Entity**: Maps permissions to roles
- **UserRole Entity**: Maps roles to users
- **PermissionService**: Provides methods for checking permissions
- **RoleService**: Provides methods for managing roles
- **RolesPermissionsService**: Provides high-level methods for managing roles and permissions

## Security Considerations

- All API endpoints are protected with authentication
- Permission checks are performed on all protected resources
- System roles cannot be modified by regular users
- Custom roles can only be managed by users with appropriate permissions