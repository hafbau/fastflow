# Invitation System API

This document describes the API for the new unified invitation system in Flowstack.

## Overview

The invitation system allows administrators to invite users to join organizations and workspaces. The API provides endpoints for creating, retrieving, updating, and accepting invitations.

## Endpoints

### Organization Invitations

#### Get all invitations for an organization

```
GET /organizations/:id/invitations
```

**Query Parameters:**
- `includeWorkspaceInvitations` (boolean, optional): If true, includes invitations to workspaces within the organization.

**Response:**
```json
[
  {
    "id": "uuid",
    "organizationId": "uuid",
    "workspaceId": null,
    "email": "user@example.com",
    "role": "member",
    "status": "pending",
    "token": "uuid",
    "expiresAt": "2023-06-01T00:00:00.000Z",
    "invitedBy": "uuid",
    "createdAt": "2023-05-25T00:00:00.000Z",
    "updatedAt": "2023-05-25T00:00:00.000Z",
    "organization": {
      "id": "uuid",
      "name": "Organization Name",
      "slug": "organization-slug"
    }
  }
]
```

#### Create an organization invitation

```
POST /organizations/:id/invitations
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "role": "member"
}
```

**Response:**
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "workspaceId": null,
  "email": "user@example.com",
  "role": "member",
  "status": "pending",
  "token": "uuid",
  "expiresAt": "2023-06-01T00:00:00.000Z",
  "invitedBy": "uuid",
  "createdAt": "2023-05-25T00:00:00.000Z",
  "updatedAt": "2023-05-25T00:00:00.000Z",
  "organization": {
    "id": "uuid",
    "name": "Organization Name",
    "slug": "organization-slug"
  }
}
```

### Workspace Invitations

#### Get all invitations for a workspace

```
GET /workspaces/:id/invitations
```

**Response:**
```json
[
  {
    "id": "uuid",
    "organizationId": "uuid",
    "workspaceId": "uuid",
    "email": "user@example.com",
    "role": "editor",
    "status": "pending",
    "token": "uuid",
    "expiresAt": "2023-06-01T00:00:00.000Z",
    "invitedBy": "uuid",
    "createdAt": "2023-05-25T00:00:00.000Z",
    "updatedAt": "2023-05-25T00:00:00.000Z",
    "organization": {
      "id": "uuid",
      "name": "Organization Name",
      "slug": "organization-slug"
    },
    "workspace": {
      "id": "uuid",
      "name": "Workspace Name",
      "slug": "workspace-slug"
    }
  }
]
```

#### Create a workspace invitation

```
POST /workspaces/:id/invitations
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "role": "editor"
}
```

**Response:**
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "workspaceId": "uuid",
  "email": "user@example.com",
  "role": "editor",
  "status": "pending",
  "token": "uuid",
  "expiresAt": "2023-06-01T00:00:00.000Z",
  "invitedBy": "uuid",
  "createdAt": "2023-05-25T00:00:00.000Z",
  "updatedAt": "2023-05-25T00:00:00.000Z",
  "organization": {
    "id": "uuid",
    "name": "Organization Name",
    "slug": "organization-slug"
  },
  "workspace": {
    "id": "uuid",
    "name": "Workspace Name",
    "slug": "workspace-slug"
  }
}
```

### Common Invitation Operations

#### Get invitation by ID

```
GET /invitations/:invitationId
```

**Response:**
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "workspaceId": "uuid or null",
  "email": "user@example.com",
  "role": "member",
  "status": "pending",
  "token": "uuid",
  "expiresAt": "2023-06-01T00:00:00.000Z",
  "invitedBy": "uuid",
  "createdAt": "2023-05-25T00:00:00.000Z",
  "updatedAt": "2023-05-25T00:00:00.000Z",
  "organization": {
    "id": "uuid",
    "name": "Organization Name",
    "slug": "organization-slug"
  },
  "workspace": {
    "id": "uuid",
    "name": "Workspace Name",
    "slug": "workspace-slug"
  }
}
```

#### Get invitation by token

```
GET /invitations/token/:token
```

**Response:**
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "workspaceId": "uuid or null",
  "email": "user@example.com",
  "role": "member",
  "status": "pending",
  "token": "uuid",
  "expiresAt": "2023-06-01T00:00:00.000Z",
  "invitedBy": "uuid",
  "createdAt": "2023-05-25T00:00:00.000Z",
  "updatedAt": "2023-05-25T00:00:00.000Z",
  "organization": {
    "id": "uuid",
    "name": "Organization Name",
    "slug": "organization-slug"
  },
  "workspace": {
    "id": "uuid",
    "name": "Workspace Name",
    "slug": "workspace-slug"
  }
}
```

#### Accept an invitation

```
POST /invitations/:token/accept
```

**Response:**
```json
{
  "message": "Invitation accepted successfully"
}
```

#### Cancel an invitation

```
DELETE /invitations/:invitationId
```

**Response:**
```
204 No Content
```

#### Resend an invitation

```
POST /invitations/:invitationId/resend
```

**Response:**
```json
{
  "message": "Invitation resent successfully"
}
```

## Error Responses

### General Errors

```json
{
  "error": "Error message"
}
```

### Common Error Status Codes

- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Conflict with existing resource
- `500 Internal Server Error`: Server error

## Notes for Frontend Implementation

1. The invitation URL format for email links is: `{FRONTEND_URL}/invitations/{token}`

2. When accepting an invitation, the user must be authenticated. If they're not already registered, they should be prompted to register first.

3. The frontend should handle expired invitations by showing an appropriate message.

4. For pending invitations, check the expiration date (`expiresAt`) to show appropriate UI.

5. Invitation status values:
   - `pending`: Invitation has been sent but not yet accepted
   - `accepted`: Invitation has been accepted by the user
   - `canceled`: Invitation has been canceled by an admin

6. Use the `invitationType` computed property to determine whether an invitation is for an organization or workspace.

7. When displaying invitations, you can show who sent the invitation by looking up the user referenced by `invitedBy`.

8. For workspace invitations, note that accepting the invitation will also add the user to the parent organization if they're not already a member.