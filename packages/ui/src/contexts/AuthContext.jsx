import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import PropTypes from 'prop-types';

// Import backend API clients
import userApi from '../api/user';
import organizationApi from '../api/organization';
import workspaceApi from '../api/workspace';

// Initialize Supabase client (for auth only)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);

  const setEssentials = useCallback(async (currentSession) => {
    console.log('Setting essential user data...');
    try {
      // Get user profile from backend
      console.log('Fetching user profile...');
      const profile = await userApi.getCurrentUser();
      console.log('User profile received:', profile.data);
      
      if (!profile.data) {
        console.error('No profile data received from API');
        return;
      }
      
      setUser({
        ...currentSession.user,
        ...profile.data,
      });

      try {
        console.log('Fetching user organizations...');
        const { data: organizations } = (await userApi.getCurrentUserOrganizations()) || {};
        console.log('User organizations received:', organizations.data);
        
        if (!organizations.data || organizations.data.length === 0) {
          console.log('No organizations found for user');
          return;
        }

        const currentOrg = organizations.data.find(org => 
          org.id === profile.data.preferences?.defaultOrganizationId
        ) || organizations.data[0];
        
        console.log('Selected organization:', currentOrg);

        // Get user's default organization
        if (currentOrg) {
          setCurrentOrganization(currentOrg);
          
          try {
            console.log('Fetching workspaces for organization:', currentOrg.id);
            const workspaces = await workspaceApi.getWorkspacesByOrganizationId(currentOrg.id);
            console.log('Workspaces received:', workspaces.data);
            
            if (!workspaces.data || workspaces.data.length === 0) {
              console.log('No workspaces found for organization');
              return;
            }

            const currentWs = workspaces.data.find(ws => 
              ws.id === profile.data.preferences?.defaultWorkspaceId
            ) || workspaces.data[0];
            
            console.log('Selected workspace:', currentWs);
            setCurrentWorkspace(currentWs);
          } catch (workspacesError) {
            console.error('Error fetching workspaces:', workspacesError);
          }
        }
      } catch (orgsError) {
        console.error('Error fetching organizations:', orgsError);
      }
    } catch (profileError) {
      console.error('Error fetching user profile:', profileError);
    }
    
    console.log('Essential user data setup complete');
  }, []);

  // Get current session
  const initializeAuth = async () => {
    setLoading(true);

    try {
      // Get current session
      console.log('Initializing auth state...');
      
      // Explicitly catch any potential errors from supabase.auth.getSession
      let sessionResult;
      try {
        sessionResult = await supabase.auth.getSession();
        console.log('Session result received:', !!sessionResult);
      } catch (getSessionError) {
        console.error('Error getting session from Supabase:', getSessionError);
        throw getSessionError;
      }
      
      const { data, error: sessionError } = sessionResult || {};
      const currentSession = data?.session;
      
      console.log('Current session exists:', !!currentSession);
      console.log('Session error:', sessionError);
      
      if (sessionError) {
        throw sessionError;
      }

      if (currentSession) {
        setSession(currentSession);
        console.log('Session set, now setting essential data...');
        await setEssentials(currentSession);
        console.log('Essential data set');
      } else {
        console.log('No active session found');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      console.log('Auth initialization complete');
      setLoading(false);
    }
  };
  // Initialize auth state
  useEffect(() => {

    // Initialize auth
    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);

      if (event === 'SIGNED_IN' && newSession) {
        // Get user profile from backend
        await setEssentials(newSession);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentOrganization(null);
        setCurrentWorkspace(null);
      }
    });

    // Clean up subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, [setEssentials]);

  // Sign in with email and password (auth only)
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // Sign out (auth only)
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Reset password (auth only)
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  // Update password (auth only)
  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update profile in backend
      const updated = await userApi.updateCurrentUser(profileData);

      // Update local user state
      setUser({
        ...user,
        ...updated.data,
      });

      return updated.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  // Upload avatar (requires backend endpoint for avatar upload)
  const uploadAvatar = async (file) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Placeholder: You must implement avatar upload in the backend and expose an endpoint.
      // Here, we assume userApi.updateCurrentUser accepts FormData with avatar.
      const formData = new FormData();
      formData.append('avatar', file);
      // TODO: Update the backend API to handle avatar upload
      const updated = await userApi.updateCurrentUser(formData);

      setUser({
        ...user,
        ...updated.data,
      });

      // Assume backend returns avatar_url in updated.data
      return updated.data?.metadata?.avatarUrl;
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  };

  // Get user profile
  const getUserProfile = async (userId) => {
    try {
      const profile = await userApi.getUserById(userId);
      return profile.data;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  };

  // Get all users (admin only)
  const getUsers = async (options = {}) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Use backend searchUsers API
      const params = {};
      if (options.status) params.status = options.status;
      if (options.search) params.search = options.search;
      if (options.page && options.limit) {
        params.page = options.page;
        params.limit = options.limit;
      }
      const res = await userApi.searchUsers(params);
      // Assume backend returns { data, count }
      return { data: res.data, count: res.count || (res.data ? res.data.length : 0) };
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  };

  // Create organization
  const createOrganization = async (organizationData) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const org = await organizationApi.createOrganization({
        name: organizationData.name,
        slug: organizationData.slug,
        description: organizationData.description || null,
      });

      // Set as current organization if it's the user's first organization
      if (!currentOrganization) {
        setCurrentOrganization(org.data);

        // Update user's default organization
        await userApi.updateCurrentUser({
          ...user,
          preferences: {
            ...user.preferences,
            defaultOrganizationId: org.data.id,
            defaultWorkspaceId: null,
          },
        });

        setUser({
          ...user,
          preferences: {
            ...user.preferences,
            defaultOrganizationId: org.data.id,
            defaultWorkspaceId: null
          },
        });
      }

      return org.data;
    } catch (error) {
      console.error('Create organization error:', error);
      throw error;
    }
  };

  // Get user's organizations
  const getUserOrganizations = async () => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get all organizations where user is a member
      const { data: orgs } = (await userApi.getCurrentUserOrganizations()) || {};
      return orgs.data;
    } catch (error) {
      console.error('Get user organizations error:', error);
      throw error;
    }
  };

  // Get organization by ID
  const getOrganization = async (organizationId) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const org = await organizationApi.getOrganizationById(organizationId);
      // Optionally, get membership/role if needed
      return org.data;
    } catch (error) {
      console.error('Get organization error:', error);
      throw error;
    }
  };

  // Update organization
  const updateOrganization = async (organizationId, organizationData) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const org = await organizationApi.updateOrganization(organizationId, organizationData);

      if (currentOrganization && currentOrganization.id === organizationId) {
        setCurrentOrganization({
          ...currentOrganization,
          ...org.data,
        });
      }

      return org.data;
    } catch (error) {
      console.error('Update organization error:', error);
      throw error;
    }
  };

  // Delete organization
  const deleteOrganization = async (organizationId) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      await organizationApi.deleteOrganization(organizationId);

      if (currentOrganization && currentOrganization.id === organizationId) {
        setCurrentOrganization(null);
        setCurrentWorkspace(null);

        // Get user's organizations to set a new default
        const orgs = await organizationApi.getAllOrganizations();
        if (orgs.data && orgs.data.length > 0) {
          const newDefaultOrg = orgs.data[0];
          setCurrentOrganization(newDefaultOrg);

          await userApi.updateCurrentUser({
            ...user,
            preferences: {
              ...user.preferences,
              defaultOrganizationId: newDefaultOrg.id,
              defaultWorkspaceId: null
            },
          });

          setUser({
            ...user,
            preferences: {
              ...user.preferences,
              defaultOrganizationId: newDefaultOrg.id,
              defaultWorkspaceId: null
            },
          });
        } else {
          await userApi.updateCurrentUser({
            ...user,
            preferences: {
              ...user.preferences,
              defaultOrganizationId: null,
              defaultWorkspaceId: null
            },
          });

          setUser({
            ...user,
            preferences: {
              ...user.preferences,
              defaultOrganizationId: null,
              defaultWorkspaceId: null
            },
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Delete organization error:', error);
      throw error;
    }
  };

  // Get organization members
  const getOrganizationMembers = async (organizationId) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const members = await organizationApi.getOrganizationMembers(organizationId);
      return members.data;
    } catch (error) {
      console.error('Get organization members error:', error);
      throw error;
    }
  };

  // Invite organization member
  const inviteOrganizationMember = async (organizationId, inviteData) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const invitation = await organizationApi.addOrganizationMember(organizationId, {
        email: inviteData.email,
        role: inviteData.role || 'member',
      });

      // Backend should return the invited member's data
      return invitation.data;
    } catch (error) {
      console.error('Invite organization member error:', error);
      throw error;
    }
  };

  // Update organization member
  const updateOrganizationMember = async (organizationId, userId, updateData) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const updated = await organizationApi.updateOrganizationMember(organizationId, userId, updateData);
      return updated.data;
    } catch (error) {
      console.error('Update organization member error:', error);
      throw error;
    }
  };

  // Remove organization member
  const removeOrganizationMember = async (organizationId, userId) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      await organizationApi.removeOrganizationMember(organizationId, userId);
      return true;
    } catch (error) {
      console.error('Remove organization member error:', error);
      throw error;
    }
  };

  // Create workspace
  const createWorkspace = async (organizationId, workspaceData) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const ws = await workspaceApi.createWorkspace({
        ...workspaceData,
        organizationId,
      });

      if (currentOrganization && currentOrganization.id === organizationId && !currentWorkspace) {
        setCurrentWorkspace(ws.data);

        await userApi.updateCurrentUser({
          ...user,
          preferences: {
            ...user.preferences,
            defaultWorkspaceId: ws.data.id,
          },
        });

        setUser({
          ...user,
          preferences: {
            ...user.preferences,
            defaultWorkspaceId: ws.data.id,
          },
        });
      }

      return ws.data;
    } catch (error) {
      console.error('Create workspace error:', error);
      throw error;
    }
  };

  // Get user's workspaces in an organization
  const getUserWorkspaces = async (organizationId) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get all workspaces for the organization
      const workspaces = await workspaceApi.getWorkspacesByOrganizationId(organizationId);
      return workspaces.data;
    } catch (error) {
      console.error('Get user workspaces error:', error);
      throw error;
    }
  };

  // Get workspace by ID
  const getWorkspace = async (organizationId, workspaceId) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const ws = await workspaceApi.getWorkspaceById(workspaceId);
      return ws.data;
    } catch (error) {
      console.error('Get workspace error:', error);
      throw error;
    }
  };

  // Update workspace
  const updateWorkspace = async (organizationId, workspaceId, workspaceData) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const ws = await workspaceApi.updateWorkspace(workspaceId, workspaceData);

      if (currentWorkspace && currentWorkspace.id === workspaceId) {
        setCurrentWorkspace({
          ...currentWorkspace,
          ...ws.data,
        });
      }

      return ws.data;
    } catch (error) {
      console.error('Update workspace error:', error);
      throw error;
    }
  };

  // Delete workspace
  const deleteWorkspace = async (organizationId, workspaceId) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      await workspaceApi.deleteWorkspace(workspaceId);

      if (currentWorkspace && currentWorkspace.id === workspaceId) {
        setCurrentWorkspace(null);

        await userApi.updateCurrentUser({ default_workspace_id: null });

        setUser({
          ...user,
          default_workspace_id: null,
        });
      }

      return true;
    } catch (error) {
      console.error('Delete workspace error:', error);
      throw error;
    }
  };

  // Get workspace members
  const getWorkspaceMembers = async (organizationId, workspaceId) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const members = await workspaceApi.getWorkspaceMembers(workspaceId);
      return members.data;
    } catch (error) {
      console.error('Get workspace members error:', error);
      throw error;
    }
  };

  // Invite workspace member
  const inviteWorkspaceMember = async (organizationId, workspaceId, inviteData) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const invitation = await workspaceApi.addWorkspaceMember(workspaceId, {
        userId: inviteData.userId,
        role: inviteData.role || 'member',
      });

      return invitation.data;
    } catch (error) {
      console.error('Invite workspace member error:', error);
      throw error;
    }
  };

  // Update workspace member
  const updateWorkspaceMember = async (organizationId, workspaceId, userId, updateData) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const updated = await workspaceApi.updateWorkspaceMember(workspaceId, userId, updateData);
      return updated.data;
    } catch (error) {
      console.error('Update workspace member error:', error);
      throw error;
    }
  };

  // Remove workspace member
  const removeWorkspaceMember = async (organizationId, workspaceId, userId) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      await workspaceApi.removeWorkspaceMember(workspaceId, userId);
      return true;
    } catch (error) {
      console.error('Remove workspace member error:', error);
      throw error;
    }
  };

  // Set current organization
  const setActiveOrganization = async (organizationId) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const org = await organizationApi.getOrganizationById(organizationId);
      setCurrentOrganization(org.data);
      setCurrentWorkspace(null);

      await userApi.updateCurrentUser({
        ...user,
        preferences: {
          ...user.preferences,
          defaultOrganizationId: organizationId,
          defaultWorkspaceId: null,
        },
      });

      setUser({
        ...user,
        preferences: {
          ...user.preferences,
          defaultOrganizationId: organizationId,
          defaultWorkspaceId: null,
        },
      });

      return org.data;
    } catch (error) {
      console.error('Set active organization error:', error);
      throw error;
    }
  };

  // Set current workspace
  const setActiveWorkspace = async (organizationId, workspaceId) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const ws = await workspaceApi.getWorkspaceById(workspaceId);
      const org = await organizationApi.getOrganizationById(organizationId);

      setCurrentOrganization(org.data);
      setCurrentWorkspace(ws.data);

      await userApi.updateCurrentUser({
        ...user,
        preferences: {
          ...user.preferences,
          defaultOrganizationId: organizationId,
          defaultWorkspaceId: workspaceId,
        },
      });

      setUser({
        ...user,
        preferences: {
          ...user.preferences,
          defaultOrganizationId: organizationId,
          defaultWorkspaceId: workspaceId,
        },
      });

      return ws.data;
    } catch (error) {
      console.error('Set active workspace error:', error);
      throw error;
    }
  };

  // Check if email is verified (auth only)
  const checkEmailVerified = async () => {
    await supabase.auth.refreshSession();

    const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error fetching user for verification check:', userError);
      return false;
    }

    return !!supabaseUser?.email_confirmed_at;
  };

  // Resend verification email (auth only)
  const resendVerificationEmail = async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Resend verification email error in AuthContext:', error);
      throw error;
    }
  };

  // Context value
  const value = {
    user,
    session,
    loading,
    currentOrganization,
    currentWorkspace,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    uploadAvatar,
    getUserProfile,
    getUsers,
    createOrganization,
    getUserOrganizations,
    getOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizationMembers,
    inviteOrganizationMember,
    updateOrganizationMember,
    removeOrganizationMember,
    createWorkspace,
    getUserWorkspaces,
    getWorkspace,
    updateWorkspace,
    deleteWorkspace,
    getWorkspaceMembers,
    inviteWorkspaceMember,
    updateWorkspaceMember,
    removeWorkspaceMember,
    setActiveOrganization,
    setActiveWorkspace,
    checkEmailVerified,
    resendVerificationEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
