import React, { useState, useEffect } from 'react';
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
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

/**
 * Organization member edit dialog component
 * Allows administrators to edit member roles
 */
const OrganizationMemberEditDialog = ({ open, onClose, onMemberUpdated, member, organizationId }) => {
  const { updateOrganizationMember } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
  });
  const [errors, setErrors] = useState({});

  // Initialize form data when member changes
  useEffect(() => {
    if (member) {
      setFormData({
        role: member.role || '',
      });
    }
  }, [member]);

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
    
    // Validate role
    if (!formData.role) {
      newErrors.role = 'Role is required';
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
      
      // Update member
      const updatedMember = await updateOrganizationMember(
        organizationId,
        member.id,
        formData
      );
      
      // Call the onMemberUpdated callback with the updated member
      onMemberUpdated(updatedMember);
    } catch (error) {
      console.error('Member update error:', error);
      enqueueSnackbar(error.message || 'Failed to update member', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!member) {
    return null;
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Member Role</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} py={2}>
          <Typography variant="body2" color="textSecondary" paragraph>
            Update the role for <strong>{member.firstName} {member.lastName}</strong> ({member.email}).
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.role} disabled={loading}>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  value={formData.role}
                  label="Role"
                  onChange={handleChange('role')}
                >
                  <MenuItem value="admin">Administrator</MenuItem>
                  <MenuItem value="member">Member</MenuItem>
                  <MenuItem value="readonly">Read Only</MenuItem>
                </Select>
                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
              </FormControl>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                <strong>Administrator:</strong> Can manage organization settings, members, and workspaces.<br />
                <strong>Member:</strong> Can view and contribute to workspaces they have access to.<br />
                <strong>Read Only:</strong> Can only view content in workspaces they have access to.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

OrganizationMemberEditDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onMemberUpdated: PropTypes.func.isRequired,
  member: PropTypes.shape({
    id: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
  }),
  organizationId: PropTypes.string.isRequired,
};

export default OrganizationMemberEditDialog;
