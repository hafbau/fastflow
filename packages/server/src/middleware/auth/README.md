# Authorization Middleware

This directory contains middleware for authorization and access control in the FlowStack application.

## Overview

The authorization middleware provides a comprehensive system for authenticating users and controlling access to resources based on roles and permissions. It integrates with Supabase for authentication and provides a flexible permission system that can be used at different levels of the application.

## Components

### JWT Verification

The `jwtVerification.ts` file contains middleware for verifying JWT tokens from Supabase. It extracts the token from the Authorization header, verifies it with Supabase, and attaches the user to the request object.

### User Context

The `userContext.ts` file contains middleware for creating a user context with organization and workspace information. It retrieves the user's organizations, workspaces, roles, and permissions, and attaches them to the request object.

### Permission Checking

The `permissionCheck.ts` file contains middleware for checking if a user has permission to perform an action. It supports different permission scopes:

- **System**: System-wide permissions
- **Organization**: Organization-level permissions
- **Workspace**: Workspace-level permissions
- **Resource**: Resource-level permissions

### Types

The `types.ts` file contains TypeScript types for the authorization middleware, including the `AuthContext` interface that defines the structure of the user context.

## Usage

### Basic Authentication

To require authentication for a route, use the `authenticate` middleware:

```typescript
import { authenticate } from '../middleware/auth'

router.get('/protected', authenticate, (req, res) => {
  // Only authenticated users can access this route
  res.json({ message: 'Protected route' })
})
```

### Permission-Based Authorization

To require specific permissions for a route, use the `authorize` middleware:

```typescript
import { authorize } from '../middleware/auth'

router.get('/chatflows', authorize({
  resourceType: 'chatflow',
  action: 'read'
}), (req, res) => {
  // Only users with 'chatflow:read' permission can access this route
  res.json({ message: 'Chatflows' })
})
```

### Role-Based Authorization

To require specific roles for a route, use the `requireSystemAdmin`, `requireOrganizationAdmin`, or `requireWorkspaceAdmin` middleware:

```typescript
import { requireSystemAdmin } from '../middleware/auth'

router.get('/admin', requireSystemAdmin, (req, res) => {
  // Only system administrators can access this route
  res.json({ message: 'Admin route' })
})
```

### Resource Ownership

To require ownership of a resource for a route, use the `requireResourceOwner` middleware:

```typescript
import { requireResourceOwner } from '../middleware/auth'

router.delete('/chatflows/:id', requireResourceOwner('id', 'chatflow'), (req, res) => {
  // Only the owner of the chatflow can access this route
  res.json({ message: 'Chatflow deleted' })
})
```

## Context-Aware Authorization

The middleware supports context-aware authorization, where permissions are checked based on the current organization or workspace context. This allows for more granular access control based on the user's role in the current context.

```typescript
import { authorize } from '../middleware/auth'

router.get('/workspaces/:workspaceId/chatflows', authorize({
  resourceType: 'chatflow',
  action: 'read',
  scopeType: 'workspace'
}), (req, res) => {
  // Only users with 'chatflow:read' permission in the current workspace can access this route
  res.json({ message: 'Workspace chatflows' })
})
```

## Error Handling

The middleware provides standardized error responses for authentication and authorization failures:

- **401 Unauthorized**: When authentication is required but not provided
- **403 Forbidden**: When the user doesn't have permission to perform an action
- **500 Internal Server Error**: When an error occurs during authentication or authorization