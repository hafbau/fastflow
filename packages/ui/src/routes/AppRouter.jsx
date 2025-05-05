import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AppLayout from '../layouts/AppLayout';

// Route Protection
import ProtectedRoute from './ProtectedRoute';
import PermissionRoute from './PermissionRoute';

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

// Page Not Found
import NotFound from '../pages/NotFound';

/**
 * Main application router
 * Configures all routes and route protection rules
 */
const AppRouter = () => {
  return (
    <BrowserRouter>
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
                  <Route path="members" element={<OrganizationMembers />} />
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
            
            {/* Workspace Routes */}
            <Route path="/workspaces/:workspaceId">
              <Route index element={<WorkspaceDetail />} />
              
              {/* Workspace Members - (requires canViewWorkspaceMembers permission) */}
              <Route element={<PermissionRoute permission="canViewWorkspaceMembers" />}>
                <Route path="members" element={<WorkspaceMembers />} />
              </Route>
              
              {/* Workspace Settings - (requires canManageWorkspaceSettings permission) */}
              <Route element={<PermissionRoute permission="canManageWorkspaceSettings" />}>
                <Route path="settings" element={<WorkspaceSettings />} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
