import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

/**
 * ForgotPassword page component
 * Allows users to request a password reset via email
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setError(null);
      setSuccess(false);
      setIsLoading(true);
      
      await resetPassword(email);
      
      // Reset successful
      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
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
          backgroundImage: 'url(/images/forgot-password-bg.jpg)',
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
            Forgot Password?
          </Typography>
          <Typography variant="h5" gutterBottom>
            Let's help you get back to your account
          </Typography>
          <Typography variant="body1">
            We'll send you a secure link to reset your password.
          </Typography>
        </Box>
      </Grid>
      
      {/* Right side - Forgot password form */}
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
            maxWidth: 450,
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
              Reset Password
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center">
              Enter your email address and we'll send you instructions to reset your password
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Reset link sent to your email address. Please check your inbox and follow the instructions.
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleEmailChange}
              disabled={isLoading || success}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.2 }}
              disabled={isLoading || success}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Send Reset Link'}
            </Button>
          </form>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              Remember your password?{' '}
              <Link component={RouterLink} to="/login" variant="body2">
                Sign in
              </Link>
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link component={RouterLink} to="/register" variant="body2">
                Sign up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ForgotPassword;
