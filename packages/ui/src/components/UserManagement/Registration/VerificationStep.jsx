import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert,
  AlertTitle,
} from '@mui/material';
import { CheckCircle, Email } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useAuth } from '../../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

/**
 * Email verification step for registration
 * Shows verification status and allows resending verification email
 */
const VerificationStep = ({ email, onComplete }) => {
  const { resendVerificationEmail, checkEmailVerified } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [checkCount, setCheckCount] = useState(0);

  // Check if email is verified
  const handleCheckVerification = async () => {
    try {
      setLoading(true);
      const isVerified = await checkEmailVerified();
      
      if (isVerified) {
        setVerified(true);
        enqueueSnackbar('Email verified successfully!', { variant: 'success' });
      } else {
        // If we've checked multiple times, show a more helpful message
        if (checkCount > 2) {
          enqueueSnackbar('Email not verified yet. Please check your inbox and click the verification link.', { variant: 'info' });
        } else {
          enqueueSnackbar('Email not verified yet. Please check your inbox.', { variant: 'info' });
        }
        setCheckCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Verification check error:', error);
      enqueueSnackbar(error.message || 'Failed to check verification status', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const handleResendEmail = async () => {
    try {
      setResendLoading(true);
      await resendVerificationEmail(email); // Pass the email prop here
      enqueueSnackbar('Verification email sent!', { variant: 'success' });
    } catch (error) {
      console.error('Resend verification error:', error);
      enqueueSnackbar(error.message || 'Failed to resend verification email', { variant: 'error' });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Box textAlign="center" py={3}>
      {verified ? (
        <Box>
          <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Email Verified!
          </Typography>
          <Typography variant="body1" paragraph>
            Your email has been successfully verified.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={onComplete}
          >
            Continue to Login
          </Button>
        </Box>
      ) : (
        <Box>
          <Email color="primary" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Verify Your Email
          </Typography>
          <Typography variant="body1" paragraph>
            We've sent a verification email to <strong>{email}</strong>.
            Please check your inbox and click the verification link.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <AlertTitle>Didn't receive the email?</AlertTitle>
            • Check your spam or junk folder<br />
            • Verify that you entered the correct email address<br />
            • Click the button below to resend the verification email
          </Alert>
          
          <Box display="flex" justifyContent="center" gap={2}>
            <Button
              variant="outlined"
              onClick={handleCheckVerification}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'I\'ve Verified My Email'}
            </Button>
            
            <Button
              variant="text"
              onClick={handleResendEmail}
              disabled={resendLoading}
            >
              {resendLoading ? <CircularProgress size={24} /> : 'Resend Email'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

VerificationStep.propTypes = {
  email: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};

export default VerificationStep;
