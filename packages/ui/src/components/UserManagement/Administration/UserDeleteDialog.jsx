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
import { useAuth } from '../../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

/**
 * User delete dialog component
 * Allows administrators to delete users from the organization
 */
const UserDeleteDialog = ({ open, onClose, onUserDeleted, user }) => {
  const { deleteUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Delete user
      await deleteUser(user.id);
      
      // Call the onUserDeleted callback with the user ID
      onUserDeleted(user.id);
    } catch (error) {
      console.error('User delete error:', error);
      enqueueSnackbar(error.message || 'Failed to delete user', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm">
      <DialogTitle>Delete User</DialogTitle>
      <DialogContent>
        <Box py={2}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            This action cannot be undone. The user will be permanently removed from your organization.
          </Alert>
          
          <Typography variant="body1" paragraph>
            Are you sure you want to delete the following user?
          </Typography>
          
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body1">
              <strong>Name:</strong> {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {user.email}
            </Typography>
            <Typography variant="body1">
              <strong>Role:</strong> {user.role}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleDelete} 
          color="error" 
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Delete User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

UserDeleteDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUserDeleted: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
  }),
};

export default UserDeleteDialog;
