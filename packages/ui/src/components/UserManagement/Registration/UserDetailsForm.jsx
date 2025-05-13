import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
} from '@mui/material';
import PropTypes from 'prop-types';

/**
 * User details form for registration
 * Collects user's email, password, and personal information
 */
const UserDetailsForm = ({ formData, handleInputChange, handleSubmit }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Account Information
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Enter your email and create a password for your account.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="email"
            name="email"
            label="Email Address"
            type="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            autoComplete="email"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="password"
            name="password"
            label="Password"
            type="password"
            value={formData.password || ''}
            onChange={handleInputChange}
            autoComplete="new-password"
            helperText="Password must be at least 8 characters"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword || ''}
            onChange={handleInputChange}
            autoComplete="new-password"
          />
        </Grid>
      </Grid>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Personal Information
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Tell us a bit about yourself.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="fullName"
            name="fullName"
            label="Full Name"
            value={formData.fullName || ''}
            onChange={handleInputChange}
            autoComplete="name"
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
};

UserDetailsForm.propTypes = {
  formData: PropTypes.shape({
    email: PropTypes.string,
    password: PropTypes.string,
    confirmPassword: PropTypes.string,
    fullName: PropTypes.string,
  }),
  handleInputChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

export default UserDetailsForm;
