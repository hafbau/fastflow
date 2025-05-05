import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

/**
 * Organization member remove dialog component
 * Allows administrators to remove members from the organization
 */
const OrganizationMemberRemoveDialog = ({ open, onClose, onMemberRemoved, member, organizationId }) => {
  const { removeOrganizationMember } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    if (!member) return;
    
    try {
      setLoading(true);
      
      // Remove member
      await removeOrganizationMember(organizationId, member.id);
      
      // Call the onMemberRemoved callback with the member ID
      onMemberRemoved(member.id);
    } catch (error) {
      console.error('Member remove error:', error);
      enqueueSnackbar(error.message || 'Failed to remove member', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!member) {
    return null;
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm">
      <DialogTitle>Remove Member</DialogTitle>
      <DialogContent>
        <Box py={2}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            This action will remove the member from your organization. They will lose access to all organization resources.
          </Alert>
          
          <Typography variant="body1" paragraph>
            Are you sure you want to remove the following member?
          </Typography>
          
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body1">
              <strong>Name:</strong> {member.firstName} {member.lastName}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {member.email}
            </Typography>
            <Typography variant="body1">
              <strong>Role:</strong> {member.role}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleRemove} 
          color="error" 
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Remove Member'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

OrganizationMemberRemoveDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onMemberRemoved: PropTypes.func.isRequired,
  member: PropTypes.shape({
    id: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
  }),
  organizationId: PropTypes.string.isRequired,
};

export default OrganizationMemberRemoveDialog;
