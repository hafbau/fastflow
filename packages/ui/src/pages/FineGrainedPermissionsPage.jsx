import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Breadcrumbs,
  Link,
  Divider,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

// Import components
import FineGrainedPermissionManager from '../components/permissions/FineGrainedPermissionManager';
import MainCard from 'ui-component/cards/MainCard';

// FineGrainedPermissionsPage component
const FineGrainedPermissionsPage = () => {
  const [users, setUsers] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedResourceType, setSelectedResourceType] = useState('');
  const [selectedResource, setSelectedResource] = useState('');
  const [loading, setLoading] = useState(false);
  const [organizationId, setOrganizationId] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { userId, resourceType, resourceId } = useParams();

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      enqueueSnackbar('Failed to fetch users', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch resource types
  const fetchResourceTypes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/permissions/resource-types');
      setResourceTypes(response.data);
    } catch (error) {
      console.error('Error fetching resource types:', error);
      enqueueSnackbar('Failed to fetch resource types', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch resources for a resource type
  const fetchResources = async (type) => {
    if (!type) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/resources/${type}`);
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      enqueueSnackbar('Failed to fetch resources', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Initialize component
  useEffect(() => {
    // Set document title
    document.title = 'Fine-Grained Permissions | FlowStack';
    
    fetchUsers();
    fetchResourceTypes();
    
    // Get organization and workspace IDs from user context or session
    const getCurrentContext = async () => {
      try {
        const response = await axios.get('/api/user/context');
        setOrganizationId(response.data.organizationId);
        setWorkspaceId(response.data.workspaceId);
      } catch (error) {
        console.error('Error fetching user context:', error);
      }
    };
    
    getCurrentContext();
    
    // Set values from URL params if available
    if (userId) {
      setSelectedUser(userId);
    }
    
    if (resourceType) {
      setSelectedResourceType(resourceType);
      fetchResources(resourceType);
    }
    
    if (resourceId) {
      setSelectedResource(resourceId);
    }
  }, [userId, resourceType, resourceId]);

  // Handle user selection
  const handleUserChange = (e) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    updateUrl(userId, selectedResourceType, selectedResource);
  };

  // Handle resource type selection
  const handleResourceTypeChange = (e) => {
    const type = e.target.value;
    setSelectedResourceType(type);
    setSelectedResource(''); // Reset selected resource
    fetchResources(type);
    updateUrl(selectedUser, type, '');
  };

  // Handle resource selection
  const handleResourceChange = (e) => {
    const resourceId = e.target.value;
    setSelectedResource(resourceId);
    updateUrl(selectedUser, selectedResourceType, resourceId);
  };

  // Update URL with selected values
  const updateUrl = (userId, resourceType, resourceId) => {
    let url = '/permissions/fine-grained';
    
    if (userId) {
      url += `/user/${userId}`;
    }
    
    if (resourceType) {
      url += `/resource-type/${resourceType}`;
    }
    
    if (resourceId) {
      url += `/resource/${resourceId}`;
    }
    
    navigate(url);
  };

  return (
    <>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link color="inherit" href="/">
                Dashboard
              </Link>
              <Link color="inherit" href="/permissions">
                Permissions
              </Link>
              <Typography color="textPrimary">Fine-Grained Permissions</Typography>
            </Breadcrumbs>
            <Typography variant="h4" sx={{ mt: 2 }}>
              Fine-Grained Permissions Management
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Manage attribute-based, conditional, and time-based permissions for resources
            </Typography>
          </Box>
          
          <MainCard>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>User</InputLabel>
                  <Select
                    value={selectedUser}
                    onChange={handleUserChange}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select a user
                    </MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name || user.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Resource Type</InputLabel>
                  <Select
                    value={selectedResourceType}
                    onChange={handleResourceTypeChange}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select a resource type
                    </MenuItem>
                    {resourceTypes.map((type) => (
                      <MenuItem key={type.name} value={type.name}>
                        {type.displayName || type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth disabled={!selectedResourceType}>
                  <InputLabel>Resource</InputLabel>
                  <Select
                    value={selectedResource}
                    onChange={handleResourceChange}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select a resource
                    </MenuItem>
                    {resources.map((resource) => (
                      <MenuItem key={resource.id} value={resource.id}>
                        {resource.name || resource.id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </MainCard>
          
          <Box sx={{ mt: 4 }}>
            {selectedUser && selectedResourceType && selectedResource ? (
              <FineGrainedPermissionManager
                userId={selectedUser}
                resourceType={selectedResourceType}
                resourceId={selectedResource}
                organizationId={organizationId}
                workspaceId={workspaceId}
              />
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                  Please select a user, resource type, and resource to manage fine-grained permissions
                </Typography>
              </Paper>
            )}
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default FineGrainedPermissionsPage;