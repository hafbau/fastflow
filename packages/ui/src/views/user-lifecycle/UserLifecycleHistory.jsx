import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { IconSearch, IconUserCircle, IconHistory, IconArrowRight } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { formatDistanceToNow } from 'date-fns';
import SubCard from 'ui-component/cards/SubCard';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';

// Lifecycle state type labels
const lifecycleStateLabels = {
  INVITED: 'Invited',
  REGISTERED: 'Registered',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
  DELETED: 'Deleted'
};

// Lifecycle state colors
const lifecycleStateColors = {
  INVITED: 'info',
  REGISTERED: 'primary',
  ACTIVE: 'success',
  INACTIVE: 'warning',
  SUSPENDED: 'error',
  DELETED: 'default'
};

const UserLifecycleHistory = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  // State for user search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // State for selected user
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentState, setCurrentState] = useState(null);
  const [stateHistory, setStateHistory] = useState([]);
  const [provisioningActions, setProvisioningActions] = useState([]);
  const [loadingUserData, setLoadingUserData] = useState(false);

  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for action filter
  const [actionStatusFilter, setActionStatusFilter] = useState('');

  // Handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Search for users
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Please enter a search query',
          variant: 'alert',
          alert: {
            color: 'warning'
          }
        })
      );
      return;
    }

    try {
      setSearching(true);
      // This endpoint should be implemented to search users by email, name, or ID
      const response = await axios.get('/api/users/search', {
        params: { query: searchQuery }
      });
      setSearchResults(response.data);
      setSearching(false);
    } catch (error) {
      console.error('Error searching users:', error);
      dispatch(
        openSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to search users',
          variant: 'alert',
          alert: {
            color: 'error'
          }
        })
      );
      setSearching(false);
    }
  };

  // Select a user to view their lifecycle data
  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setLoadingUserData(true);
    
    try {
      // Fetch user's current lifecycle state
      const currentStateResponse = await axios.get(`/api/user-lifecycle/users/${user.id}/state/current`);
      setCurrentState(currentStateResponse.data);
      
      // Fetch user's lifecycle state history
      const historyResponse = await axios.get(`/api/user-lifecycle/users/${user.id}/states`);
      setStateHistory(historyResponse.data);
      
      // Fetch user's provisioning actions
      const actionsResponse = await axios.get(`/api/user-lifecycle/users/${user.id}/actions`);
      setProvisioningActions(actionsResponse.data);
      
      setLoadingUserData(false);
    } catch (error) {
      console.error('Error fetching user lifecycle data:', error);
      dispatch(
        openSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to fetch user lifecycle data',
          variant: 'alert',
          alert: {
            color: 'error'
          }
        })
      );
      setLoadingUserData(false);
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter actions by status
  const filteredActions = actionStatusFilter
    ? provisioningActions.filter((action) => action.status === actionStatusFilter)
    : provisioningActions;

  // Get lifecycle state label
  const getStateLabel = (state) => {
    return lifecycleStateLabels[state] || state;
  };

  // Get lifecycle state color
  const getStateColor = (state) => {
    return lifecycleStateColors[state] || 'default';
  };

  // Get action type label
  const getActionTypeLabel = (type) => {
    const actionTypeLabels = {
      USER_ACTIVATION: 'Activate User',
      USER_DEACTIVATION: 'Deactivate User',
      ROLE_ASSIGNMENT: 'Assign Role',
      ROLE_REMOVAL: 'Remove Role',
      ORGANIZATION_ASSIGNMENT: 'Assign to Organization',
      ORGANIZATION_REMOVAL: 'Remove from Organization',
      WORKSPACE_ASSIGNMENT: 'Assign to Workspace',
      WORKSPACE_REMOVAL: 'Remove from Workspace',
      NOTIFICATION: 'Send Notification'
    };
    return actionTypeLabels[type] || type;
  };

  // Get action status color
  const getActionStatusColor = (status) => {
    const statusColors = {
      PENDING: 'warning',
      IN_PROGRESS: 'info',
      COMPLETED: 'success',
      FAILED: 'error',
      CANCELLED: 'default',
      REQUIRES_APPROVAL: 'secondary',
      APPROVED: 'success',
      REJECTED: 'error'
    };
    return statusColors[status] || 'default';
  };

  return (
    <MainCard title="User Lifecycle History">
      <Grid container spacing={gridSpacing}>
        {/* User Search Section */}
        <Grid item xs={12}>
          <SubCard title="Search Users">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Search by email, name, or ID"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Enter email, name, or user ID"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<IconSearch />}
                  onClick={handleSearch}
                  disabled={searching || !searchQuery.trim()}
                >
                  {searching ? 'Searching...' : 'Search'}
                </Button>
              </Grid>
            </Grid>

            {searchResults.length > 0 && (
              <Box mt={3}>
                <Typography variant="h5" gutterBottom>
                  Search Results
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {searchResults.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name || 'N/A'}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<IconUserCircle />}
                              onClick={() => handleSelectUser(user)}
                            >
                              View Lifecycle
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </SubCard>
        </Grid>

        {/* User Lifecycle Data Section */}
        {selectedUser && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" alignItems="center" mb={2}>
                <IconUserCircle size={24} />
                <Typography variant="h4" ml={1}>
                  {selectedUser.name || 'User'} ({selectedUser.email})
                </Typography>
              </Box>
            </Grid>

            {/* Current State */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Current State
                  </Typography>
                  {loadingUserData ? (
                    <Typography>Loading...</Typography>
                  ) : currentState ? (
                    <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
                      <Chip
                        label={getStateLabel(currentState.state)}
                        color={getStateColor(currentState.state)}
                        sx={{ fontSize: '1rem', py: 2, px: 3 }}
                      />
                      <Typography variant="body2" color="textSecondary" mt={1}>
                        Since: {new Date(currentState.createdAt).toLocaleString()}
                      </Typography>
                      {currentState.changedBy && (
                        <Typography variant="body2" color="textSecondary">
                          Changed by: {currentState.changedByUser?.email || currentState.changedBy}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Typography color="textSecondary">No state information available</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* State History Timeline */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    State History
                  </Typography>
                  {loadingUserData ? (
                    <Typography>Loading...</Typography>
                  ) : stateHistory.length > 0 ? (
                    <Timeline position="alternate">
                      {stateHistory.map((state, index) => (
                        <TimelineItem key={state.id}>
                          <TimelineOppositeContent color="text.secondary">
                            {new Date(state.createdAt).toLocaleString()}
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color={getStateColor(state.state)} />
                            {index < stateHistory.length - 1 && <TimelineConnector />}
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography variant="h6">{getStateLabel(state.state)}</Typography>
                            {state.changedBy && (
                              <Typography variant="body2" color="textSecondary">
                                Changed by: {state.changedByUser?.email || state.changedBy}
                              </Typography>
                            )}
                            {state.metadata && Object.keys(state.metadata).length > 0 && (
                              <Box mt={1}>
                                <Typography variant="caption" color="textSecondary">
                                  Metadata:
                                </Typography>
                                {Object.entries(state.metadata).map(([key, value]) => (
                                  <Typography key={key} variant="caption" display="block">
                                    {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                                  </Typography>
                                ))}
                              </Box>
                            )}
                          </TimelineContent>
                        </TimelineItem>
                      ))}
                    </Timeline>
                  ) : (
                    <Typography color="textSecondary">No state history available</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Provisioning Actions */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5">Provisioning Actions</Typography>
                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel>Filter by Status</InputLabel>
                      <Select
                        value={actionStatusFilter}
                        onChange={(e) => setActionStatusFilter(e.target.value)}
                        label="Filter by Status"
                      >
                        <MenuItem value="">All Statuses</MenuItem>
                        <MenuItem value="PENDING">Pending</MenuItem>
                        <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                        <MenuItem value="COMPLETED">Completed</MenuItem>
                        <MenuItem value="FAILED">Failed</MenuItem>
                        <MenuItem value="CANCELLED">Cancelled</MenuItem>
                        <MenuItem value="REQUIRES_APPROVAL">Requires Approval</MenuItem>
                        <MenuItem value="APPROVED">Approved</MenuItem>
                        <MenuItem value="REJECTED">Rejected</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {loadingUserData ? (
                    <Typography>Loading...</Typography>
                  ) : filteredActions.length > 0 ? (
                    <>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Action Type</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Parameters</TableCell>
                              <TableCell>Initiated By</TableCell>
                              <TableCell>Created</TableCell>
                              <TableCell>Completed</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredActions
                              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                              .map((action) => (
                                <TableRow key={action.id}>
                                  <TableCell>
                                    <Chip
                                      label={getActionTypeLabel(action.type)}
                                      color="primary"
                                      variant="outlined"
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={action.status}
                                      color={getActionStatusColor(action.status)}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        maxWidth: 200,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {action.parameters && Object.keys(action.parameters).length > 0
                                        ? Object.entries(action.parameters)
                                            .map(([key, value]) => `${key}: ${value}`)
                                            .join(', ')
                                        : 'No parameters'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {action.initiatedByUser?.email || action.initiatedBy}
                                  </TableCell>
                                  <TableCell>
                                    {formatDistanceToNow(new Date(action.createdAt), { addSuffix: true })}
                                  </TableCell>
                                  <TableCell>
                                    {action.completedAt
                                      ? formatDistanceToNow(new Date(action.completedAt), { addSuffix: true })
                                      : '-'}
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredActions.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                      />
                    </>
                  ) : (
                    <Typography color="textSecondary">No provisioning actions found</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </MainCard>
  );
};

export default UserLifecycleHistory;