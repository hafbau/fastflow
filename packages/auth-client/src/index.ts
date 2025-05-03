/**
 * Main entry point for the auth-client package
 */

// Export auth types
export * from './types/auth';

// Export identity provider types with explicit naming to avoid conflicts
import * as IdentityProviderTypes from './types/identityProvider';
export { IdentityProviderTypes };

// Export auth utilities
export * from './utils/auth';

// Export auth services
export * from './services/AuthService';

// Export identity provider service with explicit naming to avoid conflicts
import { IdentityProviderService, identityProviderService } from './services/IdentityProviderService';
export { IdentityProviderService, identityProviderService };

// Export auth hooks
export * from './hooks/useAuth';
export * from './hooks/useOrganization';

// Export auth contexts
export * from './contexts/AuthContext';

// Export individual auth functions for convenience
export {
  getCurrentUser,
  getSession,
  isAuthenticated,
  signUp,
  signInWithPassword,
  signInWithMagicLink,
  signOut,
  resetPassword,
  updatePassword,
  updateProfile,
  updateEmail
} from './utils/auth';