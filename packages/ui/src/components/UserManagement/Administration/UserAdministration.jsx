import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  FilterList,
  Lock,
  LockOpen,
  MoreVert,
  Refresh,
  Search,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import UserInviteDialog from './UserInviteDialog';
import UserEditDialog from './UserEditDialog';
import UserDeleteDialog from './UserDeleteDialog';
import UserResetPasswordDialog from './UserResetPasswordDialog';

/**
 * User administration component
 * Allows administrators to manage users
 */
const UserAdministration = () => {
  const { getUsers, getUsersByOrganization, getCurrentOrganization } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [actionMenuUserId, setActionMenuUserId] = useState(null);

  // Fetch users and current organization
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current organization
        const org = await getCurrentOrganization();
        setOrganization(org);
        
        // Get users for the organization
        const usersData = await getUsersByOrganization(org.id);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
        enqueueSnackbar('Failed to load users', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getCurrentOrganization, getUsersByOrganization, enqueueSnackbar]);

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setLoading(true);
      
      // Get users for the organization
      const usersData = await getUsersByOrganization(organization.id);
      setUsers(usersData);
      
      enqueueSnackbar('User list refreshed', { variant: 'success' });
    } catch (error) {
      console.error('Error refreshing users:', error);
      enqueueSnackbar('Failed to refresh users', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  // Handle filter menu
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setFilterAnchorEl(null);
    setPage(0);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle action menu
  const handleActionMenuOpen = (event, userId) => {
    setActionMenuAnchorEl(event.currentTarget);
    setActionMenuUserId(userId);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
    setActionMenuUserId(null);
  };

  // Handle user actions
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
    handleActionMenuClose();
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
    handleActionMenuClose();
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setResetPasswordDialogOpen(true);
    handleActionMenuClose();
  };

  const handleToggleUserStatus = async (user) => {
    // This will be implemented in the UserService
    handleActionMenuClose();
  };

  // Filter and search users
  const filteredUsers = users.filter((user) => {
    // Apply status filter
    if (statusFilter !== 'all' && user.status !== statusFilter) {
      return false;
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.firstName?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Paginate users
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle dialog callbacks
  const handleUserInvited = (newUser) => {
    setUsers([...users, newUser]);
    setInviteDialogOpen(false);
    enqueueSnackbar('User invited successfully', { variant: 'success' });
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
    setEditDialogOpen(false);
    enqueueSnackbar('User updated successfully', { variant: 'success' });
  };

  const handleUserDeleted = (deletedUserId) => {
    setUsers(users.filter(user => user.id !== deletedUserId));
    setDeleteDialogOpen(false);
    enqueueSnackbar('User deleted successfully', { variant: 'success' });
  };

  const handlePasswordReset = () => {
    setResetPasswordDialogOpen(false);
    enqueueSnackbar('Password reset email sent', { variant: 'success' });
  };

  if (loading && users.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4">
                User Management
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => setInviteDialogOpen(true)}
              >
                Invite User
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <TextField
                    placeholder="Search users..."
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: 300 }}
                  />
                  
                  <Box>
                    <Tooltip title="Filter">
                      <IconButton onClick={handleFilterClick}>
                        <FilterList />
                      </IconButton>
                    </Tooltip>
                    
                    <Menu
                      anchorEl={filterAnchorEl}
                      open={Boolean(filterAnchorEl)}
                      onClose={handleFilterClose}
                    >
                      <MenuItem 
                        onClick={() => handleFilterChange('all')}
                        selected={statusFilter === 'all'}
                      >
                        All Users
                      </MenuItem>
                      <MenuItem 
                        onClick={() => handleFilterChange('active')}
                        selected={statusFilter === 'active'}
                      >
                        Active Users
                      </MenuItem>
                      <MenuItem 
                        onClick={() => handleFilterChange('inactive')}
                        selected={statusFilter === 'inactive'}
                      >
                        Inactive Users
                      </MenuItem>
                      <MenuItem 
                        onClick={() => handleFilterChange('pending')}
                        selected={statusFilter === 'pending'}
                      >
                        Pending Invitations
                      </MenuItem>
                    </Menu>
                    
                    <Tooltip title="Refresh">
                      <IconButton onClick={handleRefresh} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : <Refresh />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Last Login</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedUsers.length > 0 ? (
                        paginatedUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              {user.firstName} {user.lastName}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>
                              {user.status === 'active' && 'Active'}
                              {user.status === 'inactive' && 'Inactive'}
                              {user.status === 'pending' && 'Pending Invitation'}
                            </TableCell>
                            <TableCell>
                              {user.lastLoginAt 
                                ? new Date(user.lastLoginAt).toLocaleDateString() 
                                : 'Never'}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                onClick={(event) => handleActionMenuOpen(event, user.id)}
                              >
                                <MoreVert />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            No users found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredUsers.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={() => {
          const user = users.find(u => u.id === actionMenuUserId);
          handleEditUser(user);
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => {
          const user = users.find(u => u.id === actionMenuUserId);
          handleResetPassword(user);
        }}>
          <Lock fontSize="small" sx={{ mr: 1 }} /> Reset Password
        </MenuItem>
        <MenuItem onClick={() => {
          const user = users.find(u => u.id === actionMenuUserId);
          handleToggleUserStatus(user);
        }}>
          {users.find(u => u.id === actionMenuUserId)?.status === 'active' ? (
            <>
              <LockOpen fontSize="small" sx={{ mr: 1 }} /> Deactivate
            </>
          ) : (
            <>
              <LockOpen fontSize="small" sx={{ mr: 1 }} /> Activate
            </>
          )}
        </MenuItem>
        <MenuItem onClick={() => {
          const user = users.find(u => u.id === actionMenuUserId);
          handleDeleteUser(user);
        }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
      
      {/* Dialogs */}
      <UserInviteDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        onUserInvited={handleUserInvited}
        organizationId={organization?.id}
      />
      
      <UserEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onUserUpdated={handleUserUpdated}
        user={selectedUser}
      />
      
      <UserDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onUserDeleted={handleUserDeleted}
        user={selectedUser}
      />
      
      <UserResetPasswordDialog
        open={resetPasswordDialogOpen}
        onClose={() => setResetPasswordDialogOpen(false)}
        onPasswordReset={handlePasswordReset}
        user={selectedUser}
      />
    </Container>
  );
};

export default UserAdministration;
