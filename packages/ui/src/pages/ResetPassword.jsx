import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
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
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

/**
 * ResetPassword page component
 * Allows users to set a new password after receiving a reset link
 */
const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const { confirmResetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract reset token from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    
    if (token) {
      setResetToken(token);
    } else {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [location]);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const validatePasswords = () => {
    if (!password) {
      setError('Please enter a new password');
      return false;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!resetToken) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
      return;
    }
    
    if (!validatePasswords()) {
      return;
    }
    
    try {
      setError(null);
      setSuccess(false);
      setIsLoading(true);
      
      await confirmResetPassword(resetToken, password);
      
      // Reset successful
      setSuccess(true);
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Your password has been reset successfully. Please log in with your new password.' 
          } 
        });
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. Please try again or request a new reset link.');
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
          backgroundImage: 'url(/images/reset-password-bg.jpg)',
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
            Reset Password
          </Typography>
          <Typography variant="h5" gutterBottom>
            Create a new secure password
          </Typography>
          <Typography variant="body1">
            Choose a strong password that you don't use on any other site.
          </Typography>
        </Box>
      </Grid>
      
      {/* Right side - Reset password form */}
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
              Create New Password
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center">
              Enter and confirm your new password
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Your password has been reset successfully. Redirecting to login page...
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading || success || !resetToken}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              disabled={isLoading || success || !resetToken}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.2 }}
              disabled={isLoading || success || !resetToken}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
          </form>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              <Link component={RouterLink} to="/login" variant="body2">
                Return to Sign In
              </Link>
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Need a new reset link?{' '}
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Request again
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ResetPassword;
