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
  TextField,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

/**
 * Organization delete dialog component
 * Allows administrators to delete an organization
 */
const OrganizationDeleteDialog = ({ open, onClose, onOrganizationDeleted, organization }) => {
  const { deleteOrganization } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleConfirmTextChange = (event) => {
    setConfirmText(event.target.value);
  };

  const isConfirmationValid = confirmText === organization?.name;

  const handleDelete = async () => {
    if (!organization || !isConfirmationValid) return;
    
    try {
      setLoading(true);
      
      // Delete organization
      await deleteOrganization(organization.id);
      
      // Call the onOrganizationDeleted callback
      onOrganizationDeleted();
    } catch (error) {
      console.error('Organization delete error:', error);
      enqueueSnackbar(error.message || 'Failed to delete organization', { variant: 'error' });
      setLoading(false);
    }
  };

  if (!organization) {
    return null;
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm">
      <DialogTitle>Delete Organization</DialogTitle>
      <DialogContent>
        <Box py={2}>
          <Alert severity="error" sx={{ mb: 3 }}>
            This action is permanent and cannot be undone. All workspaces, members, and data associated with this organization will be permanently deleted.
          </Alert>
          
          <Typography variant="body1" paragraph>
            Please type <strong>{organization.name}</strong> to confirm deletion.
          </Typography>
          
          <TextField
            fullWidth
            value={confirmText}
            onChange={handleConfirmTextChange}
            placeholder={`Type "${organization.name}" to confirm`}
            disabled={loading}
            error={confirmText !== '' && !isConfirmationValid}
            helperText={confirmText !== '' && !isConfirmationValid ? 'Text does not match organization name' : ''}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleDelete} 
          color="error" 
          disabled={loading || !isConfirmationValid}
        >
          {loading ? <CircularProgress size={24} /> : 'Delete Organization'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

OrganizationDeleteDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onOrganizationDeleted: PropTypes.func.isRequired,
  organization: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
};

export default OrganizationDeleteDialog;
