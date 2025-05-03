import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
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
import { IconCheck, IconX, IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { formatDistanceToNow } from 'date-fns';
import ConfirmDialog from 'ui-component/ConfirmDialog';

// Action type options for display
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

const PendingApprovals = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  // State for actions list
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for action details dialog
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  // State for approval/rejection dialogs
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [actionToApprove, setActionToApprove] = useState(null);
  const [actionToReject, setActionToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch pending approval actions on component mount
  useEffect(() => {
    fetchPendingActions();
  }, []);

  // Fetch pending approval actions
  const fetchPendingActions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/user-lifecycle/actions/pending');
      setActions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending approval actions:', error);
      dispatch(
        openSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to fetch pending approval actions',
          variant: 'alert',
          alert: {
            color: 'error'
          }
        })
      );
      setLoading(false);
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

  // Open action details dialog
  const handleViewDetails = (action) => {
    setSelectedAction(action);
    setOpenDetailsDialog(true);
  };

  // Open approve dialog
  const handleApproveClick = (action) => {
    setActionToApprove(action);
    setOpenApproveDialog(true);
  };

  // Open reject dialog
  const handleRejectClick = (action) => {
    setActionToReject(action);
    setRejectionReason('');
    setOpenRejectDialog(true);
  };

  // Approve an action
  const handleApproveAction = async () => {
    try {
      await axios.post(`/api/user-lifecycle/actions/${actionToApprove.id}/approve`);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Action approved successfully',
          variant: 'alert',
          alert: {
            color: 'success'
          }
        })
      );
      fetchPendingActions();
      setOpenApproveDialog(false);
    } catch (error) {
      console.error('Error approving action:', error);
      dispatch(
        openSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to approve action',
          variant: 'alert',
          alert: {
            color: 'error'
          }
        })
      );
    }
  };

  // Reject an action
  const handleRejectAction = async () => {
    try {
      if (!rejectionReason.trim()) {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Please provide a reason for rejection',
            variant: 'alert',
            alert: {
              color: 'warning'
            }
          })
        );
        return;
      }

      await axios.post(`/api/user-lifecycle/actions/${actionToReject.id}/reject`, {
        reason: rejectionReason
      });
      dispatch(
        openSnackbar({
          open: true,
          message: 'Action rejected successfully',
          variant: 'alert',
          alert: {
            color: 'success'
          }
        })
      );
      fetchPendingActions();
      setOpenRejectDialog(false);
    } catch (error) {
      console.error('Error rejecting action:', error);
      dispatch(
        openSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to reject action',
          variant: 'alert',
          alert: {
            color: 'error'
          }
        })
      );
    }
  };

  // Get action type label
  const getActionTypeLabel = (type) => {
    return actionTypeLabels[type] || type;
  };

  // Format parameters for display
  const formatParameters = (parameters) => {
    if (!parameters || Object.keys(parameters).length === 0) {
      return 'No parameters';
    }

    return Object.entries(parameters)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  return (
    <MainCard title="Pending Approval Actions">
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Action Type</TableCell>
                  <TableCell>Target User</TableCell>
                  <TableCell>Parameters</TableCell>
                  <TableCell>Initiated By</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : actions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No pending approval actions found
                    </TableCell>
                  </TableRow>
                ) : (
                  actions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((action) => (
                    <TableRow key={action.id}>
                      <TableCell>
                        <Chip
                          label={getActionTypeLabel(action.type)}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{action.targetUser?.email || action.targetUserId}</TableCell>
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
                          {formatParameters(action.parameters)}
                        </Typography>
                      </TableCell>
                      <TableCell>{action.initiatedByUser?.email || action.initiatedBy}</TableCell>
                      <TableCell>{formatDistanceToNow(new Date(action.createdAt), { addSuffix: true })}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="info"
                            startIcon={<IconInfoCircle />}
                            onClick={() => handleViewDetails(action)}
                          >
                            Details
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            startIcon={<IconCheck />}
                            onClick={() => handleApproveClick(action)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<IconX />}
                            onClick={() => handleRejectClick(action)}
                          >
                            Reject
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={actions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </Grid>
      </Grid>

      {/* Action Details Dialog */}
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Action Details</DialogTitle>
        <DialogContent>
          {selectedAction && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Action ID</Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedAction.id}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Action Type</Typography>
                <Typography variant="body2" color="textSecondary">
                  {getActionTypeLabel(selectedAction.type)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Target User</Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedAction.targetUser?.email || selectedAction.targetUserId}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Status</Typography>
                <Chip label="Requires Approval" color="warning" size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Initiated By</Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedAction.initiatedByUser?.email || selectedAction.initiatedBy}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Created At</Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(selectedAction.createdAt).toLocaleString()}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1">Parameters</Typography>
                {selectedAction.parameters && Object.keys(selectedAction.parameters).length > 0 ? (
                  <Card variant="outlined" sx={{ mt: 1 }}>
                    <CardContent>
                      {Object.entries(selectedAction.parameters).map(([key, value]) => (
                        <Box key={key} sx={{ mb: 1 }}>
                          <Typography variant="caption" color="textSecondary">
                            {key}
                          </Typography>
                          <Typography variant="body2">{value}</Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No parameters
                  </Typography>
                )}
              </Grid>

              {selectedAction.rule && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle1">Triggered by Rule</Typography>
                  <Card variant="outlined" sx={{ mt: 1 }}>
                    <CardContent>
                      <Typography variant="body1">{selectedAction.rule.name}</Typography>
                      {selectedAction.rule.description && (
                        <Typography variant="body2" color="textSecondary">
                          {selectedAction.rule.description}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
          {selectedAction && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<IconCheck />}
                onClick={() => {
                  setOpenDetailsDialog(false);
                  handleApproveClick(selectedAction);
                }}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<IconX />}
                onClick={() => {
                  setOpenDetailsDialog(false);
                  handleRejectClick(selectedAction);
                }}
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        open={openApproveDialog}
        title="Approve Action"
        content={`Are you sure you want to approve this ${
          actionToApprove ? getActionTypeLabel(actionToApprove.type).toLowerCase() : 'action'
        }? This will execute the action immediately.`}
        onConfirm={handleApproveAction}
        onCancel={() => setOpenApproveDialog(false)}
        confirmButtonText="Approve"
        confirmButtonColor="success"
      />

      {/* Reject Dialog */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Action</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Please provide a reason for rejecting this{' '}
            {actionToReject ? getActionTypeLabel(actionToReject.type).toLowerCase() : 'action'}.
          </Typography>
          <TextField
            fullWidth
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            multiline
            rows={3}
            sx={{ mt: 2 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleRejectAction} disabled={!rejectionReason.trim()}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default PendingApprovals;