import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
  TextField,
  Switch,
  FormGroup,
  FormControlLabel,
  Button,
  Grid,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardActions,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';

/**
 * System Settings Page
 * Administrative interface for managing global system settings
 * Only accessible to system administrators
 */
const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Mock settings data
  const [generalSettings, setGeneralSettings] = useState({
    systemName: 'FlowStack',
    instanceUrl: 'https://app.flowstack.io',
    supportEmail: 'support@flowstack.io',
    sessionTimeout: 60,
    defaultTheme: 'light',
    enableNewUserRegistration: true,
    requireEmailVerification: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    passwordRequireUppercase: true,
    passwordExpiration: 90,
    mfaEnforced: false,
    loginAttempts: 5,
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleGeneralSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSecuritySettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings({
      ...securitySettings,
      [name]: type === 'checkbox' ? checked : value === '' ? '' : type === 'number' ? Number(value) : value,
    });
  };

  const handleSaveSettings = () => {
    setNotification({
      open: true,
      message: 'Settings saved successfully',
      severity: 'success',
    });
    
    // In a real implementation, this would save settings to the backend
    console.log('General settings:', generalSettings);
    console.log('Security settings:', securitySettings);
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 4 }}>
      {/* Page Header */}
      <Typography variant="h4" component="h1" gutterBottom>
        System Settings
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Configure global settings for the FlowStack platform. These settings affect the entire system.
      </Typography>
      
      <Paper sx={{ mt: 3 }}>
        {/* Tab Navigation */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ px: 2 }}
        >
          <Tab label="General" />
          <Tab label="Security" />
          <Tab label="Appearance" />
          <Tab label="Email" />
          <Tab label="Integrations" />
          <Tab label="Audit Log" />
        </Tabs>
        
        <Divider />
        
        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {/* General Settings Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  General Settings
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="System Name"
                  name="systemName"
                  value={generalSettings.systemName}
                  onChange={handleGeneralSettingChange}
                  margin="normal"
                  helperText="The name of your platform instance"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Instance URL"
                  name="instanceUrl"
                  value={generalSettings.instanceUrl}
                  onChange={handleGeneralSettingChange}
                  margin="normal"
                  helperText="Base URL for your platform instance"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Support Email"
                  name="supportEmail"
                  type="email"
                  value={generalSettings.supportEmail}
                  onChange={handleGeneralSettingChange}
                  margin="normal"
                  helperText="Email address for user support inquiries"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  name="sessionTimeout"
                  type="number"
                  value={generalSettings.sessionTimeout}
                  onChange={handleGeneralSettingChange}
                  margin="normal"
                  inputProps={{ min: 5, max: 1440 }}
                  helperText="Time of inactivity before users are logged out"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Registration Settings
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={generalSettings.enableNewUserRegistration}
                        onChange={handleGeneralSettingChange}
                        name="enableNewUserRegistration"
                      />
                    }
                    label="Allow new user registration"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={generalSettings.requireEmailVerification}
                        onChange={handleGeneralSettingChange}
                        name="requireEmailVerification"
                      />
                    }
                    label="Require email verification"
                  />
                </FormGroup>
              </Grid>
            </Grid>
          )}
          
          {/* Security Settings Tab */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Password Policy
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Minimum Password Length"
                  name="passwordMinLength"
                  type="number"
                  value={securitySettings.passwordMinLength}
                  onChange={handleSecuritySettingChange}
                  margin="normal"
                  inputProps={{ min: 6, max: 64 }}
                  helperText="Minimum number of characters required for passwords"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password Expiration (days)"
                  name="passwordExpiration"
                  type="number"
                  value={securitySettings.passwordExpiration}
                  onChange={handleSecuritySettingChange}
                  margin="normal"
                  inputProps={{ min: 0, max: 365 }}
                  helperText="Days before passwords expire (0 = never expire)"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Failed Login Attempts"
                  name="loginAttempts"
                  type="number"
                  value={securitySettings.loginAttempts}
                  onChange={handleSecuritySettingChange}
                  margin="normal"
                  inputProps={{ min: 1, max: 10 }}
                  helperText="Number of failed attempts before account lockout"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.passwordRequireUppercase}
                        onChange={handleSecuritySettingChange}
                        name="passwordRequireUppercase"
                      />
                    }
                    label="Require uppercase letters"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.passwordRequireNumbers}
                        onChange={handleSecuritySettingChange}
                        name="passwordRequireNumbers"
                      />
                    }
                    label="Require numbers"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.passwordRequireSymbols}
                        onChange={handleSecuritySettingChange}
                        name="passwordRequireSymbols"
                      />
                    }
                    label="Require special characters"
                  />
                </FormGroup>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Multi-Factor Authentication
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.mfaEnforced}
                        onChange={handleSecuritySettingChange}
                        name="mfaEnforced"
                      />
                    }
                    label="Enforce MFA for all users"
                  />
                </FormGroup>
              </Grid>
              
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 2 }}>
                  When MFA enforcement is enabled, users will be required to set up MFA on their next login.
                </Alert>
              </Grid>
            </Grid>
          )}
          
          {/* Placeholder for Appearance Tab */}
          {activeTab === 2 && (
            <Box sx={{ py: 2 }}>
              <Typography variant="body1">
                Appearance settings will be implemented in future versions.
              </Typography>
            </Box>
          )}
          
          {/* Placeholder for Email Tab */}
          {activeTab === 3 && (
            <Box sx={{ py: 2 }}>
              <Typography variant="body1">
                Email settings will be implemented in future versions.
              </Typography>
            </Box>
          )}
          
          {/* Placeholder for Integrations Tab */}
          {activeTab === 4 && (
            <Box sx={{ py: 2 }}>
              <Typography variant="body1">
                Integration settings will be implemented in future versions.
              </Typography>
            </Box>
          )}
          
          {/* Placeholder for Audit Log Tab */}
          {activeTab === 5 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Recent System Events
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Event</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Details</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>2025-05-05 10:15 PM</TableCell>
                        <TableCell>Setting Changed</TableCell>
                        <TableCell>admin@flowstack.io</TableCell>
                        <TableCell>Updated password policy</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>2025-05-05 09:42 PM</TableCell>
                        <TableCell>User Created</TableCell>
                        <TableCell>admin@flowstack.io</TableCell>
                        <TableCell>Created user john.doe@example.com</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>2025-05-05 08:30 PM</TableCell>
                        <TableCell>System Startup</TableCell>
                        <TableCell>system</TableCell>
                        <TableCell>Application initialized</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
          
          {/* Save Button - Only show for tabs that have editable content */}
          {(activeTab === 0 || activeTab === 1) && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" color="primary" onClick={handleSaveSettings}>
                Save Settings
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SystemSettings;
