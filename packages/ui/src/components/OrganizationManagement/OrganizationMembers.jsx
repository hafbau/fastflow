import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
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
  MoreVert,
  PersonAdd,
  Refresh,
  Search,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import OrganizationMemberInviteDialog from './OrganizationMemberInviteDialog';
import OrganizationMemberEditDialog from './OrganizationMemberEditDialog';
import OrganizationMemberRemoveDialog from './OrganizationMemberRemoveDialog';

/**
 * Organization members component
 * Displays and manages members of an organization
 */
const OrganizationMembers = ({ organizationId, userRole }) => {
  const { getOrganizationMembers } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [actionMenuMemberId, setActionMenuMemberId] = useState(null);

  // Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const membersData = await getOrganizationMembers(organizationId);
        setMembers(membersData);
      } catch (error) {
        console.error('Error fetching members:', error);
        enqueueSnackbar('Failed to load organization members', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) {
      fetchMembers();
    }
  }, [organizationId, getOrganizationMembers, enqueueSnackbar]);

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const membersData = await getOrganizationMembers(organizationId);
      setMembers(membersData);
      enqueueSnackbar('Member list refreshed', { variant: 'success' });
    } catch (error) {
      console.error('Error refreshing members:', error);
      enqueueSnackbar('Failed to refresh members', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
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
  const handleActionMenuOpen = (event, memberId) => {
    setActionMenuAnchorEl(event.currentTarget);
    setActionMenuMemberId(memberId);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
    setActionMenuMemberId(null);
  };

  // Handle member actions
  const handleEditMember = (member) => {
    setSelectedMember(member);
    setEditDialogOpen(true);
    handleActionMenuClose();
  };

  const handleRemoveMember = (member) => {
    setSelectedMember(member);
    setRemoveDialogOpen(true);
    handleActionMenuClose();
  };

  // Filter members
  const filteredMembers = members.filter((member) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        member.firstName?.toLowerCase().includes(query) ||
        member.lastName?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.role?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Paginate members
  const paginatedMembers = filteredMembers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle dialog callbacks
  const handleMemberInvited = (newMember) => {
    setMembers([...members, newMember]);
    setInviteDialogOpen(false);
    enqueueSnackbar('Member invited successfully', { variant: 'success' });
  };

  const handleMemberUpdated = (updatedMember) => {
    setMembers(members.map(member => member.id === updatedMember.id ? updatedMember : member));
    setEditDialogOpen(false);
    enqueueSnackbar('Member updated successfully', { variant: 'success' });
  };

  const handleMemberRemoved = (removedMemberId) => {
    setMembers(members.filter(member => member.id !== removedMemberId));
    setRemoveDialogOpen(false);
    enqueueSnackbar('Member removed successfully', { variant: 'success' });
  };

  if (loading && members.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  const isAdmin = userRole === 'admin';

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Organization Members
        </Typography>
        
        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAdd />}
            onClick={() => setInviteDialogOpen(true)}
          >
            Invite Member
          </Button>
        )}
      </Box>
      
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <TextField
              placeholder="Search members..."
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
                  <TableCell>Joined</TableCell>
                  {isAdmin && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedMembers.length > 0 ? (
                  paginatedMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        {member.firstName} {member.lastName}
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>
                        {member.status === 'active' && 'Active'}
                        {member.status === 'pending' && 'Pending Invitation'}
                      </TableCell>
                      <TableCell>
                        {member.joinedAt 
                          ? new Date(member.joinedAt).toLocaleDateString() 
                          : 'Not joined yet'}
                      </TableCell>
                      {isAdmin && (
                        <TableCell align="right">
                          <IconButton
                            onClick={(event) => handleActionMenuOpen(event, member.id)}
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 6 : 5} align="center">
                      {searchQuery ? 'No members found matching your search' : 'No members found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredMembers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>
      
      {/* Action Menu */}
      {isAdmin && (
        <Menu
          anchorEl={actionMenuAnchorEl}
          open={Boolean(actionMenuAnchorEl)}
          onClose={handleActionMenuClose}
        >
          <MenuItem onClick={() => {
            const member = members.find(m => m.id === actionMenuMemberId);
            handleEditMember(member);
          }}>
            <Edit fontSize="small" sx={{ mr: 1 }} /> Edit Role
          </MenuItem>
          <MenuItem onClick={() => {
            const member = members.find(m => m.id === actionMenuMemberId);
            handleRemoveMember(member);
          }}>
            <Delete fontSize="small" sx={{ mr: 1 }} /> Remove
          </MenuItem>
        </Menu>
      )}
      
      {/* Dialogs */}
      {isAdmin && (
        <>
          <OrganizationMemberInviteDialog
            open={inviteDialogOpen}
            onClose={() => setInviteDialogOpen(false)}
            onMemberInvited={handleMemberInvited}
            organizationId={organizationId}
          />
          
          <OrganizationMemberEditDialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            onMemberUpdated={handleMemberUpdated}
            member={selectedMember}
            organizationId={organizationId}
          />
          
          <OrganizationMemberRemoveDialog
            open={removeDialogOpen}
            onClose={() => setRemoveDialogOpen(false)}
            onMemberRemoved={handleMemberRemoved}
            member={selectedMember}
            organizationId={organizationId}
          />
        </>
      )}
    </Box>
  );
};

OrganizationMembers.propTypes = {
  organizationId: PropTypes.string.isRequired,
  userRole: PropTypes.string.isRequired,
};

export default OrganizationMembers;
