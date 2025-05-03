import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
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

/**
 * Authentication service for Supabase
 */
export class AuthService {
  private supabase: SupabaseClient;
  private static instance: AuthService;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Get Supabase URL and anon key from environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    // Create Supabase client
    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      }
    });

    // Set up auth state change listener
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        
        // Clear organization and workspace context
        localStorage.removeItem('currentOrganizationId');
        localStorage.removeItem('currentWorkspaceId');
      }
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Get the Supabase client
   */
  public getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Get the current user
   * @returns Current user or null
   */
  public async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get the current session
   * @returns Current session or null
   */
  public async getSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Sign up with email and password
   * @param request Sign up request
   * @returns Auth result
   */
  public async signUp(request: SignUpRequest): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: request.email,
        password: request.password,
        options: {
          data: {
            full_name: request.fullName,
            ...request.metadata
          }
        }
      });

      return {
        user: data?.user || null,
        session: data?.session || null,
        error
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        user: null,
        session: null,
        error: error as any
      };
    }
  }

  /**
   * Sign in with email and password
   * @param request Sign in request
   * @returns Auth result
   */
  public async signInWithPassword(request: SignInWithPasswordRequest): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: request.email,
        password: request.password
      });

      return {
        user: data?.user || null,
        session: data?.session || null,
        error
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        user: null,
        session: null,
        error: error as any
      };
    }
  }

  /**
   * Sign in with magic link
   * @param request Magic link request
   * @returns Auth result
   */
  public async signInWithMagicLink(request: SignInWithMagicLinkRequest): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.signInWithOtp({
        email: request.email
      });

      return {
        user: null, // Magic link doesn't return a user immediately
        session: null,
        error
      };
    } catch (error) {
      console.error('Magic link error:', error);
      return {
        user: null,
        session: null,
        error: error as any
      };
    }
  }

  /**
   * Sign in with OAuth provider
   * @param request Provider request
   * @returns Auth result
   */
  public async signInWithProvider(request: SignInWithProviderRequest): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: request.provider,
        options: {
          redirectTo: request.redirectTo
        }
      });

      return {
        user: null, // OAuth doesn't return a user immediately
        session: null,
        error
      };
    } catch (error) {
      console.error('OAuth sign in error:', error);
      return {
        user: null,
        session: null,
        error: error as any
      };
    }
  }

  /**
   * Sign out the current user
   * @returns Auth result
   */
  public async signOut(): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.signOut();

      return {
        user: null,
        session: null,
        error
      };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        user: null,
        session: null,
        error: error as any
      };
    }
  }

  /**
   * Reset password
   * @param request Password reset request
   * @returns Auth result
   */
  public async resetPassword(request: PasswordResetRequest): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(
        request.email
      );

      return {
        user: null,
        session: null,
        error
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        user: null,
        session: null,
        error: error as any
      };
    }
  }

  /**
   * Update password
   * @param request Password update request
   * @returns Auth result
   */
  public async updatePassword(request: PasswordUpdateRequest): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.updateUser({
        password: request.password
      });

      return {
        user: data?.user || null,
        session: null,
        error
      };
    } catch (error) {
      console.error('Password update error:', error);
      return {
        user: null,
        session: null,
        error: error as any
      };
    }
  }

  /**
   * Update user profile
   * @param request Profile update request
   * @returns Auth result
   */
  public async updateProfile(request: ProfileUpdateRequest): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.updateUser({
        data: {
          full_name: request.fullName,
          ...request.metadata
        }
      });

      return {
        user: data?.user || null,
        session: null,
        error
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        user: null,
        session: null,
        error: error as any
      };
    }
  }

  /**
   * Update email
   * @param request Email update request
   * @returns Auth result
   */
  public async updateEmail(request: EmailUpdateRequest): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.updateUser({
        email: request.email
      });

      return {
        user: data?.user || null,
        session: null,
        error
      };
    } catch (error) {
      console.error('Email update error:', error);
      return {
        user: null,
        session: null,
        error: error as any
      };
    }
  }

  /**
   * Check if user is authenticated
   * @returns True if authenticated
   */
  public async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!session;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();