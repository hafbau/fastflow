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
 * Workspace member invite dialog component
 * Allows administrators to invite organization members to a workspace
 */
const WorkspaceMemberInviteDialog = ({
  open,
  onClose,
  onMemberInvited,
  organizationId,
  workspaceId,
}) => {
  const { getOrganizationMembers, inviteWorkspaceMember } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [organizationMembers, setOrganizationMembers] = useState([]);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [formData, setFormData] = useState({
    userId: '',
    role: 'member',
  });
  const [errors, setErrors] = useState({});

  // Fetch organization members when dialog opens
  useEffect(() => {
    const fetchOrganizationMembers = async () => {
      if (!open) return;
      
      try {
        setLoadingMembers(true);
        
        // Get organization members
        const orgMembers = await getOrganizationMembers(organizationId);
        
        // Filter out members who are already in the workspace
        const availableMembers = orgMembers.filter(
          (orgMember) => !workspaceMembers.some((wsMember) => wsMember.id === orgMember.id)
        );
        
        setOrganizationMembers(availableMembers);
        
        // Reset form data
        setFormData({
          userId: availableMembers.length > 0 ? availableMembers[0].id : '',
          role: 'member',
        });
      } catch (error) {
        console.error('Error fetching organization members:', error);
        enqueueSnackbar('Failed to load organization members', { variant: 'error' });
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchOrganizationMembers();
  }, [open, organizationId, workspaceMembers, getOrganizationMembers, enqueueSnackbar]);

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
    
    // Validate userId
    if (!formData.userId) {
      newErrors.userId = 'Please select a member to invite';
    }
    
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
      
      // Invite member to workspace
      const newMember = await inviteWorkspaceMember(organizationId, workspaceId, {
        userId: formData.userId,
        role: formData.role,
      });
      
      // Call the onMemberInvited callback with the new member
      onMemberInvited(newMember);
      
      // Reset form
      setFormData({
        userId: '',
        role: 'member',
      });
      
      // Close dialog
      onClose();
    } catch (error) {
      console.error('Workspace member invite error:', error);
      enqueueSnackbar(error.message || 'Failed to invite member', { variant: 'error' });
      setLoading(false);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    // Reset form
    setFormData({
      userId: '',
      role: 'member',
    });
    setErrors({});
    
    // Close dialog
    onClose();
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Invite Workspace Member</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} py={2}>
          <Typography variant="body2" color="textSecondary" paragraph>
            Invite an organization member to join this workspace.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.userId} disabled={loading || loadingMembers}>
                <InputLabel id="member-select-label">Organization Member</InputLabel>
                <Select
                  labelId="member-select-label"
                  id="member-select"
                  value={formData.userId}
                  onChange={handleChange('userId')}
                  label="Organization Member"
                >
                  {loadingMembers ? (
                    <MenuItem value="" disabled>
                      <CircularProgress size={20} /> Loading members...
                    </MenuItem>
                  ) : organizationMembers.length > 0 ? (
                    organizationMembers.map((member) => (
                      <MenuItem key={member.id} value={member.id}>
                        {member.fullName || member.email}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>
                      No available members to invite
                    </MenuItem>
                  )}
                </Select>
                {errors.userId && <FormHelperText>{errors.userId}</FormHelperText>}
                {organizationMembers.length === 0 && !loadingMembers && (
                  <FormHelperText>
                    All organization members are already in this workspace
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={loading || loadingMembers || organizationMembers.length === 0}
        >
          {loading ? <CircularProgress size={24} /> : 'Invite Member'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

WorkspaceMemberInviteDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onMemberInvited: PropTypes.func.isRequired,
  organizationId: PropTypes.string.isRequired,
  workspaceId: PropTypes.string.isRequired,
};

export default WorkspaceMemberInviteDialog;
