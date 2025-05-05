import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
  Button,
  Divider,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import usePermissions from '../hooks/usePermissions';

/**
 * Context Switcher component
 * Allows users to switch between organizations and workspaces
 */
const ContextSwitcher = ({ onCreateOrganization, onCreateWorkspace }) => {
  const { 
    user,
    currentOrganization, 
    currentWorkspace,
    getUserOrganizations,
    getUserWorkspaces,
    setActiveOrganization,
    setActiveWorkspace
  } = useAuth();
  
  const permissions = usePermissions();
  
  const [organizations, setOrganizations] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);
  
  // Fetch organizations on component mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!user) return;
      
      try {
        setLoadingOrgs(true);
        const orgs = await getUserOrganizations();
        setOrganizations(orgs);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setLoadingOrgs(false);
      }
    };
    
    fetchOrganizations();
  }, [user, getUserOrganizations]);
  
  // Fetch workspaces when organization changes
  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!currentOrganization) {
        setWorkspaces([]);
        return;
      }
      
      try {
        setLoadingWorkspaces(true);
        const spaces = await getUserWorkspaces(currentOrganization.id);
        setWorkspaces(spaces);
      } catch (error) {
        console.error('Error fetching workspaces:', error);
      } finally {
        setLoadingWorkspaces(false);
      }
    };
    
    fetchWorkspaces();
  }, [currentOrganization, getUserWorkspaces]);
  
  // Handle organization change
  const handleOrganizationChange = async (event) => {
    const orgId = event.target.value;
    
    if (orgId === 'create') {
      // Trigger create organization dialog
      if (onCreateOrganization) {
        onCreateOrganization();
      }
      return;
    }
    
    try {
      await setActiveOrganization(orgId);
    } catch (error) {
      console.error('Error setting active organization:', error);
    }
  };
  
  // Handle workspace change
  const handleWorkspaceChange = async (event) => {
    const workspaceId = event.target.value;
    
    if (workspaceId === 'create') {
      // Trigger create workspace dialog
      if (onCreateWorkspace) {
        onCreateWorkspace();
      }
      return;
    }
    
    try {
      await setActiveWorkspace(currentOrganization.id, workspaceId);
    } catch (error) {
      console.error('Error setting active workspace:', error);
    }
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {/* Organization selector */}
      <Box>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
          Organization
        </Typography>
        <FormControl 
          size="small" 
          sx={{ minWidth: 180 }}
          data-testid="context-switcher-organization"
        >
          {loadingOrgs ? (
            <Select
              value=""
              disabled
              displayEmpty
              renderValue={() => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2">Loading...</Typography>
                </Box>
              )}
            >
              <MenuItem value="" disabled>Loading organizations...</MenuItem>
            </Select>
          ) : (
            <Select
              value={currentOrganization?.id || ''}
              onChange={handleOrganizationChange}
              displayEmpty
              MenuProps={{
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left',
                },
              }}
              renderValue={(value) => {
                if (!value) return <em>Select Organization</em>;
                const org = organizations.find(o => o.id === value);
                return org?.name || 'Unknown Organization';
              }}
            >
              {organizations.length === 0 ? (
                <MenuItem value="" disabled>No organizations found</MenuItem>
              ) : (
                <>
                  {organizations.map((org) => (
                    <MenuItem key={org.id} value={org.id}>
                      {org.name}
                    </MenuItem>
                  ))}
                  <Divider />
                  <MenuItem value="create">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AddIcon fontSize="small" />
                      <Typography>Create New Organization</Typography>
                    </Box>
                  </MenuItem>
                </>
              )}
            </Select>
          )}
        </FormControl>
      </Box>
      
      {/* Workspace selector - only shown when an organization is selected */}
      {currentOrganization && (
        <Box>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
            Workspace
          </Typography>
          <FormControl 
            size="small" 
            sx={{ minWidth: 180 }}
            data-testid="context-switcher-workspace"
          >
            {loadingWorkspaces ? (
              <Select
                value=""
                disabled
                displayEmpty
                renderValue={() => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2">Loading...</Typography>
                  </Box>
                )}
              >
                <MenuItem value="" disabled>Loading workspaces...</MenuItem>
              </Select>
            ) : (
              <Select
                value={currentWorkspace?.id || ''}
                onChange={handleWorkspaceChange}
                displayEmpty
                MenuProps={{
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                }}
                renderValue={(value) => {
                  if (!value) return <em>Select Workspace</em>;
                  const workspace = workspaces.find(w => w.id === value);
                  return workspace?.name || 'Unknown Workspace';
                }}
              >
                {workspaces.length === 0 ? (
                  <MenuItem value="" disabled>No workspaces found</MenuItem>
                ) : (
                  <>
                    {workspaces.map((workspace) => (
                      <MenuItem key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </MenuItem>
                    ))}
                    {permissions.canCreateWorkspace && (
                      <>
                        <Divider />
                        <MenuItem value="create">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AddIcon fontSize="small" />
                            <Typography>Create New Workspace</Typography>
                          </Box>
                        </MenuItem>
                      </>
                    )}
                  </>
                )}
              </Select>
            )}
          </FormControl>
        </Box>
      )}
    </Box>
  );
};

export default ContextSwitcher;
