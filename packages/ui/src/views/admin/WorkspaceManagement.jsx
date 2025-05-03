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

const WorkspaceManagement = () => {
    const theme = useTheme()
    const api = useApi()
    const { confirm } = useConfirm()

    // State for workspaces
    const [workspaces, setWorkspaces] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [total, setTotal] = useState(0)
    const [selectedWorkspace, setSelectedWorkspace] = useState(null)
    const [workspaceUsers, setWorkspaceUsers] = useState([])

    // State for filters
    const [filters, setFilters] = useState({
        search: '',
        organization: 'all'
    })
    const [showFilters, setShowFilters] = useState(false)

    // State for workspace dialog
    const [workspaceDialog, setWorkspaceDialog] = useState({
        open: false,
        mode: 'create', // 'create', 'edit', 'view'
        data: null
    })

    // State for workspace form
    const [workspaceForm, setWorkspaceForm] = useState({
        name: '',
        description: '',
        organization: '',
        isActive: true
    })
    const [formErrors, setFormErrors] = useState({})

    // Options for filters and form
    const organizationOptions = [
        { value: 'all', label: 'All Organizations' },
        { value: 'Acme Corp', label: 'Acme Corp' },
        { value: 'Globex', label: 'Globex' },
        { value: 'Initech', label: 'Initech' },
        { value: 'Umbrella Corp', label: 'Umbrella Corp' },
        { value: 'Stark Industries', label: 'Stark Industries' }
]

    // Fetch workspaces
    const fetchWorkspaces = async () => {
        setLoading(true)
        try {
            // In a real implementation, this would be an API call with filters and pagination
            // For now, we'll simulate the data
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Sample data
            const sampleWorkspaces = [
                {
                    id: '1',
                    name: 'Development',
                    description: 'For development projects',
                    organization: 'Acme Corp',
                    isActive: true,
                    userCount: 15,
                    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '2',
                    name: 'Marketing',
                    description: 'For marketing campaigns',
                    organization: 'Acme Corp',
                    isActive: true,
                    userCount: 8,
                    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '3',
                    name: 'Sales',
                    description: 'For sales activities',
                    organization: 'Globex',
                    isActive: true,
                    userCount: 10,
                    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '4',
                    name: 'HR',
                    description: 'For human resources',
                    organization: 'Globex',
                    isActive: true,
                    userCount: 5,
                    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '5',
                    name: 'Research',
                    description: 'For research and development',
                    organization: 'Initech',
                    isActive: true,
                    userCount: 12,
                    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '6',
                    name: 'Operations',
                    description: 'For operations management',
                    organization: 'Umbrella Corp',
                    isActive: false,
                    userCount: 7,
                    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '7',
                    name: 'Engineering',
                    description: 'For engineering projects',
                    organization: 'Stark Industries',
                    isActive: true,
                    userCount: 9,
                    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
            
            // Apply filters
            let filteredWorkspaces = [...sampleWorkspaces]
            
            if (filters.search) {
                const searchLower = filters.search.toLowerCase()
                filteredWorkspaces = filteredWorkspaces.filter(
                    workspace => 
                        workspace.name.toLowerCase().includes(searchLower) ||
                        workspace.description.toLowerCase().includes(searchLower)
                )
            }
            
            if (filters.organization !== 'all') {
                filteredWorkspaces = filteredWorkspaces.filter(
                    workspace => workspace.organization === filters.organization
                )
            }
            
            setTotal(filteredWorkspaces.length)
            
            // Apply pagination
            const paginatedWorkspaces = filteredWorkspaces.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
            )
            
            setWorkspaces(paginatedWorkspaces)
            
            // If there's a selected workspace, update its data
            if (selectedWorkspace) {
                const updatedWorkspace = filteredWorkspaces.find(workspace => workspace.id === selectedWorkspace.id)
                if (updatedWorkspace) {
                    setSelectedWorkspace(updatedWorkspace)
                }
            }
        } catch (error) {
            console.error('Error fetching workspaces:', error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch workspace users
    const fetchWorkspaceUsers = async (workspaceId) => {
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
                }
            ]
            
            setWorkspaceUsers(sampleUsers)
        } catch (error) {
            console.error('Error fetching workspace users:', error)
        }
    }
    ]
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
            search: '',
            organization: 'all'
        })
        setPage(0)
    }

    // Handle workspace selection
    const handleWorkspaceSelect = async (workspace) => {
        setSelectedWorkspace(workspace)
        await fetchWorkspaceUsers(workspace.id)
    }

    // Handle open workspace dialog
    const handleOpenWorkspaceDialog = (mode, workspaceData = null) => {
        if (mode === 'create') {
            setWorkspaceForm({
                name: '',
                description: '',
                organization: '',
                isActive: true
            })
        } else if (workspaceData) {
            setWorkspaceForm({
                name: workspaceData.name,
                description: workspaceData.description,
                organization: workspaceData.organization,
                isActive: workspaceData.isActive
            })
        }
        
        setWorkspaceDialog({
            open: true,
            mode,
            data: workspaceData
        })
        
        setFormErrors({})
    }

    // Handle close workspace dialog
    const handleCloseWorkspaceDialog = () => {
        setWorkspaceDialog({
            open: false,
            mode: 'create',
            data: null
        })
    }

    // Handle form change
    const handleFormChange = (field, value) => {
        setWorkspaceForm(prev => ({ ...prev, [field]: value }))
        
        // Clear error for the field
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    // Validate form
    const validateForm = () => {
        const errors = {}
        
        if (!workspaceForm.name) {
            errors.name = 'Workspace name is required'
        }
        
        if (!workspaceForm.description) {
            errors.description = 'Description is required'
        }
        
        if (!workspaceForm.organization) {
            errors.organization = 'Organization is required'
        }
        
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Handle save workspace
    const handleSaveWorkspace = async () => {
        if (!validateForm()) {
            return
        }
        
        setLoading(true)
        try {
            // In a real implementation, this would be an API call to create or update the workspace
            // For now, we'll simulate the operation
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Refresh the workspaces list
            await fetchWorkspaces()
            
            // Close the dialog
            handleCloseWorkspaceDialog()
        } catch (error) {
            console.error('Error saving workspace:', error)
        } finally {
            setLoading(false)
        }
    }

    // Handle delete workspace
    const handleDeleteWorkspace = async (workspaceId) => {
        const result = await confirm({
            title: 'Delete Workspace',
            message: 'Are you sure you want to delete this workspace? This action cannot be undone and will remove all user associations.',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        })
        
        if (!result) {
            return
        }
        
        setLoading(true)
        try {
            // In a real implementation, this would be an API call to delete the workspace
            // For now, we'll simulate the operation
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // If the deleted workspace was selected, clear the selection
            if (selectedWorkspace && selectedWorkspace.id === workspaceId) {
                setSelectedWorkspace(null)
                setWorkspaceUsers([])
            }
            
            // Refresh the workspaces list
            await fetchWorkspaces()
        } catch (error) {
            console.error('Error deleting workspace:', error)
        } finally {
            setLoading(false)
        }
    }

    // Handle toggle workspace status
    const handleToggleWorkspaceStatus = async (workspaceId, currentStatus) => {
        const action = currentStatus ? 'deactivate' : 'activate'
        const result = await confirm({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Workspace`,
            message: `Are you sure you want to ${action} this workspace?`,
            confirmText: action.charAt(0).toUpperCase() + action.slice(1),
            cancelText: 'Cancel'
        })
        
        if (!result) {
            return
        }
        
        setLoading(true)
        try {
            // In a real implementation, this would be an API call to update the workspace status
            // For now, we'll simulate the operation
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Refresh the workspaces list
            await fetchWorkspaces()
        } catch (error) {
            console.error(`Error ${action}ing workspace:`, error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch workspaces on component mount and when filters or pagination changes
    useEffect(() => {
        fetchWorkspaces()
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
                                    label="Search Workspaces"
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
                                <FormControl fullWidth size="small">
                                    <InputLabel>Organization</InputLabel>
                                    <Select
                                        value={filters.organization}
                                        onChange={(e) => handleFilterChange('organization', e.target.value)}
                                        label="Organization"
                                    >
                                        {organizationOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2} lg={2}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={handleResetFilters}
                                    fullWidth
                                    disabled={filters.search === '' && filters.organization === 'all'}
                                >
                                    Reset
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3} lg={4}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleOpenWorkspaceDialog('create')}
                                    fullWidth
                                >
                                    Add Workspace
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
                            Workspaces
                        </Typography>
                        <TableContainer sx={{ maxHeight: '600px', overflow: 'auto' }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Organization</TableCell>
                                        <TableCell>Users</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading && workspaces.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                Loading...
                                            </TableCell>
                                        </TableRow>
                                    ) : workspaces.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                No workspaces found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        workspaces.map((workspace) => (
                                            <TableRow 
                                                key={workspace.id} 
                                                hover
                                                selected={selectedWorkspace && selectedWorkspace.id === workspace.id}
                                                onClick={() => handleWorkspaceSelect(workspace)}
                                                sx={{ cursor: 'pointer' }}
                                            >
                                                <TableCell>
                                                    <Typography variant="subtitle2">{workspace.name}</Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {workspace.description}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{workspace.organization}</TableCell>
                                                <TableCell>{workspace.userCount}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={workspace.isActive ? 'Active' : 'Inactive'}
                                                        color={workspace.isActive ? 'success' : 'default'}
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
                                                                    handleOpenWorkspaceDialog('edit', workspace)
                                                                }}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title={workspace.isActive ? 'Deactivate' : 'Activate'}>
                                                            <IconButton
                                                                color={workspace.isActive ? 'error' : 'success'}
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleToggleWorkspaceStatus(workspace.id, workspace.isActive)
                                                                }}
                                                            >
                                                                {workspace.isActive ? (
                                                                    <WorkspacesIcon fontSize="small" />
                                                                ) : (
                                                                    <WorkspacesIcon fontSize="small" />
                                                                )}
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <IconButton
                                                                color="error"
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleDeleteWorkspace(workspace.id)
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
                        {selectedWorkspace ? (
                            <>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h4">
                                        {selectedWorkspace.name}
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<EditIcon />}
                                        onClick={() => handleOpenWorkspaceDialog('edit', selectedWorkspace)}
                                    >
                                        Edit
                                    </Button>
                                </Box>
                                <Grid container spacing={2} mb={3}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">Description</Typography>
                                        <Typography variant="body2">{selectedWorkspace.description}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">Organization</Typography>
                                        <Typography variant="body2">{selectedWorkspace.organization}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">Status</Typography>
                                        <Chip
                                            label={selectedWorkspace.isActive ? 'Active' : 'Inactive'}
                                            color={selectedWorkspace.isActive ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">Created At</Typography>
                                        <Typography variant="body2">{formatDate(selectedWorkspace.createdAt)}</Typography>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 2 }} />

                                <Box>
                                    <Typography variant="h5" gutterBottom display="flex" alignItems="center">
                                        <PeopleIcon sx={{ mr: 1 }} />
                                        Users ({workspaceUsers.length})
                                    </Typography>
                                    {workspaceUsers.length === 0 ? (
                                        <Typography variant="body2" color="textSecondary">
                                            No users in this workspace
                                        </Typography>
                                    ) : (
                                        <TableContainer component={Paper} sx={{ maxHeight: '300px', overflow: 'auto' }}>
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
                                                    {workspaceUsers.map((user) => (
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
                            </>
                        ) : (
                            <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column" p={4}>
                                <WorkspacesIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, mb: 2 }} />
                                <Typography variant="h6" color="textSecondary">
                                    Select a workspace to view details
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>

            {/* Workspace Dialog */}
            <Dialog
                open={workspaceDialog.open}
                onClose={handleCloseWorkspaceDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {workspaceDialog.mode === 'create'
                        ? 'Add New Workspace'
                        : workspaceDialog.mode === 'edit'
                        ? 'Edit Workspace'
                        : 'Workspace Details'}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Workspace Name"
                                value={workspaceForm.name}
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
                                value={workspaceForm.description}
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
                            <FormControl fullWidth margin="normal" error={!!formErrors.organization}>
                                <InputLabel>Organization</InputLabel>
                                <Select
                                    value={workspaceForm.organization}
                                    onChange={(e) => handleFormChange('organization', e.target.value)}
                                    label="Organization"
                                    required
                                >
                                    {organizationOptions
                                        .filter(option => option.value !== 'all')
                                        .map((option) => (
                                            <MenuItem key={option.value} value={option.label}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                </Select>
                                {formErrors.organization && (
                                    <Typography color="error" variant="caption">
                                        {formErrors.organization}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={workspaceForm.isActive}
                                        onChange={(e) => handleFormChange('isActive', e.target.checked)}
                                    />
                                }
                                label="Active"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseWorkspaceDialog}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveWorkspace}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}

export default WorkspaceManagement