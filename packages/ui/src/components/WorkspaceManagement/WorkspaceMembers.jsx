import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
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
  PersonAdd,
  Search,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import WorkspaceMemberInviteDialog from './WorkspaceMemberInviteDialog';
import WorkspaceMemberEditDialog from './WorkspaceMemberEditDialog';
import WorkspaceMemberRemoveDialog from './WorkspaceMemberRemoveDialog';

/**
 * Workspace members component
 * Displays and manages workspace members
 */
const WorkspaceMembers = ({ organizationId, workspaceId, userRole }) => {
  const { getWorkspaceMembers } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Fetch workspace members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const membersData = await getWorkspaceMembers(organizationId, workspaceId);
        setMembers(membersData);
      } catch (error) {
        console.error('Error fetching workspace members:', error);
        enqueueSnackbar('Failed to load workspace members', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (organizationId && workspaceId) {
      fetchMembers();
    }
  }, [organizationId, workspaceId, getWorkspaceMembers, enqueueSnackbar]);

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

  // Filter members
  const filteredMembers = members.filter((member) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        member.fullName?.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Pagination
  const paginatedMembers = filteredMembers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle member invite
  const handleMemberInvited = (newMember) => {
    setMembers([...members, newMember]);
    setInviteDialogOpen(false);
    enqueueSnackbar('Member invited successfully', { variant: 'success' });
  };

  // Handle member edit
  const handleEditClick = (member) => {
    setSelectedMember(member);
    setEditDialogOpen(true);
  };

  // Handle member update
  const handleMemberUpdated = (updatedMember) => {
    setMembers(
      members.map((member) =>
        member.id === updatedMember.id ? updatedMember : member
      )
    );
    setEditDialogOpen(false);
    setSelectedMember(null);
    enqueueSnackbar('Member role updated successfully', { variant: 'success' });
  };

  // Handle member remove
  const handleRemoveClick = (member) => {
    setSelectedMember(member);
    setRemoveDialogOpen(true);
  };

  // Handle member removed
  const handleMemberRemoved = (memberId) => {
    setMembers(members.filter((member) => member.id !== memberId));
    setRemoveDialogOpen(false);
    setSelectedMember(null);
    enqueueSnackbar('Member removed successfully', { variant: 'success' });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Workspace Members</Typography>
        
        {userRole === 'admin' && (
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
      
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Search members..."
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <Search color="action" sx={{ mr: 1 }} />,
          }}
        />
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : members.length > 0 ? (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Joined</TableCell>
                  {userRole === 'admin' && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          src={member.avatarUrl}
                          alt={member.fullName}
                          sx={{ mr: 2 }}
                        >
                          {member.fullName ? member.fullName.charAt(0) : member.email.charAt(0)}
                        </Avatar>
                        <Typography variant="body1">
                          {member.fullName || 'Unnamed User'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={member.role}
                        color={member.role === 'admin' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {member.joinedAt
                        ? new Date(member.joinedAt).toLocaleDateString()
                        : 'Pending'}
                    </TableCell>
                    {userRole === 'admin' && (
                      <TableCell align="right">
                        <Tooltip title="Edit Role">
                          <IconButton
                            onClick={() => handleEditClick(member)}
                            size="small"
                            color="primary"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove Member">
                          <IconButton
                            onClick={() => handleRemoveClick(member)}
                            size="small"
                            color="error"
                            disabled={member.id === member.currentUserId}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
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
        </Paper>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No members found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {searchQuery
              ? 'No members match your search criteria'
              : 'This workspace has no members yet'}
          </Typography>
          {!searchQuery && userRole === 'admin' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => setInviteDialogOpen(true)}
            >
              Invite Member
            </Button>
          )}
        </Paper>
      )}
      
      {/* Invite dialog */}
      <WorkspaceMemberInviteDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        onMemberInvited={handleMemberInvited}
        organizationId={organizationId}
        workspaceId={workspaceId}
      />
      
      {/* Edit dialog */}
      {selectedMember && (
        <WorkspaceMemberEditDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedMember(null);
          }}
          onMemberUpdated={handleMemberUpdated}
          organizationId={organizationId}
          workspaceId={workspaceId}
          member={selectedMember}
        />
      )}
      
      {/* Remove dialog */}
      {selectedMember && (
        <WorkspaceMemberRemoveDialog
          open={removeDialogOpen}
          onClose={() => {
            setRemoveDialogOpen(false);
            setSelectedMember(null);
          }}
          onMemberRemoved={handleMemberRemoved}
          organizationId={organizationId}
          workspaceId={workspaceId}
          member={selectedMember}
        />
      )}
    </Box>
  );
};

WorkspaceMembers.propTypes = {
  organizationId: PropTypes.string.isRequired,
  workspaceId: PropTypes.string.isRequired,
  userRole: PropTypes.string.isRequired,
};

export default WorkspaceMembers;
