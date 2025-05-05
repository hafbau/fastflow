import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import WorkspaceCard from './WorkspaceCard';
import WorkspaceCreateDialog from './WorkspaceCreateDialog';

/**
 * Workspace list component
 * Displays a list of workspaces for an organization
 */
const WorkspaceList = ({ organizationId, organizationName }) => {
  const { getUserWorkspaces } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch workspaces
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoading(true);
        const workspacesData = await getUserWorkspaces(organizationId);
        setWorkspaces(workspacesData);
      } catch (error) {
        console.error('Error fetching workspaces:', error);
        enqueueSnackbar('Failed to load workspaces', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) {
      fetchWorkspaces();
    }
  }, [organizationId, getUserWorkspaces, enqueueSnackbar]);

  // Handle search
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter workspaces
  const filteredWorkspaces = workspaces.filter((workspace) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        workspace.name.toLowerCase().includes(query) ||
        (workspace.description && workspace.description.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // Handle workspace creation
  const handleWorkspaceCreated = (newWorkspace) => {
    setWorkspaces([...workspaces, newWorkspace]);
    setCreateDialogOpen(false);
    enqueueSnackbar('Workspace created successfully', { variant: 'success' });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {organizationName ? `${organizationName} Workspaces` : 'Workspaces'}
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Workspace
        </Button>
      </Box>
      
      <Box mb={4}>
        <TextField
          fullWidth
          placeholder="Search workspaces..."
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : filteredWorkspaces.length > 0 ? (
        <Grid container spacing={3}>
          {filteredWorkspaces.map((workspace) => (
            <Grid item xs={12} sm={6} md={4} key={workspace.id}>
              <WorkspaceCard workspace={workspace} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No workspaces found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {searchQuery
              ? 'No workspaces match your search criteria'
              : 'Get started by creating your first workspace'}
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Workspace
            </Button>
          )}
        </Paper>
      )}
      
      <WorkspaceCreateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onWorkspaceCreated={handleWorkspaceCreated}
        organizationId={organizationId}
      />
    </Box>
  );
};

WorkspaceList.propTypes = {
  organizationId: PropTypes.string.isRequired,
  organizationName: PropTypes.string,
};

export default WorkspaceList;
