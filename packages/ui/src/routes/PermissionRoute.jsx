import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import usePermissions from '../hooks/usePermissions';

/**
 * Permission Route Component
 * Wraps routes that require specific permissions
 * Redirects to fallback route if user doesn't have the required permission
 */
const PermissionRoute = ({ permission, redirectTo = '/dashboard' }) => {
  const permissions = usePermissions();
  
  // Check if the user has the required permission
  const hasPermission = permissions[permission] || permissions.hasPermission(permission);
  
  // Redirect to fallback if user doesn't have permission
  if (!hasPermission) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // Render the child route elements if user has permission
  return <Outlet />;
};

PermissionRoute.propTypes = {
  permission: PropTypes.string.isRequired,
  redirectTo: PropTypes.string,
};

export default PermissionRoute;
