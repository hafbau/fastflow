import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
    Box,
    Button,
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    Link,
    OutlinedInput,
    Stack,
    Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useSnackbar } from 'notistack'

// project imports
import { signInWithPassword, signInWithMagicLink } from '@flowstack/auth-client'

// ================================|| LOGIN ||================================ //

const Login = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()
    
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false)

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword)
    }

    const handleMouseDownPassword = (event) => {
        event.preventDefault()
    }

    const handleSignIn = async (values, { setErrors, setStatus, setSubmitting }) => {
        setIsLoading(true)
        try {
            const { error } = await signInWithPassword(values.email, values.password)
            
            if (error) {
                setStatus({ success: false })
                setErrors({ submit: error.message })
                enqueueSnackbar(error.message, { variant: 'error' })
            } else {
                setStatus({ success: true })
                enqueueSnackbar('Login successful!', { variant: 'success' })
                navigate('/')
            }
        } catch (err) {
            console.error(err)
            setStatus({ success: false })
            setErrors({ submit: err.message })
            enqueueSnackbar('An error occurred during login', { variant: 'error' })
        } finally {
            setIsLoading(false)
            setSubmitting(false)
        }
    }

    const handleMagicLinkSignIn = async (email) => {
        if (!email) {
            enqueueSnackbar('Please enter your email address', { variant: 'warning' })
            return
        }
        
        setIsMagicLinkLoading(true)
        try {
            const { error } = await signInWithMagicLink(email)
            
            if (error) {
                enqueueSnackbar(error.message, { variant: 'error' })
            } else {
                enqueueSnackbar('Magic link sent! Check your email inbox.', { variant: 'success' })
            }
        } catch (err) {
            console.error(err)
            enqueueSnackbar('An error occurred sending the magic link', { variant: 'error' })
        } finally {
            setIsMagicLinkLoading(false)
        }
    }

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <Grid container justifyContent="center">
                <Grid item xs={12} sm={8} md={6} lg={4}>
                    <Box
                        sx={{
                            p: 4,
                            bgcolor: theme.palette.background.paper,
                            borderRadius: 2,
                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="h3" textAlign="center">
                                    Sign In
                                </Typography>
                                <Typography variant="body2" textAlign="center" sx={{ mt: 1 }}>
                                    Sign in to continue to FlowStack
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Formik
                                    initialValues={{
                                        email: '',
                                        password: '',
                                        remember: false,
                                        submit: null
                                    }}
                                    validationSchema={Yup.object().shape({
                                        email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
                                        password: Yup.string().max(255).required('Password is required')
                                    })}
                                    onSubmit={handleSignIn}
                                >
                                    {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                                        <form noValidate onSubmit={handleSubmit}>
                                            <FormControl fullWidth error={Boolean(touched.email && errors.email)} sx={{ mb: 3 }}>
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

                                            <FormControl fullWidth error={Boolean(touched.password && errors.password)} sx={{ mb: 3 }}>
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

                                            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 3 }}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={values.remember}
                                                            onChange={handleChange}
                                                            name="remember"
                                                            color="primary"
                                                        />
                                                    }
                                                    label="Remember me"
                                                />
                                                <Typography
                                                    variant="subtitle1"
                                                    component={RouterLink}
                                                    to="/auth/reset-password"
                                                    color="primary"
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

                                            <Box sx={{ mt: 2 }}>
                                                <Button
                                                    disableElevation
                                                    disabled={isLoading}
                                                    fullWidth
                                                    size="large"
                                                    type="submit"
                                                    variant="contained"
                                                    color="primary"
                                                >
                                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                                </Button>
                                            </Box>
                                        </form>
                                    )}
                                </Formik>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider>
                                    <Typography variant="caption">OR</Typography>
                                </Divider>
                            </Grid>
                            <Grid item xs={12}>
                                <Formik
                                    initialValues={{
                                        email: '',
                                        submit: null
                                    }}
                                    validationSchema={Yup.object().shape({
                                        email: Yup.string().email('Must be a valid email').max(255).required('Email is required')
                                    })}
                                    onSubmit={(values) => {
                                        handleMagicLinkSignIn(values.email)
                                    }}
                                >
                                    {({ errors, handleBlur, handleChange, handleSubmit, touched, values }) => (
                                        <form noValidate onSubmit={handleSubmit}>
                                            <FormControl fullWidth error={Boolean(touched.email && errors.email)} sx={{ mb: 3 }}>
                                                <InputLabel htmlFor="outlined-adornment-email-magic">Email Address</InputLabel>
                                                <OutlinedInput
                                                    id="outlined-adornment-email-magic"
                                                    type="email"
                                                    value={values.email}
                                                    name="email"
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                    label="Email Address"
                                                    inputProps={{}}
                                                />
                                                {touched.email && errors.email && (
                                                    <FormHelperText error id="standard-weight-helper-text-email-magic">
                                                        {errors.email}
                                                    </FormHelperText>
                                                )}
                                            </FormControl>

                                            <Box sx={{ mt: 2 }}>
                                                <Button
                                                    disableElevation
                                                    disabled={isMagicLinkLoading}
                                                    fullWidth
                                                    size="large"
                                                    type="submit"
                                                    variant="outlined"
                                                    color="primary"
                                                >
                                                    {isMagicLinkLoading ? 'Sending...' : 'Sign In with Magic Link'}
                                                </Button>
                                            </Box>
                                        </form>
                                    )}
                                </Formik>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider />
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container justifyContent="center">
                                    <Typography variant="subtitle1" sx={{ textDecoration: 'none' }}>
                                        Don&apos;t have an account?{' '}
                                        <Typography
                                            component={RouterLink}
                                            to="/auth/signup"
                                            variant="subtitle1"
                                            sx={{ textDecoration: 'none' }}
                                            color="primary"
                                        >
                                            Sign Up
                                        </Typography>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}

export default Login