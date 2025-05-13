import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import AppLayout from '../layouts/AppLayout';
import WorkspaceLayout from '../layouts/WorkspaceLayout';

// Route Protection
import ProtectedRoute from './ProtectedRoute';
import PermissionRoute from './PermissionRoute';
import WorkspaceRoute from './WorkspaceRoute';

// Auth Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

// Dashboard
import Dashboard from '../pages/Dashboard';

// Profile
import UserProfile from '../components/UserManagement/Profile/UserProfile';

// Admin
import UserAdministration from '../components/UserManagement/Administration/UserAdministration';
import SystemSettings from '../pages/admin/SystemSettings';

// Organization Management
import OrganizationList from '../components/OrganizationManagement/OrganizationList';
import OrganizationDetail from '../components/OrganizationManagement/OrganizationDetail';
import OrganizationMembers from '../components/OrganizationManagement/OrganizationMembers';
import OrganizationSettings from '../components/OrganizationManagement/OrganizationSettings';

// Workspace Management
import WorkspaceList from '../components/WorkspaceManagement/WorkspaceList';
import WorkspaceDetail from '../components/WorkspaceManagement/WorkspaceDetail';
import WorkspaceMembers from '../components/WorkspaceManagement/WorkspaceMembers';
import WorkspaceSettings from '../components/WorkspaceManagement/WorkspaceSettings';

// Workspace Resource Components
import Chatflows from '../views/workspace/chatflows';
import Agentflows from '../views/workspace/agentflows';
import Assistants from '../views/workspace/assistants';
import Tools from '../views/workspace/tools';
import Credentials from '../views/workspace/credentials';
import Variables from '../views/workspace/variables';
import DocumentStores from '../views/workspace/document-stores';

// Page Not Found
import NotFound from '../pages/NotFound';

/**
 * Wrapper component for WorkspaceMembers that passes the necessary props
 */
const WorkspaceMembersWrapper = () => {
  const { workspaceId } = useParams();
  const { currentOrganization, currentWorkspace } = useAuth();
  
  // Check if the required props are available
  if (!currentOrganization || !currentOrganization.id) {
    console.log('Loading workspace members - waiting for organization data', { 
      currentOrganization, 
      workspaceId 
    });
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  // Default to member role if workspace info is not available yet
  const userRole = currentWorkspace?.role || 'member';
  
  console.log('Rendering WorkspaceMembers with props', { 
    organizationId: currentOrganization.id,
    workspaceId,
    userRole
  });
  
  return (
    <WorkspaceMembers 
      organizationId={currentOrganization.id}
      workspaceId={workspaceId}
      userRole={userRole}
    />
  );
};

/**
 * Wrapper component for WorkspaceSettings that passes the necessary props
 */
const WorkspaceSettingsWrapper = () => {
  const { workspaceId } = useParams();
  const { currentOrganization, currentWorkspace } = useAuth();
  
  // Check if the required props are available
  if (!currentWorkspace || !currentOrganization || !currentOrganization.id) {
    console.log('Loading workspace settings - waiting for complete data', { 
      currentOrganization, 
      currentWorkspace,
      workspaceId 
    });
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  console.log('Rendering WorkspaceSettings with props', { 
    workspace: currentWorkspace,
    organizationId: currentOrganization.id
  });
  
  return (
    <WorkspaceSettings 
      workspace={currentWorkspace}
      organizationId={currentOrganization.id}
      onWorkspaceUpdated={(updatedWorkspace) => {
        // The AuthContext already updates the currentWorkspace
        // when updateWorkspace is called, so no additional action needed here
      }}
    />
  );
};

/**
 * Main application router
 * Configures all routes and route protection rules
 */
const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Protected Routes (require authentication) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Default redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* User Profile */}
          <Route path="/profile" element={<UserProfile />} />
          
          {/* Organization Routes */}
          <Route path="/organizations">
            <Route index element={<OrganizationList />} />
            <Route path=":organizationId">
              <Route index element={<OrganizationDetail />} />
              
              {/* Organization Members - (requires canViewOrgMembers permission) */}
              <Route element={<PermissionRoute permission="canViewOrgMembers" />}>
                <Route path="members" element={<OrganizationMembers userRole="member" />} />
              </Route>
              
              {/* Organization Settings - (requires canManageOrgSettings permission) */}
              <Route element={<PermissionRoute permission="canManageOrgSettings" />}>
                <Route path="settings" element={<OrganizationSettings />} />
              </Route>
              
              {/* Workspaces */}
              <Route path="workspaces">
                <Route index element={<WorkspaceList />} />
              </Route>
            </Route>
          </Route>
          
          {/* Admin Routes - (requires isSystemAdmin permission) */}  
          <Route path="/admin" element={<PermissionRoute permission="isSystemAdmin" />}>
            <Route path="users" element={<UserAdministration />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>
          
          {/* 404 - Page Not Found */}
          <Route path="*" element={<NotFound />} />
        </Route>
        
        {/* Workspace-specific Routes with permission checking */}
        <Route path="/workspaces/:workspaceId" element={<WorkspaceRoute />}>
          <Route element={<WorkspaceLayout />}>
            {/* Workspace Dashboard */}
            <Route index element={<WorkspaceDetail />} />
            
            {/* Workspace Resources with permission requirements */}
            <Route element={<WorkspaceRoute requiredPermission="chatflows:view" />}>
              <Route path="chatflows" element={<Chatflows />} />
            </Route>
            
            <Route element={<WorkspaceRoute requiredPermission="agentflows:view" />}>
              <Route path="agentflows" element={<Agentflows />} />
            </Route>
            
            <Route element={<WorkspaceRoute requiredPermission="assistants:view" />}>
              <Route path="assistants" element={<Assistants />} />
            </Route>
            
            <Route element={<WorkspaceRoute requiredPermission="tools:view" />}>
              <Route path="tools" element={<Tools />} />
            </Route>
            
            <Route element={<WorkspaceRoute requiredPermission="credentials:view" />}>
              <Route path="credentials" element={<Credentials />} />
            </Route>
            
            <Route element={<WorkspaceRoute requiredPermission="variables:view" />}>
              <Route path="variables" element={<Variables />} />
            </Route>
            
            <Route element={<WorkspaceRoute requiredPermission="documents:view" />}>
              <Route path="document-stores" element={<DocumentStores />} />
            </Route>
            
            {/* Workspace Members - requires workspace:manageMembers permission */}
            <Route element={<WorkspaceRoute requiredPermission="workspace:manageMembers" />}>
              <Route path="members" element={<WorkspaceMembersWrapper />} />
            </Route>
            
            {/* Workspace Settings - requires workspace:manageSettings permission */}
            <Route element={<WorkspaceRoute requiredPermission="workspace:manageSettings" />}>
              <Route path="settings" element={<WorkspaceSettingsWrapper />} />
            </Route>
            
            {/* 404 within workspace context */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRouter;
