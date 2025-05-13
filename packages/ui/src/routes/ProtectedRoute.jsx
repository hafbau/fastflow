import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

/**
 * Protected Route Component
 * Wraps routes that require authentication
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
        <p style={{ marginLeft: '10px' }}>Loading your profile ...</p>
      </Box>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    // We save the original location the user was trying to navigate to for redirection after login
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  
  // Render the child route elements if authenticated
  return <Outlet />;
};

export default ProtectedRoute;
