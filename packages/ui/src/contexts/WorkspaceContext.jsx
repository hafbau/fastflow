import React, { createContext, useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * Workspace context for managing workspace-specific state
 * Provides workspace data and operations for components
 */
const WorkspaceContext = createContext(null);

/**
 * Provider component for workspace context
 * Manages workspace state and provides it to child components
 */
export const WorkspaceProvider = ({ children }) => {
  const params = useParams();
  const { currentWorkspace, getWorkspace, setActiveWorkspace } = useAuth();
  
  // State
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resources, setResources] = useState({});
  
  // Get workspaceId from route params or context
  const workspaceId = params.workspaceId || currentWorkspace?.id;
  
  // Load workspace data when workspaceId changes
  useEffect(() => {
    const loadWorkspace = async () => {
      if (!workspaceId) {
        setWorkspace(null);
        return;
      }
      
      // If the current workspace in auth context matches the ID, use it
      if (currentWorkspace && currentWorkspace.id === workspaceId) {
        setWorkspace(currentWorkspace);
        return;
      }
      
      // Otherwise fetch the workspace
      try {
        setLoading(true);
        setError(null);
        
        const workspaceData = await getWorkspace(null, workspaceId);
        setWorkspace(workspaceData);
        
        // Set as active workspace in auth context
        if (workspaceData.organization_id) {
          await setActiveWorkspace(workspaceData.organization_id, workspaceId);
        }
      } catch (err) {
        console.error('Error loading workspace:', err);
        setError(err);
        setWorkspace(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadWorkspace();
  }, [workspaceId, currentWorkspace, getWorkspace, setActiveWorkspace]);
  
  /**
   * Sets resource data for the current workspace
   * @param {string} resourceType - Type of resource (e.g., 'chatflows', 'variables')
   * @param {Array|Object} data - Resource data to store
   */
  const setResourceData = (resourceType, data) => {
    setResources(prevResources => ({
      ...prevResources,
      [resourceType]: data
    }));
  };
  
  /**
   * Gets resource data for the current workspace
   * @param {string} resourceType - Type of resource (e.g., 'chatflows', 'variables')
   * @returns {Array|Object|null} Resource data or null if not found
   */
  const getResourceData = (resourceType) => {
    return resources[resourceType] || null;
  };
  
  /**
   * Clears all resource data when switching workspaces
   */
  const clearResourceData = () => {
    setResources({});
  };
  
  // Clear resources when workspace changes
  useEffect(() => {
    clearResourceData();
  }, [workspaceId]);
  
  // Context value
  const contextValue = {
    workspace,
    workspaceId,
    loading,
    error,
    resources,
    setResourceData,
    getResourceData,
    clearResourceData
  };
  
  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};

/**
 * Hook to use workspace context
 * @returns {Object} Workspace context values
 */
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export default WorkspaceContext;