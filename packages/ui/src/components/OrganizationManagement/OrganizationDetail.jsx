import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  Edit,
  Group,
  Settings,
  WorkOutline,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import OrganizationMembers from './OrganizationMembers';
import OrganizationSettings from './OrganizationSettings';
import WorkspaceList from '../WorkspaceManagement/WorkspaceList';

/**
 * Organization detail component
 * Displays and manages a single organization
 */
const OrganizationDetail = () => {
  const { organizationId } = useParams();
  const { getOrganization } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(null);
  const [activeTab, setActiveTab] = useState('workspaces');

  // Fetch organization
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setLoading(true);
        const org = await getOrganization(organizationId);
        setOrganization(org);
      } catch (error) {
        console.error('Error fetching organization:', error);
        enqueueSnackbar('Failed to load organization', { variant: 'error' });
        navigate('/organizations');
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) {
      fetchOrganization();
    }
  }, [organizationId, getOrganization, enqueueSnackbar, navigate]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!organization) {
    return (
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" align="center">
            Organization not found
          </Typography>
          <Box display="flex" justifyContent="center" mt={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/organizations')}
            >
              Back to Organizations
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" gutterBottom>
                      {organization.name}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      {organization.description}
                    </Typography>
                  </Box>
                  
                  {organization.userRole === 'admin' && (
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => navigate(`/organizations/${organizationId}/settings`)}
                    >
                      Edit Organization
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="organization tabs"
              >
                <Tab 
                  icon={<WorkOutline />} 
                  iconPosition="start" 
                  label="Workspaces" 
                  value="workspaces" 
                />
                <Tab 
                  icon={<Group />} 
                  iconPosition="start" 
                  label="Members" 
                  value="members" 
                />
                {organization.userRole === 'admin' && (
                  <Tab 
                    icon={<Settings />} 
                    iconPosition="start" 
                    label="Settings" 
                    value="settings" 
                  />
                )}
              </Tabs>
            </Box>
            
            <Box py={3}>
              {activeTab === 'workspaces' && (
                <WorkspaceList organizationId={organizationId} />
              )}
              
              {activeTab === 'members' && (
                <OrganizationMembers 
                  organizationId={organizationId} 
                  userRole={organization.userRole} 
                />
              )}
              
              {activeTab === 'settings' && organization.userRole === 'admin' && (
                <OrganizationSettings 
                  organization={organization} 
                  onOrganizationUpdated={setOrganization} 
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default OrganizationDetail;
