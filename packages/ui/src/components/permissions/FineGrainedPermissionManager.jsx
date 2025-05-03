import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

// Import components
import AttributeManager from './AttributeManager';
import ConditionBuilder from './ConditionBuilder';
import TimeBasedPermissionManager from './TimeBasedPermissionManager';

// TabPanel component for the permission tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`permission-tabpanel-${index}`}
      aria-labelledby={`permission-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// FineGrainedPermissionManager component
const FineGrainedPermissionManager = ({
  userId,
  resourceType,
  resourceId,
  organizationId,
  workspaceId,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [conditionalPermissions, setConditionalPermissions] = useState([]);
  const [currentConditionalPermission, setCurrentConditionalPermission] = useState({
    expression: {
      type: 'condition',
      operator: 'eq',
      left: { type: 'attribute', attributeType: 'resource', attributeKey: '' },
      right: ''
    },
    isActive: true
  });
  
  const { enqueueSnackbar } = useSnackbar();

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fetch permissions
  const fetchPermissions = async () => {
    setLoading(true);
    try {
      // Fetch available permissions for the resource type
      const permissionsResponse = await axios.get(`/api/permissions/resource-types/${resourceType}`);
      setPermissions(permissionsResponse.data);
      
      // Fetch user roles
      if (userId) {
        const rolesResponse = await axios.get(`/api/roles/user/${userId}`);
        setRoles(rolesResponse.data);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      enqueueSnackbar('Failed to fetch permissions', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch conditional permissions
  const fetchConditionalPermissions = async () => {
    if (!userId || !selectedPermission) return;
    
    setLoading(true);
    try {
      const response = await axios.get('/api/permissions/conditional', {
        params: {
          userId,
          permissionId: selectedPermission.id,
          resourceType,
          resourceId,
        },
      });
      
      setConditionalPermissions(response.data);
    } catch (error) {
      console.error('Error fetching conditional permissions:', error);
      enqueueSnackbar('Failed to fetch conditional permissions', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Initialize component
  useEffect(() => {
    fetchPermissions();
  }, [resourceType, userId]);

  // Fetch conditional permissions when selected permission changes
  useEffect(() => {
    fetchConditionalPermissions();
  }, [selectedPermission]);

  // Handle permission selection
  const handlePermissionChange = (e) => {
    const permissionId = e.target.value;
    const permission = permissions.find(p => p.id === permissionId);
    setSelectedPermission(permission);
  };

  // Check if user has permission through roles
  const hasPermissionThroughRoles = (permission) => {
    if (!permission || !roles.length) return false;
    
    // Check if any of the user's roles have this permission
    return roles.some(role => 
      role.permissions && role.permissions.some(p => p.id === permission.id)
    );
  };

  // Handle dialog open for adding a new conditional permission
  const handleAddConditionalPermission = () => {
    setCurrentConditionalPermission({
      expression: {
        type: 'condition',
        operator: 'eq',
        left: { type: 'attribute', attributeType: 'resource', attributeKey: '' },
        right: ''
      },
      isActive: true
    });
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Save conditional permission
  const handleSaveConditionalPermission = async () => {
    try {
      if (!userId || !selectedPermission) {
        enqueueSnackbar('User and permission must be selected', { variant: 'error' });
        return;
      }
      
      const payload = {
        ...currentConditionalPermission,
        userId,
        permissionId: selectedPermission.id,
        resourceType,
        resourceId,
      };
      
      await axios.post('/api/permissions/conditional', payload);
      
      enqueueSnackbar('Conditional permission created successfully', { variant: 'success' });
      handleCloseDialog();
      fetchConditionalPermissions();
    } catch (error) {
      console.error('Error saving conditional permission:', error);
      enqueueSnackbar('Failed to save conditional permission', { variant: 'error' });
    }
  };

  // Delete conditional permission
  const handleDeleteConditionalPermission = async (id) => {
    try {
      await axios.delete(`/api/permissions/conditional/${id}`);
      enqueueSnackbar('Conditional permission deleted successfully', { variant: 'success' });
      fetchConditionalPermissions();
    } catch (error) {
      console.error('Error deleting conditional permission:', error);
      enqueueSnackbar('Failed to delete conditional permission', { variant: 'error' });
    }
  };

  // Toggle conditional permission active status
  const handleToggleConditionalPermission = async (permission) => {
    try {
      await axios.put(`/api/permissions/conditional/${permission.id}`, {
        ...permission,
        isActive: !permission.isActive,
      });
      
      enqueueSnackbar(
        `Conditional permission ${!permission.isActive ? 'activated' : 'deactivated'} successfully`,
        { variant: 'success' }
      );
      
      fetchConditionalPermissions();
    } catch (error) {
      console.error('Error toggling conditional permission:', error);
      enqueueSnackbar('Failed to update conditional permission', { variant: 'error' });
    }
  };

  // Handle permission refresh
  const handleRefreshPermissions = () => {
    fetchPermissions();
    fetchConditionalPermissions();
  };

  return (
    <Card>
      <CardHeader title="Fine-Grained Permission Management" />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Permission</InputLabel>
              <Select
                value={selectedPermission?.id || ''}
                onChange={handlePermissionChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select a permission
                </MenuItem>
                {permissions.map((permission) => (
                  <MenuItem key={permission.id} value={permission.id}>
                    {permission.name} ({permission.action})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            {selectedPermission && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">
                  Permission Details:
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {selectedPermission.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Action:</strong> {selectedPermission.action}
                </Typography>
                <Typography variant="body2">
                  <strong>Resource Type:</strong> {selectedPermission.resourceType}
                </Typography>
                <Typography variant="body2">
                  <strong>Has Through Roles:</strong> {hasPermissionThroughRoles(selectedPermission) ? (
                    <Chip size="small" icon={<CheckIcon />} label="Yes" color="success" />
                  ) : (
                    <Chip size="small" icon={<CloseIcon />} label="No" color="error" />
                  )}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="permission tabs">
            <Tab label="Attributes" />
            <Tab label="Conditional Permissions" />
            <Tab label="Time-Based Permissions" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <AttributeManager
            resourceType={resourceType}
            resourceId={resourceId}
            userId={userId}
            organizationId={organizationId}
            workspaceId={workspaceId}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Conditional Permissions</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddConditionalPermission}
                disabled={!selectedPermission || !userId}
              >
                Add Conditional Permission
              </Button>
            </Box>
            
            {conditionalPermissions.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="textSecondary">
                  No conditional permissions found. Add one to grant permission based on specific conditions.
                </Typography>
              </Paper>
            ) : (
              conditionalPermissions.map((permission) => (
                <Accordion key={permission.id} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                      <Typography>
                        Conditional Permission {permission.isActive ? (
                          <Chip size="small" label="Active" color="success" sx={{ ml: 1 }} />
                        ) : (
                          <Chip size="small" label="Inactive" color="default" sx={{ ml: 1 }} />
                        )}
                      </Typography>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleConditionalPermission(permission);
                          }}
                          color={permission.isActive ? 'warning' : 'success'}
                        >
                          {permission.isActive ? <CloseIcon /> : <CheckIcon />}
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConditionalPermission(permission.id);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ConditionBuilder
                      value={permission.expression}
                      resourceType={resourceType}
                      resourceId={resourceId}
                      userId={userId}
                      organizationId={organizationId}
                      workspaceId={workspaceId}
                      readOnly={true}
                    />
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <TimeBasedPermissionManager
            userId={userId}
            permissionId={selectedPermission?.id}
            resourceType={resourceType}
            resourceId={resourceId}
            onPermissionChange={handleRefreshPermissions}
          />
        </TabPanel>
      </CardContent>
      
      {/* Add Conditional Permission Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add Conditional Permission</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Create a conditional permission that grants access only when specific conditions are met.
          </DialogContentText>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Build Condition Expression
            </Typography>
            <Paper sx={{ p: 2 }}>
              <ConditionBuilder
                value={currentConditionalPermission.expression}
                onChange={(newExpression) => setCurrentConditionalPermission({
                  ...currentConditionalPermission,
                  expression: newExpression
                })}
                resourceType={resourceType}
                resourceId={resourceId}
                userId={userId}
                organizationId={organizationId}
                workspaceId={workspaceId}
              />
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveConditionalPermission} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default FineGrainedPermissionManager;