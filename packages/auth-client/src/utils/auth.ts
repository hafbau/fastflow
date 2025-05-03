import { authService } from '../services/AuthService';
import { identityProviderService } from '../services/IdentityProviderService';
import { useAuth } from '../hooks/useAuth';
import { AuthProvider, useAuthContext } from '../contexts/AuthContext';
import {
  AuthResult,
  AuthState,
  UserProfile,
  SignUpRequest,
  SignInWithPasswordRequest,
  SignInWithMagicLinkRequest,
  SignInWithProviderRequest,
  PasswordResetRequest,
  PasswordUpdateRequest,
  ProfileUpdateRequest,
  EmailUpdateRequest,
  IdentityProviderSession
} from '../types/auth';

// Re-export everything for easy imports
export {
  authService,
  identityProviderService,
  useAuth,
  AuthProvider,
  useAuthContext,
  // Types
  AuthResult,
  AuthState,
  UserProfile,
  SignUpRequest,
  SignInWithPasswordRequest,
  SignInWithMagicLinkRequest,
  SignInWithProviderRequest,
  PasswordResetRequest,
  PasswordUpdateRequest,
  ProfileUpdateRequest,
  EmailUpdateRequest,
  IdentityProviderSession
};

// Re-export identity provider types
export type {
  IdentityProviderConfig,
  IdentityProviderAttribute
} from '../services/IdentityProviderService';

// Direct access to auth functions for simpler imports
export const getCurrentUser = authService.getCurrentUser.bind(authService);
export const getSession = authService.getSession.bind(authService);
export const isAuthenticated = authService.isAuthenticated.bind(authService);

// These functions are provided for backward compatibility with the old implementation
export const signUp = async (email: string, password: string, fullName?: string) => {
  return authService.signUp({ email, password, fullName });
};

export const signInWithPassword = async (email: string, password: string) => {
  return authService.signInWithPassword({ email, password });
};

export const signInWithMagicLink = async (email: string) => {
  return authService.signInWithMagicLink({ email });
};

export const signOut = async () => {
  return authService.signOut();
};

export const resetPassword = async (email: string) => {
  return authService.resetPassword({ email });
};

export const updatePassword = async (password: string) => {
  return authService.updatePassword({ password });
};

export const updateProfile = async (fullName: string, metadata?: Record<string, any>) => {
  return authService.updateProfile({ fullName, metadata });
};

export const updateEmail = async (email: string) => {
  return authService.updateEmail({ email });
};

// Export the Supabase client for direct access if needed
export const supabase = authService.getSupabaseClient();