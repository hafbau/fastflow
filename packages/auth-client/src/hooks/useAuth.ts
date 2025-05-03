import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/AuthService';
import {
  AuthState,
  SignUpRequest,
  SignInWithPasswordRequest,
  SignInWithMagicLinkRequest,
  SignInWithProviderRequest,
  PasswordResetRequest,
  PasswordUpdateRequest,
  ProfileUpdateRequest,
  EmailUpdateRequest,
  AuthResult
} from '../types/auth';

/**
 * Hook for authentication functionality
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false
  });

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const [user, session] = await Promise.all([
          authService.getCurrentUser(),
          authService.getSession()
        ]);

        setAuthState({
          user,
          session,
          isLoading: false,
          isAuthenticated: !!session
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false
        });
      }
    };

    initAuth();

    // Set up auth state change listener
    const { data: { subscription } } = authService.getSupabaseClient().auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const user = await authService.getCurrentUser();
          setAuthState({
            user,
            session,
            isLoading: false,
            isAuthenticated: true
          });
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false
          });
        } else if (event === 'USER_UPDATED') {
          const user = await authService.getCurrentUser();
          setAuthState(prev => ({
            ...prev,
            user,
            isLoading: false
          }));
        }
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up
  const signUp = useCallback(async (request: SignUpRequest): Promise<AuthResult> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const result = await authService.signUp(request);
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return result;
  }, []);

  // Sign in with password
  const signInWithPassword = useCallback(async (request: SignInWithPasswordRequest): Promise<AuthResult> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const result = await authService.signInWithPassword(request);
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return result;
  }, []);

  // Sign in with magic link
  const signInWithMagicLink = useCallback(async (request: SignInWithMagicLinkRequest): Promise<AuthResult> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const result = await authService.signInWithMagicLink(request);
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return result;
  }, []);

  // Sign in with provider
  const signInWithProvider = useCallback(async (request: SignInWithProviderRequest): Promise<AuthResult> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const result = await authService.signInWithProvider(request);
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return result;
  }, []);

  // Sign out
  const signOut = useCallback(async (): Promise<AuthResult> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const result = await authService.signOut();
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return result;
  }, []);

  // Reset password
  const resetPassword = useCallback(async (request: PasswordResetRequest): Promise<AuthResult> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const result = await authService.resetPassword(request);
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return result;
  }, []);

  // Update password
  const updatePassword = useCallback(async (request: PasswordUpdateRequest): Promise<AuthResult> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const result = await authService.updatePassword(request);
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return result;
  }, []);

  // Update profile
  const updateProfile = useCallback(async (request: ProfileUpdateRequest): Promise<AuthResult> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const result = await authService.updateProfile(request);
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return result;
  }, []);

  // Update email
  const updateEmail = useCallback(async (request: EmailUpdateRequest): Promise<AuthResult> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const result = await authService.updateEmail(request);
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return result;
  }, []);

  return {
    ...authState,
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