# Custom Role Definitions System

This document describes the custom role definitions system implemented in Flowstack.

## Overview

The custom role definitions system extends the base roles and permissions system to provide organizations with the ability to create and manage custom roles with specific permission sets. This provides flexibility for organizations to define roles that match their specific organizational structure and access control needs.

## Features

- **Role Inheritance**: Custom roles can inherit permissions from parent roles, creating a hierarchical structure
- **Role Templates**: Predefined role templates can be used as a starting point for creating new roles
- **Role Versioning**: Track changes to roles over time with versioning
- **Permission Conflict Resolution**: Priority-based conflict resolution for inherited permissions
- **Role Hierarchy Visualization**: Visualize the role hierarchy to understand relationships

## Custom Role Model

Custom roles extend the base Role entity with additional properties:

- **Parent Role**: The parent role from which permissions are inherited
- **Priority**: Used for conflict resolution when permissions are inherited from multiple sources
- **Version**: Tracks changes to the role over time
- **Is Template**: Indicates if the role is a template that can be used to create new roles
- **Template ID**: Reference to the template role if this role was created from a template

## Role Inheritance

Custom roles can inherit permissions from parent roles. When a role inherits from a parent, it automatically receives all permissions assigned to the parent role. This creates a hierarchical structure that simplifies permission management.

### Conflict Resolution

When a role inherits permissions from a parent role, conflicts may arise if the same permission is defined differently in multiple roles. The system resolves conflicts using the following rules:

1. Direct permissions take precedence over inherited permissions
2. When multiple inherited permissions conflict, the role with the highest priority wins

## Role Templates

Role templates provide a starting point for creating new roles. Templates are predefined roles with common permission sets that can be customized for specific needs.

### Creating a Role from Template

When creating a role from a template, the new role inherits all permissions from the template. The new role can then be customized by adding or removing permissions as needed.

## API Endpoints

The following API endpoints are available for managing custom roles:

### Custom Roles

- `GET /api/v1/custom-roles` - Get all custom roles
- `GET /api/v1/custom-roles/:roleId` - Get custom role by ID
- `GET /api/v1/custom-roles/organizations/:organizationId` - Get custom roles for an organization
- `POST /api/v1/custom-roles/organizations/:organizationId` - Create a new custom role for an organization
- `PUT /api/v1/custom-roles/:roleId` - Update a custom role
- `DELETE /api/v1/custom-roles/:roleId` - Delete a custom role

### Role Templates

- `GET /api/v1/custom-roles/templates/organizations/:organizationId` - Get role templates for an organization
- `POST /api/v1/custom-roles/templates/organizations/:organizationId` - Create a new role template for an organization
- `POST /api/v1/custom-roles/from-template/:templateId` - Create a role from a template

### Role Hierarchy

- `GET /api/v1/custom-roles/:roleId/hierarchy` - Get role hierarchy
- `GET /api/v1/custom-roles/:roleId/effective-permissions` - Get effective permissions for a role (including inherited permissions)

### Role Permissions

- `POST /api/v1/custom-roles/:roleId/permissions/:permissionId` - Assign a permission to a role
- `DELETE /api/v1/custom-roles/:roleId/permissions/:permissionId` - Remove a permission from a role

## Usage Examples

### Creating a Custom Role

```typescript
// Create a new custom role
const customRole = await customRoleService.createCustomRole({
    name: 'Department Manager',
    description: 'Manages a department within the organization',
    organizationId: 'org-123',
    priority: 10
});
```

### Creating a Role with Inheritance

```typescript
// Create a role that inherits from another role
const customRole = await customRoleService.createCustomRole({
    name: 'Team Lead',
    description: 'Leads a team within a department',
    organizationId: 'org-123',
    parentRoleId: 'role-456', // Department Manager role
    priority: 5
});
```

### Creating a Role Template

```typescript
// Create a role template
const template = await customRoleService.createRoleTemplate({
    name: 'Read-Only User',
    description: 'Can only read resources, no write access',
    organizationId: 'org-123'
});

// Assign permissions to the template
await roleService.assignPermissionToRole(template.id, 'perm-read-chatflow');
await roleService.assignPermissionToRole(template.id, 'perm-read-credential');
```

### Creating a Role from Template

```typescript
// Create a role from a template
const role = await customRoleService.createRoleFromTemplate('template-123', {
    name: 'Support Staff',
    description: 'Support staff with read-only access',
    organizationId: 'org-123'
});
```

### Getting Effective Permissions

```typescript
// Get all effective permissions for a role (including inherited)
const permissions = await customRoleService.getEffectiveRolePermissions('role-123');

// Check if a specific permission is included
const hasPermission = permissions.some(p => p.permission.name === 'chatflow:read');
```

## Implementation Details

The custom role system is implemented using the following components:

- **CustomRole Entity**: Extends the base Role entity with additional properties for inheritance and templates
- **CustomRoleService**: Provides methods for managing custom roles, templates, and inheritance
- **Role Hierarchy**: Implemented as a parent-child relationship between roles

## Security Considerations

- Circular references in role inheritance are prevented
- Roles that are used as parents or templates cannot be deleted
- Custom roles are always scoped to an organization
- Permission checks consider the entire inheritance hierarchy