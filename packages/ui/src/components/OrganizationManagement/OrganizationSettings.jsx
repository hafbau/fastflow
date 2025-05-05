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
import { Save, Delete } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import OrganizationDeleteDialog from './OrganizationDeleteDialog';

/**
 * Organization settings component
 * Allows administrators to manage organization settings
 */
const OrganizationSettings = ({ organization, onOrganizationUpdated }) => {
  const { updateOrganization } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: organization?.name || '',
    description: organization?.description || '',
  });
  const [errors, setErrors] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
      newErrors.name = 'Organization name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Organization name must be at least 3 characters';
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
      
      // Update organization
      const updatedOrg = await updateOrganization(organization.id, formData);
      
      // Call the onOrganizationUpdated callback with the updated organization
      onOrganizationUpdated(updatedOrg);
      
      enqueueSnackbar('Organization updated successfully', { variant: 'success' });
    } catch (error) {
      console.error('Organization update error:', error);
      enqueueSnackbar(error.message || 'Failed to update organization', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationDeleted = () => {
    enqueueSnackbar('Organization deleted successfully', { variant: 'success' });
    navigate('/organizations');
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Organization Settings
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                General Information
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="name"
                      name="name"
                      label="Organization Name"
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
                      rows={3}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                      disabled={loading}
                    >
                      Save Changes
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Danger Zone
              </Typography>
              
              <Alert severity="warning" sx={{ mb: 3 }}>
                Deleting an organization is permanent and cannot be undone. All workspaces and data will be lost.
              </Alert>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteDialogOpen(true)}
                fullWidth
              >
                Delete Organization
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <OrganizationDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onOrganizationDeleted={handleOrganizationDeleted}
        organization={organization}
      />
    </Box>
  );
};

OrganizationSettings.propTypes = {
  organization: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
  onOrganizationUpdated: PropTypes.func.isRequired,
};

export default OrganizationSettings;
