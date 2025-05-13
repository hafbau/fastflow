import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Paper,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
// apiClient is imported in api/auth.js if needed there, or directly if other calls are made here.
// For now, we only need registerUser from our new auth api.
import { registerUser } from '../api/user'; // Import new registerUser
import { useAuth } from '../contexts/AuthContext'; // Still need useAuth for authUser later if handling post-verification profile/org creation here
import UserDetailsForm from '../components/UserManagement/Registration/UserDetailsForm';
// OrganizationDetailsForm will be used in a separate post-login flow
// import OrganizationDetailsForm from '../components/UserManagement/Registration/OrganizationDetailsForm'; 
import VerificationStep from '../components/UserManagement/Registration/VerificationStep';

/**
 * Registration page component
 * Multi-step registration process for new users
 */
const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user: authUser } = useAuth(); // We might need authUser for other things, or for post-login checks
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    // User details
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    
    // Organization details
    organizationName: '',
    organizationDescription: '',
    industry: '',
    size: '',
  });
  
  // Steps for the registration process - simplified to 2 steps for initial registration
  const steps = [
    'Account Information',
    'Verification',
  ];
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const validateUserDetails = () => {
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (!formData.fullName) {
      setError('Full name is required');
      return false;
    }
    
    return true;
  };
  
  const validateOrganizationDetails = () => {
    if (!formData.organizationName) {
      setError('Organization name is required');
      return false;
    }
    
    return true;
  };
  
  const handleUserDetailsSubmit = async () => { // This is now the main submission handler for Step 0
    if (validateUserDetails()) {
      setIsLoading(true);
      setError(null);
      try {
        // Call backend /register endpoint
        await registerUser({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
        });
        
        // If backend call is successful (Supabase user created, profile created, email sent by backend)
        // Store email for VerificationStep display, as authUser might not be set yet.
        localStorage.setItem('pendingVerificationEmail', formData.email);
        handleNext(); // Proceed to VerificationStep
      } catch (err) {
        console.error('Registration API error:', err);
        setError(err.message || 'Registration failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Organization details will be collected after login if not present.
  // So, handleOrganizationDetailsSubmit and handleFullRegistration are removed from this initial flow.

  const handleVerificationComplete = () => {
    // After user confirms they've clicked the email link and checkEmailVerified is successful in VerificationStep
    localStorage.removeItem('pendingVerificationEmail'); // Clean up
    navigate('/login'); 
  };

  // Get current step content
  const getStepContent = (step) => {
    switch (step) {
      case 0: // Account Information
        return (
          <UserDetailsForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleUserDetailsSubmit} // This now calls backend /register
            isLoading={isLoading} // Pass isLoading for the button
          />
        );
      case 1: // Verification
        return (
          <VerificationStep
            email={formData.email} // Email from Step 0 form data
            onComplete={handleVerificationComplete} // Navigates to login
            handleBack={handleBack} // Go back to UserDetailsForm
            // isLoading is managed within VerificationStep for its own buttons
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Grid 
      container 
      sx={{ 
        height: '100vh',
        backgroundColor: (theme) => theme.palette.background.default
      }}
    >
      {/* Left side - FlowStack branding and info */}
      <Grid 
        item 
        xs={false} 
        sm={false} 
        md={6} 
        lg={7}
        sx={{
          backgroundImage: 'url(/images/register-bg.jpg)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          color: '#fff'
        }}
      >
        <Box 
          sx={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            p: 4,
            borderRadius: 2,
            maxWidth: '80%',
            textAlign: 'center'
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom>
            Join FlowStack
          </Typography>
          <Typography variant="h5" gutterBottom>
            Create your organization and start collaborating
          </Typography>
          <Typography variant="body1">
            Powerful tools for managing teams, workspaces, and resources.
          </Typography>
        </Box>
      </Grid>
      
      {/* Right side - Registration form */}
      <Grid 
        item 
        xs={12} 
        sm={12} 
        md={6} 
        lg={5}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 2, sm: 4, md: 6 }
        }}
      >
        <Paper 
          elevation={4}
          sx={{
            p: { xs: 3, sm: 4 },
            width: '100%',
            maxWidth: 500,
            borderRadius: 2
          }}
        >
          <Box 
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Create Account
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>
              Set up your account and organization
            </Typography>
            
            {/* Stepper */}
            <Stepper activeStep={activeStep} alternativeLabel sx={{ width: '100%', mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {/* Step content */}
          {getStepContent(activeStep)}
          
          {/* Login link */}
          {activeStep === 0 && (
            <>
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  OR
                </Typography>
              </Divider>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login" variant="body2">
                    Sign in
                  </Link>
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Register;
