import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  AppBar,
  Toolbar,
  Chip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatIcon from '@mui/icons-material/Chat';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import BuildIcon from '@mui/icons-material/Build';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import StorageIcon from '@mui/icons-material/Storage';
import CodeIcon from '@mui/icons-material/Code';
import GroupsIcon from '@mui/icons-material/Groups';
import SettingsIcon from '@mui/icons-material/Settings';

import { useAuth } from '../contexts/AuthContext';
import { useNavigation, NAV_LEVELS } from '../contexts/NavigationContext';

// Import the enhanced workspace hooks from local hooks
import { useWorkspace, useWorkspacePermission } from '../hooks';

// Drawer width
const DRAWER_WIDTH = 260;

/**
 * WorkspaceLayout component for workspace-specific pages
 * Provides a workspace-specific sidebar navigation and content area
 */
const WorkspaceLayout = () => {
  const theme = useTheme();
  const { workspaceId: routeWorkspaceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use the enhanced workspace context
  const { workspaceId, organizationId } = useWorkspace();
  const { hasPermission } = useWorkspacePermission('workspace', 'view');
  
  const { 
    currentNavLevel,
    workspaceSidebarVisible,
    isMobileView,
    toggleWorkspaceSidebar,
    setSidebarVisibility
  } = useNavigation();
  
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [open, setOpen] = useState(isDesktop);

  // Update drawer state based on navigation context
  useEffect(() => {
    setOpen(workspaceSidebarVisible && !isMobileView);
  }, [workspaceSidebarVisible, isMobileView]);

  // Update navigation context when drawer is opened/closed
  useEffect(() => {
    if (currentNavLevel === NAV_LEVELS.WORKSPACE) {
      setSidebarVisibility(NAV_LEVELS.WORKSPACE, open);
    }
  }, [open, currentNavLevel, setSidebarVisibility]);

  // Validate that the route workspace ID matches context
  useEffect(() => {
    // If route workspace ID doesn't match context, update the route
    if (routeWorkspaceId && workspaceId && routeWorkspaceId !== workspaceId) {
      const newPath = location.pathname.replace(
        `/workspaces/${routeWorkspaceId}`, 
        `/workspaces/${workspaceId}`
      );
      navigate(newPath, { replace: true });
    }
  }, [routeWorkspaceId, workspaceId, location.pathname, navigate]);

  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setOpen(!open);
    toggleWorkspaceSidebar();
  };

  // Check if a path is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Workspace navigation items with permission requirements
  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: `/workspaces/${workspaceId}`,
      permission: 'workspace:view'
    },
    { 
      id: 'chatflows', 
      label: 'Chatflows', 
      icon: <ChatIcon />, 
      path: `/workspaces/${workspaceId}/chatflows`,
      permission: 'chatflows:view'
    },
    { 
      id: 'agentflows', 
      label: 'Agentflows', 
      icon: <SmartToyIcon />, 
      path: `/workspaces/${workspaceId}/agentflows`,
      permission: 'agentflows:view'
    },
    { 
      id: 'assistants', 
      label: 'Assistants', 
      icon: <SmartToyIcon />, 
      path: `/workspaces/${workspaceId}/assistants`,
      permission: 'assistants:view'
    },
    { 
      id: 'tools', 
      label: 'Tools', 
      icon: <BuildIcon />, 
      path: `/workspaces/${workspaceId}/tools`,
      permission: 'tools:view'
    },
    { 
      id: 'credentials', 
      label: 'Credentials', 
      icon: <VpnKeyIcon />, 
      path: `/workspaces/${workspaceId}/credentials`,
      permission: 'credentials:view'
    },
    { 
      id: 'variables', 
      label: 'Variables', 
      icon: <CodeIcon />, 
      path: `/workspaces/${workspaceId}/variables`,
      permission: 'variables:view'
    },
    { 
      id: 'document-stores', 
      label: 'Document Stores', 
      icon: <StorageIcon />, 
      path: `/workspaces/${workspaceId}/document-stores`,
      permission: 'documents:view'
    },
    // Admin section
    { type: 'divider' },
    { 
      id: 'members', 
      label: 'Members', 
      icon: <GroupsIcon />, 
      path: `/workspaces/${workspaceId}/members`,
      permission: 'workspace:manageMembers'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: <SettingsIcon />, 
      path: `/workspaces/${workspaceId}/settings`,
      permission: 'workspace:manageSettings'
    },
  ];

  // Filter menu items based on permissions
  const filteredNavItems = navItems.filter(item => {
    // Allow dividers
    if (item.type === 'divider') return true;
    
    // Check permission if specified
    if (item.permission) {
      const [resource, action] = item.permission.split(':');
      return hasPermission(resource, action);
    }
    
    // Allow items without permission requirement
    return true;
  });

  if (!workspaceId) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">Please select a workspace</Typography>
      </Box>
    );
  }

  // Fetch workspace name (use custom hook if available)
  const getWorkspaceName = () => {
    // This would ideally use a cached value from context
    return `Workspace ${workspaceId}`;
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Workspace Drawer */}
      <Drawer
        variant={isMobileView ? 'temporary' : 'persistent'}
        open={open}
        onClose={handleDrawerToggle}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
            ...(!open && {
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              width: theme.spacing(7),
              [theme.breakpoints.up('sm')]: {
                width: theme.spacing(9),
              },
            }),
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: theme.spacing(0, 1),
            ...theme.mixins.toolbar,
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            pl: 2,
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {open && (
              <Box>
                <Typography variant="h6" noWrap>
                  {getWorkspaceName()}
                </Typography>
                <Chip 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                  label={`ID: ${workspaceId}`}
                  sx={{ mt: 0.5 }}
                />
              </Box>
            )}
          </Box>
          <IconButton onClick={handleDrawerToggle} aria-label="Toggle sidebar">
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
        <Divider />
        <List>
          {filteredNavItems.map((item, index) => (
            item.type === 'divider' ? (
              <Divider key={`divider-${index}`} />
            ) : (
              <Tooltip 
                key={item.id} 
                title={!open ? item.label : ''}
                placement="right"
              >
                <ListItem
                  button
                  onClick={() => navigate(item.path)}
                  selected={isActive(item.path)}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.action.selected,
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    sx={{ 
                      opacity: open ? 1 : 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }} 
                  />
                </ListItem>
              </Tooltip>
            )
          ))}
        </List>
      </Drawer>
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open ? DRAWER_WIDTH : theme.spacing(9)}px)` },
          ml: { sm: `${open ? DRAWER_WIDTH : theme.spacing(9)}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Box sx={{ mb: 2, ...theme.mixins.toolbar }} /> {/* Toolbar spacer */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default WorkspaceLayout;
