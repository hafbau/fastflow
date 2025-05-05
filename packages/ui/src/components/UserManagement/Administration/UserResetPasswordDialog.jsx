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
 * User reset password dialog component
 * Allows administrators to send password reset emails to users
 */
const UserResetPasswordDialog = ({ open, onClose, onPasswordReset, user }) => {
  const { resetUserPassword } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Reset user password
      await resetUserPassword(user.id);
      
      // Call the onPasswordReset callback
      onPasswordReset();
    } catch (error) {
      console.error('Password reset error:', error);
      enqueueSnackbar(error.message || 'Failed to reset password', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm">
      <DialogTitle>Reset User Password</DialogTitle>
      <DialogContent>
        <Box py={2}>
          <Alert severity="info" sx={{ mb: 3 }}>
            This will send a password reset email to the user. They will need to click the link in the email to set a new password.
          </Alert>
          
          <Typography variant="body1" paragraph>
            Are you sure you want to reset the password for the following user?
          </Typography>
          
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body1">
              <strong>Name:</strong> {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {user.email}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleResetPassword} 
          color="primary" 
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Send Reset Email'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

UserResetPasswordDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPasswordReset: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
  }),
};

export default UserResetPasswordDialog;
