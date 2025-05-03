# Supabase Auth Developer Guide

This guide provides detailed information for developers on how to use the Supabase Auth integration after the architectural refactoring. It focuses on practical examples and best practices for working with the client package.

> **Note:** For a comprehensive overview of the architecture, please refer to the [Supabase Auth Architecture](./supabase-auth-architecture.md) document.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Using TypeScript Interfaces](#using-typescript-interfaces)
4. [Authentication Services](#authentication-services)
5. [React Integration](#react-integration)
6. [Identity Provider Integration](#identity-provider-integration)
7. [Common Use Cases](#common-use-cases)
8. [Troubleshooting](#troubleshooting)

## Introduction

The Supabase Auth integration has been refactored to improve maintainability, type safety, and reusability. The core authentication logic is now in the `packages/auth-client` TypeScript package, while the UI components are in the `packages/ui` JavaScript package.

This guide focuses on how to use the auth-client package in your development work.

## Getting Started

### Installation

The client package is already included in the project dependencies. You can import it directly in your code:

```javascript
// In JavaScript files
import { authService, useAuth } from '@flowstack/auth-client';

// In TypeScript files
import { authService, useAuth, UserProfile } from '@flowstack/auth-client';
```

### Basic Setup

To use the Supabase Auth integration in a React application, wrap your app with the `AuthProvider`:

```jsx
import { AuthProvider } from '@flowstack/auth-client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './views/auth/Login';
import Dashboard from './views/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

## Using TypeScript Interfaces

The client package provides TypeScript interfaces for auth-related data structures. These interfaces ensure type safety and provide better IDE support.

### Core Interfaces

```typescript
// Import types from the auth-client package
import {
  UserProfile,
  AuthState,
  AuthResult,
  SignUpRequest,
  SignInWithPasswordRequest,
  SignInWithMagicLinkRequest,
  SignInWithProviderRequest,
  PasswordResetRequest,
  PasswordUpdateRequest,
  ProfileUpdateRequest,
  EmailUpdateRequest
} from '@flowstack/auth-client';
```

### Example Usage

```typescript
// Define a user profile
const userProfile: UserProfile = {
  id: 'user-123',
  email: 'user@example.com',
  fullName: 'John Doe',
  avatarUrl: 'https://example.com/avatar.jpg',
  metadata: {
    role: 'admin',
    department: 'engineering'
  }
};

// Create a sign-up request
const signUpRequest: SignUpRequest = {
  email: 'user@example.com',
  password: 'password123',
  fullName: 'John Doe',
  metadata: {
    role: 'user',
    department: 'marketing'
  }
};

// Create a sign-in request
const signInRequest: SignInWithPasswordRequest = {
  email: 'user@example.com',
  password: 'password123'
};
```

### Using Interfaces in JavaScript

Even in JavaScript files, you can use JSDoc comments with TypeScript interfaces for better IDE support:

```javascript
/**
 * @typedef {import('@flowstack/auth-client').UserProfile} UserProfile
 * @typedef {import('@flowstack/auth-client').SignUpRequest} SignUpRequest
 */

/**
 * @param {SignUpRequest} request
 * @returns {Promise<UserProfile>}
 */
async function registerUser(request) {
  const result = await authService.signUp(request);
  return result.user;
}
```

## Authentication Services

The client package provides services for authentication operations. These services encapsulate the core authentication logic and provide a clean API for auth operations.

### AuthService

The `AuthService` class provides methods for user authentication, registration, and profile management:

```typescript
import { authService } from '@flowstack/auth-client';

// Sign up a new user
async function signUp(email, password, fullName) {
  const result = await authService.signUp({
    email,
    password,
    fullName
  });
  
  if (result.error) {
    console.error('Sign up error:', result.error);
    return null;
  }
  
  return result.user;
}

// Sign in with email and password
async function signIn(email, password) {
  const result = await authService.signInWithPassword({
    email,
    password
  });
  
  if (result.error) {
    console.error('Sign in error:', result.error);
    return false;
  }
  
  return true;
}

// Sign out
async function signOut() {
  const result = await authService.signOut();
  
  if (result.error) {
    console.error('Sign out error:', result.error);
    return false;
  }
  
  return true;
}

// Get the current user
async function getCurrentUser() {
  return await authService.getCurrentUser();
}

// Check if the user is authenticated
async function isAuthenticated() {
  return await authService.isAuthenticated();
}
```

### IdentityProviderService

The `IdentityProviderService` class provides methods for working with external identity providers:

```typescript
import { identityProviderService } from '@flowstack/auth-client';

// Get identity providers for an organization
async function getProvidersForOrganization(organizationId) {
  return await identityProviderService.getProvidersForOrganization(organizationId);
}

// Initiate authentication with an identity provider
async function initiateAuthentication(providerId) {
  try {
    const redirectUrl = await identityProviderService.initiateAuthentication(providerId);
    window.location.href = redirectUrl;
  } catch (error) {
    console.error('Authentication initiation error:', error);
  }
}

// Get user sessions
async function getUserSessions() {
  return await identityProviderService.getUserSessions();
}

// Logout from an identity provider
async function logoutFromProvider(providerId, sessionId) {
  try {
    await identityProviderService.logout(providerId, sessionId);
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}
```

## React Integration

The client package provides React hooks and context for accessing auth functionality in React components.

### useAuth Hook

The `useAuth` hook provides access to the authentication state and methods:

```jsx
import { useAuth } from '@flowstack/auth-client';

function ProfileComponent() {
  const {
    user,
    session,
    isLoading,
    isAuthenticated,
    signUp,
    signInWithPassword,
    signInWithMagicLink,
    signInWithProvider,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    updateEmail
  } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### AuthProvider

The `AuthProvider` component provides the authentication context to your application:

```jsx
import { AuthProvider } from '@flowstack/auth-client';

function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}
```

### Route Guards

You can create route guards using the `useAuth` hook:

```jsx
import { useAuth } from '@flowstack/auth-client';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

// Usage
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

## Identity Provider Integration

The client package provides support for external identity providers like SAML and OIDC.

### Setting Up Identity Providers

```jsx
import { identityProviderService, IdentityProviderTypes } from '@flowstack/auth-client';

// Create a component for identity provider selection
function IdentityProviderSelector({ organizationId }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadProviders() {
      try {
        const providerList = await identityProviderService.getProvidersForOrganization(organizationId);
        setProviders(providerList);
      } catch (error) {
        console.error('Error loading providers:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadProviders();
  }, [organizationId]);
  
  const handleProviderClick = async (providerId) => {
    try {
      const redirectUrl = await identityProviderService.initiateAuthentication(providerId);
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };
  
  if (loading) {
    return <div>Loading providers...</div>;
  }
  
  return (
    <div>
      <h2>Sign in with:</h2>
      <ul>
        {providers.map(provider => (
          <li key={provider.id}>
            <button onClick={() => handleProviderClick(provider.id)}>
              {provider.name} ({provider.type})
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Handling Identity Provider Callbacks

```jsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '@flowstack/auth-client';

function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    async function handleCallback() {
      try {
        // The Supabase client will automatically handle the callback
        // and update the session
        const session = await authService.getSession();
        
        if (session) {
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
      }
    }
    
    handleCallback();
  }, [navigate, location]);
  
  return <div>Processing authentication...</div>;
}
```

## Common Use Cases

### User Registration and Login

```jsx
import { useState } from 'react';
import { useAuth } from '@flowstack/auth-client';

function RegistrationForm() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await signUp({
        email,
        password,
        fullName
      });
      
      if (result.error) {
        setError(result.error.message);
      } else {
        // Registration successful
        alert('Registration successful! Please check your email to confirm your account.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <div>
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
```

### Password Reset

```jsx
import { useState } from 'react';
import { useAuth } from '@flowstack/client';

function PasswordResetForm() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await resetPassword({ email });
      
      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {success && (
        <div className="success">
          Password reset instructions have been sent to your email.
        </div>
      )}
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Reset Password'}
      </button>
    </form>
  );
}
```

### User Profile Management

```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '@flowstack/client';

function ProfileManagement() {
  const { user, updateProfile, updateEmail, updatePassword } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setEmail(user.email || '');
    }
  }, [user]);
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await updateProfile({ fullName });
      
      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await updateEmail({ email });
      
      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await updatePassword({ password });
      
      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccess(true);
        setPassword('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return <div>Please sign in to manage your profile.</div>;
  }
  
  return (
    <div>
      <h1>Profile Management</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">Profile updated successfully!</div>}
      
      <form onSubmit={handleProfileUpdate}>
        <h2>Update Profile</h2>
        <div>
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
      
      <form onSubmit={handleEmailUpdate}>
        <h2>Update Email</h2>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Email'}
        </button>
      </form>
      
      <form onSubmit={handlePasswordUpdate}>
        <h2>Update Password</h2>
        <div>
          <label htmlFor="password">New Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **Authentication state not updating**:
   - Make sure you're using the `AuthProvider` at the root of your application
   - Check that you're using the `useAuth` hook correctly

2. **TypeScript errors**:
   - Ensure you're importing the correct types from the client package
   - Check that you're using the types correctly in your code

3. **Authentication errors**:
   - Check the console for error messages
   - Verify that the Supabase project is properly configured
   - Ensure that the environment variables are correctly set

### Debugging

The client package includes logging for authentication operations. You can check the browser console for error messages and debugging information.

For more advanced debugging, you can use the browser's network tab to inspect the requests to the Supabase API.

### Getting Help

If you encounter issues that you can't resolve, check the following resources:

1. The [Supabase Auth Architecture](./supabase-auth-architecture.md) document
2. The [Supabase documentation](https://supabase.com/docs)
3. The project's issue tracker