import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

/**
 * Workspace settings component
 * Allows administrators to update workspace settings
 */
const WorkspaceSettings = ({ workspace, organizationId, onWorkspaceUpdated }) => {
  const { updateWorkspace } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: workspace.name || '',
    description: workspace.description || '',
  });
  const [errors, setErrors] = useState({});

  // Handle form field changes
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

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Workspace name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Workspace name must be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Update workspace
      const updatedWorkspace = await updateWorkspace(organizationId, workspace.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      });
      
      // Call the onWorkspaceUpdated callback with the updated workspace
      onWorkspaceUpdated(updatedWorkspace);
      
      enqueueSnackbar('Workspace settings updated successfully', { variant: 'success' });
    } catch (error) {
      console.error('Workspace update error:', error);
      enqueueSnackbar(error.message || 'Failed to update workspace settings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Workspace Settings
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Update your workspace information and settings.
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={3}>
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
                rows={4}
                placeholder="Describe the purpose of this workspace"
              />
            </Grid>
          </Grid>
          
          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              disabled={loading}
            >
              Save Changes
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom color="error">
            Danger Zone
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            Deleting a workspace is permanent and cannot be undone. All workspace data will be lost.
          </Alert>
          
          <Typography variant="body2" paragraph>
            To delete this workspace, go to the workspace overview and click the "Delete" button.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

WorkspaceSettings.propTypes = {
  workspace: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
  organizationId: PropTypes.string.isRequired,
  onWorkspaceUpdated: PropTypes.func.isRequired,
};

export default WorkspaceSettings;
