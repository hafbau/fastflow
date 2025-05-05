import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { 
  QrCode2, 
  Security, 
  Check, 
  Close,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

/**
 * MFA setup component
 * Allows users to enable/disable multi-factor authentication
 */
const MFASetup = () => {
  const { user, getMFAStatus, enableMFA, verifyMFA, disableMFA } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [disableCode, setDisableCode] = useState('');

  // Fetch MFA status
  useEffect(() => {
    const fetchMFAStatus = async () => {
      try {
        setLoading(true);
        const status = await getMFAStatus();
        setMfaEnabled(status.enabled);
      } catch (error) {
        console.error('Error fetching MFA status:', error);
        enqueueSnackbar('Failed to load MFA status', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMFAStatus();
    }
  }, [user, getMFAStatus, enqueueSnackbar]);

  const handleSetupMFA = async () => {
    try {
      setLoading(true);
      const data = await enableMFA();
      setSetupData(data);
      setDialogOpen(true);
    } catch (error) {
      console.error('MFA setup error:', error);
      enqueueSnackbar(error.message || 'Failed to setup MFA', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      enqueueSnackbar('Please enter a valid 6-digit code', { variant: 'error' });
      return;
    }
    
    try {
      setVerifying(true);
      await verifyMFA(verificationCode);
      setMfaEnabled(true);
      setDialogOpen(false);
      setVerificationCode('');
      enqueueSnackbar('MFA enabled successfully', { variant: 'success' });
    } catch (error) {
      console.error('MFA verification error:', error);
      enqueueSnackbar(error.message || 'Failed to verify MFA code', { variant: 'error' });
    } finally {
      setVerifying(false);
    }
  };

  const handleDisableMFA = async () => {
    if (!disableCode || disableCode.length !== 6) {
      enqueueSnackbar('Please enter a valid 6-digit code', { variant: 'error' });
      return;
    }
    
    try {
      setDisabling(true);
      await disableMFA(disableCode);
      setMfaEnabled(false);
      setDisableDialogOpen(false);
      setDisableCode('');
      enqueueSnackbar('MFA disabled successfully', { variant: 'success' });
    } catch (error) {
      console.error('MFA disable error:', error);
      enqueueSnackbar(error.message || 'Failed to disable MFA', { variant: 'error' });
    } finally {
      setDisabling(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setVerificationCode('');
  };

  const handleDisableDialogClose = () => {
    setDisableDialogOpen(false);
    setDisableCode('');
  };

  if (loading && !setupData) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Multi-Factor Authentication
      </Typography>
      
      <Typography variant="body2" color="textSecondary" paragraph>
        Add an extra layer of security to your account by enabling multi-factor authentication.
      </Typography>
      
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Security color={mfaEnabled ? 'success' : 'action'} sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h6">
                {mfaEnabled ? 'MFA is Enabled' : 'MFA is Disabled'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {mfaEnabled 
                  ? 'Your account is protected with multi-factor authentication.' 
                  : 'Enable MFA to add an extra layer of security to your account.'}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {mfaEnabled ? (
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDisableDialogOpen(true)}
              disabled={loading}
            >
              Disable MFA
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSetupMFA}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Enable MFA'}
            </Button>
          )}
        </CardContent>
      </Card>
      
      <Alert severity="info">
        <AlertTitle>What is Multi-Factor Authentication?</AlertTitle>
        Multi-factor authentication (MFA) adds an additional layer of security to your account by requiring a verification code from your mobile device in addition to your password.
      </Alert>
      
      {/* MFA Setup Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Set Up Multi-Factor Authentication</DialogTitle>
        <DialogContent>
          <Box py={2}>
            <Typography variant="body1" paragraph>
              Scan the QR code below with an authenticator app like Google Authenticator or Authy.
            </Typography>
            
            {setupData && (
              <Box display="flex" flexDirection="column" alignItems="center" my={3}>
                <img 
                  src={setupData.qrCodeUrl} 
                  alt="MFA QR Code" 
                  style={{ width: 200, height: 200, marginBottom: 16 }}
                />
                
                <Typography variant="body2" color="textSecondary">
                  Or enter this code manually: <strong>{setupData.secretKey}</strong>
                </Typography>
              </Box>
            )}
            
            <Typography variant="body1" paragraph>
              Enter the 6-digit verification code from your authenticator app:
            </Typography>
            
            <TextField
              fullWidth
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              inputProps={{ 
                maxLength: 6,
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
              sx={{ mt: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={verifying}>
            Cancel
          </Button>
          <Button 
            onClick={handleVerifyMFA} 
            color="primary" 
            disabled={verifying || verificationCode.length !== 6}
          >
            {verifying ? <CircularProgress size={24} /> : 'Verify'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Disable MFA Dialog */}
      <Dialog open={disableDialogOpen} onClose={handleDisableDialogClose} maxWidth="sm">
        <DialogTitle>Disable Multi-Factor Authentication</DialogTitle>
        <DialogContent>
          <Box py={2}>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <AlertTitle>Warning</AlertTitle>
              Disabling MFA will reduce the security of your account. Are you sure you want to continue?
            </Alert>
            
            <Typography variant="body1" paragraph>
              Enter the 6-digit verification code from your authenticator app to confirm:
            </Typography>
            
            <TextField
              fullWidth
              label="Verification Code"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              inputProps={{ 
                maxLength: 6,
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
              sx={{ mt: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDisableDialogClose} disabled={disabling}>
            Cancel
          </Button>
          <Button 
            onClick={handleDisableMFA} 
            color="error" 
            disabled={disabling || disableCode.length !== 6}
          >
            {disabling ? <CircularProgress size={24} /> : 'Disable MFA'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MFASetup;
