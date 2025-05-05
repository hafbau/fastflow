import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

/**
 * Workspace create dialog component
 * Allows users to create a new workspace in an organization
 */
const WorkspaceCreateDialog = ({ open, onClose, onWorkspaceCreated, organizationId }) => {
  const { createWorkspace, getUserOrganizations } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organizationId: organizationId || '',
  });
  const [errors, setErrors] = useState({});

  // Fetch organizations if organizationId is not provided
  React.useEffect(() => {
    const fetchOrganizations = async () => {
      if (!open || organizationId) return;
      
      try {
        setLoadingOrgs(true);
        const orgs = await getUserOrganizations();
        setOrganizations(orgs);
        
        // Set default organization if available
        if (orgs.length > 0 && !formData.organizationId) {
          setFormData(prev => ({
            ...prev,
            organizationId: orgs[0].id,
          }));
        }
      } catch (error) {
        console.error('Error fetching organizations:', error);
        enqueueSnackbar('Failed to load organizations', { variant: 'error' });
      } finally {
        setLoadingOrgs(false);
      }
    };

    fetchOrganizations();
  }, [open, organizationId, getUserOrganizations, enqueueSnackbar, formData.organizationId]);

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    
    // Clear error when field is edited
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Workspace name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Workspace name must be at least 3 characters';
    }
    
    // Validate organization
    if (!formData.organizationId) {
      newErrors.organizationId = 'Please select an organization';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Create workspace
      const workspace = await createWorkspace(formData.organizationId, {
        name: formData.name,
        description: formData.description,
      });
      
      // Call the onWorkspaceCreated callback with the new workspace
      onWorkspaceCreated(workspace);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        organizationId: organizationId || '',
      });
      
      // Close dialog
      onClose();
    } catch (error) {
      console.error('Workspace creation error:', error);
      enqueueSnackbar(error.message || 'Failed to create workspace', { variant: 'error' });
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      name: '',
      description: '',
      organizationId: organizationId || '',
    });
    setErrors({});
    
    // Close dialog
    onClose();
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Create Workspace</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} py={2}>
          <Typography variant="body2" color="textSecondary" paragraph>
            Create a new workspace to organize your projects and collaborate with team members.
          </Typography>
          
          <Grid container spacing={3}>
            {!organizationId && (
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.organizationId} disabled={loading || loadingOrgs}>
                  <InputLabel id="organization-select-label">Organization</InputLabel>
                  <Select
                    labelId="organization-select-label"
                    id="organization-select"
                    value={formData.organizationId}
                    onChange={handleChange('organizationId')}
                    label="Organization"
                  >
                    {loadingOrgs ? (
                      <MenuItem value="" disabled>
                        <CircularProgress size={20} /> Loading organizations...
                      </MenuItem>
                    ) : organizations.length > 0 ? (
                      organizations.map((org) => (
                        <MenuItem key={org.id} value={org.id}>
                          {org.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        No organizations available
                      </MenuItem>
                    )}
                  </Select>
                  {errors.organizationId && <FormHelperText>{errors.organizationId}</FormHelperText>}
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="name"
                name="name"
                label="Workspace Name"
                value={formData.name}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                disabled={loading}
                placeholder="e.g., Marketing, Development, HR"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                error={!!errors.description}
                helperText={errors.description}
                disabled={loading}
                multiline
                rows={3}
                placeholder="Describe the purpose of this workspace"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          disabled={loading || (loadingOrgs && !organizationId)}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Workspace'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

WorkspaceCreateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onWorkspaceCreated: PropTypes.func.isRequired,
  organizationId: PropTypes.string,
};

export default WorkspaceCreateDialog;
