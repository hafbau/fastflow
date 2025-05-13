import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for accessing organization and workspace context
 * This replaces the dependency on @flowstack/auth-client
 */
export const useWorkspaceContext = () => {
  const auth = useAuth();

  return {
    // Organization context
    currentOrganizationId: auth.currentOrganization?.id || null,
    switchOrganization: auth.setActiveOrganization,
    
    // Workspace context
    currentWorkspaceId: auth.currentWorkspace?.id || null,
    switchWorkspace: auth.setActiveWorkspace,
    
    // Permissions (placeholders - implement as needed based on actual Auth)
    workspacePermissions: auth.permissions || {},
    refreshWorkspacePermissions: () => {/* Implement based on actual auth context */},
    hasPermission: (resource, action) => {
      // Simple implementation - enhance based on your actual permissions model
      return true; // Default to allowing until permissions are implemented
    },
    
    // Loading state
    isLoading: auth.loading
  };
};

/**
 * Custom hook for checking workspace-specific permissions
 * @param {string} resource The resource type
 * @param {string} action The action to perform on the resource
 * @returns {Object} Object containing hasPermission boolean and loading state
 */
export const useWorkspacePermission = (resource, action) => {
  const { hasPermission, isLoading } = useWorkspaceContext();
  
  return {
    hasPermission: typeof hasPermission === 'function' ? hasPermission(resource, action) : true,
    isLoading
  };
};

/**
 * Custom hook for working with the current organization
 * @returns {Object} Organization context
 */
export const useOrganization = () => {
  const { currentOrganizationId, switchOrganization, isLoading } = useWorkspaceContext();
  const auth = useAuth();
  
  return {
    organizationId: currentOrganizationId,
    organization: auth.currentOrganization,
    switchOrganization,
    isLoading
  };
};

/**
 * Custom hook for working with the current workspace
 * @returns {Object} Workspace context
 */
export const useWorkspace = () => {
  const { 
    currentWorkspaceId, 
    switchWorkspace, 
    currentOrganizationId,
    isLoading 
  } = useWorkspaceContext();
  const auth = useAuth();
  
  return {
    workspaceId: currentWorkspaceId,
    workspace: auth.currentWorkspace,
    organizationId: currentOrganizationId,
    switchWorkspace,
    isLoading
  };
};
