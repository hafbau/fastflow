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
 * Workspace member remove dialog component
 * Allows administrators to remove a member from a workspace
 */
const WorkspaceMemberRemoveDialog = ({
  open,
  onClose,
  onMemberRemoved,
  organizationId,
  workspaceId,
  member,
}) => {
  const { removeWorkspaceMember, user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(false);

  // Check if the member is the current user
  const isCurrentUser = member?.id === user?.id;

  // Handle remove button click
  const handleRemove = async () => {
    try {
      setLoading(true);
      
      // Remove workspace member
      await removeWorkspaceMember(organizationId, workspaceId, member.id);
      
      // Call the onMemberRemoved callback with the member ID
      onMemberRemoved(member.id);
      
      // Close dialog
      onClose();
    } catch (error) {
      console.error('Workspace member remove error:', error);
      enqueueSnackbar(error.message || 'Failed to remove member', { variant: 'error' });
      setLoading(false);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    // Close dialog
    onClose();
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle color="error">Remove Member</DialogTitle>
      <DialogContent>
        {isCurrentUser ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            You cannot remove yourself from the workspace.
          </Alert>
        ) : (
          <>
            <Alert severity="warning" sx={{ mb: 3 }}>
              This action will remove the member from this workspace. They will no longer have access to workspace resources.
            </Alert>
            
            <Typography variant="body1" paragraph>
              Are you sure you want to remove <strong>{member?.fullName || member?.email}</strong> from this workspace?
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Note: The user will remain a member of the organization and can be invited back to the workspace later.
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleRemove}
          color="error"
          disabled={loading || isCurrentUser}
        >
          {loading ? <CircularProgress size={24} /> : 'Remove Member'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

WorkspaceMemberRemoveDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onMemberRemoved: PropTypes.func.isRequired,
  organizationId: PropTypes.string.isRequired,
  workspaceId: PropTypes.string.isRequired,
  member: PropTypes.shape({
    id: PropTypes.string.isRequired,
    fullName: PropTypes.string,
    email: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
  }).isRequired,
};

export default WorkspaceMemberRemoveDialog;
