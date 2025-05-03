# Flowstack Auth Client

This package provides authentication and identity provider functionality for Flowstack applications.

## Features

- Authentication with Supabase
- User management
- Identity provider integration
- React hooks and context for easy integration

## Installation

```bash
npm install @flowstack/auth-client
# or
yarn add @flowstack/auth-client
# or
pnpm add @flowstack/auth-client
```

## Usage

### Basic Authentication

```tsx
import { AuthProvider, useAuth } from '@flowstack/auth-client';

// Wrap your application with the AuthProvider
function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}

// Use the auth hook in your components
function LoginComponent() {
  const { signInWithPassword, isLoading, isAuthenticated } = useAuth();

  const handleLogin = async (email, password) => {
    const result = await signInWithPassword({ email, password });
    if (result.error) {
      console.error('Login failed:', result.error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>You are logged in!</p>
      ) : (
        <button onClick={() => handleLogin('user@example.com', 'password')} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Login'}
        </button>
      )}
    </div>
  );
}
```

### Identity Provider Integration

```tsx
import { identityProviderService } from '@flowstack/auth-client';

// Get all identity providers for an organization
const providers = await identityProviderService.getProvidersForOrganization('org-id');

// Initiate authentication with an identity provider
const redirectUrl = await identityProviderService.initiateAuthentication('provider-id');
window.location.href = redirectUrl;
```

## API Reference

### Auth Hooks

- `useAuth()` - Hook for authentication functionality
- `useAuthContext()` - Hook to use the auth context
- `useOrganization(organizationId)` - Hook to fetch and manage organization data

### Auth Services

- `authService` - Service for authentication operations
- `identityProviderService` - Service for identity provider operations

## License

MIT