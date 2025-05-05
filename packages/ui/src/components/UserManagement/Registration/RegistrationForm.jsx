import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import UserDetailsForm from './UserDetailsForm';
import OrganizationDetailsForm from './OrganizationDetailsForm';
import VerificationStep from './VerificationStep';
import { useAuth } from '../../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const steps = ['Account Details', 'Organization Details', 'Verification'];

/**
 * Multi-step registration form component
 * Handles user registration, organization creation, and email verification
 */
const RegistrationForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    organizationSlug: '',
    organizationDescription: '',
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (activeStep === 0) {
      // Validate user details
      if (formData.password !== formData.confirmPassword) {
        enqueueSnackbar('Passwords do not match', { variant: 'error' });
        return;
      }
      handleNext();
    } else if (activeStep === 1) {
      // Register user and create organization
      try {
        setLoading(true);
        
        // Register user
        await register(formData.email, formData.password, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          organizationName: formData.organizationName,
          organizationSlug: formData.organizationSlug,
          organizationDescription: formData.organizationDescription,
        });
        
        handleNext();
      } catch (error) {
        console.error('Registration error:', error);
        enqueueSnackbar(error.message || 'Registration failed', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <UserDetailsForm 
            formData={formData} 
            handleChange={handleChange} 
          />
        );
      case 1:
        return (
          <OrganizationDetailsForm 
            formData={formData} 
            handleChange={handleChange} 
          />
        );
      case 2:
        return (
          <VerificationStep 
            email={formData.email} 
            onComplete={() => navigate('/login')} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Create Your Account
        </Typography>
        <Typography variant="body1" align="center" color="textSecondary" paragraph>
          Join Flowstack to start building your workflows
        </Typography>
        
        <Card variant="outlined" sx={{ mt: 4 }}>
          <CardContent>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            <Divider sx={{ mb: 4 }} />
            
            <form onSubmit={handleSubmit}>
              {renderStepContent(activeStep)}
              
              <Box mt={4} display="flex" justifyContent="space-between">
                <Button
                  disabled={activeStep === 0 || activeStep === steps.length - 1 || loading}
                  onClick={handleBack}
                >
                  Back
                </Button>
                
                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : activeStep === steps.length - 2 ? (
                      'Register'
                    ) : (
                      'Next'
                    )}
                  </Button>
                ) : null}
              </Box>
            </form>
          </CardContent>
        </Card>
        
        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Already have an account?{' '}
            <Button
              color="primary"
              onClick={() => navigate('/login')}
              disabled={loading}
            >
              Sign In
            </Button>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default RegistrationForm;
