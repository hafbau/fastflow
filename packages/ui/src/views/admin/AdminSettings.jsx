import React, { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    Stack,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography,
    Alert,
    Snackbar
} from '@mui/material'
import {
    Save as SaveIcon,
    Refresh as RefreshIcon,
    Security as SecurityIcon,
    Email as EmailIcon,
    Notifications as NotificationsIcon,
    Storage as StorageIcon,
    CloudUpload as CloudUploadIcon,
    Settings as SettingsIcon
} from '@mui/icons-material'
import useApi from 'hooks/useApi'
import { gridSpacing } from 'store/constant'

const AdminSettings = () => {
    const theme = useTheme()
    const api = useApi()

    // State for tabs
    const [tabValue, setTabValue] = useState(0)

    // State for settings
    const [settings, setSettings] = useState({
        general: {
            siteName: 'FlowStack',
            siteDescription: 'AI Workflow Automation Platform',
            supportEmail: 'support@flowstack.ai',
            maxUsersPerOrganization: 50,
            maxWorkspacesPerOrganization: 10
        },
        security: {
            passwordMinLength: 8,
            passwordRequireUppercase: true,
            passwordRequireNumbers: true,
            passwordRequireSymbols: true,
            mfaEnabled: true,
            mfaRequired: false,
            sessionTimeout: 30,
            loginAttempts: 5,
            lockoutDuration: 15
        },
        email: {
            smtpHost: 'smtp.example.com',
            smtpPort: 587,
            smtpUsername: 'notifications@flowstack.ai',
            smtpPassword: '********',
            smtpSecure: true,
            emailFromName: 'FlowStack',
            emailFromAddress: 'notifications@flowstack.ai'
        },
        notifications: {
            enableEmailNotifications: true,
            enableInAppNotifications: true,
            notifyOnNewUser: true,
            notifyOnNewOrganization: true,
            notifyOnFailedLogin: true,
            notifyOnRoleChange: true,
            dailyDigest: true
        },
        storage: {
            provider: 's3',
            region: 'us-west-2',
            bucket: 'flowstack-uploads',
            accessKey: '********',
            secretKey: '********',
            maxFileSize: 10,
            allowedFileTypes: '.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.zip'
        }
    })

    // State for loading and saving
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    })

    // Fetch settings
    const fetchSettings = async () => {
        setLoading(true)
        try {
            // In a real implementation, this would be an API call
            // For now, we'll simulate the data
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // We'll use the default settings defined above
            // In a real app, you would fetch from the API
            
            setLoading(false)
        } catch (error) {
            console.error('Error fetching settings:', error)
            setSnackbar({
                open: true,
                message: 'Failed to load settings',
                severity: 'error'
            })
            setLoading(false)
        }
    }

    // Save settings
    const saveSettings = async () => {
        setSaving(true)
        try {
            // In a real implementation, this would be an API call
            // For now, we'll simulate the operation
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500))
            
            setSnackbar({
                open: true,
                message: 'Settings saved successfully',
                severity: 'success'
            })
            setSaving(false)
        } catch (error) {
            console.error('Error saving settings:', error)
            setSnackbar({
                open: true,
                message: 'Failed to save settings',
                severity: 'error'
            })
            setSaving(false)
        }
    }

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
    }

    // Handle settings change
    const handleSettingsChange = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }))
    }

    // Handle snackbar close
    const handleSnackbarClose = () => {
        setSnackbar(prev => ({
            ...prev,
            open: false
        }))
    }

    // Fetch settings on component mount
    useEffect(() => {
        fetchSettings()
    }, [])

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
                                <Tab icon={<SettingsIcon />} label="General" />
                                <Tab icon={<SecurityIcon />} label="Security" />
                                <Tab icon={<EmailIcon />} label="Email" />
                                <Tab icon={<NotificationsIcon />} label="Notifications" />
                                <Tab icon={<StorageIcon />} label="Storage" />
                            </Tabs>
                        </Box>
                        
                        {/* General Settings */}
                        {tabValue === 0 && (
                            <Box sx={{ p: 2 }}>
                                <Typography variant="h4" gutterBottom>
                                    General Settings
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Site Name"
                                            value={settings.general.siteName}
                                            onChange={(e) => handleSettingsChange('general', 'siteName', e.target.value)}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Support Email"
                                            value={settings.general.supportEmail}
                                            onChange={(e) => handleSettingsChange('general', 'supportEmail', e.target.value)}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Site Description"
                                            value={settings.general.siteDescription}
                                            onChange={(e) => handleSettingsChange('general', 'siteDescription', e.target.value)}
                                            margin="normal"
                                            multiline
                                            rows={2}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Max Users per Organization"
                                            type="number"
                                            value={settings.general.maxUsersPerOrganization}
                                            onChange={(e) => handleSettingsChange('general', 'maxUsersPerOrganization', parseInt(e.target.value))}
                                            margin="normal"
                                            InputProps={{
                                                inputProps: { min: 1 }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Max Workspaces per Organization"
                                            type="number"
                                            value={settings.general.maxWorkspacesPerOrganization}
                                            onChange={(e) => handleSettingsChange('general', 'maxWorkspacesPerOrganization', parseInt(e.target.value))}
                                            margin="normal"
                                            InputProps={{
                                                inputProps: { min: 1 }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                        
                        {/* Security Settings */}
                        {tabValue === 1 && (
                            <Box sx={{ p: 2 }}>
                                <Typography variant="h4" gutterBottom>
                                    Security Settings
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Minimum Password Length"
                                            type="number"
                                            value={settings.security.passwordMinLength}
                                            onChange={(e) => handleSettingsChange('security', 'passwordMinLength', parseInt(e.target.value))}
                                            margin="normal"
                                            InputProps={{
                                                inputProps: { min: 6 }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Session Timeout (minutes)"
                                            type="number"
                                            value={settings.security.sessionTimeout}
                                            onChange={(e) => handleSettingsChange('security', 'sessionTimeout', parseInt(e.target.value))}
                                            margin="normal"
                                            InputProps={{
                                                inputProps: { min: 5 }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Max Login Attempts"
                                            type="number"
                                            value={settings.security.loginAttempts}
                                            onChange={(e) => handleSettingsChange('security', 'loginAttempts', parseInt(e.target.value))}
                                            margin="normal"
                                            InputProps={{
                                                inputProps: { min: 1 }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Account Lockout Duration (minutes)"
                                            type="number"
                                            value={settings.security.lockoutDuration}
                                            onChange={(e) => handleSettingsChange('security', 'lockoutDuration', parseInt(e.target.value))}
                                            margin="normal"
                                            InputProps={{
                                                inputProps: { min: 1 }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormGroup>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={settings.security.passwordRequireUppercase}
                                                        onChange={(e) => handleSettingsChange('security', 'passwordRequireUppercase', e.target.checked)}
                                                    />
                                                }
                                                label="Require uppercase letters in passwords"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={settings.security.passwordRequireNumbers}
                                                        onChange={(e) => handleSettingsChange('security', 'passwordRequireNumbers', e.target.checked)}
                                                    />
                                                }
                                                label="Require numbers in passwords"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={settings.security.passwordRequireSymbols}
                                                        onChange={(e) => handleSettingsChange('security', 'passwordRequireSymbols', e.target.checked)}
                                                    />
                                                }
                                                label="Require symbols in passwords"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={settings.security.mfaEnabled}
                                                        onChange={(e) => handleSettingsChange('security', 'mfaEnabled', e.target.checked)}
                                                    />
                                                }
                                                label="Enable Multi-Factor Authentication"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={settings.security.mfaRequired}
                                                        onChange={(e) => handleSettingsChange('security', 'mfaRequired', e.target.checked)}
                                                        disabled={!settings.security.mfaEnabled}
                                                    />
                                                }
                                                label="Require Multi-Factor Authentication for all users"
                                            />
                                        </FormGroup>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                        
                        {/* Email Settings */}
                        {tabValue === 2 && (
                            <Box sx={{ p: 2 }}>
                                <Typography variant="h4" gutterBottom>
                                    Email Settings
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="SMTP Host"
                                            value={settings.email.smtpHost}
                                            onChange={(e) => handleSettingsChange('email', 'smtpHost', e.target.value)}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="SMTP Port"
                                            type="number"
                                            value={settings.email.smtpPort}
                                            onChange={(e) => handleSettingsChange('email', 'smtpPort', parseInt(e.target.value))}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="SMTP Username"
                                            value={settings.email.smtpUsername}
                                            onChange={(e) => handleSettingsChange('email', 'smtpUsername', e.target.value)}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="SMTP Password"
                                            type="password"
                                            value={settings.email.smtpPassword}
                                            onChange={(e) => handleSettingsChange('email', 'smtpPassword', e.target.value)}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="From Name"
                                            value={settings.email.emailFromName}
                                            onChange={(e) => handleSettingsChange('email', 'emailFromName', e.target.value)}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="From Email Address"
                                            value={settings.email.emailFromAddress}
                                            onChange={(e) => handleSettingsChange('email', 'emailFromAddress', e.target.value)}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={settings.email.smtpSecure}
                                                    onChange={(e) => handleSettingsChange('email', 'smtpSecure', e.target.checked)}
                                                />
                                            }
                                            label="Use Secure Connection (TLS)"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => {
                                                setSnackbar({
                                                    open: true,
                                                    message: 'Test email sent successfully',
                                                    severity: 'success'
                                                })
                                            }}
                                        >
                                            Send Test Email
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                        
                        {/* Notification Settings */}
                        {tabValue === 3 && (
                            <Box sx={{ p: 2 }}>
                                <Typography variant="h4" gutterBottom>
                                    Notification Settings
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <FormGroup>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={settings.notifications.enableEmailNotifications}
                                                        onChange={(e) => handleSettingsChange('notifications', 'enableEmailNotifications', e.target.checked)}
                                                    />
                                                }
                                                label="Enable Email Notifications"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={settings.notifications.enableInAppNotifications}
                                                        onChange={(e) => handleSettingsChange('notifications', 'enableInAppNotifications', e.target.checked)}
                                                    />
                                                }
                                                label="Enable In-App Notifications"
                                            />
                                        </FormGroup>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Admin Notifications
                                        </Typography>
                                        <FormGroup>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={settings.notifications.notifyOnNewUser}
                                                        onChange={(e) => handleSettingsChange('notifications', 'notifyOnNewUser', e.target.checked)}
                                                        disabled={!settings.notifications.enableEmailNotifications && !settings.notifications.enableInAppNotifications}
                                                    />
                                                }
                                                label="Notify when a new user registers"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={settings.notifications.notifyOnNewOrganization}
                                                        onChange={(e) => handleSettingsChange('notifications', 'notifyOnNewOrganization', e.target.checked)}
                                                        disabled={!settings.notifications.enableEmailNotifications && !settings.notifications.enableInAppNotifications}
                                                    />
                                                }
                                                label="Notify when a new organization is created"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={settings.notifications.notifyOnFailedLogin}
                                                        onChange={(e) => handleSettingsChange('notifications', 'notifyOnFailedLogin', e.target.checked)}
                                                        disabled={!settings.notifications.enableEmailNotifications && !settings.notifications.enableInAppNotifications}
                                                    />
                                                }
                                                label="Notify on failed login attempts"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={settings.notifications.notifyOnRoleChange}
                                                        onChange={(e) => handleSettingsChange('notifications', 'notifyOnRoleChange', e.target.checked)}
                                                        disabled={!settings.notifications.enableEmailNotifications && !settings.notifications.enableInAppNotifications}
                                                    />
                                                }
                                                label="Notify when user roles are changed"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={settings.notifications.dailyDigest}
                                                        onChange={(e) => handleSettingsChange('notifications', 'dailyDigest', e.target.checked)}
                                                        disabled={!settings.notifications.enableEmailNotifications}
                                                    />
                                                }
                                                label="Send daily activity digest"
                                            />
                                        </FormGroup>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                        
                        {/* Storage Settings */}
                        {tabValue === 4 && (
                            <Box sx={{ p: 2 }}>
                                <Typography variant="h4" gutterBottom>
                                    Storage Settings
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel>Storage Provider</InputLabel>
                                            <Select
                                                value={settings.storage.provider}
                                                onChange={(e) => handleSettingsChange('storage', 'provider', e.target.value)}
                                                label="Storage Provider"
                                            >
                                                <MenuItem value="local">Local Storage</MenuItem>
                                                <MenuItem value="s3">Amazon S3</MenuItem>
                                                <MenuItem value="gcs">Google Cloud Storage</MenuItem>
                                                <MenuItem value="azure">Azure Blob Storage</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Max File Size (MB)"
                                            type="number"
                                            value={settings.storage.maxFileSize}
                                            onChange={(e) => handleSettingsChange('storage', 'maxFileSize', parseInt(e.target.value))}
                                            margin="normal"
                                            InputProps={{
                                                inputProps: { min: 1 }
                                            }}
                                        />
                                    </Grid>
                                    
                                    {settings.storage.provider === 's3' && (
                                        <>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="AWS Region"
                                                    value={settings.storage.region}
                                                    onChange={(e) => handleSettingsChange('storage', 'region', e.target.value)}
                                                    margin="normal"
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="S3 Bucket Name"
                                                    value={settings.storage.bucket}
                                                    onChange={(e) => handleSettingsChange('storage', 'bucket', e.target.value)}
                                                    margin="normal"
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Access Key"
                                                    value={settings.storage.accessKey}
                                                    onChange={(e) => handleSettingsChange('storage', 'accessKey', e.target.value)}
                                                    margin="normal"
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Secret Key"
                                                    type="password"
                                                    value={settings.storage.secretKey}
                                                    onChange={(e) => handleSettingsChange('storage', 'secretKey', e.target.value)}
                                                    margin="normal"
                                                />
                                            </Grid>
                                        </>
                                    )}
                                    
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Allowed File Types"
                                            value={settings.storage.allowedFileTypes}
                                            onChange={(e) => handleSettingsChange('storage', 'allowedFileTypes', e.target.value)}
                                            margin="normal"
                                            helperText="Comma-separated list of file extensions (e.g., .jpg,.png,.pdf)"
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                        
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={fetchSettings}
                                sx={{ mr: 1 }}
                                startIcon={<RefreshIcon />}
                                disabled={loading || saving}
                            >
                                Reset
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={saveSettings}
                                startIcon={<SaveIcon />}
                                disabled={loading || saving}
                            >
                                {saving ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
            
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Grid>
    )
}

export default AdminSettings