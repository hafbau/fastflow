# Authentication Compatibility Layer

This document describes the authentication compatibility layer that allows both Supabase Auth and the existing authentication mechanisms (Basic Auth and API Key) to work together seamlessly.

> **Note:** For detailed information about the architectural design of the Supabase Auth integration after the recent refactoring, please refer to the [Supabase Auth Architecture](../../../docs/supabase-auth-architecture.md) document.

## Overview

The authentication system now supports three authentication methods:

1. **Supabase Auth**: JWT token-based authentication using Supabase Auth
2. **API Key Authentication**: Bearer token authentication using API keys
3. **Basic Auth**: Username/password authentication using environment variables

The compatibility layer ensures that all three methods can work together, providing a smooth transition path from the existing authentication system to Supabase Auth.

## Architecture

The Supabase Auth integration follows a clean architecture with a one-way dependency relationship:

- **`packages/client`**: A specialized TypeScript package that contains all the core Supabase Auth logic, interfaces, and utilities
- **`packages/ui`**: The main React frontend UI package in JavaScript that uses the client package

This separation allows for better code organization, improved type safety, and easier testing and maintenance. For more details, see the [Supabase Auth Architecture](../../../docs/supabase-auth-architecture.md) document.

## Authentication Flow

The authentication middleware checks for credentials in the following order (by default):

1. Supabase JWT token in the Authorization header
2. API key in the Authorization header
3. Basic Auth credentials in the Authorization header

This order can be customized using the configuration options described below.

## Configuration Options

The authentication system can be configured using environment variables:

```
# Authentication Feature Flags
ENABLE_SUPABASE_AUTH=true             # Enable Supabase Auth
SUPABASE_AUTH_PRIMARY=true            # Use Supabase Auth as primary auth method
ENABLE_API_KEY_AUTH=true              # Enable API Key authentication
API_KEY_REQUIRE_USER=false            # Require API keys to be associated with a user
ENABLE_INTERNAL_REQUEST=true          # Enable internal request authentication
INTERNAL_REQUEST_REQUIRE_AUTH=false   # Require authentication for internal requests
ENABLE_AUTH_MIGRATION_TOOLS=false     # Enable authentication migration tools
ENABLE_AUTH_TRANSITION_UI=false       # Enable authentication transition UI

# API Key Storage
APIKEY_STORAGE_TYPE=database          # API key storage type: 'json' or 'database'
APIKEY_PATH=                          # Path to store API keys JSON file

# Basic Auth
FASTFLOW_USERNAME=                    # Username for basic auth
FASTFLOW_PASSWORD=                    # Password for basic auth
```

## API Key Storage

API keys can be stored in two ways:

1. **JSON File**: The original storage method, using a JSON file on disk
2. **Database**: The new storage method, using the database

To migrate from file-based storage to database storage:

1. Set `APIKEY_STORAGE_TYPE=database` in your environment variables
2. Run the migration script: `ts-node src/scripts/migrateApiKeys.ts`

## API Key Association with Supabase Users

API keys can now be associated with Supabase users, which provides several benefits:

1. API keys inherit permissions from the associated user
2. API key usage can be tracked and audited per user
3. API keys can be automatically revoked when a user is deactivated

To associate an existing API key with a Supabase user:

```typescript
import apiKeyService from '../services/apiKeyService'

// Associate API key with Supabase user
await apiKeyService.associateWithSupabaseUser(apiKeyId, supabaseUserId)
```

## Migration Path

### Phase 1: Add Supabase Auth alongside existing authentication

1. Set up Supabase Auth (see [supabase-setup.md](./supabase-setup.md))
2. Configure the authentication compatibility layer
3. Set `ENABLE_SUPABASE_AUTH=true` and `SUPABASE_AUTH_PRIMARY=false`
4. Keep existing authentication methods enabled

During this phase, both authentication systems will work in parallel. New users will be created in Supabase Auth, but existing API keys and Basic Auth will continue to work.

### Phase 2: Migrate API keys to database and associate with Supabase users

1. Set `APIKEY_STORAGE_TYPE=database` in your environment variables
2. Run the migration script: `ts-node src/scripts/migrateApiKeys.ts`
3. Associate existing API keys with Supabase users

During this phase, API keys will be stored in the database and associated with Supabase users. This allows for better tracking and permission management.

### Phase 3: Make Supabase Auth the primary authentication method

1. Set `SUPABASE_AUTH_PRIMARY=true` in your environment variables
2. Set `API_KEY_REQUIRE_USER=true` to require API keys to be associated with Supabase users

During this phase, Supabase Auth will be the primary authentication method, but API keys and Basic Auth will still work as fallbacks.

### Phase 4: Disable legacy authentication methods

1. Set `ENABLE_API_KEY_AUTH=false` to disable API key authentication
2. Remove `FASTFLOW_USERNAME` and `FASTFLOW_PASSWORD` to disable Basic Auth

During this phase, only Supabase Auth will be used for authentication.

## Internal Requests

Internal requests (requests with the `x-request-from: internal` header) can be configured to:

1. Require authentication using Basic Auth
2. Allow without authentication

This is controlled by the `ENABLE_INTERNAL_REQUEST` and `INTERNAL_REQUEST_REQUIRE_AUTH` environment variables.

## Whitelist URLs

Certain URLs are whitelisted and do not require authentication:

```javascript
export const WHITELIST_URLS = [
    '/api/v1/verify/apikey/',
    '/api/v1/chatflows/apikey/',
    '/api/v1/public-chatflows',
    // ... other whitelist URLs
]
```

These URLs can be accessed without authentication, regardless of the authentication configuration.

## API Key Management

The new API key service provides methods for managing API keys:

```typescript
import apiKeyService from '../services/apiKeyService'

// Create a new API key
const newKey = await apiKeyService.createApiKey(
    'My API Key',
    supabaseUserId,
    organizationId,
    workspaceId
)

// Get API keys for a Supabase user
const userKeys = await apiKeyService.getApiKeysForSupabaseUser(supabaseUserId)

// Validate an API key
const isValid = await apiKeyService.validateApiKey(apiKey)

// Delete an API key
await apiKeyService.deleteApiKey(apiKeyId)
```

## Using the Client Package

The `packages/client` package provides TypeScript interfaces, services, hooks, and utilities for authentication. To use these in your code:

```javascript
// Import from the client package
import { 
  authService, 
  useAuth, 
  AuthProvider 
} from '@flowstack/client';

// Use the auth service for authentication operations
const handleLogin = async (email, password) => {
  const result = await authService.signInWithPassword({ email, password });
  if (result.error) {
    console.error('Login error:', result.error);
  }
};

// Use the AuthProvider in your app
function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}

// Use the useAuth hook in your components
function Profile() {
  const { user, isAuthenticated, signOut } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

For more detailed examples and best practices, see the [Supabase Auth Architecture](../../../docs/supabase-auth-architecture.md) document.

## Testing

When testing the authentication system, you can use the following approaches:

1. **Supabase Auth**: Use the Supabase client to sign in and get a JWT token
2. **API Key**: Use an API key in the Authorization header
3. **Basic Auth**: Use Basic Auth credentials in the Authorization header

Example:

```javascript
// Supabase Auth
const { data } = await supabaseClient.auth.signInWithPassword({
    email: 'user@example.com',
    password: 'password'
})
const token = data.session.access_token
// Use token in Authorization header: Bearer <token>

// API Key
// Use API key in Authorization header: Bearer <api-key>

// Basic Auth
// Use Basic Auth in Authorization header: Basic <base64-encoded-username:password>
```

## Troubleshooting

If you encounter authentication issues:

1. Check the server logs for authentication-related messages
2. Verify that the correct environment variables are set
3. Ensure that the authentication method you're using is enabled
4. Check that the credentials are valid and properly formatted

Common issues:

- JWT token expired: Supabase tokens expire after a certain period
- API key not found: The API key may have been deleted or is invalid
- Basic Auth credentials incorrect: Check the environment variables
- API key requires user association: Set `API_KEY_REQUIRE_USER=false` or associate the key with a user