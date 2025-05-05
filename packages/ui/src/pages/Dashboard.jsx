import React from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Alert,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import usePermissions from '../hooks/usePermissions';
import PermissionGate from '../components/PermissionGate';

/**
 * Dashboard component
 * Serves as the entry point after user login
 */
const Dashboard = () => {
  const { 
    user, 
    currentOrganization, 
    currentWorkspace,
    getUserOrganizations,
    getUserWorkspaces 
  } = useAuth();
  
  const permissions = usePermissions();
  const navigate = useNavigate();
  
  const [organizations, setOrganizations] = React.useState([]);
  const [workspaces, setWorkspaces] = React.useState([]);
  
  // Fetch organizations and workspaces on component mount
  React.useEffect(() => {
    const fetchUserContext = async () => {
      try {
        if (user) {
          const orgs = await getUserOrganizations();
          setOrganizations(orgs || []);
          
          if (currentOrganization) {
            const spaces = await getUserWorkspaces(currentOrganization.id);
            setWorkspaces(spaces || []);
          }
        }
      } catch (error) {
        console.error('Error fetching context data:', error);
      }
    };
    
    fetchUserContext();
  }, [user, currentOrganization, getUserOrganizations, getUserWorkspaces]);
  
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Welcome to FlowStack, {user?.full_name || user?.email || 'User'}!
        </Typography>
      </Box>
      
      {!currentOrganization && (
        <Alert 
          severity="info" 
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => navigate('/organizations')}
            >
              View Organizations
            </Button>
          }
          sx={{ mb: 4 }}
        >
          Please select or create an organization to get started.
        </Alert>
      )}
      
      {currentOrganization && !currentWorkspace && (
        <Alert 
          severity="info"
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => navigate(`/organizations/${currentOrganization.id}/workspaces`)}
            >
              View Workspaces
            </Button>
          }
          sx={{ mb: 4 }}
        >
          Select or create a workspace in {currentOrganization.name} to continue.
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* User Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Your Information
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Email" secondary={user?.email || 'N/A'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Full Name" secondary={user?.full_name || 'N/A'} />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="System Admin" 
                  secondary={user?.is_system_admin ? 'Yes' : 'No'} 
                />
              </ListItem>
            </List>
            
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/profile')}
              >
                Edit Profile
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Context Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Active Context
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Current Organization" 
                  secondary={currentOrganization?.name || 'None Selected'} 
                />
              </ListItem>
              {currentOrganization && (
                <ListItem>
                  <ListItemText 
                    primary="Organization Role" 
                    secondary={currentOrganization?.role || 'N/A'} 
                  />
                </ListItem>
              )}
              <Divider sx={{ my: 1 }} />
              <ListItem>
                <ListItemText 
                  primary="Current Workspace" 
                  secondary={currentWorkspace?.name || 'None Selected'} 
                />
              </ListItem>
              {currentWorkspace && (
                <ListItem>
                  <ListItemText 
                    primary="Workspace Role" 
                    secondary={currentWorkspace?.role || 'N/A'} 
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        
        {/* Organizations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Your Organizations" 
              action={
                <Button 
                  size="small" 
                  onClick={() => navigate('/organizations')}
                >
                  View All
                </Button>
              } 
            />
            <CardContent>
              {organizations.length === 0 ? (
                <Typography color="textSecondary">
                  You don't have any organizations yet.
                </Typography>
              ) : (
                <List>
                  {organizations.slice(0, 5).map(org => (
                    <ListItem 
                      key={org.id}
                      button
                      onClick={() => navigate(`/organizations/${org.id}`)}
                    >
                      <ListItemText 
                        primary={org.name} 
                        secondary={`Role: ${org.role || 'Member'}`} 
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Workspaces */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Your Workspaces" 
              action={
                currentOrganization && (
                  <Button 
                    size="small" 
                    onClick={() => navigate(`/organizations/${currentOrganization.id}/workspaces`)}
                  >
                    View All
                  </Button>
                )
              } 
            />
            <CardContent>
              {!currentOrganization ? (
                <Typography color="textSecondary">
                  Select an organization to view workspaces.
                </Typography>
              ) : workspaces.length === 0 ? (
                <Typography color="textSecondary">
                  No workspaces found in this organization.
                </Typography>
              ) : (
                <List>
                  {workspaces.slice(0, 5).map(workspace => (
                    <ListItem 
                      key={workspace.id}
                      button
                      onClick={() => navigate(`/workspaces/${workspace.id}`)}
                    >
                      <ListItemText 
                        primary={workspace.name} 
                        secondary={`Role: ${workspace.role || 'Member'}`} 
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Admin Actions */}
        <Grid item xs={12}>
          <PermissionGate permission="isSystemAdmin">
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/admin/users')}
              >
                User Administration
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/admin/settings')}
              >
                System Settings
              </Button>
            </Stack>
          </PermissionGate>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
