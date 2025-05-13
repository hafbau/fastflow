import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import usePermissions from '../hooks/usePermissions';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography } from '@mui/material';

/**
 * Permission Route Component
 * Wraps routes that require specific permissions
 * Shows error message or redirects if user doesn't have the required permission
 */
const PermissionRoute = ({ permission, redirectTo = null, showError = true }) => {
  const { user, loading } = useAuth();
  const permissions = usePermissions();
  
  // Check if the user has the required permission
  const hasPermission = permissions[permission] || permissions.hasPermission(permission);
  
  // If still loading auth state, don't make a decision yet
  if (loading) {
    return <Outlet />;
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If user doesn't have permission
  if (!hasPermission) {
    // Either show error or redirect based on props
    if (showError) {
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
    } else if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  // Render the child route elements if user has permission
  return <Outlet />;
};

PermissionRoute.propTypes = {
  permission: PropTypes.string.isRequired,
  redirectTo: PropTypes.string,
  showError: PropTypes.bool,
};

export default PermissionRoute;