import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText, 
  Typography,
  Divider,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { 
  IconBriefcase, 
  IconPlus, 
  IconChevronDown,
  IconSettings,
  IconUsers,
  IconFolder
} from '@tabler/icons-react';
import { useAuth } from '@/contexts/AuthContext';
import WorkspaceCreateDialog from './WorkspaceCreateDialog';

// Import the enhanced workspace hooks from local hooks
import { useWorkspace, useOrganization } from '../../hooks';

/**
 * WorkspaceSwitcher - A component that displays the current workspace
 * and allows switching between available workspaces within an organization.
 * Also provides quick access to workspace management functions.
 */
const WorkspaceSwitcher = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Use the enhanced workspace-aware hooks
  const { organizationId, switchOrganization } = useOrganization();
  const { workspaceId, switchWorkspace } = useWorkspace();
  const { user } = useAuth();
  
  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  
  // Fetch workspaces for the current organization
  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!organizationId) return;
      
      try {
        setLoading(true);
        // Use the API to fetch workspaces
        const response = await fetch(`/api/organizations/${organizationId}/workspaces`);
        const data = await response.json();
        setWorkspaces(data);
      } catch (error) {
        console.error('Error fetching workspaces:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkspaces();
  }, [organizationId]);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleWorkspaceClick = async (workspace) => {
    try {
      // Use the enhanced workspace context's switchWorkspace method
      await switchWorkspace(workspace.id);
      navigate(`/workspaces/${workspace.id}`);
    } catch (error) {
      console.error('Error switching workspace:', error);
    } finally {
      handleClose();
    }
  };
  
  const handleCreateWorkspace = () => {
    setCreateDialogOpen(true);
    handleClose();
  };
  
  const handleManageClick = () => {
    handleClose();
    if (organizationId) {
      navigate(`/organizations/${organizationId}/workspaces`);
    }
  };
  
  const handleWorkspaceSettings = () => {
    handleClose();
    if (workspaceId) {
      navigate(`/workspaces/${workspaceId}/settings`);
    }
  };
  
  const handleWorkspaceMembers = () => {
    handleClose();
    if (workspaceId) {
      navigate(`/workspaces/${workspaceId}/members`);
    }
  };

  // Helper function to get the current workspace name
  const getCurrentWorkspaceName = () => {
    if (!workspaceId || !workspaces.length) return 'Select Workspace';
    const currentWorkspace = workspaces.find(w => w.id === workspaceId);
    return currentWorkspace ? currentWorkspace.name : 'Select Workspace';
  };

  if (!organizationId) {
    return null;
  }
  
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title="Switch workspace">
          <Button
            id="workspace-switcher-button"
            aria-controls={open ? 'workspace-switcher-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            endIcon={<IconChevronDown size={16} />}
            sx={{ 
              textTransform: 'none',
              color: 'text.primary',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <IconBriefcase size={20} />
            <Typography noWrap variant="body2" sx={{ maxWidth: 150 }}>
              {getCurrentWorkspaceName()}
            </Typography>
          </Button>
        </Tooltip>
      </Box>
      
      <Menu
        id="workspace-switcher-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'workspace-switcher-button',
        }}
        PaperProps={{
          elevation: 2,
          sx: {
            width: 256,
            maxHeight: 450,
            overflow: 'auto',
            mt: 0.5
          }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Current Organization
          </Typography>
        </Box>
        
        <Divider />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            {workspaces.length > 0 ? (
              workspaces.map((workspace) => (
                <MenuItem 
                  key={workspace.id}
                  onClick={() => handleWorkspaceClick(workspace)}
                  selected={workspaceId === workspace.id}
                  sx={{ 
                    py: 1.5,
                    px: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      }
                    }
                  }}
                >
                  <ListItemIcon>
                    <IconBriefcase size={20} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={workspace.name}
                    primaryTypographyProps={{
                      noWrap: true,
                      variant: 'body2'
                    }}
                  />
                </MenuItem>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No workspaces found
                </Typography>
              </Box>
            )}
          </>
        )}
        
        <Divider />
        
        {workspaceId && (
          <>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Workspace Actions
              </Typography>
            </Box>
            
            <MenuItem onClick={handleWorkspaceSettings}>
              <ListItemIcon>
                <IconSettings size={20} />
              </ListItemIcon>
              <ListItemText primary="Workspace Settings" />
            </MenuItem>
            
            <MenuItem onClick={handleWorkspaceMembers}>
              <ListItemIcon>
                <IconUsers size={20} />
              </ListItemIcon>
              <ListItemText primary="Manage Members" />
            </MenuItem>
            
            <Divider />
          </>
        )}

        <MenuItem onClick={handleManageClick}>
          <ListItemIcon>
            <IconFolder size={20} />
          </ListItemIcon>
          <ListItemText primary="Manage Workspaces" />
        </MenuItem>
        
        <MenuItem onClick={handleCreateWorkspace}>
          <ListItemIcon>
            <IconPlus size={20} />
          </ListItemIcon>
          <ListItemText primary="Create Workspace" />
        </MenuItem>
      </Menu>
      
      <WorkspaceCreateDialog 
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        organizationId={organizationId}
        onSuccess={(newWorkspace) => {
          // Navigate to new workspace
          if (newWorkspace) {
            // Use the enhanced switchWorkspace method
            switchWorkspace(newWorkspace.id);
            navigate(`/workspaces/${newWorkspace.id}`);
          }
        }}
      />
    </>
  );
};

export default WorkspaceSwitcher;
