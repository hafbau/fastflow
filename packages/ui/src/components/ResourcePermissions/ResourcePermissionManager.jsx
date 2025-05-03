import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Checkbox, 
  Chip, 
  CircularProgress, 
  Divider, 
  FormControl, 
  FormControlLabel, 
  Grid, 
  IconButton, 
  InputLabel, 
  MenuItem, 
  Paper, 
  Select, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TextField, 
  Typography 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTheme } from '@mui/material/styles';
import useApi from '../../hooks/useApi';
import useConfirm from '../../hooks/useConfirm';

/**
 * Resource Permission Manager Component
 * 
 * This component provides an interface for managing resource-level permissions.
 * It allows administrators to assign and revoke permissions for specific resources.
 */
const ResourcePermissionManager = ({ resourceType, resourceId, resourceName }) => {
  const theme = useTheme();
  const { confirm } = useConfirm();
  const api = useApi();

  // State
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [resourcePermissions, setResourcePermissions] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedPermission, setSelectedPermission] = useState('');
  const [error, setError] = useState(null);

  // Load users and permissions on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load users
        const usersResponse = await api.get('/api/v1/users');
        setUsers(usersResponse.data);

        // Load available permissions for this resource type
        const permissionsResponse = await api.get(`/api/v1/roles-permissions/resource-types/${resourceType}/permissions`);
        setPermissions(permissionsResponse.data);

        // Load current resource permissions
        await loadResourcePermissions();
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [resourceType, resourceId]);

  // Load resource permissions
  const loadResourcePermissions = async () => {
    try {
      const response = await api.get(`/api/v1/resource-permissions/resources/${resourceType}/${resourceId}/users`);
      
      // Transform the data into a more usable format
      const permissionsData = [];
      
      // For each permission, get the users who have it
      for (const permission of permissions) {
        const usersWithPermission = await api.get(
          `/api/v1/resource-permissions/resources/${resourceType}/${resourceId}/users?permission=${permission.action}`
        );
        
        const userIds = usersWithPermission.data.userIds || [];
        
        for (const userId of userIds) {
          permissionsData.push({
            userId,
            permission: permission.action
          });
        }
      }
      
      setResourcePermissions(permissionsData);
    } catch (err) {
      setError(err.message || 'Failed to load resource permissions');
    }
  };

  // Handle adding a new permission
  const handleAddPermission = async () => {
    if (!selectedUser || !selectedPermission) {
      setError('Please select both a user and a permission');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/api/v1/resource-permissions/users/${selectedUser}/resources/${resourceType}/${resourceId}`, {
        permission: selectedPermission
      });

      // Refresh the permissions list
      await loadResourcePermissions();
      
      // Reset selection
      setSelectedUser('');
      setSelectedPermission('');
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to add permission');
    } finally {
      setLoading(false);
    }
  };

  // Handle removing a permission
  const handleRemovePermission = async (userId, permission) => {
    const result = await confirm({
      title: 'Remove Permission',
      message: 'Are you sure you want to remove this permission?',
      confirmText: 'Remove',
      cancelText: 'Cancel'
    });

    if (!result) return;

    setLoading(true);
    try {
      await api.delete(`/api/v1/resource-permissions/users/${userId}/resources/${resourceType}/${resourceId}`, {
        data: { permission }
      });

      // Refresh the permissions list
      await loadResourcePermissions();
    } catch (err) {
      setError(err.message || 'Failed to remove permission');
    } finally {
      setLoading(false);
    }
  };

  // Get user name by ID
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.fullName || user.email || 'Unknown User'}` : 'Unknown User';
  };

  // Get permission label
  const getPermissionLabel = (permissionAction) => {
    const permission = permissions.find(p => p.action === permissionAction);
    return permission ? permission.description || permission.action : permissionAction;
  };

  return (
    <Card>
      <CardHeader 
        title={
          <Box display="flex" alignItems="center">
            <Typography variant="h5" component="div">
              Resource Permissions
            </Typography>
            <Box ml={1}>
              <Chip 
                label={resourceName || resourceType} 
                color="primary" 
                size="small" 
              />
            </Box>
          </Box>
        }
        action={
          <IconButton onClick={loadResourcePermissions} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        }
      />
      <Divider />
      <CardContent>
        {error && (
          <Box mb={2}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {/* Add Permission Form */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: theme.palette.background.neutral }}>
          <Typography variant="subtitle1" gutterBottom>
            Add Permission
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="user-select-label">User</InputLabel>
                <Select
                  labelId="user-select-label"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  label="User"
                  disabled={loading}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.fullName || user.email || user.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="permission-select-label">Permission</InputLabel>
                <Select
                  labelId="permission-select-label"
                  value={selectedPermission}
                  onChange={(e) => setSelectedPermission(e.target.value)}
                  label="Permission"
                  disabled={loading}
                >
                  {permissions.map((permission) => (
                    <MenuItem key={permission.id} value={permission.action}>
                      {permission.description || permission.action}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddPermission}
                disabled={loading || !selectedUser || !selectedPermission}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Add Permission'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Permissions Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Permission</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && !resourcePermissions.length ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : resourcePermissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No permissions assigned
                  </TableCell>
                </TableRow>
              ) : (
                resourcePermissions.map((item, index) => (
                  <TableRow key={`${item.userId}-${item.permission}-${index}`}>
                    <TableCell>{getUserName(item.userId)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getPermissionLabel(item.permission)} 
                        size="small" 
                        color={
                          item.permission.includes('delete') ? 'error' :
                          item.permission.includes('write') || item.permission.includes('update') ? 'warning' :
                          'default'
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleRemovePermission(item.userId, item.permission)}
                        disabled={loading}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ResourcePermissionManager;