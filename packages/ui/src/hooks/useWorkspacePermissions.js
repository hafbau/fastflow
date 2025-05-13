import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';

/**
 * Hook to check workspace-level permissions
 * Provides functions to verify if the current user has specific permissions in the current workspace
 */
const useWorkspacePermissions = () => {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  
  /**
   * Check if the user has a specific permission in the current workspace
   * @param {string} permission - Permission to check
   * @returns {boolean} - Whether user has the permission
   */
  const hasPermission = useCallback((permission) => {
    // If no user or workspace, return false
    if (!user || !workspace) return false;
    
    // System admins have all permissions
    if (user.isSystemAdmin) return true;
    
    // Get user's role in the workspace
    const userRole = workspace.role || 'member';
    
    // Check role-based permissions
    switch (permission) {
      // View permissions
      case 'canViewWorkspace':
        return ['admin', 'manager', 'editor', 'viewer', 'member'].includes(userRole);
        
      case 'canViewWorkspaceMembers':
        return ['admin', 'manager', 'editor', 'viewer', 'member'].includes(userRole);
      
      // Management permissions
      case 'canManageWorkspace':
        return ['admin', 'manager'].includes(userRole);
        
      case 'canManageWorkspaceSettings':
        return ['admin', 'manager'].includes(userRole);
        
      case 'canManageWorkspaceMembers':
        return ['admin', 'manager'].includes(userRole);
      
      // Content permissions
      case 'canCreateChatflow':
        return ['admin', 'manager', 'editor'].includes(userRole);
        
      case 'canEditChatflow':
        return ['admin', 'manager', 'editor'].includes(userRole);
        
      case 'canDeleteChatflow':
        return ['admin', 'manager', 'editor'].includes(userRole);
        
      case 'canRunChatflow':
        return ['admin', 'manager', 'editor', 'viewer'].includes(userRole);
      
      // Credential permissions
      case 'canViewCredentials':
        return ['admin', 'manager', 'editor'].includes(userRole);
        
      case 'canManageCredentials':
        return ['admin', 'manager', 'editor'].includes(userRole);
      
      // Variable permissions
      case 'canViewVariables':
        return ['admin', 'manager', 'editor'].includes(userRole);
        
      case 'canManageVariables':
        return ['admin', 'manager', 'editor'].includes(userRole);
      
      // Document store permissions
      case 'canViewDocumentStores':
        return ['admin', 'manager', 'editor', 'viewer'].includes(userRole);
        
      case 'canManageDocumentStores':
        return ['admin', 'manager', 'editor'].includes(userRole);
      
      // Default case
      default:
        return false;
    }
  }, [user, workspace]);
  
  /**
   * Check if the user has admin permissions in the workspace
   * @returns {boolean} - Whether user is workspace admin
   */
  const isWorkspaceAdmin = useCallback(() => {
    if (!user || !workspace) return false;
    
    return user.isSystemAdmin || workspace.role === 'admin';
  }, [user, workspace]);
  
  /**
   * Check if the user has manager permissions in the workspace
   * @returns {boolean} - Whether user is workspace manager
   */
  const isWorkspaceManager = useCallback(() => {
    if (!user || !workspace) return false;
    
    return user.isSystemAdmin || ['admin', 'manager'].includes(workspace.role);
  }, [user, workspace]);
  
  /**
   * Check if the user has editor permissions in the workspace
   * @returns {boolean} - Whether user is workspace editor
   */
  const isWorkspaceEditor = useCallback(() => {
    if (!user || !workspace) return false;
    
    return user.isSystemAdmin || ['admin', 'manager', 'editor'].includes(workspace.role);
  }, [user, workspace]);
  
  return {
    hasPermission,
    isWorkspaceAdmin,
    isWorkspaceManager,
    isWorkspaceEditor
  };
};

export default useWorkspacePermissions;