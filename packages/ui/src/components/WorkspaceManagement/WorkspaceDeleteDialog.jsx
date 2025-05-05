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
 * Workspace delete dialog component
 * Allows administrators to delete a workspace
 */
const WorkspaceDeleteDialog = ({
  open,
  onClose,
  onWorkspaceDeleted,
  organizationId,
  workspaceId,
  workspaceName,
}) => {
  const { deleteWorkspace } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState(null);

  // Handle confirmation text change
  const handleConfirmTextChange = (event) => {
    setConfirmText(event.target.value);
    setError(null);
  };

  // Handle delete button click
  const handleDelete = async () => {
    // Check if confirmation text matches workspace name
    if (confirmText !== workspaceName) {
      setError('Please type the workspace name correctly to confirm deletion');
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete workspace
      await deleteWorkspace(organizationId, workspaceId);
      
      // Close dialog
      onClose();
      
      // Call the onWorkspaceDeleted callback
      onWorkspaceDeleted();
    } catch (error) {
      console.error('Workspace deletion error:', error);
      enqueueSnackbar(error.message || 'Failed to delete workspace', { variant: 'error' });
      setLoading(false);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    // Reset state
    setConfirmText('');
    setError(null);
    
    // Close dialog
    onClose();
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle color="error">Delete Workspace</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          This action cannot be undone. This will permanently delete the workspace and all associated data.
        </Alert>
        
        <Typography variant="body1" paragraph>
          Please type <strong>{workspaceName}</strong> to confirm deletion:
        </Typography>
        
        <TextField
          fullWidth
          value={confirmText}
          onChange={handleConfirmTextChange}
          placeholder={`Type "${workspaceName}" to confirm`}
          error={!!error}
          helperText={error}
          disabled={loading}
          autoComplete="off"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          disabled={loading || confirmText !== workspaceName}
        >
          {loading ? <CircularProgress size={24} /> : 'Delete Workspace'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

WorkspaceDeleteDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onWorkspaceDeleted: PropTypes.func.isRequired,
  organizationId: PropTypes.string.isRequired,
  workspaceId: PropTypes.string.isRequired,
  workspaceName: PropTypes.string.isRequired,
};

export default WorkspaceDeleteDialog;
