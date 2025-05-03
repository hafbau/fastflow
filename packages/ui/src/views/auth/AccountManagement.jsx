import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    FormControl,
    FormHelperText,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Tab,
    Tabs,
    Typography,
    Avatar,
    CircularProgress
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { Visibility, VisibilityOff, Person, Lock, Email } from '@mui/icons-material'
import { useSnackbar } from 'notistack'

// project imports
import { getCurrentUser, updatePassword, updateProfile, updateEmail } from '@flowstack/auth-client'

// ================================|| ACCOUNT MANAGEMENT ||================================ //

const AccountManagement = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()
    
    const [activeTab, setActiveTab] = useState(0)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useState(null)
    const [isLoadingUser, setIsLoadingUser] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoadingUser(true)
            try {
                const userData = await getCurrentUser()
                if (!userData) {
                    navigate('/auth/login')
                    return
                }
                setUser(userData)
            } catch (error) {
                console.error('Error fetching user:', error)
                enqueueSnackbar('Error loading user data', { variant: 'error' })
            } finally {
                setIsLoadingUser(false)
            }
        }

        fetchUser()
    }, [navigate, enqueueSnackbar])

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue)
    }

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword)
    }

    const handleMouseDownPassword = (event) => {
        event.preventDefault()
    }

    const handleUpdateProfile = async (values, { setErrors, setStatus, setSubmitting }) => {
        setIsLoading(true)
        try {
            const { error, user } = await updateProfile(values.name)
            
            if (error) {
                setStatus({ success: false })
                setErrors({ submit: error.message })
                enqueueSnackbar(error.message, { variant: 'error' })
            } else {
                setStatus({ success: true })
                setUser(user)
                enqueueSnackbar('Profile updated successfully!', { variant: 'success' })
            }
        } catch (err) {
            console.error(err)
            setStatus({ success: false })
            setErrors({ submit: err.message })
            enqueueSnackbar('An error occurred updating your profile', { variant: 'error' })
        } finally {
            setIsLoading(false)
            setSubmitting(false)
        }
    }

    const handleUpdateEmail = async (values, { setErrors, setStatus, setSubmitting }) => {
        setIsLoading(true)
        try {
            const { error } = await updateEmail(values.email)
            
            if (error) {
                setStatus({ success: false })
                setErrors({ submit: error.message })
                enqueueSnackbar(error.message, { variant: 'error' })
            } else {
                setStatus({ success: true })
                enqueueSnackbar('Email update confirmation sent! Check your inbox.', { variant: 'success' })
            }
        } catch (err) {
            console.error(err)
            setStatus({ success: false })
            setErrors({ submit: err.message })
            enqueueSnackbar('An error occurred updating your email', { variant: 'error' })
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
                enqueueSnackbar('Password updated successfully!', { variant: 'success' })
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

    if (isLoadingUser) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h3">Account Management</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                                <Tabs value={activeTab} onChange={handleTabChange} aria-label="account management tabs">
                                    <Tab icon={<Person />} label="Profile" />
                                    <Tab icon={<Email />} label="Email" />
                                    <Tab icon={<Lock />} label="Password" />
                                </Tabs>
                            </Box>

                            {/* Profile Tab */}
                            {activeTab === 0 && (
                                <Box>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <Avatar
                                                sx={{
                                                    width: 100,
                                                    height: 100,
                                                    mb: 2,
                                                    bgcolor: theme.palette.primary.main
                                                }}
                                            >
                                                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)}
                                            </Avatar>
                                            <Typography variant="h6">{user?.user_metadata?.full_name || 'User'}</Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {user?.email}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} md={8}>
                                            <Formik
                                                initialValues={{
                                                    name: user?.user_metadata?.full_name || '',
                                                    submit: null
                                                }}
                                                validationSchema={Yup.object().shape({
                                                    name: Yup.string().max(255).required('Name is required')
                                                })}
                                                onSubmit={handleUpdateProfile}
                                            >
                                                {({ errors, handleBlur, handleChange, handleSubmit, touched, values }) => (
                                                    <form noValidate onSubmit={handleSubmit}>
                                                        <FormControl fullWidth error={Boolean(touched.name && errors.name)} sx={{ mb: 3 }}>
                                                            <InputLabel htmlFor="outlined-adornment-name-profile">Full Name</InputLabel>
                                                            <OutlinedInput
                                                                id="outlined-adornment-name-profile"
                                                                type="text"
                                                                value={values.name}
                                                                name="name"
                                                                onBlur={handleBlur}
                                                                onChange={handleChange}
                                                                label="Full Name"
                                                                inputProps={{}}
                                                            />
                                                            {touched.name && errors.name && (
                                                                <FormHelperText error id="standard-weight-helper-text-name-profile">
                                                                    {errors.name}
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
                                                                size="large"
                                                                type="submit"
                                                                variant="contained"
                                                                color="primary"
                                                            >
                                                                {isLoading ? 'Updating...' : 'Update Profile'}
                                                            </Button>
                                                        </Box>
                                                    </form>
                                                )}
                                            </Formik>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}

                            {/* Email Tab */}
                            {activeTab === 1 && (
                                <Box>
                                    <Formik
                                        initialValues={{
                                            email: user?.email || '',
                                            submit: null
                                        }}
                                        validationSchema={Yup.object().shape({
                                            email: Yup.string().email('Must be a valid email').max(255).required('Email is required')
                                        })}
                                        onSubmit={handleUpdateEmail}
                                    >
                                        {({ errors, handleBlur, handleChange, handleSubmit, touched, values }) => (
                                            <form noValidate onSubmit={handleSubmit}>
                                                <FormControl fullWidth error={Boolean(touched.email && errors.email)} sx={{ mb: 3 }}>
                                                    <InputLabel htmlFor="outlined-adornment-email-update">Email Address</InputLabel>
                                                    <OutlinedInput
                                                        id="outlined-adornment-email-update"
                                                        type="email"
                                                        value={values.email}
                                                        name="email"
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        label="Email Address"
                                                        inputProps={{}}
                                                    />
                                                    {touched.email && errors.email && (
                                                        <FormHelperText error id="standard-weight-helper-text-email-update">
                                                            {errors.email}
                                                        </FormHelperText>
                                                    )}
                                                </FormControl>

                                                <Typography variant="body2" sx={{ mb: 3 }}>
                                                    When you update your email, we'll send a confirmation link to your new email address.
                                                    Your email will only be updated after you click the confirmation link.
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
                                                        size="large"
                                                        type="submit"
                                                        variant="contained"
                                                        color="primary"
                                                    >
                                                        {isLoading ? 'Updating...' : 'Update Email'}
                                                    </Button>
                                                </Box>
                                            </form>
                                        )}
                                    </Formik>
                                </Box>
                            )}

                            {/* Password Tab */}
                            {activeTab === 2 && (
                                <Box>
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
                                        {({ errors, handleBlur, handleChange, handleSubmit, touched, values }) => (
                                            <form noValidate onSubmit={handleSubmit}>
                                                <FormControl fullWidth error={Boolean(touched.password && errors.password)} sx={{ mb: 3 }}>
                                                    <InputLabel htmlFor="outlined-adornment-password-update">New Password</InputLabel>
                                                    <OutlinedInput
                                                        id="outlined-adornment-password-update"
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
                                                        <FormHelperText error id="standard-weight-helper-text-password-update">
                                                            {errors.password}
                                                        </FormHelperText>
                                                    )}
                                                </FormControl>

                                                <FormControl fullWidth error={Boolean(touched.confirmPassword && errors.confirmPassword)} sx={{ mb: 3 }}>
                                                    <InputLabel htmlFor="outlined-adornment-confirm-password-update">Confirm New Password</InputLabel>
                                                    <OutlinedInput
                                                        id="outlined-adornment-confirm-password-update"
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={values.confirmPassword}
                                                        name="confirmPassword"
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        label="Confirm New Password"
                                                        inputProps={{}}
                                                    />
                                                    {touched.confirmPassword && errors.confirmPassword && (
                                                        <FormHelperText error id="standard-weight-helper-text-confirm-password-update">
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
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    )
}

export default AccountManagement