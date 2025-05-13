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
  Paper,
  CircularProgress,
  InputBase,
  IconButton,
  Badge
} from '@mui/material';
import { 
  IconBriefcase, 
  IconBuilding,
  IconPlus, 
  IconChevronDown,
  IconSettings,
  IconUsers,
  IconFolder,
  IconSearch,
  IconBuildingSkyscraper
} from '@tabler/icons-react';
import { useAuth } from '@/contexts/AuthContext';

// Import the enhanced workspace hooks from local hooks
import { useWorkspace, useOrganization } from '../../hooks';

/**
 * OrganizationWorkspaceSwitcher - An enhanced component that allows users
 * to switch between both organizations and workspaces in a unified dropdown
 */
const OrganizationWorkspaceSwitcher = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use the enhanced workspace-aware hooks
  const { organizationId, switchOrganization } = useOrganization();
  const { workspaceId, switchWorkspace } = useWorkspace();
  const { user, getUserOrganizations, getUserWorkspaces } = useAuth();
  
  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  
  // Fetch user's organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        // Use the API to fetch organizations
        const data = await getUserOrganizations();
        setOrganizations(data);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrganizations();
  }, [user]);
  
  // Fetch workspaces for the current organization
  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!organizationId) return;
      
      try {
        setLoading(true);
        // Use the API to fetch workspaces
        const data = await getUserWorkspaces(organizationId);
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
    setSearchQuery('');
  };
  
  const handleOrganizationClick = async (organization) => {
    try {
      // Only switch if we're changing organizations
      if (organization.id !== organizationId) {
        await switchOrganization(organization.id);
        navigate(`/organizations/${organization.id}`);
      }
    } catch (error) {
      console.error('Error switching organization:', error);
    } finally {
      handleClose();
    }
  };
  
  const handleWorkspaceClick = async (workspace) => {
    try {
      // Only switch if we're changing workspaces
      if (workspace.id !== workspaceId) {
        await switchWorkspace(workspace.id);
        navigate(`/workspaces/${workspace.id}`);
      }
    } catch (error) {
      console.error('Error switching workspace:', error);
    } finally {
      handleClose();
    }
  };
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Helper functions to get current names
  const getCurrentOrganizationName = () => {
    if (!organizationId || !organizations.length) return 'Select Organization';
    const currentOrg = organizations.find(org => org.id === organizationId);
    return currentOrg ? currentOrg.name : 'Select Organization';
  };

  const getCurrentWorkspaceName = () => {
    if (!workspaceId || !workspaces.length) return 'Select Workspace';
    const currentWorkspace = workspaces.find(ws => ws.id === workspaceId);
    return currentWorkspace ? currentWorkspace.name : 'Select Workspace';
  };

  // Filter organizations and workspaces based on search query
  const filteredOrganizations = organizations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredWorkspaces = workspaces.filter(ws => 
    ws.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title="Switch organization or workspace">
          <Button
            id="context-switcher-button"
            aria-controls={open ? 'context-switcher-menu' : undefined}
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
              height: 40,
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <IconBuildingSkyscraper size={20} />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                {getCurrentOrganizationName()}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                {getCurrentWorkspaceName()}
              </Typography>
            </Box>
          </Button>
        </Tooltip>
      </Box>
      
      <Menu
        id="context-switcher-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'context-switcher-button',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 300,
            maxHeight: 500,
            overflow: 'auto',
            mt: 0.5
          }
        }}
      >
        {/* Search box */}
        <Box sx={{ px: 2, py: 1 }}>
          <Paper
            component="form"
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%' }}
          >
            <IconButton sx={{ p: '10px' }} aria-label="search">
              <IconSearch size={18} />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search organizations & workspaces"
              inputProps={{ 'aria-label': 'search organizations and workspaces' }}
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
            />
          </Paper>
        </Box>
        
        <Divider />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            {/* Organizations Section */}
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Organizations
              </Typography>
            </Box>
            
            {filteredOrganizations.length > 0 ? (
              filteredOrganizations.map((org) => (
                <MenuItem 
                  key={org.id}
                  onClick={() => handleOrganizationClick(org)}
                  selected={organizationId === org.id}
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
                    <IconBuilding size={20} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={org.name}
                    primaryTypographyProps={{
                      noWrap: true,
                      variant: 'body2',
                      fontWeight: organizationId === org.id ? 'bold' : 'normal'
                    }}
                  />
                  {organizationId === org.id && (
                    <Badge color="primary" variant="dot" />
                  )}
                </MenuItem>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery ? 'No organizations match your search' : 'No organizations found'}
                </Typography>
              </Box>
            )}
            
            <Divider sx={{ my: 1 }} />
            
            {/* Workspaces Section */}
            {organizationId && (
              <>
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Workspaces in {getCurrentOrganizationName()}
                  </Typography>
                </Box>
                
                {filteredWorkspaces.length > 0 ? (
                  filteredWorkspaces.map((workspace) => (
                    <MenuItem 
                      key={workspace.id}
                      onClick={() => handleWorkspaceClick(workspace)}
                      selected={workspaceId === workspace.id}
                      sx={{ 
                        py: 1.5,
                        px: 2,
                        '&.Mui-selected': {
                          backgroundColor: 'secondary.light',
                          '&:hover': {
                            backgroundColor: 'secondary.light',
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
                          variant: 'body2',
                          fontWeight: workspaceId === workspace.id ? 'bold' : 'normal'
                        }}
                      />
                      {workspaceId === workspace.id && (
                        <Badge color="secondary" variant="dot" />
                      )}
                    </MenuItem>
                  ))
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery ? 'No workspaces match your search' : 'No workspaces found'}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </>
        )}
        
        <Divider sx={{ my: 1 }} />
        
        {/* Management options */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Management
          </Typography>
        </Box>
        
        <MenuItem onClick={() => {
          handleClose();
          navigate('/organizations');
        }}>
          <ListItemIcon>
            <IconSettings size={20} />
          </ListItemIcon>
          <ListItemText primary="Manage Organizations" />
        </MenuItem>
        
        {organizationId && (
          <MenuItem onClick={() => {
            handleClose();
            navigate(`/organizations/${organizationId}/workspaces`);
          }}>
            <ListItemIcon>
              <IconFolder size={20} />
            </ListItemIcon>
            <ListItemText primary="Manage Workspaces" />
          </MenuItem>
        )}
        
        {organizationId && workspaceId && (
          <MenuItem onClick={() => {
            handleClose();
            navigate(`/workspaces/${workspaceId}/members`);
          }}>
            <ListItemIcon>
              <IconUsers size={20} />
            </ListItemIcon>
            <ListItemText primary="Workspace Members" />
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default OrganizationWorkspaceSwitcher;
