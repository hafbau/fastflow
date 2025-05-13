import { useAuthContext } from '../contexts/AuthContext';

/**
 * Custom hook for accessing organization and workspace context
 */
export const useWorkspaceContext = () => {
  const auth = useAuthContext();

  return {
    // Organization context
    currentOrganizationId: auth.currentOrganizationId,
    switchOrganization: auth.switchOrganization,
    
    // Workspace context
    currentWorkspaceId: auth.currentWorkspaceId,
    switchWorkspace: auth.switchWorkspace,
    
    // Permissions
    workspacePermissions: auth.workspacePermissions,
    refreshWorkspacePermissions: auth.refreshWorkspacePermissions,
    hasPermission: auth.hasPermission,
    
    // Loading state
    isLoading: auth.isLoading
  };
};

/**
 * Custom hook for checking workspace-specific permissions
 * @param resource The resource type
 * @param action The action to perform on the resource
 * @returns Boolean indicating if the current user has permission
 */
export const useWorkspacePermission = (resource: string, action: string) => {
  const { hasPermission, isLoading } = useWorkspaceContext();
  
  return {
    hasPermission: hasPermission(resource, action),
    isLoading
  };
};

/**
 * Custom hook for working with the current organization
 */
export const useOrganization = () => {
  const { currentOrganizationId, switchOrganization, isLoading } = useWorkspaceContext();
  
  return {
    organizationId: currentOrganizationId,
    switchOrganization,
    isLoading
  };
};

/**
 * Custom hook for working with the current workspace
 */
export const useWorkspace = () => {
  const { 
    currentWorkspaceId, 
    switchWorkspace, 
    currentOrganizationId,
    isLoading 
  } = useWorkspaceContext();
  
  return {
    workspaceId: currentWorkspaceId,
    organizationId: currentOrganizationId,
    switchWorkspace,
    isLoading
  };
}; 