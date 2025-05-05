import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useAuth } from '../../../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import AvatarUploader from './AvatarUploader';

/**
 * Profile editor component
 * Allows users to edit their profile information
 */
const ProfileEditor = ({ profile, onUpdate }) => {
  const { updateUserProfile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    jobTitle: profile.jobTitle || '',
    company: profile.company || '',
    bio: profile.bio || '',
    avatarUrl: profile.avatarUrl || '',
  });

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleAvatarUpdate = (url) => {
    setFormData({
      ...formData,
      avatarUrl: url,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      setLoading(true);
      
      // Update profile
      const updatedProfile = await updateUserProfile(formData);
      
      // Call the onUpdate callback with the updated profile
      onUpdate(updatedProfile);
    } catch (error) {
      console.error('Profile update error:', error);
      enqueueSnackbar(error.message || 'Failed to update profile', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Edit Profile
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} display="flex" justifyContent="center">
          <AvatarUploader 
            currentAvatarUrl={formData.avatarUrl} 
            onAvatarUpdate={handleAvatarUpdate}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="firstName"
            name="firstName"
            label="First Name"
            value={formData.firstName}
            onChange={handleChange('firstName')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="lastName"
            name="lastName"
            label="Last Name"
            value={formData.lastName}
            onChange={handleChange('lastName')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="jobTitle"
            name="jobTitle"
            label="Job Title"
            value={formData.jobTitle}
            onChange={handleChange('jobTitle')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="company"
            name="company"
            label="Company"
            value={formData.company}
            onChange={handleChange('company')}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="bio"
            name="bio"
            label="Bio"
            value={formData.bio}
            onChange={handleChange('bio')}
            multiline
            rows={4}
            helperText="Tell us a bit about yourself"
          />
        </Grid>
        
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

ProfileEditor.propTypes = {
  profile: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    jobTitle: PropTypes.string,
    company: PropTypes.string,
    bio: PropTypes.string,
    avatarUrl: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default ProfileEditor;
