import React from 'react';
import PropTypes from 'prop-types';
import usePermissions from '../hooks/usePermissions';

/**
 * A component that renders its children only if the user has the specified permission
 * Useful for permission-based conditional rendering throughout the application
 * 
 * @param {string} permission - The permission to check (e.g., 'canManageOrgSettings')
 * @param {React.ReactNode} children - Content to render if user has permission
 * @param {React.ReactNode} fallback - Content to render if user doesn't have permission
 */
const PermissionGate = ({ permission, children, fallback = null }) => {
  const permissions = usePermissions();
  
  // Check if user has the requested permission
  const hasPermission = permissions[permission] || permissions.hasPermission(permission);
  
  // Render children if permitted, otherwise render fallback (or null)
  return hasPermission ? children : fallback;
};

PermissionGate.propTypes = {
  permission: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
};

export default PermissionGate;
