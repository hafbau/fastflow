import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

/**
 * Organization create dialog component
 * Allows users to create a new organization
 */
const OrganizationCreateDialog = ({ open, onClose, onOrganizationCreated }) => {
  const { createOrganization } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

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
      
      // Create organization
      const newOrg = await createOrganization(formData);
      
      // Call the onOrganizationCreated callback with the new organization
      onOrganizationCreated(newOrg);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
      });
    } catch (error) {
      console.error('Organization creation error:', error);
      enqueueSnackbar(error.message || 'Failed to create organization', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      name: '',
      description: '',
    });
    setErrors({});
    
    // Close dialog
    onClose();
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Organization</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} py={2}>
          <Typography variant="body2" color="textSecondary" paragraph>
            Create a new organization to collaborate with your team.
          </Typography>
          
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
                autoFocus
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
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Organization'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

OrganizationCreateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onOrganizationCreated: PropTypes.func.isRequired,
};

export default OrganizationCreateDialog;
