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
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

/**
 * Workspace member edit dialog component
 * Allows administrators to edit a workspace member's role
 */
const WorkspaceMemberEditDialog = ({
  open,
  onClose,
  onMemberUpdated,
  organizationId,
  workspaceId,
  member,
}) => {
  const { updateWorkspaceMember } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: member?.role || 'member',
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
    
    // Validate role
    if (!formData.role) {
      newErrors.role = 'Please select a role';
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
      
      // Update workspace member
      const updatedMember = await updateWorkspaceMember(
        organizationId,
        workspaceId,
        member.id,
        {
          role: formData.role,
        }
      );
      
      // Call the onMemberUpdated callback with the updated member
      onMemberUpdated(updatedMember);
      
      // Close dialog
      onClose();
    } catch (error) {
      console.error('Workspace member update error:', error);
      enqueueSnackbar(error.message || 'Failed to update member role', { variant: 'error' });
      setLoading(false);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    // Reset form
    setFormData({
      role: member?.role || 'member',
    });
    setErrors({});
    
    // Close dialog
    onClose();
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Member Role</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} py={2}>
          <Typography variant="body2" color="textSecondary" paragraph>
            Update the role for <strong>{member?.fullName || member?.email}</strong>.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.role} disabled={loading}>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  id="role-select"
                  value={formData.role}
                  onChange={handleChange('role')}
                  label="Role"
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="member">Member</MenuItem>
                </Select>
                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
          
          <Box mt={3}>
            <Typography variant="subtitle2" gutterBottom>
              Role Permissions:
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Admin:</strong> Can manage workspace settings, invite members, and manage workspace content.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Member:</strong> Can view and interact with workspace content based on their specific permissions.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={loading || formData.role === member?.role}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

WorkspaceMemberEditDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onMemberUpdated: PropTypes.func.isRequired,
  organizationId: PropTypes.string.isRequired,
  workspaceId: PropTypes.string.isRequired,
  member: PropTypes.shape({
    id: PropTypes.string.isRequired,
    fullName: PropTypes.string,
    email: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
  }).isRequired,
};

export default WorkspaceMemberEditDialog;
