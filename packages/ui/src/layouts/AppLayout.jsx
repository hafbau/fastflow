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
import ContextSwitcher from '../components/ContextSwitcher';
import PermissionGate from '../components/PermissionGate';

const drawerWidth = 260;

/**
 * Main application layout with navigation sidebar and header
 */
const AppLayout = () => {
  const { user, currentOrganization, currentWorkspace, signOut } = useAuth();
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
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ mr: 3, display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="h6" noWrap component="div">
              FlowStack
            </Typography>
          </Box>
          
          {/* Context Switcher */}
          <ContextSwitcher 
            onCreateOrganization={() => setCreateOrgDialogOpen(true)}
            onCreateWorkspace={() => setCreateWorkspaceDialogOpen(true)}
          />
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" sx={{ mr: 2 }}>
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
              
              {currentOrganization && (
                <>
                  <NavItem 
                    to={`/organizations/${currentOrganization.id}`} 
                    icon={<BusinessCenterIcon />}
                    text={currentOrganization.name} 
                  />
                  
                  <NavItem 
                    to={`/organizations/${currentOrganization.id}/members`} 
                    icon={<PeopleIcon />}
                    text="Members" 
                    permission="canViewOrgMembers"
                  />
                  
                  <NavItem 
                    to={`/organizations/${currentOrganization.id}/settings`} 
                    icon={<SettingsIcon />}
                    text="Settings" 
                    permission="canManageOrgSettings"
                  />
                </>
              )}
            </List>
            
            {/* Workspaces Section */}
            {currentOrganization && (
              <List
                subheader={
                  <ListSubheader component="div" id="workspaces-subheader">
                    Workspaces
                  </ListSubheader>
                }
              >
                <NavItem 
                  to={`/organizations/${currentOrganization.id}/workspaces`} 
                  icon={<FolderSharedIcon />}
                  text="All Workspaces" 
                />
                
                {currentWorkspace && (
                  <>
                    <NavItem 
                      to={`/workspaces/${currentWorkspace.id}`} 
                      icon={<FolderIcon />}
                      text={currentWorkspace.name} 
                    />
                    
                    <NavItem 
                      to={`/workspaces/${currentWorkspace.id}/members`} 
                      icon={<PeopleIcon />}
                      text="Members" 
                      permission="canViewWorkspaceMembers"
                    />
                    
                    <NavItem 
                      to={`/workspaces/${currentWorkspace.id}/settings`} 
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
      
      {/* Organization Create Dialog (placeholder - to be implemented) */}
      {createOrgDialogOpen && (
        // This would be your actual OrganizationCreateDialog component
        <div style={{ display: 'none' }}>
          Organization Create Dialog - to be implemented
        </div>
      )}
      
      {/* Workspace Create Dialog (placeholder - to be implemented) */}
      {createWorkspaceDialogOpen && (
        // This would be your actual WorkspaceCreateDialog component
        <div style={{ display: 'none' }}>
          Workspace Create Dialog - to be implemented
        </div>
      )}
    </Box>
  );
};

export default AppLayout;
