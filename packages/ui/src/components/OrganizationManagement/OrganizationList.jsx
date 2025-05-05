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
  Edit,
  MoreVert,
  Refresh,
  Search,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import OrganizationCreateDialog from './OrganizationCreateDialog';

/**
 * Organization list component
 * Displays a list of organizations the user belongs to
 */
const OrganizationList = () => {
  const { getUserOrganizations } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const orgs = await getUserOrganizations();
        setOrganizations(orgs);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        enqueueSnackbar('Failed to load organizations', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [getUserOrganizations, enqueueSnackbar]);

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const orgs = await getUserOrganizations();
      setOrganizations(orgs);
      enqueueSnackbar('Organization list refreshed', { variant: 'success' });
    } catch (error) {
      console.error('Error refreshing organizations:', error);
      enqueueSnackbar('Failed to refresh organizations', { variant: 'error' });
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

  // Handle organization selection
  const handleOrganizationSelect = (organizationId) => {
    navigate(`/organizations/${organizationId}`);
  };

  // Filter organizations
  const filteredOrganizations = organizations.filter((org) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        org.name?.toLowerCase().includes(query) ||
        org.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Paginate organizations
  const paginatedOrganizations = filteredOrganizations.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle organization creation
  const handleOrganizationCreated = (newOrg) => {
    setOrganizations([...organizations, newOrg]);
    setCreateDialogOpen(false);
    enqueueSnackbar('Organization created successfully', { variant: 'success' });
    navigate(`/organizations/${newOrg.id}`);
  };

  if (loading && organizations.length === 0) {
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
                My Organizations
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Create Organization
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <TextField
                    placeholder="Search organizations..."
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
                        <TableCell>Description</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Members</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedOrganizations.length > 0 ? (
                        paginatedOrganizations.map((org) => (
                          <TableRow 
                            key={org.id} 
                            hover
                            onClick={() => handleOrganizationSelect(org.id)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell>{org.name}</TableCell>
                            <TableCell>{org.description}</TableCell>
                            <TableCell>{org.userRole}</TableCell>
                            <TableCell>{org.memberCount}</TableCell>
                            <TableCell>
                              {new Date(org.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/organizations/${org.id}/settings`);
                                }}
                              >
                                <Edit />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            {searchQuery ? 'No organizations found matching your search' : 'No organizations found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredOrganizations.length}
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
      
      {/* Create Organization Dialog */}
      <OrganizationCreateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onOrganizationCreated={handleOrganizationCreated}
      />
    </Container>
  );
};

export default OrganizationList;
