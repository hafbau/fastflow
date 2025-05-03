import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
    Box,
    Button,
    Divider,
    FormControl,
    FormHelperText,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
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
import { signUp } from '@flowstack/auth-client'

// ================================|| SIGNUP ||================================ //

const Signup = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()
    
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword)
    }

    const handleMouseDownPassword = (event) => {
        event.preventDefault()
    }

    const handleSignUp = async (values, { setErrors, setStatus, setSubmitting }) => {
        setIsLoading(true)
        try {
            const { error } = await signUp(values.email, values.password, values.name)
            
            if (error) {
                setStatus({ success: false })
                setErrors({ submit: error.message })
                enqueueSnackbar(error.message, { variant: 'error' })
            } else {
                setStatus({ success: true })
                enqueueSnackbar('Registration successful! Please check your email to confirm your account.', {
                    variant: 'success',
                    autoHideDuration: 5000
                })
                navigate('/auth/login')
            }
        } catch (err) {
            console.error(err)
            setStatus({ success: false })
            setErrors({ submit: err.message })
            enqueueSnackbar('An error occurred during registration', { variant: 'error' })
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
                                    Sign Up
                                </Typography>
                                <Typography variant="body2" textAlign="center" sx={{ mt: 1 }}>
                                    Create your FlowStack account
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Formik
                                    initialValues={{
                                        name: '',
                                        email: '',
                                        password: '',
                                        submit: null
                                    }}
                                    validationSchema={Yup.object().shape({
                                        name: Yup.string().max(255).required('Name is required'),
                                        email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
                                        password: Yup.string()
                                            .max(255)
                                            .required('Password is required')
                                            .min(8, 'Password must be at least 8 characters')
                                    })}
                                    onSubmit={handleSignUp}
                                >
                                    {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                                        <form noValidate onSubmit={handleSubmit}>
                                            <FormControl fullWidth error={Boolean(touched.name && errors.name)} sx={{ mb: 3 }}>
                                                <InputLabel htmlFor="outlined-adornment-name-signup">Name</InputLabel>
                                                <OutlinedInput
                                                    id="outlined-adornment-name-signup"
                                                    type="text"
                                                    value={values.name}
                                                    name="name"
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                    label="Name"
                                                    inputProps={{}}
                                                />
                                                {touched.name && errors.name && (
                                                    <FormHelperText error id="standard-weight-helper-text-name-signup">
                                                        {errors.name}
                                                    </FormHelperText>
                                                )}
                                            </FormControl>

                                            <FormControl fullWidth error={Boolean(touched.email && errors.email)} sx={{ mb: 3 }}>
                                                <InputLabel htmlFor="outlined-adornment-email-signup">Email Address</InputLabel>
                                                <OutlinedInput
                                                    id="outlined-adornment-email-signup"
                                                    type="email"
                                                    value={values.email}
                                                    name="email"
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                    label="Email Address"
                                                    inputProps={{}}
                                                />
                                                {touched.email && errors.email && (
                                                    <FormHelperText error id="standard-weight-helper-text-email-signup">
                                                        {errors.email}
                                                    </FormHelperText>
                                                )}
                                            </FormControl>

                                            <FormControl fullWidth error={Boolean(touched.password && errors.password)} sx={{ mb: 3 }}>
                                                <InputLabel htmlFor="outlined-adornment-password-signup">Password</InputLabel>
                                                <OutlinedInput
                                                    id="outlined-adornment-password-signup"
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
                                                    <FormHelperText error id="standard-weight-helper-text-password-signup">
                                                        {errors.password}
                                                    </FormHelperText>
                                                )}
                                            </FormControl>

                                            <Typography variant="body2" sx={{ mb: 3 }}>
                                                By signing up, you agree to our Terms of Service and Privacy Policy.
                                            </Typography>

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
                                                    {isLoading ? 'Signing up...' : 'Sign Up'}
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
                                        Already have an account?{' '}
                                        <Typography
                                            component={RouterLink}
                                            to="/auth/login"
                                            variant="subtitle1"
                                            sx={{ textDecoration: 'none' }}
                                            color="primary"
                                        >
                                            Sign In
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

export default Signup