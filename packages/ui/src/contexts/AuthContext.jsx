import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import PropTypes from 'prop-types';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
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

  // Initialize auth state
  useEffect(() => {
    // Get current session
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        // Get current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (currentSession) {
          setSession(currentSession);
          
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
          
          if (profileError) {
            throw profileError;
          }
          
          // Set user with profile data
          setUser({
            ...currentSession.user,
            ...profile,
          });
          
          // Get user's default organization
          if (profile.default_organization_id) {
            const { data: organization, error: orgError } = await supabase
              .from('organizations')
              .select('*')
              .eq('id', profile.default_organization_id)
              .single();
            
            if (!orgError) {
              setCurrentOrganization(organization);
              
              // Get user's default workspace if available
              if (profile.default_workspace_id) {
                const { data: workspace, error: workspaceError } = await supabase
                  .from('workspaces')
                  .select('*')
                  .eq('id', profile.default_workspace_id)
                  .eq('organization_id', organization.id)
                  .single();
                
                if (!workspaceError) {
                  setCurrentWorkspace(workspace);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Initialize auth
    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      
      if (event === 'SIGNED_IN' && newSession) {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', newSession.user.id)
          .single();
        
        if (!profileError) {
          // Set user with profile data
          setUser({
            ...newSession.user,
            ...profile,
          });
          
          // Get user's default organization
          if (profile.default_organization_id) {
            const { data: organization, error: orgError } = await supabase
              .from('organizations')
              .select('*')
              .eq('id', profile.default_organization_id)
              .single();
            
            if (!orgError) {
              setCurrentOrganization(organization);
              
              // Get user's default workspace if available
              if (profile.default_workspace_id) {
                const { data: workspace, error: workspaceError } = await supabase
                  .from('workspaces')
                  .select('*')
                  .eq('id', profile.default_workspace_id)
                  .eq('organization_id', organization.id)
                  .single();
                
                if (!workspaceError) {
                  setCurrentWorkspace(workspace);
                }
              }
            }
          }
        }
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
  }, []);

  // Sign up with email and password
  const signUp = async (email, password, userData) => {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) {
        throw authError;
      }
      
      // Create user profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: email,
              first_name: userData.firstName,
              last_name: userData.lastName,
              full_name: `${userData.firstName} ${userData.lastName}`,
              avatar_url: null,
              status: 'active',
            },
          ]);
        
        if (profileError) {
          throw profileError;
        }
      }
      
      return authData;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  // Sign in with email and password
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

  // Sign out
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

  // Reset password
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

  // Update password
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
      
      // Update profile in database
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update local user state
      setUser({
        ...user,
        ...data,
      });
      
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  // Upload avatar
  const uploadAvatar = async (file) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update profile with avatar URL
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
        .select()
        .single();
      
      if (updateError) {
        throw updateError;
      }
      
      // Update local user state
      setUser({
        ...user,
        ...data,
      });
      
      return publicUrl;
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  };

  // Get user profile
  const getUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
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
      
      // Check if user is admin
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', {
        user_id: user.id,
      });
      
      if (adminError) {
        throw adminError;
      }
      
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }
      
      // Build query
      let query = supabase.from('profiles').select('*');
      
      // Apply filters
      if (options.status) {
        query = query.eq('status', options.status);
      }
      
      if (options.search) {
        query = query.or(`full_name.ilike.%${options.search}%,email.ilike.%${options.search}%`);
      }
      
      // Apply pagination
      if (options.page && options.limit) {
        const from = (options.page - 1) * options.limit;
        const to = from + options.limit - 1;
        query = query.range(from, to);
      }
      
      // Execute query
      const { data, error, count } = await query.order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return { data, count };
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
      
      // Start a transaction
      const { data, error } = await supabase.rpc('create_organization', {
        org_name: organizationData.name,
        org_description: organizationData.description || null,
        user_id: user.id,
      });
      
      if (error) {
        throw error;
      }
      
      // Get the created organization
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', data)
        .single();
      
      if (orgError) {
        throw orgError;
      }
      
      // Set as current organization if it's the user's first organization
      if (!currentOrganization) {
        setCurrentOrganization(organization);
        
        // Update user's default organization
        await supabase
          .from('profiles')
          .update({ default_organization_id: organization.id })
          .eq('id', user.id);
        
        // Update local user state
        setUser({
          ...user,
          default_organization_id: organization.id,
        });
      }
      
      return organization;
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
      
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          role,
          organizations:organization_id (
            id,
            name,
            description,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Transform data to a more usable format
      const organizations = data.map(item => ({
        ...item.organizations,
        role: item.role,
      }));
      
      return organizations;
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
      
      // Check if user is a member of the organization
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        throw new Error('You are not a member of this organization');
      }
      
      // Get organization details
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();
      
      if (error) {
        throw error;
      }
      
      return {
        ...data,
        role: membership.role,
      };
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
      
      // Check if user is an admin of the organization
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError || membership.role !== 'admin') {
        throw new Error('You do not have permission to update this organization');
      }
      
      // Update organization
      const { data, error } = await supabase
        .from('organizations')
        .update(organizationData)
        .eq('id', organizationId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update current organization if it's the one being updated
      if (currentOrganization && currentOrganization.id === organizationId) {
        setCurrentOrganization({
          ...currentOrganization,
          ...data,
        });
      }
      
      return {
        ...data,
        role: membership.role,
      };
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
      
      // Check if user is an admin of the organization
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError || membership.role !== 'admin') {
        throw new Error('You do not have permission to delete this organization');
      }
      
      // Delete organization
      const { error } = await supabase.rpc('delete_organization', {
        org_id: organizationId,
      });
      
      if (error) {
        throw error;
      }
      
      // If deleted organization is the current one, reset current organization
      if (currentOrganization && currentOrganization.id === organizationId) {
        setCurrentOrganization(null);
        setCurrentWorkspace(null);
        
        // Get user's organizations to set a new default
        const { data: organizations, error: orgsError } = await supabase
          .from('organization_members')
          .select(`
            organization_id,
            role,
            organizations:organization_id (
              id,
              name,
              description,
              created_at,
              updated_at
            )
          `)
          .eq('user_id', user.id);
        
        if (!orgsError && organizations.length > 0) {
          const newDefaultOrg = organizations[0].organizations;
          
          // Set new default organization
          setCurrentOrganization({
            ...newDefaultOrg,
            role: organizations[0].role,
          });
          
          // Update user's default organization
          await supabase
            .from('profiles')
            .update({ 
              default_organization_id: newDefaultOrg.id,
              default_workspace_id: null,
            })
            .eq('id', user.id);
          
          // Update local user state
          setUser({
            ...user,
            default_organization_id: newDefaultOrg.id,
            default_workspace_id: null,
          });
        } else {
          // Update user's default organization to null
          await supabase
            .from('profiles')
            .update({ 
              default_organization_id: null,
              default_workspace_id: null,
            })
            .eq('id', user.id);
          
          // Update local user state
          setUser({
            ...user,
            default_organization_id: null,
            default_workspace_id: null,
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
      
      // Check if user is a member of the organization
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        throw new Error('You are not a member of this organization');
      }
      
      // Get organization members
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          user_id,
          role,
          created_at,
          profiles:user_id (
            id,
            email,
            first_name,
            last_name,
            full_name,
            avatar_url,
            status
          )
        `)
        .eq('organization_id', organizationId);
      
      if (error) {
        throw error;
      }
      
      // Transform data to a more usable format
      const members = data.map(item => ({
        id: item.user_id,
        role: item.role,
        joinedAt: item.created_at,
        email: item.profiles.email,
        firstName: item.profiles.first_name,
        lastName: item.profiles.last_name,
        fullName: item.profiles.full_name,
        avatarUrl: item.profiles.avatar_url,
        status: item.profiles.status,
      }));
      
      return members;
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
      
      // Check if user is an admin of the organization
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError || membership.role !== 'admin') {
        throw new Error('You do not have permission to invite members to this organization');
      }
      
      // Invite member
      const { data, error } = await supabase.rpc('invite_organization_member', {
        org_id: organizationId,
        email: inviteData.email,
        role: inviteData.role || 'member',
        inviter_id: user.id,
      });
      
      if (error) {
        throw error;
      }
      
      // Get the invited user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', inviteData.email)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }
      
      // Return member data
      return {
        id: data,
        role: inviteData.role || 'member',
        email: inviteData.email,
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        fullName: profile?.full_name || '',
        avatarUrl: profile?.avatar_url || null,
        status: 'pending',
        joinedAt: null,
      };
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
      
      // Check if user is an admin of the organization
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError || membership.role !== 'admin') {
        throw new Error('You do not have permission to update members in this organization');
      }
      
      // Update member
      const { data, error } = await supabase
        .from('organization_members')
        .update({ role: updateData.role })
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .select(`
          user_id,
          role,
          created_at,
          profiles:user_id (
            id,
            email,
            first_name,
            last_name,
            full_name,
            avatar_url,
            status
          )
        `)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Transform data to a more usable format
      const updatedMember = {
        id: data.user_id,
        role: data.role,
        joinedAt: data.created_at,
        email: data.profiles.email,
        firstName: data.profiles.first_name,
        lastName: data.profiles.last_name,
        fullName: data.profiles.full_name,
        avatarUrl: data.profiles.avatar_url,
        status: data.profiles.status,
      };
      
      return updatedMember;
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
      
      // Check if user is an admin of the organization
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError || membership.role !== 'admin') {
        throw new Error('You do not have permission to remove members from this organization');
      }
      
      // Prevent removing yourself
      if (userId === user.id) {
        throw new Error('You cannot remove yourself from the organization');
      }
      
      // Remove member
      const { error } = await supabase.rpc('remove_organization_member', {
        org_id: organizationId,
        member_id: userId,
      });
      
      if (error) {
        throw error;
      }
      
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
      
      // Check if user is a member of the organization
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        throw new Error('You are not a member of this organization');
      }
      
      // Create workspace
      const { data, error } = await supabase.rpc('create_workspace', {
        org_id: organizationId,
        workspace_name: workspaceData.name,
        workspace_description: workspaceData.description || null,
        creator_id: user.id,
      });
      
      if (error) {
        throw error;
      }
      
      // Get the created workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', data)
        .single();
      
      if (workspaceError) {
        throw workspaceError;
      }
      
      // Get organization name
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', organizationId)
        .single();
      
      if (orgError) {
        throw orgError;
      }
      
      // Set as current workspace if it's the user's first workspace in this organization
      if (currentOrganization && currentOrganization.id === organizationId && !currentWorkspace) {
        setCurrentWorkspace(workspace);
        
        // Update user's default workspace
        await supabase
          .from('profiles')
          .update({ default_workspace_id: workspace.id })
          .eq('id', user.id);
        
        // Update local user state
        setUser({
          ...user,
          default_workspace_id: workspace.id,
        });
      }
      
      return {
        ...workspace,
        organizationName: organization.name,
        role: 'admin', // Creator is always admin
      };
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
      
      // Check if user is a member of the organization
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        throw new Error('You are not a member of this organization');
      }
      
      // Get organization name
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', organizationId)
        .single();
      
      if (orgError) {
        throw orgError;
      }
      
      // Get user's workspaces in the organization
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          workspace_id,
          role,
          workspaces:workspace_id (
            id,
            name,
            description,
            organization_id,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .eq('workspaces.organization_id', organizationId);
      
      if (error) {
        throw error;
      }
      
      // Transform data to a more usable format
      const workspaces = data.map(item => ({
        ...item.workspaces,
        organizationName: organization.name,
        role: item.role,
      }));
      
      return workspaces;
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
      
      // Check if user is a member of the workspace
      const { data: membership, error: membershipError } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        throw new Error('You are not a member of this workspace');
      }
      
      // Get workspace details
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .eq('organization_id', organizationId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Get organization name
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', organizationId)
        .single();
      
      if (orgError) {
        throw orgError;
      }
      
      return {
        ...data,
        organizationName: organization.name,
        role: membership.role,
      };
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
      
      // Check if user is an admin of the workspace
      const { data: membership, error: membershipError } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError || membership.role !== 'admin') {
        throw new Error('You do not have permission to update this workspace');
      }
      
      // Update workspace
      const { data, error } = await supabase
        .from('workspaces')
        .update(workspaceData)
        .eq('id', workspaceId)
        .eq('organization_id', organizationId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update current workspace if it's the one being updated
      if (currentWorkspace && currentWorkspace.id === workspaceId) {
        setCurrentWorkspace({
          ...currentWorkspace,
          ...data,
        });
      }
      
      // Get organization name
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', organizationId)
        .single();
      
      if (orgError) {
        throw orgError;
      }
      
      return {
        ...data,
        organizationName: organization.name,
        role: membership.role,
      };
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
      
      // Check if user is an admin of the workspace
      const { data: membership, error: membershipError } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError || membership.role !== 'admin') {
        throw new Error('You do not have permission to delete this workspace');
      }
      
      // Delete workspace
      const { error } = await supabase.rpc('delete_workspace', {
        workspace_id: workspaceId,
        org_id: organizationId,
      });
      
      if (error) {
        throw error;
      }
      
      // If deleted workspace is the current one, reset current workspace
      if (currentWorkspace && currentWorkspace.id === workspaceId) {
        setCurrentWorkspace(null);
        
        // Update user's default workspace to null
        await supabase
          .from('profiles')
          .update({ default_workspace_id: null })
          .eq('id', user.id);
        
        // Update local user state
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
      
      // Check if user is a member of the workspace
      const { data: membership, error: membershipError } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        throw new Error('You are not a member of this workspace');
      }
      
      // Get workspace members
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          user_id,
          role,
          created_at,
          profiles:user_id (
            id,
            email,
            first_name,
            last_name,
            full_name,
            avatar_url,
            status
          )
        `)
        .eq('workspace_id', workspaceId);
      
      if (error) {
        throw error;
      }
      
      // Transform data to a more usable format
      const members = data.map(item => ({
        id: item.user_id,
        role: item.role,
        joinedAt: item.created_at,
        email: item.profiles.email,
        firstName: item.profiles.first_name,
        lastName: item.profiles.last_name,
        fullName: item.profiles.full_name,
        avatarUrl: item.profiles.avatar_url,
        status: item.profiles.status,
      }));
      
      return members;
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
      
      // Check if user is an admin of the workspace
      const { data: membership, error: membershipError } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError || membership.role !== 'admin') {
        throw new Error('You do not have permission to invite members to this workspace');
      }
      
      // Check if the user is a member of the organization
      const { data: orgMember, error: orgMemberError } = await supabase
        .from('organization_members')
        .select('user_id')
        .eq('organization_id', organizationId)
        .eq('user_id', inviteData.userId)
        .single();
      
      if (orgMemberError) {
        throw new Error('The user must be a member of the organization to be invited to a workspace');
      }
      
      // Invite member
      const { error } = await supabase
        .from('workspace_members')
        .insert([
          {
            workspace_id: workspaceId,
            user_id: inviteData.userId,
            role: inviteData.role || 'member',
          },
        ]);
      
      if (error) {
        throw error;
      }
      
      // Get the invited user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', inviteData.userId)
        .single();
      
      if (profileError) {
        throw profileError;
      }
      
      // Return member data
      return {
        id: inviteData.userId,
        role: inviteData.role || 'member',
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        status: profile.status,
        joinedAt: new Date().toISOString(),
      };
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
      
      // Check if user is an admin of the workspace
      const { data: membership, error: membershipError } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError || membership.role !== 'admin') {
        throw new Error('You do not have permission to update members in this workspace');
      }
      
      // Update member
      const { error } = await supabase
        .from('workspace_members')
        .update({ role: updateData.role })
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      // Get updated member data
      const { data: memberData, error: memberDataError } = await supabase
        .from('workspace_members')
        .select(`
          user_id,
          role,
          created_at,
          profiles:user_id (
            id,
            email,
            first_name,
            last_name,
            full_name,
            avatar_url,
            status
          )
        `)
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .single();
      
      if (memberDataError) {
        throw memberDataError;
      }
      
      // Transform data to a more usable format
      const updatedMember = {
        id: memberData.user_id,
        role: memberData.role,
        joinedAt: memberData.created_at,
        email: memberData.profiles.email,
        firstName: memberData.profiles.first_name,
        lastName: memberData.profiles.last_name,
        fullName: memberData.profiles.full_name,
        avatarUrl: memberData.profiles.avatar_url,
        status: memberData.profiles.status,
      };
      
      return updatedMember;
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
      
      // Check if user is an admin of the workspace
      const { data: membership, error: membershipError } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError || membership.role !== 'admin') {
        throw new Error('You do not have permission to remove members from this workspace');
      }
      
      // Prevent removing yourself
      if (userId === user.id) {
        throw new Error('You cannot remove yourself from the workspace');
      }
      
      // Remove member
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
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
      
      // Check if user is a member of the organization
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        throw new Error('You are not a member of this organization');
      }
      
      // Get organization details
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Set current organization
      setCurrentOrganization({
        ...data,
        role: membership.role,
      });
      
      // Reset current workspace
      setCurrentWorkspace(null);
      
      // Update user's default organization
      await supabase
        .from('profiles')
        .update({ 
          default_organization_id: organizationId,
          default_workspace_id: null,
        })
        .eq('id', user.id);
      
      // Update local user state
      setUser({
        ...user,
        default_organization_id: organizationId,
        default_workspace_id: null,
      });
      
      return {
        ...data,
        role: membership.role,
      };
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
      
      // Check if user is a member of the workspace
      const { data: membership, error: membershipError } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        throw new Error('You are not a member of this workspace');
      }
      
      // Get workspace details
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .eq('organization_id', organizationId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Get organization details
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();
      
      if (orgError) {
        throw orgError;
      }
      
      // Set current organization
      setCurrentOrganization({
        ...organization,
        role: membership.role,
      });
      
      // Set current workspace
      setCurrentWorkspace(data);
      
      // Update user's default organization and workspace
      await supabase
        .from('profiles')
        .update({ 
          default_organization_id: organizationId,
          default_workspace_id: workspaceId,
        })
        .eq('id', user.id);
      
      // Update local user state
      setUser({
        ...user,
        default_organization_id: organizationId,
        default_workspace_id: workspaceId,
      });
      
      return {
        ...data,
        organizationName: organization.name,
        role: membership.role,
      };
    } catch (error) {
      console.error('Set active workspace error:', error);
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
    signUp,
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
