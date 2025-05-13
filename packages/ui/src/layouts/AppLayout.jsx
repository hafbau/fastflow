import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Tooltip,
  Badge,
  ListSubheader,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Business as BusinessIcon,
  Folder as FolderIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  FolderShared as FolderSharedIcon,
  BusinessCenter as BusinessCenterIcon,
  ChevronLeft as ChevronLeftIcon,
  NotificationsOutlined as NotificationsIcon,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import usePermissions from '../hooks/usePermissions';
import PermissionGate from '../components/PermissionGate';

// Import the new enhanced Organization/Workspace switcher
import OrganizationWorkspaceSwitcher from '../components/WorkspaceManagement/OrganizationWorkspaceSwitcher';
import OrganizationCreateDialog from '../components/OrganizationManagement/OrganizationCreateDialog';
import WorkspaceCreateDialog from '../components/WorkspaceManagement/WorkspaceCreateDialog';

// Import the improved workspace hooks from local hooks
import { useWorkspace, useOrganization, useWorkspacePermission } from '../hooks';

const drawerWidth = 260;

/**
 * Main application layout with navigation sidebar and header
 */
const AppLayout = () => {
  const { user, signOut } = useAuth();
  // Use the enhanced workspace-aware hooks
  const { workspaceId, organizationId } = useWorkspace();
  const { hasPermission } = useWorkspacePermission('organization', 'manage');
  const permissions = usePermissions();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const [createOrgDialogOpen, setCreateOrgDialogOpen] = useState(false);
  const [createWorkspaceDialogOpen, setCreateWorkspaceDialogOpen] = useState(false);
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleSignOut = async () => {
    handleProfileMenuClose();
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Render navigation item with conditional active state
  const NavItem = ({ to, icon, text, permission }) => {
    const item = (
      <ListItem disablePadding>
        <ListItemButton 
          component={Link} 
          to={to}
          selected={isActive(to)}
        >
          <ListItemIcon>
            {icon}
          </ListItemIcon>
          <ListItemText primary={text} />
        </ListItemButton>
      </ListItem>
    );
    
    if (permission) {
      return (
        <PermissionGate permission={permission}>
          {item}
        </PermissionGate>
      );
    }
    
    return item;
  };
  
  // Helper function to fetch organization name
  const fetchOrgName = (orgId) => 'Default Organization'; // Placeholder for organization name fetching
  // const fetchOrgName = async (orgId) => {
  //   if (!orgId) return "";
  //   // Implement organization name fetching here
  //   try {
  //     const response = await fetch(`/api/organizations/${orgId}`);
  //     const data = await response.json();
  //     return data.name;
  //   } catch (error) {
  //     console.error('Error fetching organization name:', error);
  //     return 'Unknown Organization';
  //   }
  // };

  // Helper function to fetch workspace name
  const fetchWorkspaceName = (wsId) => 'Default Workspace'; // Placeholder for workspace name fetching
  // const fetchWorkspaceName = async (wsId) => {
  //   if (!wsId) return "";
  //   // Implement workspace name fetching here
  //   try {
  //     const response = await fetch(`/api/workspaces/${wsId}`);
  //     const data = await response.json();
  //     return data.name;
  //   } catch (error) {
  //     console.error('Error fetching workspace name:', error);
  //     return 'Unknown Workspace';
  //   }
  // };
  
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
            aria-label="Open/close navigation menu"
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ mr: 3, display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="h6" noWrap component="div">
              FlowStack
            </Typography>
          </Box>
          
          {/* Use the new OrganizationWorkspaceSwitcher component */}
          <OrganizationWorkspaceSwitcher />
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" sx={{ mr: 2 }} aria-label="Notifications">
              <Badge badgeContent={0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* User Menu */}
          <Box>
            <Tooltip title={user?.full_name || user?.email || 'User'}>
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                aria-controls="user-menu"
                aria-haspopup="true"
                aria-label="User profile and settings"
              >
                <Avatar 
                  src={user?.avatar_url}
                  alt={user?.full_name || user?.email}
                  sx={{ width: 32, height: 32 }}
                >
                  {user?.first_name?.charAt(0) || user?.email?.charAt(0)}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem component={Link} to="/profile" onClick={handleProfileMenuClose}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>
              
              <Divider />
              
              <MenuItem onClick={handleSignOut}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Sign Out</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Navigation Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={drawerOpen}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            boxShadow: 'none',
          },
        }}
      >
        <Toolbar />
        
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {/* Dashboard */}
            <NavItem 
              to="/dashboard" 
              icon={<DashboardIcon />}
              text="Dashboard" 
            />
            
            {/* Organizations Section */}
            <List
              subheader={
                <ListSubheader component="div" id="organizations-subheader">
                  Organizations
                </ListSubheader>
              }
            >
              <NavItem 
                to="/organizations" 
                icon={<BusinessIcon />}
                text="My Organizations" 
              />
              
              {organizationId && (
                <>
                  <NavItem 
                    to={`/organizations/${organizationId}`} 
                    icon={<BusinessCenterIcon />}
                    text={fetchOrgName(organizationId)} 
                  />
                  
                  <NavItem 
                    to={`/organizations/${organizationId}/members`} 
                    icon={<PeopleIcon />}
                    text="Members" 
                    permission="canViewOrgMembers"
                  />
                  
                  <NavItem 
                    to={`/organizations/${organizationId}/settings`} 
                    icon={<SettingsIcon />}
                    text="Settings" 
                    permission="canManageOrgSettings"
                  />
                </>
              )}
            </List>
            
            {/* Workspaces Section */}
            {organizationId && (
              <List
                subheader={
                  <ListSubheader component="div" id="workspaces-subheader">
                    Workspaces
                  </ListSubheader>
                }
              >
                <NavItem 
                  to={`/organizations/${organizationId}/workspaces`} 
                  icon={<FolderSharedIcon />}
                  text="All Workspaces" 
                />
                
                {workspaceId && (
                  <>
                    <NavItem 
                      to={`/workspaces/${workspaceId}`} 
                      icon={<FolderIcon />}
                      text={fetchWorkspaceName(workspaceId)} 
                    />
                    
                    <NavItem 
                      to={`/workspaces/${workspaceId}/members`} 
                      icon={<PeopleIcon />}
                      text="Members" 
                      permission="canViewWorkspaceMembers"
                    />
                    
                    <NavItem 
                      to={`/workspaces/${workspaceId}/settings`} 
                      icon={<SettingsIcon />}
                      text="Settings" 
                      permission="canManageWorkspaceSettings"
                    />
                  </>
                )}
              </List>
            )}
            
            {/* Admin Section */}
            <PermissionGate permission="isSystemAdmin">
              <List
                subheader={
                  <ListSubheader component="div" id="admin-subheader">
                    Administration
                  </ListSubheader>
                }
              >
                <NavItem 
                  to="/admin/users" 
                  icon={<AdminIcon />}
                  text="User Management" 
                />
                
                <NavItem 
                  to="/admin/settings" 
                  icon={<SettingsIcon />}
                  text="System Settings" 
                />
              </List>
            </PermissionGate>
          </List>
        </Box>
      </Drawer>
      
      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          ml: { sm: drawerOpen ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
      
      {/* Organization Create Dialog */}
      <OrganizationCreateDialog
        open={createOrgDialogOpen}
        onClose={() => setCreateOrgDialogOpen(false)}
        onSuccess={(newOrg) => {
          // Navigate to new organization
          if (newOrg) {
            // Update context to new organization
            setCreateOrgDialogOpen(false);
          }
        }}
      />

      {/* Workspace Create Dialog */}
      <WorkspaceCreateDialog
        open={createWorkspaceDialogOpen}
        onClose={() => setCreateWorkspaceDialogOpen(false)}
        organizationId={organizationId}
        onSuccess={(newWorkspace) => {
          // Navigate to new workspace
          if (newWorkspace) {
            setCreateWorkspaceDialogOpen(false);
          }
        }}
      />
    </Box>
  );
};

export default AppLayout;
