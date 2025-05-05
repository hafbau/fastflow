import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for checking user permissions based on roles
 * Provides helper methods for checking specific permissions across the application
 */
const usePermissions = () => {
  const { user, currentOrganization, currentWorkspace } = useAuth();
  
  // Check if the user is a system administrator
  const isSystemAdmin = user?.is_system_admin === true;
  
  // Organization-level permissions
  const isOrgAdmin = currentOrganization?.role === 'admin';
  const isOrgMember = !!currentOrganization;
  const isOrgReadOnly = currentOrganization?.role === 'readonly';
  
  // Workspace-level permissions
  const isWorkspaceAdmin = currentWorkspace?.role === 'admin';
  const isWorkspaceMember = !!currentWorkspace;
  const isWorkspaceReadOnly = currentWorkspace?.role === 'readonly';
  
  // Organization management permissions
  const canManageOrgSettings = isSystemAdmin || isOrgAdmin;
  const canManageOrgMembers = isSystemAdmin || isOrgAdmin;
  const canCreateWorkspace = isSystemAdmin || isOrgAdmin;
  const canViewOrgMembers = isSystemAdmin || isOrgMember;
  
  // Workspace management permissions
  const canManageWorkspaceSettings = isSystemAdmin || isOrgAdmin || isWorkspaceAdmin;
  const canManageWorkspaceMembers = isSystemAdmin || isOrgAdmin || isWorkspaceAdmin;
  const canViewWorkspaceMembers = isSystemAdmin || isOrgMember || isWorkspaceMember;
  
  // User management permissions
  const canManageUsers = isSystemAdmin;
  
  return {
    // System-level permissions
    isSystemAdmin,
    
    // Organization-level permissions
    isOrgAdmin,
    isOrgMember,
    isOrgReadOnly,
    canManageOrgSettings,
    canManageOrgMembers,
    canCreateWorkspace,
    canViewOrgMembers,
    
    // Workspace-level permissions
    isWorkspaceAdmin,
    isWorkspaceMember,
    isWorkspaceReadOnly,
    canManageWorkspaceSettings,
    canManageWorkspaceMembers,
    canViewWorkspaceMembers,
    
    // User management permissions
    canManageUsers,
    
    /**
     * Generic permission check function
     * @param {string} permission - The permission to check (e.g., 'canManageOrgSettings')
     * @returns {boolean} - Whether the user has the specified permission
     */
    hasPermission: (permission) => {
      if (typeof permission !== 'string') return false;
      return !!eval(permission);
    }
  };
};

export default usePermissions;
