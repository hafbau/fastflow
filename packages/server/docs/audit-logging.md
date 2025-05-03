# Audit Logging System

The audit logging system provides comprehensive tracking of all access-related events, authentication activities, and resource modifications within the application. This documentation outlines the architecture, implementation details, and usage guidelines for the audit logging system.

## Overview

The audit logging system is designed to:

- Track all authentication events (login, logout, registration, etc.)
- Log authorization checks and permission verifications
- Record resource modifications with before/after values
- Provide immutable and secure audit trails
- Support filtering and searching of audit logs
- Enable export of audit logs for compliance reporting

## Architecture

The audit logging system consists of the following components:

1. **AuditLog Entity**: Database model for storing audit log records
2. **AuditLogsService**: Service for creating and retrieving audit logs
3. **Audit Logging Middleware**: Middleware for automatically capturing events
4. **AuditLogController**: API endpoints for retrieving and exporting logs
5. **UI Components**: Interface for viewing and searching audit logs

## Database Schema

The `audit_logs` table stores all audit events with the following structure:

| Column        | Type      | Description                                   |
|---------------|-----------|-----------------------------------------------|
| id            | UUID      | Primary key                                   |
| userId        | UUID      | User who performed the action (nullable)      |
| action        | VARCHAR   | Action performed (e.g., user_login, create)   |
| resourceType  | VARCHAR   | Type of resource (e.g., user, chatflow)       |
| resourceId    | VARCHAR   | ID of the affected resource (nullable)        |
| metadata      | JSONB     | Additional context data                       |
| ipAddress     | VARCHAR   | IP address of the request (nullable)          |
| timestamp     | TIMESTAMP | When the action occurred                      |
| createdAt     | TIMESTAMP | When the log was created                      |

## Audit Log Types

The system logs several types of events:

### Authentication Events

- `user_register`: User registration
- `user_login`: User login
- `user_logout`: User logout
- `password_reset_request`: Password reset request
- `password_update`: Password update
- `magic_link_request`: Magic link authentication request

### Authorization Events

- `permission_check`: Permission verification
- `api_access`: API endpoint access

### Resource Events

Resource events follow the pattern `{resourceType}_{action}`, for example:

- `user_create`: User creation
- `user_update`: User update
- `user_delete`: User deletion
- `chatflow_create`: Chatflow creation
- `chatflow_update`: Chatflow update
- `chatflow_delete`: Chatflow deletion

## Middleware Usage

The audit logging system provides several middleware functions for capturing events:

### Authentication Events

```typescript
import { logAuthEvent } from '../middlewares/auditLogger'

// Example: Log user login
router.post('/login', logAuthEvent('user_login'), loginController)
```

### Authorization Events

```typescript
import { logAuthorizationEvent } from '../middlewares/auditLogger'

// Example: Log permission check
router.get('/resource', checkPermission, logAuthorizationEvent('permission_check'), getResourceController)
```

### Resource Modification Events

```typescript
import { logResourceEvent, captureResourceBefore } from '../middlewares/auditLogger'

// Example: Log resource update with before/after values
router.put('/resource/:id',
  captureResourceBefore((id) => resourceService.getById(id)),
  logResourceEvent('resource', 'update'),
  updateResourceController
)
```

## API Endpoints

The audit logging system provides the following API endpoints:

### Get Audit Logs

```
GET /api/v1/audit-logs
```

Query parameters:
- `userId`: Filter by user ID
- `action`: Filter by action
- `resourceType`: Filter by resource type
- `resourceId`: Filter by resource ID
- `startDate`: Filter by start date
- `endDate`: Filter by end date
- `limit`: Number of logs to return (default: 10)
- `offset`: Pagination offset (default: 0)

### Get Audit Log by ID

```
GET /api/v1/audit-logs/:id
```

### Export Audit Logs as CSV

```
GET /api/v1/audit-logs/export
```

Supports the same query parameters as the Get Audit Logs endpoint.

## UI Interface

The audit logs UI provides a comprehensive interface for:

- Viewing audit logs with filtering and pagination
- Searching for specific events
- Viewing detailed information about each event
- Exporting logs for compliance reporting

## Permissions

The following permissions control access to audit logs:

- `audit:read`: Permission to view audit logs
- `audit:create`: Permission to create audit logs (system use only)

## Best Practices

1. **Sensitive Data**: Avoid logging sensitive information in the metadata field
2. **Performance**: The audit logging system is designed to be non-blocking, but excessive logging can impact performance
3. **Retention**: Implement a retention policy for audit logs based on compliance requirements
4. **Monitoring**: Regularly review audit logs for suspicious activity

## Integration with SOC2 Compliance

The audit logging system is designed to support SOC2 compliance requirements:

- **Security**: Tracks authentication and authorization events
- **Availability**: Monitors system access and usage
- **Processing Integrity**: Records resource modifications with before/after values
- **Confidentiality**: Restricts access to audit logs based on permissions
- **Privacy**: Ensures proper tracking of data access and modifications

## Troubleshooting

Common issues and solutions:

1. **Missing Logs**: Ensure the middleware is properly configured on all routes
2. **Performance Issues**: Review the volume of logs being generated and consider optimizing
3. **Database Size**: Implement a retention policy to manage database growth

## Future Enhancements

Planned enhancements for the audit logging system:

1. Real-time alerts for suspicious activities
2. Advanced analytics and reporting
3. Integration with external SIEM systems
4. Automated compliance reporting