import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { format } from 'date-fns';

// Time-based permission types
const PERMISSION_TYPES = [
  { value: 'temporary', label: 'Temporary Access' },
  { value: 'scheduled', label: 'Scheduled Access' },
  { value: 'recurring', label: 'Recurring Access' },
];

// Days of week for recurring schedule
const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

// TimeBasedPermissionManager component
const TimeBasedPermissionManager = ({
  userId,
  permissionId,
  resourceType,
  resourceId,
  onPermissionChange,
}) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPermission, setCurrentPermission] = useState({
    type: 'temporary',
    startTime: new Date(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to 24 hours from now
    isActive: true,
    reason: '',
    schedule: {
      days: [],
      hours: [],
      months: [],
      daysOfMonth: [],
    },
  });
  
  const { enqueueSnackbar } = useSnackbar();

  // Fetch time-based permissions
  const fetchPermissions = async () => {
    if (!userId || !permissionId) return;
    
    setLoading(true);
    try {
      const response = await axios.get('/api/permissions/time-based', {
        params: {
          userId,
          permissionId,
          resourceType,
          resourceId,
        },
      });
      
      setPermissions(response.data);
    } catch (error) {
      console.error('Error fetching time-based permissions:', error);
      enqueueSnackbar('Failed to fetch time-based permissions', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Initialize component
  useEffect(() => {
    fetchPermissions();
  }, [userId, permissionId, resourceType, resourceId]);

  // Handle dialog open for adding a new permission
  const handleAddPermission = () => {
    setEditMode(false);
    setCurrentPermission({
      type: 'temporary',
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to 24 hours from now
      isActive: true,
      reason: '',
      schedule: {
        days: [],
        hours: [],
        months: [],
        daysOfMonth: [],
      },
    });
    setOpenDialog(true);
  };

  // Handle dialog open for editing a permission
  const handleEditPermission = (permission) => {
    setEditMode(true);
    
    // Convert string dates to Date objects
    const permissionCopy = {
      ...permission,
      startTime: new Date(permission.startTime),
      endTime: permission.endTime ? new Date(permission.endTime) : null,
    };
    
    setCurrentPermission(permissionCopy);
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle permission type change
  const handleTypeChange = (e) => {
    const type = e.target.value;
    setCurrentPermission({
      ...currentPermission,
      type,
    });
  };

  // Handle schedule change for recurring permissions
  const handleScheduleChange = (field, value) => {
    setCurrentPermission({
      ...currentPermission,
      schedule: {
        ...currentPermission.schedule,
        [field]: value,
      },
    });
  };

  // Handle day of week toggle for recurring schedule
  const handleDayToggle = (day) => {
    const days = [...(currentPermission.schedule.days || [])];
    const index = days.indexOf(day);
    
    if (index === -1) {
      days.push(day);
    } else {
      days.splice(index, 1);
    }
    
    handleScheduleChange('days', days);
  };

  // Handle hour toggle for recurring schedule
  const handleHourToggle = (hour) => {
    const hours = [...(currentPermission.schedule.hours || [])];
    const index = hours.indexOf(hour);
    
    if (index === -1) {
      hours.push(hour);
    } else {
      hours.splice(index, 1);
    }
    
    handleScheduleChange('hours', hours);
  };

  // Save permission
  const handleSavePermission = async () => {
    try {
      if (!userId || !permissionId) {
        enqueueSnackbar('User ID and Permission ID are required', { variant: 'error' });
        return;
      }
      
      // Validate based on type
      if (currentPermission.type === 'temporary' || currentPermission.type === 'scheduled') {
        if (!currentPermission.startTime) {
          enqueueSnackbar('Start time is required', { variant: 'error' });
          return;
        }
        
        if (!currentPermission.endTime) {
          enqueueSnackbar('End time is required', { variant: 'error' });
          return;
        }
        
        if (new Date(currentPermission.startTime) >= new Date(currentPermission.endTime)) {
          enqueueSnackbar('End time must be after start time', { variant: 'error' });
          return;
        }
      } else if (currentPermission.type === 'recurring') {
        const { days, hours } = currentPermission.schedule;
        
        if (!days || days.length === 0) {
          enqueueSnackbar('At least one day must be selected for recurring schedule', { variant: 'error' });
          return;
        }
        
        if (!hours || hours.length === 0) {
          enqueueSnackbar('At least one hour must be selected for recurring schedule', { variant: 'error' });
          return;
        }
      }
      
      const payload = {
        ...currentPermission,
        userId,
        permissionId,
        resourceType,
        resourceId,
      };
      
      if (editMode) {
        await axios.put(`/api/permissions/time-based/${currentPermission.id}`, payload);
        enqueueSnackbar('Time-based permission updated successfully', { variant: 'success' });
      } else {
        await axios.post('/api/permissions/time-based', payload);
        enqueueSnackbar('Time-based permission created successfully', { variant: 'success' });
      }
      
      handleCloseDialog();
      fetchPermissions();
      
      if (onPermissionChange) {
        onPermissionChange();
      }
    } catch (error) {
      console.error('Error saving time-based permission:', error);
      enqueueSnackbar('Failed to save time-based permission', { variant: 'error' });
    }
  };

  // Delete permission
  const handleDeletePermission = async (id) => {
    try {
      await axios.delete(`/api/permissions/time-based/${id}`);
      enqueueSnackbar('Time-based permission deleted successfully', { variant: 'success' });
      fetchPermissions();
      
      if (onPermissionChange) {
        onPermissionChange();
      }
    } catch (error) {
      console.error('Error deleting time-based permission:', error);
      enqueueSnackbar('Failed to delete time-based permission', { variant: 'error' });
    }
  };

  // Toggle permission active status
  const handleToggleActive = async (permission) => {
    try {
      await axios.put(`/api/permissions/time-based/${permission.id}`, {
        ...permission,
        isActive: !permission.isActive,
      });
      
      enqueueSnackbar(
        `Time-based permission ${!permission.isActive ? 'activated' : 'deactivated'} successfully`,
        { variant: 'success' }
      );
      
      fetchPermissions();
      
      if (onPermissionChange) {
        onPermissionChange();
      }
    } catch (error) {
      console.error('Error toggling time-based permission:', error);
      enqueueSnackbar('Failed to update time-based permission', { variant: 'error' });
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  };

  // Get permission status
  const getPermissionStatus = (permission) => {
    if (!permission.isActive) {
      return { label: 'Inactive', color: 'default' };
    }
    
    const now = new Date();
    
    if (permission.type === 'temporary' || permission.type === 'scheduled') {
      const startTime = new Date(permission.startTime);
      const endTime = new Date(permission.endTime);
      
      if (now < startTime) {
        return { label: 'Pending', color: 'warning' };
      } else if (now > endTime) {
        return { label: 'Expired', color: 'error' };
      } else {
        return { label: 'Active', color: 'success' };
      }
    } else if (permission.type === 'recurring') {
      // For recurring, we'd need to check the schedule against current time
      // This is a simplified version
      return { label: 'Recurring', color: 'info' };
    }
    
    return { label: 'Unknown', color: 'default' };
  };

  // Render schedule details
  const renderScheduleDetails = (schedule) => {
    if (!schedule) return 'No schedule';
    
    const parts = [];
    
    if (schedule.days && schedule.days.length > 0) {
      const dayLabels = schedule.days.map(day => 
        DAYS_OF_WEEK.find(d => d.value === day)?.label || day
      ).join(', ');
      parts.push(`Days: ${dayLabels}`);
    }
    
    if (schedule.hours && schedule.hours.length > 0) {
      const hourLabels = schedule.hours.map(hour => 
        `${hour}:00${hour < 12 ? 'am' : 'pm'}`
      ).join(', ');
      parts.push(`Hours: ${hourLabels}`);
    }
    
    return parts.join(' | ');
  };

  return (
    <Card>
      <CardHeader 
        title="Time-Based Permissions" 
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddPermission}
            disabled={!userId || !permissionId}
          >
            Add Time-Based Permission
          </Button>
        }
      />
      <Divider />
      <CardContent>
        {!userId || !permissionId ? (
          <Typography variant="body1" color="textSecondary" align="center">
            Select a user and permission to manage time-based permissions
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Schedule</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {permissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No time-based permissions found
                    </TableCell>
                  </TableRow>
                ) : (
                  permissions.map((permission) => {
                    const status = getPermissionStatus(permission);
                    
                    return (
                      <TableRow key={permission.id}>
                        <TableCell>
                          {PERMISSION_TYPES.find(t => t.value === permission.type)?.label || permission.type}
                        </TableCell>
                        <TableCell>{formatDate(permission.startTime)}</TableCell>
                        <TableCell>{formatDate(permission.endTime)}</TableCell>
                        <TableCell>
                          {permission.type === 'recurring' ? renderScheduleDetails(permission.schedule) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={status.label}
                            color={status.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{permission.reason || 'N/A'}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleEditPermission(permission)} size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleToggleActive(permission)} size="small" color={permission.isActive ? 'warning' : 'success'}>
                            {permission.isActive ? <AccessTimeIcon /> : <RefreshIcon />}
                          </IconButton>
                          <IconButton onClick={() => handleDeletePermission(permission.id)} size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
      
      {/* Add/Edit Permission Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Time-Based Permission' : 'Add Time-Based Permission'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {editMode
              ? 'Edit the time-based permission details below.'
              : 'Configure a time-based permission to grant access for a specific time period.'}
          </DialogContentText>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Permission Type</InputLabel>
                <Select
                  value={currentPermission.type}
                  onChange={handleTypeChange}
                >
                  {PERMISSION_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentPermission.isActive}
                    onChange={(e) => setCurrentPermission({
                      ...currentPermission,
                      isActive: e.target.checked
                    })}
                  />
                }
                label="Active"
              />
            </Grid>
            
            {(currentPermission.type === 'temporary' || currentPermission.type === 'scheduled') && (
              <>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="Start Time"
                      value={currentPermission.startTime}
                      onChange={(newValue) => setCurrentPermission({
                        ...currentPermission,
                        startTime: newValue
                      })}
                      renderInput={(params) => <TextField {...params} fullWidth margin="dense" />}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="End Time"
                      value={currentPermission.endTime}
                      onChange={(newValue) => setCurrentPermission({
                        ...currentPermission,
                        endTime: newValue
                      })}
                      renderInput={(params) => <TextField {...params} fullWidth margin="dense" />}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}
            
            {currentPermission.type === 'recurring' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Days of Week
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {DAYS_OF_WEEK.map((day) => (
                      <Chip
                        key={day.value}
                        label={day.label}
                        onClick={() => handleDayToggle(day.value)}
                        color={currentPermission.schedule.days?.includes(day.value) ? 'primary' : 'default'}
                        clickable
                      />
                    ))}
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Hours (24-hour format)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                      <Chip
                        key={hour}
                        label={`${hour}:00`}
                        onClick={() => handleHourToggle(hour)}
                        color={currentPermission.schedule.hours?.includes(hour) ? 'primary' : 'default'}
                        clickable
                      />
                    ))}
                  </Box>
                </Grid>
              </>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="dense"
                label="Reason"
                multiline
                rows={2}
                value={currentPermission.reason || ''}
                onChange={(e) => setCurrentPermission({
                  ...currentPermission,
                  reason: e.target.value
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSavePermission} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default TimeBasedPermissionManager;