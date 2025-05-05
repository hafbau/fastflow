import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

/**
 * User details form for registration
 * Collects user's email, password, and personal information
 */
const UserDetailsForm = ({ formData, handleChange }) => {
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
            value={formData.email}
            onChange={handleChange('email')}
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
            value={formData.password}
            onChange={handleChange('password')}
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
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
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
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="firstName"
            name="firstName"
            label="First Name"
            value={formData.firstName}
            onChange={handleChange('firstName')}
            autoComplete="given-name"
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
            autoComplete="family-name"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

UserDetailsForm.propTypes = {
  formData: PropTypes.shape({
    email: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    confirmPassword: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default UserDetailsForm;
