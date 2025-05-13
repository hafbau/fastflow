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

// Local storage keys for workspace context
const ORG_STORAGE_KEY = 'flowstack_current_organization';
const WORKSPACE_STORAGE_KEY = 'flowstack_current_workspace';

// API service for organizations and workspaces (this would be imported from your API services)
// This is a placeholder - you should replace with your actual API service
const organizationService = {
  getUserOrganizations: async (userId: string) => {
    // Replace with actual implementation
    try {
      const response = await fetch(`/api/users/${userId}/organizations`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching user organizations:', error);
      return [];
    }
  },
  getOrganizationWorkspaces: async (organizationId: string) => {
    // Replace with actual implementation
    try {
      const response = await fetch(`/api/organizations/${organizationId}/workspaces`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching organization workspaces:', error);
      return [];
    }
  },
  getWorkspacePermissions: async (workspaceId: string, userId: string) => {
    // Replace with actual implementation
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/permissions?userId=${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching workspace permissions:', error);
      return {};
    }
  }
};

/**
 * Hook for authentication functionality
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    currentOrganizationId: null,
    currentWorkspaceId: null,
    workspacePermissions: null
  });

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const [user, session] = await Promise.all([
          authService.getCurrentUser(),
          authService.getSession()
        ]);

        // Restore organization and workspace from localStorage if available
        const storedOrgId = localStorage.getItem(ORG_STORAGE_KEY);
        const storedWorkspaceId = localStorage.getItem(WORKSPACE_STORAGE_KEY);

        setAuthState({
          user,
          session,
          isLoading: false,
          isAuthenticated: !!session,
          currentOrganizationId: storedOrgId,
          currentWorkspaceId: storedWorkspaceId,
          workspacePermissions: null
        });

        // If we have both a user and a workspace, fetch permissions
        if (user && storedWorkspaceId) {
          try {
            const permissions = await organizationService.getWorkspacePermissions(
              storedWorkspaceId,
              user.id
            );
            setAuthState(prev => ({
              ...prev,
              workspacePermissions: permissions
            }));
          } catch (error) {
            console.error('Error fetching stored workspace permissions:', error);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
          currentOrganizationId: null,
          currentWorkspaceId: null,
          workspacePermissions: null
        });
      }
    };

    initAuth();

    // Set up auth state change listener
    const { data: { subscription } } = authService.getSupabaseClient().auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const user = await authService.getCurrentUser();
          
          // Restore organization and workspace from localStorage if available
          const storedOrgId = localStorage.getItem(ORG_STORAGE_KEY);
          const storedWorkspaceId = localStorage.getItem(WORKSPACE_STORAGE_KEY);
          
          setAuthState({
            user,
            session,
            isLoading: false,
            isAuthenticated: true,
            currentOrganizationId: storedOrgId,
            currentWorkspaceId: storedWorkspaceId,
            workspacePermissions: null
          });
          
          // If we have both a user and a workspace, fetch permissions
          if (user && storedWorkspaceId) {
            try {
              const permissions = await organizationService.getWorkspacePermissions(
                storedWorkspaceId,
                user.id
              );
              setAuthState(prev => ({
                ...prev,
                workspacePermissions: permissions
              }));
            } catch (error) {
              console.error('Error fetching workspace permissions on sign-in:', error);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear workspace context from localStorage on sign out
          localStorage.removeItem(ORG_STORAGE_KEY);
          localStorage.removeItem(WORKSPACE_STORAGE_KEY);
          
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
            currentOrganizationId: null,
            currentWorkspaceId: null,
            workspacePermissions: null
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
    
    // Clear workspace context from localStorage on sign out
    localStorage.removeItem(ORG_STORAGE_KEY);
    localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    
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

  // Switch organization
  const switchOrganization = useCallback(async (organizationId: string): Promise<void> => {
    if (!authState.user) {
      throw new Error('Cannot switch organization: User is not authenticated');
    }

    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Validate that the user is a member of this organization
      const userOrgs = await organizationService.getUserOrganizations(authState.user.id);
      const isValidOrg = userOrgs.some((org: any) => org.id === organizationId);
      
      if (!isValidOrg) {
        throw new Error('User is not a member of this organization');
      }
      
      // Get the first workspace for this organization or null if none exists
      const workspaces = await organizationService.getOrganizationWorkspaces(organizationId);
      const firstWorkspaceId = workspaces.length > 0 ? workspaces[0].id : null;
      
      // Store in localStorage
      localStorage.setItem(ORG_STORAGE_KEY, organizationId);
      
      if (firstWorkspaceId) {
        localStorage.setItem(WORKSPACE_STORAGE_KEY, firstWorkspaceId);
        
        // Fetch permissions for the workspace
        const permissions = await organizationService.getWorkspacePermissions(
          firstWorkspaceId,
          authState.user.id
        );
        
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          currentOrganizationId: organizationId,
          currentWorkspaceId: firstWorkspaceId,
          workspacePermissions: permissions
        }));
      } else {
        // Organization has no workspaces
        localStorage.removeItem(WORKSPACE_STORAGE_KEY);
        
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          currentOrganizationId: organizationId,
          currentWorkspaceId: null,
          workspacePermissions: null
        }));
      }
    } catch (error) {
      console.error('Error switching organization:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [authState.user]);

  // Switch workspace
  const switchWorkspace = useCallback(async (workspaceId: string): Promise<void> => {
    if (!authState.user) {
      throw new Error('Cannot switch workspace: User is not authenticated');
    }
    
    if (!authState.currentOrganizationId) {
      throw new Error('Cannot switch workspace: No organization selected');
    }
    
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Validate the workspace belongs to the current organization
      const workspaces = await organizationService.getOrganizationWorkspaces(
        authState.currentOrganizationId
      );
      
      const workspace = workspaces.find((ws: any) => ws.id === workspaceId);
      if (!workspace) {
        throw new Error('Workspace not found in current organization');
      }
      
      // Store in localStorage
      localStorage.setItem(WORKSPACE_STORAGE_KEY, workspaceId);
      
      // Fetch permissions for the workspace
      const permissions = await organizationService.getWorkspacePermissions(
        workspaceId,
        authState.user.id
      );
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        currentWorkspaceId: workspaceId,
        workspacePermissions: permissions
      }));
    } catch (error) {
      console.error('Error switching workspace:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [authState.user, authState.currentOrganizationId]);

  // Refresh workspace permissions
  const refreshWorkspacePermissions = useCallback(async (): Promise<void> => {
    if (!authState.user || !authState.currentWorkspaceId) {
      return;
    }
    
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const permissions = await organizationService.getWorkspacePermissions(
        authState.currentWorkspaceId,
        authState.user.id
      );
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        workspacePermissions: permissions
      }));
    } catch (error) {
      console.error('Error refreshing workspace permissions:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [authState.user, authState.currentWorkspaceId]);

  // Check if user has a specific permission
  const hasPermission = useCallback((resource: string, action: string): boolean => {
    if (!authState.workspacePermissions) {
      return false;
    }
    
    // This implementation assumes workspacePermissions is a map with keys in the format "resource:action"
    // Adjust this based on your actual permission structure
    const permissionKey = `${resource}:${action}`;
    return !!authState.workspacePermissions[permissionKey];
  }, [authState.workspacePermissions]);

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
    updateEmail,
    switchOrganization,
    switchWorkspace,
    refreshWorkspacePermissions,
    hasPermission
  };
};