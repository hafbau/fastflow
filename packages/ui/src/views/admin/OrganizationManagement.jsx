import React, { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
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
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Switch,
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
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction
} from '@mui/material'
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    FilterList as FilterListIcon,
    Refresh as RefreshIcon,
    Search as SearchIcon,
    Business as BusinessIcon,
    People as PeopleIcon,
    Workspaces as WorkspacesIcon
} from '@mui/icons-material'
import useApi from 'hooks/useApi'
import useConfirm from 'hooks/useConfirm'
import { gridSpacing } from 'store/constant'

const OrganizationManagement = () => {
    const theme = useTheme()
    const api = useApi()
    const { confirm } = useConfirm()

    // State for organizations
    const [organizations, setOrganizations] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [total, setTotal] = useState(0)
    const [selectedOrganization, setSelectedOrganization] = useState(null)
    const [organizationUsers, setOrganizationUsers] = useState([])
    const [organizationWorkspaces, setOrganizationWorkspaces] = useState([])

    // State for filters
    const [filters, setFilters] = useState({
        search: ''
    })
    const [showFilters, setShowFilters] = useState(false)

    // State for organization dialog
    const [organizationDialog, setOrganizationDialog] = useState({
        open: false,
        mode: 'create', // 'create', 'edit', 'view'
        data: null
    })

    // State for organization form
    const [organizationForm, setOrganizationForm] = useState({
        name: '',
        description: '',
        website: '',
        isActive: true
    })
// Fetch organizations
    const fetchOrganizations = async () => {
        setLoading(true)
        try {
            // In a real implementation, this would be an API call with filters and pagination
            // For now, we'll simulate the data
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Sample data
            const sampleOrganizations = [
                {
                    id: '1',
                    name: 'Acme Corp',
                    description: 'Leading provider of everything',
                    website: 'https://acme.example.com',
                    isActive: true,
                    userCount: 35,
                    workspaceCount: 12,
                    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '2',
                    name: 'Globex',
                    description: 'Global excellence in technology',
                    website: 'https://globex.example.com',
                    isActive: true,
                    userCount: 28,
                    workspaceCount: 8,
                    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '3',
                    name: 'Initech',
                    description: 'Innovative technology solutions',
                    website: 'https://initech.example.com',
                    isActive: true,
                    userCount: 22,
                    workspaceCount: 6,
                    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '4',
                    name: 'Umbrella Corp',
                    description: 'Protecting your future',
                    website: 'https://umbrella.example.com',
                    isActive: false,
                    userCount: 18,
                    workspaceCount: 5,
                    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '5',
                    name: 'Stark Industries',
                    description: 'Building a better tomorrow',
                    website: 'https://stark.example.com',
                    isActive: true,
                    userCount: 12,
                    workspaceCount: 4,
                    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
            
            // Apply filters
            let filteredOrganizations = [...sampleOrganizations]
            
            if (filters.search) {
                const searchLower = filters.search.toLowerCase()
                filteredOrganizations = filteredOrganizations.filter(
                    org => 
                        org.name.toLowerCase().includes(searchLower) ||
                        org.description.toLowerCase().includes(searchLower)
                )
            }
            
            setTotal(filteredOrganizations.length)
            
            // Apply pagination
            const paginatedOrganizations = filteredOrganizations.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
            )
            
            setOrganizations(paginatedOrganizations)
            
            // If there's a selected organization, update its data
            if (selectedOrganization) {
                const updatedOrg = filteredOrganizations.find(org => org.id === selectedOrganization.id)
                if (updatedOrg) {
                    setSelectedOrganization(updatedOrg)
                }
            }
        } catch (error) {
            console.error('Error fetching organizations:', error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch organization users
    const fetchOrganizationUsers = async (organizationId) => {
        try {
            // In a real implementation, this would be an API call
            // For now, we'll simulate the data
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Sample data
            const sampleUsers = [
                {
                    id: '1',
                    email: 'john.doe@example.com',
                    fullName: 'John Doe',
                    role: 'Admin',
                    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '2',
                    email: 'jane.smith@example.com',
                    fullName: 'Jane Smith',
                    role: 'Member',
                    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '3',
                    email: 'bob.johnson@example.com',
                    fullName: 'Bob Johnson',
                    role: 'Member',
                    lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '4',
                    email: 'alice.williams@example.com',
                    fullName: 'Alice Williams',
                    role: 'Viewer',
                    lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '5',
                    email: 'charlie.brown@example.com',
                    fullName: 'Charlie Brown',
                    role: 'Member',
                    lastLogin: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
            
            setOrganizationUsers(sampleUsers)
        } catch (error) {
            console.error('Error fetching organization users:', error)
        }
    }

    // Fetch organization workspaces
    const fetchOrganizationWorkspaces = async (organizationId) => {
        try {
            // In a real implementation, this would be an API call
            // For now, we'll simulate the data
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Sample data
            const sampleWorkspaces = [
                {
                    id: '1',
                    name: 'Development',
                    description: 'For development projects',
                    userCount: 15,
                    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '2',
                    name: 'Marketing',
                    description: 'For marketing campaigns',
                    userCount: 8,
                    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '3',
                    name: 'Sales',
                    description: 'For sales activities',
                    userCount: 10,
                    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '4',
                    name: 'HR',
                    description: 'For human resources',
                    userCount: 5,
                    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
            
            setOrganizationWorkspaces(sampleWorkspaces)
        } catch (error) {
            console.error('Error fetching organization workspaces:', error)
        }
    }
    const [formErrors, setFormErrors] = useState({})
// Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    }

    // Format relative time
    const formatRelativeTime = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        
        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
        
        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
        
        const diffDays = Math.floor(diffHours / 24)
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    }

    // Handle filter change
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }))
    }

    // Handle page change
    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    // Handle rows per page change
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    // Handle reset filters
    const handleResetFilters = () => {
        setFilters({
            search: ''
        })
        setPage(0)
    }

    // Handle organization selection
    const handleOrganizationSelect = async (organization) => {
        setSelectedOrganization(organization)
        await Promise.all([
            fetchOrganizationUsers(organization.id),
            fetchOrganizationWorkspaces(organization.id)
        ])
    }

    // Handle open organization dialog
    const handleOpenOrganizationDialog = (mode, organizationData = null) => {
        if (mode === 'create') {
            setOrganizationForm({
                name: '',
                description: '',
                website: '',
                isActive: true
            })
        } else if (organizationData) {
            setOrganizationForm({
                name: organizationData.name,
                description: organizationData.description,
                website: organizationData.website,
                isActive: organizationData.isActive
            })
        }
        
        setOrganizationDialog({
            open: true,
            mode,
            data: organizationData
        })
        
        setFormErrors({})
    }

    // Handle close organization dialog
    const handleCloseOrganizationDialog = () => {
        setOrganizationDialog({
            open: false,
            mode: 'create',
            data: null
        })
    }

    // Handle form change
    const handleFormChange = (field, value) => {
        setOrganizationForm(prev => ({ ...prev, [field]: value }))
        
        // Clear error for the field
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    // Validate form
    const validateForm = () => {
        const errors = {}
        
        if (!organizationForm.name) {
            errors.name = 'Organization name is required'
        }
        
        if (!organizationForm.description) {
            errors.description = 'Description is required'
        }
        
        if (organizationForm.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(organizationForm.website)) {
            errors.website = 'Website URL is invalid'
        }
        
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Handle save organization
    const handleSaveOrganization = async () => {
        if (!validateForm()) {
            return
        }
        
        setLoading(true)
        try {
            // In a real implementation, this would be an API call to create or update the organization
            // For now, we'll simulate the operation
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Refresh the organizations list
            await fetchOrganizations()
            
            // Close the dialog
            handleCloseOrganizationDialog()
        } catch (error) {
            console.error('Error saving organization:', error)
        } finally {
            setLoading(false)
        }
    }

    // Handle delete organization
    const handleDeleteOrganization = async (organizationId) => {
        const result = await confirm({
            title: 'Delete Organization',
            message: 'Are you sure you want to delete this organization? This action cannot be undone and will remove all associated workspaces and user associations.',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        })
        
        if (!result) {
            return
        }
        
        setLoading(true)
        try {
            // In a real implementation, this would be an API call to delete the organization
            // For now, we'll simulate the operation
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // If the deleted organization was selected, clear the selection
            if (selectedOrganization && selectedOrganization.id === organizationId) {
                setSelectedOrganization(null)
                setOrganizationUsers([])
                setOrganizationWorkspaces([])
            }
            
            // Refresh the organizations list
            await fetchOrganizations()
        } catch (error) {
            console.error('Error deleting organization:', error)
        } finally {
            setLoading(false)
        }
    }

    // Handle toggle organization status
    const handleToggleOrganizationStatus = async (organizationId, currentStatus) => {
        const action = currentStatus ? 'deactivate' : 'activate'
        const result = await confirm({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Organization`,
            message: `Are you sure you want to ${action} this organization?`,
            confirmText: action.charAt(0).toUpperCase() + action.slice(1),
            cancelText: 'Cancel'
        })
        
        if (!result) {
            return
        }
        
        setLoading(true)
        try {
            // In a real implementation, this would be an API call to update the organization status
            // For now, we'll simulate the operation
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Refresh the organizations list
            await fetchOrganizations()
        } catch (error) {
            console.error(`Error ${action}ing organization:`, error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch organizations on component mount and when filters or pagination changes
    useEffect(() => {
        fetchOrganizations()
    }, [page, rowsPerPage, filters])
return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <TextField
                                    fullWidth
                                    label="Search Organizations"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3} lg={3}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={handleResetFilters}
                                    fullWidth
                                    disabled={filters.search === ''}
                                >
                                    Reset Filters
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3} lg={3}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<RefreshIcon />}
                                    onClick={fetchOrganizations}
                                    fullWidth
                                    disabled={loading}
                                >
                                    Refresh
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3} lg={3}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleOpenOrganizationDialog('create')}
                                    fullWidth
                                >
                                    Add Organization
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="h4" gutterBottom>
                            Organizations
                        </Typography>
                        <TableContainer sx={{ maxHeight: '600px', overflow: 'auto' }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Users</TableCell>
                                        <TableCell>Workspaces</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading && organizations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                Loading...
                                            </TableCell>
                                        </TableRow>
                                    ) : organizations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                No organizations found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        organizations.map((organization) => (
                                            <TableRow 
                                                key={organization.id} 
                                                hover
                                                selected={selectedOrganization && selectedOrganization.id === organization.id}
                                                onClick={() => handleOrganizationSelect(organization)}
                                                sx={{ cursor: 'pointer' }}
                                            >
                                                <TableCell>
                                                    <Typography variant="subtitle2">{organization.name}</Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {organization.description}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{organization.userCount}</TableCell>
                                                <TableCell>{organization.workspaceCount}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={organization.isActive ? 'Active' : 'Inactive'}
                                                        color={organization.isActive ? 'success' : 'default'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                        <Tooltip title="Edit">
                                                            <IconButton
                                                                color="primary"
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleOpenOrganizationDialog('edit', organization)
                                                                }}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title={organization.isActive ? 'Deactivate' : 'Activate'}>
                                                            <IconButton
                                                                color={organization.isActive ? 'error' : 'success'}
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleToggleOrganizationStatus(organization.id, organization.isActive)
                                                                }}
                                                            >
                                                                {organization.isActive ? (
                                                                    <BusinessIcon fontSize="small" />
                                                                ) : (
                                                                    <BusinessIcon fontSize="small" />
                                                                )}
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <IconButton
                                                                color="error"
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleDeleteOrganization(organization.id)
                                                                }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={total}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        {selectedOrganization ? (
                            <>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h4">
                                        {selectedOrganization.name}
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<EditIcon />}
                                        onClick={() => handleOpenOrganizationDialog('edit', selectedOrganization)}
                                    >
                                        Edit
                                    </Button>
                                </Box>
                                <Grid container spacing={2} mb={3}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">Description</Typography>
                                        <Typography variant="body2">{selectedOrganization.description}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">Website</Typography>
                                        <Typography variant="body2">
                                            {selectedOrganization.website ? (
                                                <a href={selectedOrganization.website} target="_blank" rel="noopener noreferrer">
                                                    {selectedOrganization.website}
                                                </a>
                                            ) : (
                                                'N/A'
                                            )}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">Status</Typography>
                                        <Chip
                                            label={selectedOrganization.isActive ? 'Active' : 'Inactive'}
                                            color={selectedOrganization.isActive ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">Created At</Typography>
                                        <Typography variant="body2">{formatDate(selectedOrganization.createdAt)}</Typography>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 2 }} />

                                <Box mb={3}>
                                    <Typography variant="h5" gutterBottom display="flex" alignItems="center">
                                        <PeopleIcon sx={{ mr: 1 }} />
                                        Users ({organizationUsers.length})
                                    </Typography>
                                    {organizationUsers.length === 0 ? (
                                        <Typography variant="body2" color="textSecondary">
                                            No users in this organization
                                        </Typography>
                                    ) : (
                                        <TableContainer component={Paper} sx={{ maxHeight: '200px', overflow: 'auto' }}>
                                            <Table size="small" stickyHeader>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Name</TableCell>
                                                        <TableCell>Email</TableCell>
                                                        <TableCell>Role</TableCell>
                                                        <TableCell>Last Login</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {organizationUsers.map((user) => (
                                                        <TableRow key={user.id} hover>
                                                            <TableCell>{user.fullName}</TableCell>
                                                            <TableCell>{user.email}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={user.role}
                                                                    color={
                                                                        user.role === 'Admin'
                                                                            ? 'error'
                                                                            : user.role === 'Member'
                                                                            ? 'primary'
                                                                            : 'default'
                                                                    }
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Tooltip title={formatDate(user.lastLogin)}>
                                                                    <span>{formatRelativeTime(user.lastLogin)}</span>
                                                                </Tooltip>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box>
                                    <Typography variant="h5" gutterBottom display="flex" alignItems="center">
                                        <WorkspacesIcon sx={{ mr: 1 }} />
                                        Workspaces ({organizationWorkspaces.length})
                                    </Typography>
                                    {organizationWorkspaces.length === 0 ? (
                                        <Typography variant="body2" color="textSecondary">
                                            No workspaces in this organization
                                        </Typography>
                                    ) : (
                                        <TableContainer component={Paper} sx={{ maxHeight: '200px', overflow: 'auto' }}>
                                            <Table size="small" stickyHeader>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Name</TableCell>
                                                        <TableCell>Description</TableCell>
                                                        <TableCell>Users</TableCell>
                                                        <TableCell>Created</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {organizationWorkspaces.map((workspace) => (
                                                        <TableRow key={workspace.id} hover>
                                                            <TableCell>{workspace.name}</TableCell>
                                                            <TableCell>{workspace.description}</TableCell>
                                                            <TableCell>{workspace.userCount}</TableCell>
                                                            <TableCell>
                                                                <Tooltip title={formatDate(workspace.createdAt)}>
                                                                    <span>{formatRelativeTime(workspace.createdAt)}</span>
                                                                </Tooltip>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                </Box>
                            </>
                        ) : (
                            <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column" p={4}>
                                <BusinessIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, mb: 2 }} />
                                <Typography variant="h6" color="textSecondary">
                                    Select an organization to view details
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>

            {/* Organization Dialog */}
            <Dialog
                open={organizationDialog.open}
                onClose={handleCloseOrganizationDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {organizationDialog.mode === 'create'
                        ? 'Add New Organization'
                        : organizationDialog.mode === 'edit'
                        ? 'Edit Organization'
                        : 'Organization Details'}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Organization Name"
                                value={organizationForm.name}
                                onChange={(e) => handleFormChange('name', e.target.value)}
                                error={!!formErrors.name}
                                helperText={formErrors.name}
                                required
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                value={organizationForm.description}
                                onChange={(e) => handleFormChange('description', e.target.value)}
                                error={!!formErrors.description}
                                helperText={formErrors.description}
                                required
                                margin="normal"
                                multiline
                                rows={3}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Website"
                                value={organizationForm.website}
                                onChange={(e) => handleFormChange('website', e.target.value)}
                                error={!!formErrors.website}
                                helperText={formErrors.website}
                                margin="normal"
                                placeholder="https://example.com"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={organizationForm.isActive}
                                        onChange={(e) => handleFormChange('isActive', e.target.checked)}
                                    />
                                }
                                label="Active"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseOrganizationDialog}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveOrganization}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}

export default OrganizationManagement