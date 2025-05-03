import { useState } from 'react'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useSnackbar } from 'notistack'

// project imports
import { resetPassword, updatePassword } from '@flowstack/auth-client'

// ================================|| RESET PASSWORD ||================================ //

const ResetPassword = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const location = useLocation()
    const { enqueueSnackbar } = useSnackbar()
    
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    
    // Check if we're in the update password flow (after clicking the reset link in email)
    const isUpdateFlow = location.hash.includes('type=recovery')

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword)
    }

    const handleMouseDownPassword = (event) => {
        event.preventDefault()
    }

    const handleResetRequest = async (values, { setErrors, setStatus, setSubmitting }) => {
        setIsLoading(true)
        try {
            const { error } = await resetPassword(values.email)
            
            if (error) {
                setStatus({ success: false })
                setErrors({ submit: error.message })
                enqueueSnackbar(error.message, { variant: 'error' })
            } else {
                setStatus({ success: true })
                enqueueSnackbar('Password reset instructions sent to your email!', {
                    variant: 'success',
                    autoHideDuration: 5000
                })
                navigate('/auth/login')
            }
        } catch (err) {
            console.error(err)
            setStatus({ success: false })
            setErrors({ submit: err.message })
            enqueueSnackbar('An error occurred during password reset', { variant: 'error' })
        } finally {
            setIsLoading(false)
            setSubmitting(false)
        }
    }

    const handleUpdatePassword = async (values, { setErrors, setStatus, setSubmitting }) => {
        setIsLoading(true)
        try {
            const { error } = await updatePassword(values.password)
            
            if (error) {
                setStatus({ success: false })
                setErrors({ submit: error.message })
                enqueueSnackbar(error.message, { variant: 'error' })
            } else {
                setStatus({ success: true })
                enqueueSnackbar('Password updated successfully!', {
                    variant: 'success',
                    autoHideDuration: 5000
                })
                navigate('/auth/login')
            }
        } catch (err) {
            console.error(err)
            setStatus({ success: false })
            setErrors({ submit: err.message })
            enqueueSnackbar('An error occurred updating your password', { variant: 'error' })
        } finally {
            setIsLoading(false)
            setSubmitting(false)
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
                                    {isUpdateFlow ? 'Update Password' : 'Reset Password'}
                                </Typography>
                                <Typography variant="body2" textAlign="center" sx={{ mt: 1 }}>
                                    {isUpdateFlow 
                                        ? 'Create a new password for your account' 
                                        : 'Enter your email and we\'ll send you instructions to reset your password'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                {isUpdateFlow ? (
                                    <Formik
                                        initialValues={{
                                            password: '',
                                            confirmPassword: '',
                                            submit: null
                                        }}
                                        validationSchema={Yup.object().shape({
                                            password: Yup.string()
                                                .max(255)
                                                .required('Password is required')
                                                .min(8, 'Password must be at least 8 characters'),
                                            confirmPassword: Yup.string()
                                                .oneOf([Yup.ref('password'), null], 'Passwords must match')
                                                .required('Confirm Password is required')
                                        })}
                                        onSubmit={handleUpdatePassword}
                                    >
                                        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                                            <form noValidate onSubmit={handleSubmit}>
                                                <FormControl fullWidth error={Boolean(touched.password && errors.password)} sx={{ mb: 3 }}>
                                                    <InputLabel htmlFor="outlined-adornment-password">New Password</InputLabel>
                                                    <OutlinedInput
                                                        id="outlined-adornment-password"
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
                                                        label="New Password"
                                                        inputProps={{}}
                                                    />
                                                    {touched.password && errors.password && (
                                                        <FormHelperText error id="standard-weight-helper-text-password">
                                                            {errors.password}
                                                        </FormHelperText>
                                                    )}
                                                </FormControl>

                                                <FormControl fullWidth error={Boolean(touched.confirmPassword && errors.confirmPassword)} sx={{ mb: 3 }}>
                                                    <InputLabel htmlFor="outlined-adornment-confirm-password">Confirm Password</InputLabel>
                                                    <OutlinedInput
                                                        id="outlined-adornment-confirm-password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={values.confirmPassword}
                                                        name="confirmPassword"
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        label="Confirm Password"
                                                        inputProps={{}}
                                                    />
                                                    {touched.confirmPassword && errors.confirmPassword && (
                                                        <FormHelperText error id="standard-weight-helper-text-confirm-password">
                                                            {errors.confirmPassword}
                                                        </FormHelperText>
                                                    )}
                                                </FormControl>

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
                                                        {isLoading ? 'Updating...' : 'Update Password'}
                                                    </Button>
                                                </Box>
                                            </form>
                                        )}
                                    </Formik>
                                ) : (
                                    <Formik
                                        initialValues={{
                                            email: '',
                                            submit: null
                                        }}
                                        validationSchema={Yup.object().shape({
                                            email: Yup.string().email('Must be a valid email').max(255).required('Email is required')
                                        })}
                                        onSubmit={handleResetRequest}
                                    >
                                        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                                            <form noValidate onSubmit={handleSubmit}>
                                                <FormControl fullWidth error={Boolean(touched.email && errors.email)} sx={{ mb: 3 }}>
                                                    <InputLabel htmlFor="outlined-adornment-email-reset">Email Address</InputLabel>
                                                    <OutlinedInput
                                                        id="outlined-adornment-email-reset"
                                                        type="email"
                                                        value={values.email}
                                                        name="email"
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        label="Email Address"
                                                        inputProps={{}}
                                                    />
                                                    {touched.email && errors.email && (
                                                        <FormHelperText error id="standard-weight-helper-text-email-reset">
                                                            {errors.email}
                                                        </FormHelperText>
                                                    )}
                                                </FormControl>

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
                                                        {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                                                    </Button>
                                                </Box>
                                            </form>
                                        )}
                                    </Formik>
                                )}
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container justifyContent="center">
                                    <Typography
                                        component={RouterLink}
                                        to="/auth/login"
                                        variant="subtitle1"
                                        sx={{ textDecoration: 'none' }}
                                        color="primary"
                                    >
                                        Back to Login
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

export default ResetPassword