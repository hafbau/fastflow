# Supabase Authentication Setup

This document provides instructions for setting up and configuring Supabase authentication for the Flowstack application.

> **Note:** For detailed information about the architectural design of the Supabase Auth integration after the recent refactoring, please refer to the [Supabase Auth Architecture](../../../docs/supabase-auth-architecture.md) document.

## Overview

Flowstack now supports Supabase authentication as an alternative to the existing basic auth and API key authentication methods. Supabase provides a robust authentication system with features like:

- Email/password authentication
- Magic link authentication
- OAuth providers (Google, GitHub, etc.)
- Multi-factor authentication (MFA)
- User management
- Role-based access control

The integration is designed to work alongside the existing authentication methods, providing a smooth transition path for existing users.

## Architecture

The Supabase Auth integration follows a clean architecture with a one-way dependency relationship:

- **`packages/client`**: A specialized TypeScript package that contains all the core Supabase Auth logic, interfaces, and utilities
- **`packages/ui`**: The main React frontend UI package in JavaScript that uses the client package

This separation allows for better code organization, improved type safety, and easier testing and maintenance. For more details, see the [Supabase Auth Architecture](../../../docs/supabase-auth-architecture.md) document.

## Prerequisites

1. A Supabase account (free tier is sufficient for development)
2. A Supabase project
3. Node.js 18.15.0 or higher

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Note down your project URL, anon key, and service role key

### 2. Configure Environment Variables

Add the following environment variables to your `.env` file:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Configure Supabase Auth Settings

In the Supabase dashboard:

1. Go to Authentication > Settings
2. Configure the Site URL to match your application URL
3. Configure redirect URLs for authentication flows
4. Enable/disable the authentication providers you want to use

### 4. Email Templates

The application includes custom email templates for various authentication flows:

- Email confirmation
- Password reset
- Magic link authentication
- MFA verification
- User invitation

These templates are automatically configured when the application starts. You can customize them by modifying the HTML files in `packages/server/src/templates/emails/`.

## Usage

### Authentication Flow

The authentication middleware now checks for authentication in the following order:

1. Supabase JWT token
2. API key
3. Basic auth (if configured)

If any of these methods succeed, the request is allowed to proceed.

### Using the Client Package

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

### User Management

You can manage users through the Supabase dashboard or programmatically using the client package. The package provides utility functions for common user management tasks:

- `signUp`: Register a new user
- `signInWithPassword`: Sign in a user with email and password
- `signInWithMagicLink`: Sign in a user with a magic link
- `signInWithProvider`: Sign in a user with an OAuth provider
- `signOut`: Sign out a user
- `resetPassword`: Send a password reset email
- `updatePassword`: Update a user's password
- `updateProfile`: Update a user's profile
- `updateEmail`: Update a user's email

## Backward Compatibility

The Supabase integration is designed to work alongside the existing authentication methods. Existing API keys and basic auth credentials will continue to work.

For more information on the compatibility layer, see the [Authentication Compatibility Layer](./auth-compatibility.md) document.

## Security Considerations

- The service role key has admin privileges and should be kept secure
- JWT tokens are validated on each request
- User passwords are securely hashed by Supabase
- MFA can be enabled for additional security

## Troubleshooting

If you encounter issues with Supabase authentication:

1. Check that the environment variables are correctly set
2. Verify that the Supabase project is properly configured
3. Check the application logs for error messages
4. Ensure that the email templates are correctly formatted

## Next Steps

After setting up Supabase authentication, you may want to:

1. Configure additional authentication providers
2. Set up row-level security (RLS) policies in Supabase
3. Implement user roles and permissions
4. Add custom claims to JWT tokens

For more information, refer to the [Supabase documentation](https://supabase.com/docs).