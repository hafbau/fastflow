import React from 'react';
import { Navigate, Outlet, useParams, useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import useWorkspacePermissions from '../hooks/useWorkspacePermissions';
import { useWorkspace } from '../contexts/WorkspaceContext';

/**
 * WorkspacePermissionRoute component
 * Protects routes that require specific workspace-level permissions
 */
const WorkspacePermissionRoute = ({ permission }) => {
  const { workspaceId } = useParams();
  const location = useLocation();
  const { hasPermission } = useWorkspacePermissions();
  const { workspace, loading, error } = useWorkspace();
  
  // If still loading the workspace, allow through (WorkspaceRoute handles loading state)
  if (loading) return <Outlet />;
  
  // If there was an error loading the workspace, show generic error
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error Loading Workspace
        </Typography>
        <Typography variant="body1">
          {error.message || 'An unexpected error occurred when loading the workspace.'}
        </Typography>
      </Box>
    );
  }
  
  // If no workspace found, redirect to dashboard
  if (!workspace) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Check if user has the required permission
  if (!hasPermission(permission)) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Permission Denied
        </Typography>
        <Typography variant="body1">
          You don't have the necessary permissions to access this resource.
        </Typography>
      </Box>
    );
  }
  
  // If user has permission, render the protected route
  return <Outlet />;
};

export default WorkspacePermissionRoute;