# Invitation System Implementation

## Overview

This document provides a technical overview of the unified invitation system implementation in Flowstack.

## Components Implemented

### 1. Database Migrations

Created a new `invitation` table in all supported database types (SQLite, PostgreSQL, MySQL, MariaDB) with the following schema:

```sql
CREATE TABLE invitation (
  id VARCHAR PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  token VARCHAR(255) UNIQUE,
  expiresAt TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending',
  invitedBy VARCHAR NULL,
  organizationId VARCHAR NOT NULL,
  workspaceId VARCHAR NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizationId) REFERENCES organization(id) ON DELETE CASCADE,
  FOREIGN KEY (workspaceId) REFERENCES workspace(id) ON DELETE CASCADE
);
```

Indexes created for:
- token (unique)
- organizationId + email (for efficient lookup)
- workspaceId + email (for efficient lookup)

### 2. Entity Relationships

Created a new `Invitation` entity with:
- TypeORM entity definition with proper column types
- ManyToOne relationships with Organization and Workspace
- Computed property for invitation type (organization/workspace)

Updated the Organization and Workspace entities with:
- OneToMany relationship to Invitation

### 3. Service Layer

Implemented the InvitationService class with:
- Lazy initialization pattern using ensureInitialized method
- Error handling and logging
- Methods for:
  - Getting organization and workspace invitations
  - Creating invitations
  - Updating invitations
  - Canceling invitations
  - Resending invitations
  - Accepting invitations
  - Handling both organization and workspace invitations in a unified way

### 4. Controller Layer

Implemented the InvitationsController with:
- Methods for all invitation operations
- Proper request validation
- Error handling and responses
- Email sending integration
- Automatic handling of organization membership when accepting workspace invitations

### 5. Routes

Created routes for:
- Organization invitations: `/organizations/:id/invitations`
- Workspace invitations: `/workspaces/:id/invitations`
- General invitation operations: `/invitations/:id`, `/invitations/token/:token`, etc.

### 6. Email Templates

Enhanced the email template with:
- Organization name
- Workspace name (if applicable)
- Inviter name
- Inviter avatar (optional)
- Better styling and clarity

### 7. Testing

Implemented tests for:
- Unit tests for InvitationService
- Integration tests for the entire invitation flow

## Code Structure

```
src/
├── database/
│   ├── entities/
│   │   ├── Invitation.ts  # New unified entity
│   │   ├── Organization.ts  # Updated with relationship
│   │   └── Workspace.ts  # Updated with relationship
│   └── migrations/
│       └── */
│           └── 1746950000000-CreateInvitationTable.ts  # Migration for each DB type
├── services/
│   └── invitations/
│       └── index.ts  # InvitationService class
├── controllers/
│   └── invitations/
│       └── index.ts  # InvitationsController
├── routes/
│   └── invitations/
│       └── index.ts  # Route definitions
├── utils/
│   ├── emailService.ts  # Updated to include inviter information
│   └── emailTemplates.ts  # Enhanced template with better styling
└── tests/
    ├── invitation.test.ts  # Unit tests
    └── invitation-system.test.ts  # Integration tests
```

## Migration Plan

The new system is designed to replace the existing separate Organization and Workspace invitation systems. We've taken the following approach:

1. Built the new system alongside the existing one
2. Created comprehensive tests to verify functionality
3. Updated the reference documentation

After verification in testing environments:
1. Redirect old routes to the new system
2. Update frontend to use the new API
3. Delete the deprecated code after successful migration

## Next Steps

1. Verify the implementation in a testing environment
2. Complete data migration from the old invitation tables to the new unified table
3. Fully remove the deprecated code
4. Update frontend to use the new API

## API Documentation

See the [Invitations API documentation](./invitations-api.md) for details on the available endpoints and usage.