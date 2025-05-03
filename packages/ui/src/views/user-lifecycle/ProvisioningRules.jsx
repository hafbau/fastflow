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
  FormControl,
  Grid,
  IconButton,
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
import { IconPlus, IconEdit, IconTrash, IconFilter } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { formatDistanceToNow } from 'date-fns';
import ConfirmDialog from 'ui-component/ConfirmDialog';

// Rule type options
const ruleTypeOptions = [
  { value: 'USER_ONBOARDING', label: 'User Onboarding' },
  { value: 'ROLE_CHANGE', label: 'Role Change' },
  { value: 'USER_OFFBOARDING', label: 'User Offboarding' }
];

// Rule trigger options
const ruleTriggerOptions = [
  { value: 'EVENT', label: 'Event-based' },
  { value: 'SCHEDULE', label: 'Schedule-based' },
  { value: 'CONDITION', label: 'Condition-based' }
];

// Rule status options
const ruleStatusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'DRAFT', label: 'Draft' }
];

// Event type options
const eventTypeOptions = [
  { value: 'USER_CREATED', label: 'User Created' },
  { value: 'USER_INVITED', label: 'User Invited' },
  { value: 'USER_REGISTERED', label: 'User Registered' },
  { value: 'USER_ACTIVATED', label: 'User Activated' },
  { value: 'USER_DEACTIVATED', label: 'User Deactivated' },
  { value: 'USER_DELETED', label: 'User Deleted' },
  { value: 'ROLE_ASSIGNED', label: 'Role Assigned' },
  { value: 'ROLE_REMOVED', label: 'Role Removed' },
  { value: 'ORGANIZATION_JOINED', label: 'Organization Joined' },
  { value: 'ORGANIZATION_LEFT', label: 'Organization Left' },
  { value: 'WORKSPACE_JOINED', label: 'Workspace Joined' },
  { value: 'WORKSPACE_LEFT', label: 'Workspace Left' }
];

// Action type options
const actionTypeOptions = [
  { value: 'USER_ACTIVATION', label: 'Activate User' },
  { value: 'USER_DEACTIVATION', label: 'Deactivate User' },
  { value: 'ROLE_ASSIGNMENT', label: 'Assign Role' },
  { value: 'ROLE_REMOVAL', label: 'Remove Role' },
  { value: 'ORGANIZATION_ASSIGNMENT', label: 'Assign to Organization' },
  { value: 'ORGANIZATION_REMOVAL', label: 'Remove from Organization' },
  { value: 'WORKSPACE_ASSIGNMENT', label: 'Assign to Workspace' },
  { value: 'WORKSPACE_REMOVAL', label: 'Remove from Workspace' },
  { value: 'NOTIFICATION', label: 'Send Notification' }
];

const ProvisioningRules = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  // State for rules list
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for rule dialog
  const [openRuleDialog, setOpenRuleDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);
  const [ruleForm, setRuleForm] = useState({
    name: '',
    description: '',
    type: 'USER_ONBOARDING',
    trigger: 'EVENT',
    conditions: {
      eventTypes: []
    },
    actions: [],
    status: 'DRAFT'
  });

  // State for filter dialog
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    trigger: '',
    status: ''
  });

  // State for delete confirmation
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);

  // State for action dialog
  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [actionForm, setActionForm] = useState({
    type: 'USER_ACTIVATION',
    parameters: {},
    requiresApproval: false
  });

  // Fetch rules on component mount
  useEffect(() => {
    fetchRules();
  }, []);

  // Fetch rules with filters
  const fetchRules = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.trigger) params.trigger = filters.trigger;
      if (filters.status) params.status = filters.status;

      const response = await axios.get('/api/user-lifecycle/rules', { params });
      setRules(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching provisioning rules:', error);
      dispatch(
        openSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to fetch provisioning rules',
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

  // Open rule dialog for creating a new rule
  const handleAddRule = () => {
    setIsEditMode(false);
    setCurrentRule(null);
    setRuleForm({
      name: '',
      description: '',
      type: 'USER_ONBOARDING',
      trigger: 'EVENT',
      conditions: {
        eventTypes: []
      },
      actions: [],
      status: 'DRAFT'
    });
    setOpenRuleDialog(true);
  };

  // Open rule dialog for editing an existing rule
  const handleEditRule = (rule) => {
    setIsEditMode(true);
    setCurrentRule(rule);
    setRuleForm({
      name: rule.name,
      description: rule.description || '',
      type: rule.type,
      trigger: rule.trigger,
      conditions: rule.conditions,
      actions: rule.actions,
      status: rule.status,
      organizationId: rule.organizationId,
      workspaceId: rule.workspaceId
    });
    setOpenRuleDialog(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (rule) => {
    setRuleToDelete(rule);
    setOpenDeleteDialog(true);
  };

  // Delete a rule
  const handleDeleteRule = async () => {
    try {
      await axios.delete(`/api/user-lifecycle/rules/${ruleToDelete.id}`);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Provisioning rule deleted successfully',
          variant: 'alert',
          alert: {
            color: 'success'
          }
        })
      );
      fetchRules();
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting provisioning rule:', error);
      dispatch(
        openSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to delete provisioning rule',
          variant: 'alert',
          alert: {
            color: 'error'
          }
        })
      );
    }
  };

  // Handle rule form change
  const handleRuleFormChange = (e) => {
    const { name, value } = e.target;
    setRuleForm({
      ...ruleForm,
      [name]: value
    });
  };

  // Handle conditions change
  const handleConditionsChange = (e) => {
    const { name, value } = e.target;
    setRuleForm({
      ...ruleForm,
      conditions: {
        ...ruleForm.conditions,
        [name]: value
      }
    });
  };

  // Add a new action
  const handleAddAction = () => {
    setCurrentAction(null);
    setActionForm({
      type: 'USER_ACTIVATION',
      parameters: {},
      requiresApproval: false
    });
    setOpenActionDialog(true);
  };

  // Edit an existing action
  const handleEditAction = (index) => {
    setCurrentAction(index);
    setActionForm(ruleForm.actions[index]);
    setOpenActionDialog(true);
  };

  // Remove an action
  const handleRemoveAction = (index) => {
    const updatedActions = [...ruleForm.actions];
    updatedActions.splice(index, 1);
    setRuleForm({
      ...ruleForm,
      actions: updatedActions
    });
  };

  // Handle action form change
  const handleActionFormChange = (e) => {
    const { name, value } = e.target;
    setActionForm({
      ...actionForm,
      [name]: value
    });
  };

  // Handle action parameters change
  const handleActionParametersChange = (e) => {
    const { name, value } = e.target;
    setActionForm({
      ...actionForm,
      parameters: {
        ...actionForm.parameters,
        [name]: value
      }
    });
  };

  // Save action
  const handleSaveAction = () => {
    const updatedActions = [...ruleForm.actions];
    if (currentAction !== null) {
      updatedActions[currentAction] = actionForm;
    } else {
      updatedActions.push(actionForm);
    }
    setRuleForm({
      ...ruleForm,
      actions: updatedActions
    });
    setOpenActionDialog(false);
  };

  // Save rule
  const handleSaveRule = async () => {
    try {
      if (isEditMode) {
        await axios.put(`/api/user-lifecycle/rules/${currentRule.id}`, ruleForm);
        dispatch(
          openSnackbar({
            open: true,
            message: 'Provisioning rule updated successfully',
            variant: 'alert',
            alert: {
              color: 'success'
            }
          })
        );
      } else {
        await axios.post('/api/user-lifecycle/rules', ruleForm);
        dispatch(
          openSnackbar({
            open: true,
            message: 'Provisioning rule created successfully',
            variant: 'alert',
            alert: {
              color: 'success'
            }
          })
        );
      }
      fetchRules();
      setOpenRuleDialog(false);
    } catch (error) {
      console.error('Error saving provisioning rule:', error);
      dispatch(
        openSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to save provisioning rule',
          variant: 'alert',
          alert: {
            color: 'error'
          }
        })
      );
    }
  };

  // Apply filters
  const handleApplyFilters = () => {
    fetchRules();
    setOpenFilterDialog(false);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      type: '',
      trigger: '',
      status: ''
    });
    setOpenFilterDialog(false);
    fetchRules();
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'warning';
      case 'DRAFT':
        return 'info';
      default:
        return 'default';
    }
  };

  // Get rule type label
  const getRuleTypeLabel = (type) => {
    const option = ruleTypeOptions.find((opt) => opt.value === type);
    return option ? option.label : type;
  };

  // Get rule trigger label
  const getRuleTriggerLabel = (trigger) => {
    const option = ruleTriggerOptions.find((opt) => opt.value === trigger);
    return option ? option.label : trigger;
  };

  // Get action type label
  const getActionTypeLabel = (type) => {
    const option = actionTypeOptions.find((opt) => opt.value === type);
    return option ? option.label : type;
  };

  return (
    <MainCard title="Provisioning Rules">
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Button variant="contained" startIcon={<IconPlus />} onClick={handleAddRule}>
              Add Rule
            </Button>
            <Button variant="outlined" startIcon={<IconFilter />} onClick={() => setOpenFilterDialog(true)}>
              Filter
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Trigger</TableCell>
                  <TableCell>Status</TableCell>
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
                ) : rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No provisioning rules found
                    </TableCell>
                  </TableRow>
                ) : (
                  rules.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <Typography variant="subtitle1">{rule.name}</Typography>
                        {rule.description && (
                          <Typography variant="caption" color="textSecondary">
                            {rule.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{getRuleTypeLabel(rule.type)}</TableCell>
                      <TableCell>{getRuleTriggerLabel(rule.trigger)}</TableCell>
                      <TableCell>
                        <Chip label={rule.status} color={getStatusColor(rule.status)} size="small" />
                      </TableCell>
                      <TableCell>{formatDistanceToNow(new Date(rule.createdAt), { addSuffix: true })}</TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary" onClick={() => handleEditRule(rule)}>
                          <IconEdit />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(rule)}>
                          <IconTrash />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={rules.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </Grid>
      </Grid>

      {/* Rule Dialog */}
      <Dialog open={openRuleDialog} onClose={() => setOpenRuleDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit Provisioning Rule' : 'Create Provisioning Rule'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Rule Name"
                name="name"
                value={ruleForm.name}
                onChange={handleRuleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={ruleForm.description}
                onChange={handleRuleFormChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Rule Type</InputLabel>
                <Select name="type" value={ruleForm.type} onChange={handleRuleFormChange} label="Rule Type">
                  {ruleTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Trigger</InputLabel>
                <Select name="trigger" value={ruleForm.trigger} onChange={handleRuleFormChange} label="Trigger">
                  {ruleTriggerOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select name="status" value={ruleForm.status} onChange={handleRuleFormChange} label="Status">
                  {ruleStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Conditions Section */}
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                Conditions
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {ruleForm.trigger === 'EVENT' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Event Types</InputLabel>
                  <Select
                    multiple
                    name="eventTypes"
                    value={ruleForm.conditions.eventTypes || []}
                    onChange={(e) => handleConditionsChange(e)}
                    label="Event Types"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={eventTypeOptions.find((opt) => opt.value === value)?.label || value}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {eventTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Actions Section */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} mb={1}>
                <Typography variant="h5">Actions</Typography>
                <Button variant="outlined" startIcon={<IconPlus />} onClick={handleAddAction}>
                  Add Action
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              {ruleForm.actions.length === 0 ? (
                <Typography variant="body2" color="textSecondary" align="center">
                  No actions defined. Click "Add Action" to define what happens when this rule is triggered.
                </Typography>
              ) : (
                ruleForm.actions.map((action, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">{getActionTypeLabel(action.type)}</Typography>
                        <Box>
                          <IconButton size="small" color="primary" onClick={() => handleEditAction(index)}>
                            <IconEdit />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleRemoveAction(index)}>
                            <IconTrash />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        {action.requiresApproval ? 'Requires approval' : 'Automatic execution'}
                      </Typography>
                      {Object.entries(action.parameters).length > 0 && (
                        <Box mt={1}>
                          <Typography variant="body2">Parameters:</Typography>
                          {Object.entries(action.parameters).map(([key, value]) => (
                            <Typography key={key} variant="caption" display="block">
                              {key}: {value}
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRuleDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveRule} disabled={!ruleForm.name || ruleForm.actions.length === 0}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={openActionDialog} onClose={() => setOpenActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{currentAction !== null ? 'Edit Action' : 'Add Action'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Action Type</InputLabel>
                <Select name="type" value={actionForm.type} onChange={handleActionFormChange} label="Action Type">
                  {actionTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Dynamic parameters based on action type */}
            {actionForm.type === 'ROLE_ASSIGNMENT' || actionForm.type === 'ROLE_REMOVAL' ? (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Role ID"
                    name="roleId"
                    value={actionForm.parameters.roleId || ''}
                    onChange={handleActionParametersChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Workspace ID (optional)"
                    name="workspaceId"
                    value={actionForm.parameters.workspaceId || ''}
                    onChange={handleActionParametersChange}
                  />
                </Grid>
              </>
            ) : actionForm.type === 'ORGANIZATION_ASSIGNMENT' ? (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Organization ID"
                    name="organizationId"
                    value={actionForm.parameters.organizationId || ''}
                    onChange={handleActionParametersChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Role"
                    name="role"
                    value={actionForm.parameters.role || ''}
                    onChange={handleActionParametersChange}
                    placeholder="e.g., member, admin"
                  />
                </Grid>
              </>
            ) : actionForm.type === 'ORGANIZATION_REMOVAL' ? (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Organization ID"
                  name="organizationId"
                  value={actionForm.parameters.organizationId || ''}
                  onChange={handleActionParametersChange}
                  required
                />
              </Grid>
            ) : actionForm.type === 'WORKSPACE_ASSIGNMENT' ? (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Workspace ID"
                    name="workspaceId"
                    value={actionForm.parameters.workspaceId || ''}
                    onChange={handleActionParametersChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Role"
                    name="role"
                    value={actionForm.parameters.role || ''}
                    onChange={handleActionParametersChange}
                    placeholder="e.g., member, admin"
                  />
                </Grid>
              </>
            ) : actionForm.type === 'WORKSPACE_REMOVAL' ? (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Workspace ID"
                  name="workspaceId"
                  value={actionForm.parameters.workspaceId || ''}
                  onChange={handleActionParametersChange}
                  required
                />
              </Grid>
            ) : actionForm.type === 'NOTIFICATION' ? (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  name="message"
                  value={actionForm.parameters.message || ''}
                  onChange={handleActionParametersChange}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
            ) : null}

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Requires Approval</InputLabel>
                <Select
                  name="requiresApproval"
                  value={actionForm.requiresApproval}
                  onChange={(e) => setActionForm({ ...actionForm, requiresApproval: e.target.value })}
                  label="Requires Approval"
                >
                  <MenuItem value={false}>No - Execute automatically</MenuItem>
                  <MenuItem value={true}>Yes - Require manual approval</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenActionDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAction}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={openFilterDialog} onClose={() => setOpenFilterDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Filter Rules</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Rule Type</InputLabel>
                <Select
                  name="type"
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  label="Rule Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  {ruleTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Trigger</InputLabel>
                <Select
                  name="trigger"
                  value={filters.trigger}
                  onChange={(e) => setFilters({ ...filters, trigger: e.target.value })}
                  label="Trigger"
                >
                  <MenuItem value="">All Triggers</MenuItem>
                  {ruleTriggerOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {ruleStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetFilters}>Reset</Button>
          <Button variant="contained" onClick={handleApplyFilters}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={openDeleteDialog}
        title="Delete Provisioning Rule"
        content={`Are you sure you want to delete the rule "${ruleToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteRule}
        onCancel={() => setOpenDeleteDialog(false)}
      />
    </MainCard>
  );
};

export default ProvisioningRules;