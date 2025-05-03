import React, { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAuth } from '../hooks/useAuth';
import {
  AuthResult,
  SignUpRequest,
  SignInWithPasswordRequest,
  SignInWithMagicLinkRequest,
  SignInWithProviderRequest,
  PasswordResetRequest,
  PasswordUpdateRequest,
  ProfileUpdateRequest,
  EmailUpdateRequest
} from '../types/auth';

// Define the auth context type
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (request: SignUpRequest) => Promise<AuthResult>;
  signInWithPassword: (request: SignInWithPasswordRequest) => Promise<AuthResult>;
  signInWithMagicLink: (request: SignInWithMagicLinkRequest) => Promise<AuthResult>;
  signInWithProvider: (request: SignInWithProviderRequest) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  resetPassword: (request: PasswordResetRequest) => Promise<AuthResult>;
  updatePassword: (request: PasswordUpdateRequest) => Promise<AuthResult>;
  updateProfile: (request: ProfileUpdateRequest) => Promise<AuthResult>;
  updateEmail: (request: EmailUpdateRequest) => Promise<AuthResult>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the auth provider
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth provider component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use the auth context
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

/**
 * Simplified auth functions for direct import
 */
export const getAuthFunctions = () => {
  const {
    signUp,
    signInWithPassword,
    signInWithMagicLink,
    signInWithProvider,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    updateEmail
  } = useAuthContext();

  return {
    signUp,
    signInWithPassword,
    signInWithMagicLink,
    signInWithProvider,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    updateEmail
  };
};