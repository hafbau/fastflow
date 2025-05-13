import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useParams, useLocation } from 'react-router-dom';
import { CircularProgress, Box, Typography, Alert } from '@mui/material';

// Import the enhanced workspace hooks from local hooks
import { useWorkspace, useWorkspacePermission } from '../hooks';
import { useAuth } from '../contexts/AuthContext';

/**
 * WorkspaceRoute component
 * 
 * A specialized route component that:
 * 1. Verifies the user has access to the requested workspace
 * 2. Handles loading states during permission checks
 * 3. Redirects unauthorized access attempts
 * 4. Optionally checks for specific workspace permissions
 * 
 * @param {Object} props Component props
 * @param {string} [props.requiredPermission] Optional specific permission required (format: "resource:action")
 * @param {string} [props.redirectTo="/dashboard"] Path to redirect to if access is denied
 */
const WorkspaceRoute = ({ 
  requiredPermission,
  redirectTo = "/dashboard",
  ...rest 
}) => {
  const { workspaceId: routeWorkspaceId } = useParams();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { workspaceId } = useWorkspace();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  
  // Extract resource and action at the component level
  const resourceAction = requiredPermission ? requiredPermission.split(':') : [null, null];
  const [resource, action] = resourceAction;
  const { hasPermission } = useWorkspacePermission(resource, action);

  // Track workspace loading state
  useEffect(() => {
    console.log('Workspace state updated:', { workspaceId });
    
    if (workspaceId) {
      setWorkspaceLoading(false);
    } else {
      setWorkspaceLoading(true);
    }
  }, [workspaceId]);

  // Check workspace access and permissions
  useEffect(() => {
    console.log('Access check dependencies changed:', { 
      isAuthenticated, 
      authLoading, 
      workspaceId, 
      workspaceLoading,
      routeWorkspaceId, 
      requiredPermission,
      hasPermission: requiredPermission ? hasPermission : 'N/A'
    });

    const checkAccess = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Skip if not authenticated yet
        if (!isAuthenticated || authLoading) {
          console.log('Authentication not ready, skipping access check');
          return;
        }

        // Skip if workspace is still loading
        if (workspaceLoading) {
          console.log('Workspace data still loading, skipping access check');
          return;
        }

        // Verify workspace ID exists and matches the route parameter
        if (!workspaceId) {
          console.log('No workspace selected');
          setError("No workspace selected");
          setHasAccess(false);
          return;
        }

        if (routeWorkspaceId !== workspaceId) {
          console.log('Workspace ID mismatch', { routeWorkspaceId, workspaceId });
          setError("Workspace ID mismatch");
          setHasAccess(false);
          return;
        }

        // Check if user has required permission
        if (requiredPermission) {
          console.log('Checking permission:', { resource, action, hasPermission });
          
          if (!hasPermission) {
            console.log('Permission denied');
            setError(`You don't have permission to ${action} ${resource} in this workspace`);
            setHasAccess(false);
            return;
          }
        }

        // All checks passed
        console.log('Access check passed');
        setHasAccess(true);
      } catch (error) {
        console.error('Error checking workspace access:', error);
        setError('Error verifying workspace access');
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [
    isAuthenticated, 
    authLoading,
    workspaceId, 
    workspaceLoading,
    routeWorkspaceId, 
    requiredPermission,
    hasPermission
  ]);

  // Display loading state during permission check
  if (isLoading || authLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography variant="body1">Verifying workspace access...</Typography>
      </Box>
    );
  }

  // Redirect if user doesn't have access
  if (!hasAccess) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location.pathname,
          error: error || "You don't have access to this workspace"
        }} 
        replace 
      />
    );
  }

  // Display access error if there is one but we're not redirecting
  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          p: 3
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Render child routes if access is granted
  return <Outlet />;
};

export default WorkspaceRoute;
