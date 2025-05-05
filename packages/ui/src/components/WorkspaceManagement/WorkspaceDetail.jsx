import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  Business,
  Delete,
  Edit,
  Group,
  Settings,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import WorkspaceMembers from './WorkspaceMembers';
import WorkspaceSettings from './WorkspaceSettings';
import WorkspaceDeleteDialog from './WorkspaceDeleteDialog';

/**
 * Workspace detail component
 * Displays detailed information about a workspace and provides tabs for different sections
 */
const WorkspaceDetail = () => {
  const { organizationId, workspaceId } = useParams();
  const { getWorkspace, getOrganization } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch workspace and organization data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get workspace details
        const workspaceData = await getWorkspace(organizationId, workspaceId);
        setWorkspace(workspaceData);
        
        // Get organization details
        const organizationData = await getOrganization(organizationId);
        setOrganization(organizationData);
      } catch (error) {
        console.error('Error fetching workspace details:', error);
        enqueueSnackbar(error.message || 'Failed to load workspace details', { variant: 'error' });
        navigate('/organizations');
      } finally {
        setLoading(false);
      }
    };

    if (organizationId && workspaceId) {
      fetchData();
    }
  }, [organizationId, workspaceId, getWorkspace, getOrganization, enqueueSnackbar, navigate]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate(`/organizations/${organizationId}`);
  };

  // Handle edit button click
  const handleEditClick = () => {
    setActiveTab('settings');
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  // Handle workspace deletion
  const handleWorkspaceDeleted = () => {
    enqueueSnackbar('Workspace deleted successfully', { variant: 'success' });
    navigate(`/organizations/${organizationId}`);
  };

  // Render loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Render error state if workspace or organization not found
  if (!workspace || !organization) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Workspace not found
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/organizations')}
        >
          Back to Organizations
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={handleBackClick} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        
        <Box flexGrow={1}>
          <Typography variant="h4" gutterBottom>
            {workspace.name}
          </Typography>
          
          <Box display="flex" alignItems="center">
            <Business fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {organization.name}
            </Typography>
          </Box>
        </Box>
        
        {workspace.role === 'admin' && (
          <Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Edit />}
              onClick={handleEditClick}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleDeleteClick}
            >
              Delete
            </Button>
          </Box>
        )}
      </Box>
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="workspace tabs">
          <Tab label="Overview" value="overview" icon={<Business />} iconPosition="start" />
          <Tab label="Members" value="members" icon={<Group />} iconPosition="start" />
          {workspace.role === 'admin' && (
            <Tab label="Settings" value="settings" icon={<Settings />} iconPosition="start" />
          )}
        </Tabs>
      </Box>
      
      {/* Tab content */}
      {activeTab === 'overview' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  About this Workspace
                </Typography>
                
                <Typography variant="body1" paragraph>
                  {workspace.description || 'No description provided.'}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body2">
                      {new Date(workspace.created_at).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {new Date(workspace.updated_at).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Your Role
                    </Typography>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {workspace.role}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Organization
                    </Typography>
                    <Typography variant="body2">
                      {organization.name}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Group />}
                  onClick={() => setActiveTab('members')}
                  sx={{ mb: 2 }}
                >
                  Manage Members
                </Button>
                
                {workspace.role === 'admin' && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Settings />}
                    onClick={() => setActiveTab('settings')}
                  >
                    Workspace Settings
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {activeTab === 'members' && (
        <WorkspaceMembers
          organizationId={organizationId}
          workspaceId={workspaceId}
          userRole={workspace.role}
        />
      )}
      
      {activeTab === 'settings' && workspace.role === 'admin' && (
        <WorkspaceSettings
          workspace={workspace}
          organizationId={organizationId}
          onWorkspaceUpdated={(updatedWorkspace) => setWorkspace(updatedWorkspace)}
        />
      )}
      
      {/* Delete dialog */}
      <WorkspaceDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onWorkspaceDeleted={handleWorkspaceDeleted}
        organizationId={organizationId}
        workspaceId={workspaceId}
        workspaceName={workspace.name}
      />
    </Box>
  );
};

export default WorkspaceDetail;
