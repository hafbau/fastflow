import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  AccountCircle,
  Security,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import ProfileEditor from './ProfileEditor';
import PasswordChange from './PasswordChange';
import MFASetup from './MFASetup';
import { useSnackbar } from 'notistack';

/**
 * User profile page component
 * Shows user information and provides tabs for different profile management sections
 */
const UserProfile = () => {
  const { user, getUserProfile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileData = await getUserProfile();
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
        enqueueSnackbar('Failed to load profile data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, getUserProfile, enqueueSnackbar]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    enqueueSnackbar('Profile updated successfully', { variant: 'success' });
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="md">
        <Box my={4} textAlign="center">
          <Typography variant="h5" color="error">
            Failed to load profile
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Grid container spacing={4}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    src={profile.avatarUrl}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    sx={{ width: 80, height: 80, mr: 3 }}
                  />
                  <Box>
                    <Typography variant="h4">
                      {profile.firstName} {profile.lastName}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      {profile.email}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Member since {new Date(profile.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Tabs */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  aria-label="profile tabs"
                  variant="fullWidth"
                >
                  <Tab icon={<AccountCircle />} label="Profile" />
                  <Tab icon={<Security />} label="Password" />
                  <Tab icon={<Settings />} label="MFA" />
                </Tabs>
              </Box>
              
              <CardContent>
                {/* Profile Tab */}
                {activeTab === 0 && (
                  <ProfileEditor 
                    profile={profile} 
                    onUpdate={handleProfileUpdate} 
                  />
                )}
                
                {/* Password Tab */}
                {activeTab === 1 && (
                  <PasswordChange />
                )}
                
                {/* MFA Tab */}
                {activeTab === 2 && (
                  <MFASetup />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default UserProfile;
