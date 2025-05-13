import { User, Session, AuthError, Provider } from '@supabase/supabase-js';

/**
 * Authentication result interface
 */
export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

/**
 * User profile interface
 */
export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Authentication state interface
 */
export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  currentOrganizationId: string | null;
  currentWorkspaceId: string | null;
  workspacePermissions: Record<string, any> | null;
}

/**
 * Password reset request interface
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password update request interface
 */
export interface PasswordUpdateRequest {
  password: string;
}

/**
 * Email update request interface
 */
export interface EmailUpdateRequest {
  email: string;
}

/**
 * Profile update request interface
 */
export interface ProfileUpdateRequest {
  fullName?: string;
  metadata?: Record<string, any>;
}

/**
 * Sign up request interface
 */
export interface SignUpRequest {
  email: string;
  password: string;
  fullName?: string;
  metadata?: Record<string, any>;
}

/**
 * Sign in with password request interface
 */
export interface SignInWithPasswordRequest {
  email: string;
  password: string;
}

/**
 * Sign in with magic link request interface
 */
export interface SignInWithMagicLinkRequest {
  email: string;
}

/**
 * Sign in with OAuth provider request interface
 */
export interface SignInWithProviderRequest {
  provider: Provider;
  redirectTo?: string;
}

/**
 * Identity provider session interface
 */
export interface IdentityProviderSession {
  id: string;
  providerId: string;
  userId?: string;
  externalId: string;
  active: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Workspace permission interface
 */
export interface WorkspacePermission {
  resource: string;
  action: string;
  allowed: boolean;
}