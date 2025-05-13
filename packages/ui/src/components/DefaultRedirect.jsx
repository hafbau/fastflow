import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Component that redirects to the appropriate starting page based on user's context
 * - If user has an active workspace, redirects to that workspace
 * - If user has an active organization but no workspace, redirects to organization's workspaces 
 * - Otherwise, redirects to dashboard
 */
const DefaultRedirect = () => {
  const { currentWorkspace, currentOrganization } = useAuth();
  
  // Redirect to workspace if available
  if (currentWorkspace) {
    return <Navigate to={`/workspaces/${currentWorkspace.id}/chatflows`} replace />;
  }
  
  // Redirect to organization workspaces if organization is available
  if (currentOrganization) {
    return <Navigate to={`/organizations/${currentOrganization.id}/workspaces`} replace />;
  }
  
  // Default to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default DefaultRedirect;
