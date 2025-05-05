import React, { useState, useRef } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { 
  AddAPhoto, 
  Delete,
  PhotoCamera,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Avatar uploader component
 * Allows users to upload, crop, and remove profile pictures
 */
const AvatarUploader = ({ currentAvatarUrl, onAvatarUpdate }) => {
  const { uploadAvatar, deleteAvatar } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        enqueueSnackbar('Image size must be less than 5MB', { variant: 'error' });
        return;
      }
      
      // Check file type
      if (!file.type.match('image.*')) {
        enqueueSnackbar('Please select an image file', { variant: 'error' });
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
        setDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      setLoading(true);
      
      // Upload avatar
      const avatarUrl = await uploadAvatar(selectedFile);
      
      // Call the onAvatarUpdate callback with the new URL
      onAvatarUpdate(avatarUrl);
      
      // Close dialog
      setDialogOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      
      enqueueSnackbar('Avatar updated successfully', { variant: 'success' });
    } catch (error) {
      console.error('Avatar upload error:', error);
      enqueueSnackbar(error.message || 'Failed to upload avatar', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setLoading(true);
      
      // Delete avatar
      await deleteAvatar();
      
      // Call the onAvatarUpdate callback with null
      onAvatarUpdate(null);
      
      enqueueSnackbar('Avatar removed successfully', { variant: 'success' });
    } catch (error) {
      console.error('Avatar removal error:', error);
      enqueueSnackbar(error.message || 'Failed to remove avatar', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          <IconButton
            color="primary"
            aria-label="upload picture"
            component="span"
            onClick={() => fileInputRef.current.click()}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 1,
            }}
          >
            <PhotoCamera />
          </IconButton>
        }
      >
        <Avatar
          src={currentAvatarUrl}
          alt="Profile Picture"
          sx={{ width: 100, height: 100 }}
        />
      </Badge>
      
      <input
        ref={fileInputRef}
        accept="image/*"
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      
      <Box mt={2} display="flex" gap={1}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddAPhoto />}
          onClick={() => fileInputRef.current.click()}
          disabled={loading}
        >
          Change
        </Button>
        
        {currentAvatarUrl && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<Delete />}
            onClick={handleRemove}
            disabled={loading}
          >
            Remove
          </Button>
        )}
      </Box>
      
      {/* Avatar Preview Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Upload Profile Picture</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" p={2}>
            <Typography variant="body2" color="textSecondary" paragraph>
              Preview your profile picture
            </Typography>
            
            {previewUrl && (
              <Avatar
                src={previewUrl}
                alt="Preview"
                sx={{ width: 200, height: 200, mb: 2 }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            color="primary" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

AvatarUploader.propTypes = {
  currentAvatarUrl: PropTypes.string,
  onAvatarUpdate: PropTypes.func.isRequired,
};

export default AvatarUploader;
