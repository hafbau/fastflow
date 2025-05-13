import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  useMediaQuery
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import useScriptRef from '../../hooks/useScriptRef';
import AnimateButton from '../../ui-component/extended/AnimateButton';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// ============================|| LOGIN ||============================ //

const Login = ({ ...others }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const scriptedRef = useScriptRef();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  const [checked, setChecked] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, getUserWorkspaces } = useAuth();

  // Handle login success and workspace navigation
  const handleLoginSuccess = async (userData) => {
    try {
      // If there's a specific location to redirect to after login, use that
      const from = location.state?.from || '/dashboard';
      
      // If the redirect is to a workspace, navigate directly
      if (from.startsWith('/workspaces/')) {
        navigate(from);
        return;
      }
      
      // Check if user has organizations with workspaces
      if (userData.user && userData.user.default_organization_id) {
        try {
          // Get workspaces for the default organization
          const workspaces = await getUserWorkspaces(userData.user.default_organization_id);
          
          if (workspaces && workspaces.length > 0) {
            // If user has a default workspace, navigate to it
            if (userData.user.default_workspace_id) {
              const defaultWorkspace = workspaces.find(w => w.id === userData.user.default_workspace_id);
              if (defaultWorkspace) {
                navigate(`/workspaces/${defaultWorkspace.id}`);
                return;
              }
            }
            
            // Otherwise, navigate to the first workspace
            navigate(`/workspaces/${workspaces[0].id}`);
            return;
          }
        } catch (error) {
          console.error('Error getting workspaces:', error);
          // Fall through to default navigation
        }
      }
      
      // Default navigation if no workspace was selected
      navigate('/dashboard');
    } catch (err) {
      console.error('Navigation error:', err);
      setError('Error navigating after login. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle form submission for login
  const handleFormSubmit = async (values, { setErrors, setStatus, setSubmitting }) => {
    try {
      setIsLoading(true);
      setError('');
      
      const userData = await signIn(values.email, values.password);
      
      if (scriptedRef.current) {
        setStatus({ success: true });
        setSubmitting(false);
        
        // Handle successful login and workspace navigation
        await handleLoginSuccess(userData);
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (scriptedRef.current) {
        setStatus({ success: false });
        setErrors({ submit: err.message });
        setSubmitting(false);
      }
      
      setError(err.message || 'Failed to login. Please check your credentials and try again.');
      setIsLoading(false);
    }
  };

  // Toggle password visibility
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <Grid container direction="column" justifyContent="center" spacing={2}>
        <Grid item xs={12}>
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex'
            }}
          >
            <Divider sx={{ flexGrow: 1 }} orientation="horizontal" />
            <Typography variant="h4" sx={{ m: 2 }}>
              Sign In
            </Typography>
            <Divider sx={{ flexGrow: 1 }} orientation="horizontal" />
          </Box>
        </Grid>
      </Grid>

      <Formik
        initialValues={{
          email: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
          password: Yup.string().max(255).required('Password is required')
        })}
        onSubmit={handleFormSubmit}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit} {...others}>
            <FormControl fullWidth error={Boolean(touched.email && errors.email)} sx={{ ...theme.typography.customInput }}>
              <InputLabel htmlFor="outlined-adornment-email-login">Email Address</InputLabel>
              <OutlinedInput
                id="outlined-adornment-email-login"
                type="email"
                value={values.email}
                name="email"
                onBlur={handleBlur}
                onChange={handleChange}
                label="Email Address"
                inputProps={{}}
              />
              {touched.email && errors.email && (
                <FormHelperText error id="standard-weight-helper-text-email-login">
                  {errors.email}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              error={Boolean(touched.password && errors.password)}
              sx={{ ...theme.typography.customInput }}
            >
              <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password-login"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                name="password"
                onBlur={handleBlur}
                onChange={handleChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      size="large"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
                inputProps={{}}
              />
              {touched.password && errors.password && (
                <FormHelperText error id="standard-weight-helper-text-password-login">
                  {errors.password}
                </FormHelperText>
              )}
            </FormControl>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    name="checked"
                    color="primary"
                  />
                }
                label="Remember me"
              />
              <Typography
                variant="subtitle1"
                component={Link}
                to="/forgot-password"
                color="secondary"
                sx={{ textDecoration: 'none', cursor: 'pointer' }}
              >
                Forgot Password?
              </Typography>
            </Stack>
            {errors.submit && (
              <Box sx={{ mt: 3 }}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Box>
            )}
            {error && (
              <Box sx={{ mt: 3 }}>
                <FormHelperText error>{error}</FormHelperText>
              </Box>
            )}

            <Box sx={{ mt: 2 }}>
              <AnimateButton>
                <Button
                  disableElevation
                  disabled={isSubmitting || isLoading}
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  color="secondary"
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </AnimateButton>
            </Box>
          </form>
        )}
      </Formik>
      <Grid container justifyContent="center" alignItems="center" sx={{ mt: 5 }}>
        <Typography variant="subtitle1" sx={{ textDecoration: 'none' }}>
          Don&apos;t have an account?&nbsp;
          <Typography
            variant="subtitle1"
            component={Link}
            to="/register"
            sx={{
              textDecoration: 'none',
              color: theme.palette.secondary.main,
              cursor: 'pointer'
            }}
          >
            Sign up
          </Typography>
        </Typography>
      </Grid>
    </>
  );
};

export default Login;
