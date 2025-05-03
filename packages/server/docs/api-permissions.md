# API Permissions Documentation

This document outlines the permission requirements for all API endpoints in the application. It serves as a reference for developers to ensure consistent permission checking across the application.

## Permission Structure

Permissions are structured as follows:

```
{resourceType}:{action}:{resourceId?}
```

Where:
- `resourceType` is the type of resource being accessed (e.g., chatflow, credential, tool)
- `action` is the action being performed (e.g., create, read, update, delete)
- `resourceId` is an optional specific resource ID (if not provided, the permission applies to all resources of that type)

## Core API Endpoints

### ChatFlows

| Endpoint | Method | Permission Required |
|----------|--------|---------------------|
| `/api/v1/chatflows` | GET | `chatflow:read` |
| `/api/v1/chatflows/:id` | GET | `chatflow:read:{id}` |
| `/api/v1/chatflows` | POST | `chatflow:create` |
| `/api/v1/chatflows/importchatflows` | POST | `chatflow:create` |
| `/api/v1/chatflows/:id` | PUT | `chatflow:update:{id}` |
| `/api/v1/chatflows/:id` | DELETE | `chatflow:delete:{id}` |
| `/api/v1/chatflows/apikey/:apikey` | GET | API key authentication |

### Credentials

| Endpoint | Method | Permission Required |
|----------|--------|---------------------|
| `/api/v1/credentials` | GET | `credential:read` |
| `/api/v1/credentials/:id` | GET | `credential:read:{id}` |
| `/api/v1/credentials` | POST | `credential:create` |
| `/api/v1/credentials/:id` | PUT | `credential:update:{id}` |
| `/api/v1/credentials/:id` | DELETE | `credential:delete:{id}` |

### Tools

| Endpoint | Method | Permission Required |
|----------|--------|---------------------|
| `/api/v1/tools` | GET | `tool:read` |
| `/api/v1/tools/:id` | GET | `tool:read:{id}` |
| `/api/v1/tools` | POST | `tool:create` |
| `/api/v1/tools/:id` | PUT | `tool:update:{id}` |
| `/api/v1/tools/:id` | DELETE | `tool:delete:{id}` |

### Assistants

| Endpoint | Method | Permission Required |
|----------|--------|---------------------|
| `/api/v1/assistants` | GET | `assistant:read` |
| `/api/v1/assistants/:id` | GET | `assistant:read:{id}` |
| `/api/v1/assistants` | POST | `assistant:create` |
| `/api/v1/assistants/:id` | PUT | `assistant:update:{id}` |
| `/api/v1/assistants/:id` | DELETE | `assistant:delete:{id}` |
| `/api/v1/assistants/components/chatmodels` | GET | `assistant:read` |
| `/api/v1/assistants/components/docstores` | GET | `assistant:read` |
| `/api/v1/assistants/components/tools` | GET | `assistant:read` |
| `/api/v1/assistants/generate/instruction` | POST | `assistant:create` |

### Variables

| Endpoint | Method | Permission Required |
|----------|--------|---------------------|
| `/api/v1/variables` | GET | `variable:read` |
| `/api/v1/variables` | POST | `variable:create` |
| `/api/v1/variables/:id` | PUT | `variable:update:{id}` |
| `/api/v1/variables/:id` | DELETE | `variable:delete:{id}` |

### Document Store

| Endpoint | Method | Permission Required |
|----------|--------|---------------------|
| `/api/v1/document-store/store` | GET | `documentstore:read` |
| `/api/v1/document-store/store/:id` | GET | `documentstore:read:{id}` |
| `/api/v1/document-store/store` | POST | `documentstore:create` |
| `/api/v1/document-store/store/:id` | PUT | `documentstore:update:{id}` |
| `/api/v1/document-store/store/:id` | DELETE | `documentstore:delete:{id}` |
| `/api/v1/document-store/upsert/:id` | POST | `documentstore:update:{id}` |
| `/api/v1/document-store/refresh/:id` | POST | `documentstore:update:{id}` |
| `/api/v1/document-store/store-configs/:id/:loaderId` | GET | `documentstore:read:{id}` |
| `/api/v1/document-store/loader/:id/:loaderId` | DELETE | `documentstore:update:{id}` |
| `/api/v1/document-store/chunks/:storeId/:loaderId/:chunkId` | DELETE | `documentstore:update:{storeId}` |
| `/api/v1/document-store/chunks/:storeId/:loaderId/:chunkId` | PUT | `documentstore:update:{storeId}` |
| `/api/v1/document-store/chunks/:storeId/:fileId/:pageNo` | GET | `documentstore:read:{storeId}` |

## Auxiliary API Endpoints

### API Keys

| Endpoint | Method | Permission Required |
|----------|--------|---------------------|
| `/api/v1/apikey` | GET | `apikey:read` |
| `/api/v1/apikey` | POST | `apikey:create` |
| `/api/v1/apikey/import` | POST | `apikey:create` |
| `/api/v1/apikey/:id` | PUT | `apikey:update:{id}` |
| `/api/v1/apikey/:id` | DELETE | `apikey:delete:{id}` |

### Stats

| Endpoint | Method | Permission Required |
|----------|--------|---------------------|
| `/api/v1/stats` | GET | `chatflow:read` |
| `/api/v1/stats/:id` | GET | `chatflow:read:{id}` |

### Export/Import

| Endpoint | Method | Permission Required |
|----------|--------|---------------------|
| `/api/v1/export-import/export` | POST | `system:read` |
| `/api/v1/export-import/import` | POST | `system:create` |

### Organizations

| Endpoint | Method | Permission Required |
|----------|--------|---------------------|
| `/api/v1/organizations` | GET | `organization:read` |
| `/api/v1/organizations/:id` | GET | `organization:read:{id}` |
| `/api/v1/organizations/slug/:slug` | GET | `organization:read` |
| `/api/v1/organizations` | POST | `organization:create` |
| `/api/v1/organizations/:id` | PUT | `organization:update:{id}` |
| `/api/v1/organizations/:id` | DELETE | `organization:delete:{id}` |
| `/api/v1/organizations/:id/members` | GET | `organization:read:{id}` |
| `/api/v1/organizations/:id/members` | POST | `organization:update:{id}` |
| `/api/v1/organizations/:id/members/:userId` | PUT | `organization:update:{id}` |
| `/api/v1/organizations/:id/members/:userId` | DELETE | `organization:update:{id}` |
| `/api/v1/organizations/:id/settings` | GET | `organization:read:{id}` |
| `/api/v1/organizations/:id/settings` | PUT | `organization:update:{id}` |

### Workspaces

| Endpoint | Method | Permission Required |
|----------|--------|---------------------|
| `/api/v1/workspaces` | GET | `workspace:read` |
| `/api/v1/workspaces/:id` | GET | `workspace:read:{id}` |
| `/api/v1/workspaces/slug/:slug` | GET | `workspace:read` |
| `/api/v1/workspaces/organization/:organizationId` | GET | `organization:read:{organizationId}` |
| `/api/v1/workspaces` | POST | `workspace:create` |
| `/api/v1/workspaces/:id` | PUT | `workspace:update:{id}` |
| `/api/v1/workspaces/:id` | DELETE | `workspace:delete:{id}` |
| `/api/v1/workspaces/:id/members` | GET | `workspace:read:{id}` |
| `/api/v1/workspaces/:id/members` | POST | `workspace:update:{id}` |
| `/api/v1/workspaces/:id/members/:userId` | PUT | `workspace:update:{id}` |
| `/api/v1/workspaces/:id/members/:userId` | DELETE | `workspace:update:{id}` |
| `/api/v1/workspaces/:id/settings` | GET | `workspace:read:{id}` |
| `/api/v1/workspaces/:id/settings` | PUT | `workspace:update:{id}` |

### Users

| Endpoint | Method | Permission Required |
|----------|--------|---------------------|
| `/api/v1/users` | GET | `users:read` |
| `/api/v1/users/:id` | GET | `users:read` |
| `/api/v1/users/:id` | PUT | `users:update` |
| `/api/v1/users/:id` | DELETE | `users:delete` |
| `/api/v1/users/:id/status` | PATCH | `users:update` |
| `/api/v1/users/:id/reset-password` | POST | `users:update` |
| `/api/v1/users/invite` | POST | `users:create` |
| `/api/v1/users/me` | GET | Authenticated user |
| `/api/v1/users/me` | PUT | Authenticated user |

### Roles and Permissions

| Endpoint | Method | Permission Required |
|----------|--------|---------------------|
| `/api/v1/roles` | GET | `role:read:*` |
| `/api/v1/roles/system` | GET | `role:read:*` |
| `/api/v1/organizations/:organizationId/roles` | GET | `organization:read:{organizationId}` |
| `/api/v1/resource-permissions/users/:userId/resources/:resourceType/:resourceId` | GET | `permission:manage` |
| `/api/v1/resource-permissions/users/:userId/resources/:resourceType/:resourceId` | POST | `permission:manage` |
| `/api/v1/resource-permissions/users/:userId/resources/:resourceType/:resourceId` | DELETE | `permission:manage` |
| `/api/v1/resource-permissions/users/:userId/resources/:resourceType` | GET | `permission:manage` |
| `/api/v1/resource-permissions/resources/:resourceType/:resourceId/users` | GET | `permission:manage` |
| `/api/v1/resource-permissions/check/users/:userId/resources/:resourceType/:resourceId` | GET | `permission:manage` |
| `/api/v1/resource-permissions/batch-check/users/:userId/resources/:resourceType/:resourceId` | POST | `permission:manage` |
| `/api/v1/resource-permissions/resources/:resourceType/:resourceId` | DELETE | `permission:manage` |

## Multi-Tenant API Endpoints

Multi-tenant endpoints enforce permissions at both the organization and workspace levels:

1. Organization-level permissions control access to all resources within an organization
2. Workspace-level permissions control access to resources within a specific workspace
3. Resource-level permissions control access to specific resources

### Organization-Scoped Endpoints

| Endpoint | Method | Permission Required |
|----------|--------|---------------------|
| `/api/v1/organizations/:orgId/chatflows` | GET | `organization:read:{orgId}` AND `chatflow:read` |
| `/api/v1/organizations/:orgId/chatflows/:id` | GET | `organization:read:{orgId}` AND `chatflow:read:{id}` |
| `/api/v1/organizations/:orgId/chatflows` | POST | `organization:update:{orgId}` AND `chatflow:create` |
| `/api/v1/organizations/:orgId/chatflows/:id` | PUT | `organization:update:{orgId}` AND `chatflow:update:{id}` |
| `/api/v1/organizations/:orgId/chatflows/:id` | DELETE | `organization:update:{orgId}` AND `chatflow:delete:{id}` |

### Workspace-Scoped Endpoints

| Endpoint | Method | Permission Required |
|----------|--------|---------------------|
| `/api/v1/workspaces/:workspaceId/chatflows` | GET | `workspace:read:{workspaceId}` AND `chatflow:read` |
| `/api/v1/workspaces/:workspaceId/chatflows/:id` | GET | `workspace:read:{workspaceId}` AND `chatflow:read:{id}` |
| `/api/v1/workspaces/:workspaceId/chatflows` | POST | `workspace:update:{workspaceId}` AND `chatflow:create` |
| `/api/v1/workspaces/:workspaceId/chatflows/:id` | PUT | `workspace:update:{workspaceId}` AND `chatflow:update:{id}` |
| `/api/v1/workspaces/:workspaceId/chatflows/:id` | DELETE | `workspace:update:{workspaceId}` AND `chatflow:delete:{id}` |

## Public Endpoints

The following endpoints are publicly accessible and do not require authentication:

| Endpoint | Method | Notes |
|----------|--------|-------|
| `/api/v1/health` | GET | Health check endpoint |
| `/api/v1/auth/login` | POST | User login |
| `/api/v1/auth/register` | POST | User registration |
| `/api/v1/auth/reset-password` | POST | Password reset |
| `/api/v1/auth/confirm-email` | POST | Email confirmation |
| `/api/v1/auth/magic-link` | POST | Magic link authentication |
| `/api/v1/public-chatflows/:id` | GET | Public chatflow access |
| `/api/v1/public-chatbotConfig/:id` | GET | Public chatbot configuration |