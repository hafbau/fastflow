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
    Tab,
    Tabs
} from '@mui/material'
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    FilterList as FilterListIcon,
    Refresh as RefreshIcon,
    Search as SearchIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Business as BusinessIcon,
    Workspaces as WorkspacesIcon,
    Security as SecurityIcon,
    Settings as SettingsIcon,
    VpnKey as VpnKeyIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    Login as LoginIcon,
    Logout as LogoutIcon
} from '@mui/icons-material'
import useApi from '@/hooks/useApi'
import useConfirm from '@/hooks/useConfirm'
import { gridSpacing } from 'store/constant'

const UserManagement = () => {
    const theme = useTheme()
    const api = useApi()
    const { confirm } = useConfirm()

    // State for users
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [total, setTotal] = useState(0)
    const [selectedUser, setSelectedUser] = useState(null)
    const [userOrganizations, setUserOrganizations] = useState([])
    const [userWorkspaces, setUserWorkspaces] = useState([])
    const [userRoles, setUserRoles] = useState([])
    const [userPermissions, setUserPermissions] = useState([])
    const [userActivityLogs, setUserActivityLogs] = useState([])

    // State for filters
    const [filters, setFilters] = useState({
        search: '',
        role: 'all',
        status: 'all',
        organization: 'all'
    })

    // State for user dialog
    const [userDialog, setUserDialog] = useState({
        open: false,
        mode: 'create', // 'create', 'edit', 'view'
        data: null
    })

    // State for user form
    const [userForm, setUserForm] = useState({
        email: '',
        fullName: '',
        role: '',
        organization: '',
        isActive: true,
        isMfaEnabled: false
    })
    const [formErrors, setFormErrors] = useState({})

    // State for detail tabs
    const [detailTab, setDetailTab] = useState(0)

    // Options for filters and form
    const roleOptions = [
        { value: 'all', label: 'All Roles' },
        { value: 'Admin', label: 'Admin' },
        { value: 'Member', label: 'Member' },
        { value: 'Viewer', label: 'Viewer' }
    ]

    const statusOptions = [
        { value: 'all', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
    ]

    const organizationOptions = [
        { value: 'all', label: 'All Organizations' },
        { value: 'Acme Corp', label: 'Acme Corp' },
        { value: 'Globex', label: 'Globex' },
        { value: 'Initech', label: 'Initech' },
        { value: 'Umbrella Corp', label: 'Umbrella Corp' },
        { value: 'Stark Industries', label: 'Stark Industries' }
    ]

    // Fetch users
    const fetchUsers = async () => {
        setLoading(true)
        try {
            // In a real implementation, this would be an API call with filters and pagination
            // For now, we'll simulate the data
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Sample data
            const sampleUsers = [
                {
                    id: '1',
                    email: 'admin@example.com',
                    fullName: 'Admin User',
                    role: 'Admin',
                    organization: 'Acme Corp',
                    isActive: true,
                    isMfaEnabled: true,
                    lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '2',
                    email: 'john.doe@example.com',
                    fullName: 'John Doe',
                    role: 'Member',
                    organization: 'Acme Corp',
                    isActive: true,
                    isMfaEnabled: false,
                    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '3',
                    email: 'jane.smith@example.com',
                    fullName: 'Jane Smith',
                    role: 'Member',
                    organization: 'Acme Corp',
                    isActive: true,
                    isMfaEnabled: true,
                    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '4',
                    email: 'bob.johnson@example.com',
                    fullName: 'Bob Johnson',
                    role: 'Viewer',
                    organization: 'Globex',
                    isActive: true,
                    isMfaEnabled: false,
                    lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '5',
                    email: 'alice.williams@example.com',
                    fullName: 'Alice Williams',
                    role: 'Member',
                    organization: 'Initech',
                    isActive: true,
                    isMfaEnabled: false,
                    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '6',
                    email: 'charlie.brown@example.com',
                    fullName: 'Charlie Brown',
                    role: 'Admin',
                    organization: 'Stark Industries',
                    isActive: false,
                    isMfaEnabled: false,
                    lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
            
            // Apply filters
            let filteredUsers = [...sampleUsers]
            
            if (filters.search) {
                const searchLower = filters.search.toLowerCase()
                filteredUsers = filteredUsers.filter(
                    user => 
                        user.email.toLowerCase().includes(searchLower) ||
                        user.fullName.toLowerCase().includes(searchLower)
                )
            }
            
            if (filters.role !== 'all') {
                filteredUsers = filteredUsers.filter(user => user.role === filters.role)
            }
            
            if (filters.status !== 'all') {
                const isActive = filters.status === 'active'
                filteredUsers = filteredUsers.filter(user => user.isActive === isActive)
            }
            
            if (filters.organization !== 'all') {
                filteredUsers = filteredUsers.filter(user => user.organization === filters.organization)
            }
            
            setTotal(filteredUsers.length)
            
            // Apply pagination
            const paginatedUsers = filteredUsers.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
            )
            
            setUsers(paginatedUsers)
            
            // If there's a selected user, update its data
            if (selectedUser) {
                const updatedUser = filteredUsers.find(user => user.id === selectedUser.id)
                if (updatedUser) {
                    setSelectedUser(updatedUser)
                }
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch user details
    const fetchUserDetails = async (userId) => {
        try {
            // In a real implementation, these would be API calls
            // For now, we'll simulate the data
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Sample organizations for the user
            const sampleUserOrganizations = [
                {
                    id: '1',
                    name: 'Acme Corp',
                    role: 'Admin',
                    joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '2',
                    name: 'Globex',
                    role: 'Member',
                    joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
            
            // Sample workspaces for the user
            const sampleUserWorkspaces = [
                {
                    id: '1',
                    name: 'Development',
                    organization: 'Acme Corp',
                    role: 'Admin',
                    joinedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '2',
                    name: 'Marketing',
                    organization: 'Acme Corp',
                    role: 'Member',
                    joinedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '3',
                    name: 'Research',
                    organization: 'Globex',
                    role: 'Member',
                    joinedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
            
            // Sample roles for the user
            const sampleUserRoles = [
                {
                    id: '1',
                    name: 'Admin',
                    scope: 'System',
                    assignedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '2',
                    name: 'Organization Admin',
                    scope: 'Acme Corp',
                    assignedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
            
            // Sample permissions for the user
            const sampleUserPermissions = [
                {
                    id: '1',
                    name: 'user:read',
                    description: 'Can view user details',
                    source: 'Admin Role'
                },
                {
                    id: '2',
                    name: 'user:write',
                    description: 'Can create and update users',
                    source: 'Admin Role'
                },
                {
                    id: '3',
                    name: 'organization:read',
                    description: 'Can view organization details',
                    source: 'Organization Admin Role'
                },
                {
                    id: '4',
                    name: 'organization:write',
                    description: 'Can create and update organizations',
                    source: 'Organization Admin Role'
                }
            ]
            
            // Sample activity logs for the user
            const sampleUserActivityLogs = [
                {
                    id: '1',
                    action: 'login',
                    details: 'Successful login',
                    ipAddress: '192.168.1.1',
                    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
                },
                {
                    id: '2',
                    action: 'user_update',
                    details: 'Updated profile information',
                    ipAddress: '192.168.1.1',
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '3',
                    action: 'workspace_create',
                    details: 'Created workspace "Marketing"',
                    ipAddress: '192.168.1.1',
                    timestamp: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
            
            setUserOrganizations(sampleUserOrganizations)
            setUserWorkspaces(sampleUserWorkspaces)
            setUserRoles(sampleUserRoles)
            setUserPermissions(sampleUserPermissions)
            setUserActivityLogs(sampleUserActivityLogs)
        } catch (error) {
            console.error('Error fetching user details:', error)
        }
    }

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

    // Get icon for action
    const getActionIcon = (action) => {
        switch (action) {
            case 'login':
                return <LoginIcon fontSize="small" />
            case 'logout':
                return <LogoutIcon fontSize="small" />
            case 'user_create':
                return <AddIcon fontSize="small" />
            case 'user_update':
                return <EditIcon fontSize="small" />
            case 'user_delete':
                return <DeleteIcon fontSize="small" />
            case 'organization_create':
                return <AddIcon fontSize="small" />
            case 'workspace_create':
                return <AddIcon fontSize="small" />
            default:
                return <PersonIcon fontSize="small" />
        }
    }

    // Get color for action
    const getActionColor = (action) => {
        if (action.includes('create')) return 'success'
        if (action.includes('update')) return 'primary'
        if (action.includes('delete')) return 'error'
        if (action === 'login') return 'success'
        if (action === 'logout') return 'default'
        return 'default'
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
            role: 'all',
            status: 'all',
            organization: 'all'
        })
        setPage(0)
    }

    // Handle user selection
    const handleUserSelect = async (user) => {
        setSelectedUser(user)
        await fetchUserDetails(user.id)
    }

    // Handle detail tab change
    const handleDetailTabChange = (event, newValue) => {
        setDetailTab(newValue)
    }

    // Handle open user dialog
    const handleOpenUserDialog = (mode, userData = null) => {
        if (mode === 'create') {
            setUserForm({
                email: '',
                fullName: '',
                role: '',
                organization: '',
                isActive: true,
                isMfaEnabled: false
            })
        } else if (userData) {
            setUserForm({
                email: userData.email,
                fullName: userData.fullName,
                role: userData.role,
                organization: userData.organization,
                isActive: userData.isActive,
                isMfaEnabled: userData.isMfaEnabled
            })
        }
        
        setUserDialog({
            open: true,
            mode,
            data: userData
        })
        
        setFormErrors({})
    }

    // Handle close user dialog
    const handleCloseUserDialog = () => {
        setUserDialog({
            open: false,
            mode: 'create',
            data: null
        })
    }

    // Handle form change
    const handleFormChange = (field, value) => {
        setUserForm(prev => ({ ...prev, [field]: value }))
        
        // Clear error for the field
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    // Validate form
    const validateForm = () => {
        const errors = {}
        
        if (!userForm.email) {
            errors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(userForm.email)) {
            errors.email = 'Invalid email address'
        }
        
        if (!userForm.fullName) {
            errors.fullName = 'Full name is required'
        }
        
        if (!userForm.role) {
            errors.role = 'Role is required'
        }
        
        if (!userForm.organization) {
            errors.organization = 'Organization is required'
        }
        
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Handle save user
    const handleSaveUser = async () => {
        if (!validateForm()) {
            return
        }
        
        setLoading(true)
        try {
            // In a real implementation, this would be an API call to create or update the user
            // For now, we'll simulate the operation
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Refresh the users list
            await fetchUsers()
            
            // Close the dialog
            handleCloseUserDialog()
        } catch (error) {
            console.error('Error saving user:', error)
        } finally {
            setLoading(false)
        }
    }

    // Handle delete user
    const handleDeleteUser = async (userId) => {
        const result = await confirm({
            title: 'Delete User',
            message: 'Are you sure you want to delete this user? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        })
        
        if (!result) {
            return
        }
        
        setLoading(true)
        try {
            // In a real implementation, this would be an API call to delete the user
            // For now, we'll simulate the operation
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // If the deleted user was selected, clear the selection
            if (selectedUser && selectedUser.id === userId) {
                setSelectedUser(null)
                setUserOrganizations([])
                setUserWorkspaces([])
                setUserRoles([])
                setUserPermissions([])
                setUserActivityLogs([])
            }
            
            // Refresh the users list
            await fetchUsers()
        } catch (error) {
            console.error('Error deleting user:', error)
        } finally {
            setLoading(false)
        }
    }

    // Handle toggle user status
    const handleToggleUserStatus = async (userId, currentStatus) => {
        const action = currentStatus ? 'deactivate' : 'activate'
        const result = await confirm({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
            message: `Are you sure you want to ${action} this user?`,
            confirmText: action.charAt(0).toUpperCase() + action.slice(1),
            cancelText: 'Cancel'
        })
        
        if (!result) {
            return
        }
        
        setLoading(true)
        try {
            // In a real implementation, this would be an API call to update the user status
            // For now, we'll simulate the operation
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Refresh the users list
            await fetchUsers()
        } catch (error) {
            console.error(`Error ${action}ing user:`, error)
        } finally {
            setLoading(false)
        }
    }

    // Handle reset password
    const handleResetPassword = async (userId) => {
        const result = await confirm({
            title: 'Reset Password',
            message: 'Are you sure you want to reset this user\'s password? A password reset email will be sent to the user.',
            confirmText: 'Reset Password',
            cancelText: 'Cancel'
        })
        
        if (!result) {
            return
        }
        
        setLoading(true)
        try {
            // In a real implementation, this would be an API call to reset the user's password
            // For now, we'll simulate the operation
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Show success message
            alert('Password reset email sent successfully')
        } catch (error) {
            console.error('Error resetting password:', error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch users on component mount and when filters or pagination changes
    useEffect(() => {
        fetchUsers()
    }, [page, rowsPerPage, filters])

    return (
        <Grid container spacing={gridSpacing}>
            {/* Filters */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    label="Search"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    variant="outlined"
                                    size="small"
                                    placeholder="Search by name, email..."
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Role</InputLabel>
                                    <Select
                                        value={filters.role}
                                        onChange={(e) => handleFilterChange('role', e.target.value)}
                                        label="Role"
                                    >
                                        {roleOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        label="Status"
                                    >
                                        {statusOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
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
                            <Grid item xs={12} md={1}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={handleResetFilters}
                                    fullWidth
                                >
                                    Reset
                                </Button>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleOpenUserDialog('create')}
                                    fullWidth
                                >
                                    Add User
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            {/* User List and Details */}
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    {/* User List */}
                    <Grid item xs={12} md={selectedUser ? 6 : 12}>
                        <Card>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h4">Users</Typography>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<RefreshIcon />}
                                        onClick={fetchUsers}
                                    >
                                        Refresh
                                    </Button>
                                </Stack>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell>Role</TableCell>
                                                <TableCell>Organization</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Last Login</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {loading && users.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} align="center">
                                                        Loading...
                                                    </TableCell>
                                                </TableRow>
                                            ) : users.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} align="center">
                                                        No users found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                users.map((user) => (
                                                    <TableRow
                                                        key={user.id}
                                                        hover
                                                        onClick={() => handleUserSelect(user)}
                                                        selected={selectedUser && selectedUser.id === user.id}
                                                        sx={{ cursor: 'pointer' }}
                                                    >
                                                        <TableCell>{user.fullName}</TableCell>
                                                        <TableCell>{user.email}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={user.role}
                                                                color={user.role === 'Admin' ? 'primary' : 'default'}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell>{user.organization}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={user.isActive ? 'Active' : 'Inactive'}
                                                                color={user.isActive ? 'success' : 'error'}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Tooltip title={formatDate(user.lastLogin)}>
                                                                <span>{formatRelativeTime(user.lastLogin)}</span>
                                                            </Tooltip>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" spacing={1}>
                                                                <Tooltip title="Edit User">
                                                                    <IconButton
                                                                        size="small"
                                                                        color="primary"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            handleOpenUserDialog('edit', user)
                                                                        }}
                                                                    >
                                                                        <EditIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title={user.isActive ? 'Deactivate User' : 'Activate User'}>
                                                                    <IconButton
                                                                        size="small"
                                                                        color={user.isActive ? 'error' : 'success'}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            handleToggleUserStatus(user.id, user.isActive)
                                                                        }}
                                                                    >
                                                                        {user.isActive ? (
                                                                            <BlockIcon fontSize="small" />
                                                                        ) : (
                                                                            <CheckCircleIcon fontSize="small" />
                                                                        )}
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Delete User">
                                                                    <IconButton
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            handleDeleteUser(user.id)
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
                                    rowsPerPageOptions={[5, 10, 25, 50]}
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

                    {/* User Details */}
                    {selectedUser && (
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="h4">User Details</Typography>
                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleOpenUserDialog('edit', selectedUser)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                startIcon={<VpnKeyIcon />}
                                                onClick={() => handleResetPassword(selectedUser.id)}
                                            >
                                                Reset Password
                                            </Button>
                                        </Stack>
                                    </Stack>

                                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                                        <Tabs value={detailTab} onChange={handleDetailTabChange} aria-label="user detail tabs">
                                            <Tab label="Profile" />
                                            <Tab label="Organizations" />
                                            <Tab label="Workspaces" />
                                            <Tab label="Roles & Permissions" />
                                            <Tab label="Activity" />
                                        </Tabs>
                                    </Box>

                                    {/* Profile Tab */}
                                    {detailTab === 0 && (
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                                <Stack spacing={2}>
                                                    <Box>
                                                        <Typography variant="subtitle1" color="textSecondary">
                                                            Full Name
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {selectedUser.fullName}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle1" color="textSecondary">
                                                            Email
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {selectedUser.email}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle1" color="textSecondary">
                                                            Role
                                                        </Typography>
                                                        <Chip
                                                            label={selectedUser.role}
                                                            color={selectedUser.role === 'Admin' ? 'primary' : 'default'}
                                                            size="small"
                                                        />
                                                    </Box>
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Stack spacing={2}>
                                                    <Box>
                                                        <Typography variant="subtitle1" color="textSecondary">
                                                            Status
                                                        </Typography>
                                                        <Chip
                                                            label={selectedUser.isActive ? 'Active' : 'Inactive'}
                                                            color={selectedUser.isActive ? 'success' : 'error'}
                                                            size="small"
                                                        />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle1" color="textSecondary">
                                                            MFA Enabled
                                                        </Typography>
                                                        <Chip
                                                            label={selectedUser.isMfaEnabled ? 'Enabled' : 'Disabled'}
                                                            color={selectedUser.isMfaEnabled ? 'success' : 'default'}
                                                            size="small"
                                                        />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle1" color="textSecondary">
                                                            Created At
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {formatDate(selectedUser.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle1" color="textSecondary">
                                                            Last Login
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {formatDate(selectedUser.lastLogin)}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    )}

                                    {/* Organizations Tab */}
                                    {detailTab === 1 && (
                                        <TableContainer>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Organization</TableCell>
                                                        <TableCell>Role</TableCell>
                                                        <TableCell>Joined</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {userOrganizations.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={3} align="center">
                                                                No organizations found
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        userOrganizations.map((org) => (
                                                            <TableRow key={org.id}>
                                                                <TableCell>{org.name}</TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={org.role}
                                                                        color={org.role === 'Admin' ? 'primary' : 'default'}
                                                                        size="small"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>{formatDate(org.joinedAt)}</TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}

                                    {/* Workspaces Tab */}
                                    {detailTab === 2 && (
                                        <TableContainer>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Workspace</TableCell>
                                                        <TableCell>Organization</TableCell>
                                                        <TableCell>Role</TableCell>
                                                        <TableCell>Joined</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {userWorkspaces.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={4} align="center">
                                                                No workspaces found
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        userWorkspaces.map((workspace) => (
                                                            <TableRow key={workspace.id}>
                                                                <TableCell>{workspace.name}</TableCell>
                                                                <TableCell>{workspace.organization}</TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={workspace.role}
                                                                        color={workspace.role === 'Admin' ? 'primary' : 'default'}
                                                                        size="small"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>{formatDate(workspace.joinedAt)}</TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}

                                    {/* Roles & Permissions Tab */}
                                    {detailTab === 3 && (
                                        <Box>
                                            <Typography variant="h5" gutterBottom>
                                                Roles
                                            </Typography>
                                            <TableContainer sx={{ mb: 3 }}>
                                                <Table>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Role</TableCell>
                                                            <TableCell>Scope</TableCell>
                                                            <TableCell>Assigned</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {userRoles.length === 0 ? (
                                                            <TableRow>
                                                                <TableCell colSpan={3} align="center">
                                                                    No roles found
                                                                </TableCell>
                                                            </TableRow>
                                                        ) : (
                                                            userRoles.map((role) => (
                                                                <TableRow key={role.id}>
                                                                    <TableCell>{role.name}</TableCell>
                                                                    <TableCell>{role.scope}</TableCell>
                                                                    <TableCell>{formatDate(role.assignedAt)}</TableCell>
                                                                </TableRow>
                                                            ))
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>

                                            <Typography variant="h5" gutterBottom>
                                                Permissions
                                            </Typography>
                                            <TableContainer>
                                                <Table>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Permission</TableCell>
                                                            <TableCell>Description</TableCell>
                                                            <TableCell>Source</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {userPermissions.length === 0 ? (
                                                            <TableRow>
                                                                <TableCell colSpan={3} align="center">
                                                                    No permissions found
                                                                </TableCell>
                                                            </TableRow>
                                                        ) : (
                                                            userPermissions.map((permission) => (
                                                                <TableRow key={permission.id}>
                                                                    <TableCell>{permission.name}</TableCell>
                                                                    <TableCell>{permission.description}</TableCell>
                                                                    <TableCell>{permission.source}</TableCell>
                                                                </TableRow>
                                                            ))
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    )}

                                    {/* Activity Tab */}
                                    {detailTab === 4 && (
                                        <TableContainer>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Action</TableCell>
                                                        <TableCell>Details</TableCell>
                                                        <TableCell>IP Address</TableCell>
                                                        <TableCell>Time</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {userActivityLogs.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={4} align="center">
                                                                No activity logs found
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        userActivityLogs.map((log) => (
                                                            <TableRow key={log.id}>
                                                                <TableCell>
                                                                    <Chip
                                                                        icon={getActionIcon(log.action)}
                                                                        label={log.action.charAt(0).toUpperCase() + log.action.slice(1).replace('_', ' ')}
                                                                        color={getActionColor(log.action)}
                                                                        size="small"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>{log.details}</TableCell>
                                                                <TableCell>{log.ipAddress}</TableCell>
                                                                <TableCell>
                                                                    <Tooltip title={formatDate(log.timestamp)}>
                                                                        <span>{formatRelativeTime(log.timestamp)}</span>
                                                                    </Tooltip>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            </Grid>

            {/* User Dialog */}
            <Dialog
                open={userDialog.open}
                onClose={handleCloseUserDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {userDialog.mode === 'create' ? 'Add User' : userDialog.mode === 'edit' ? 'Edit User' : 'User Details'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                value={userForm.email}
                                onChange={(e) => handleFormChange('email', e.target.value)}
                                error={!!formErrors.email}
                                helperText={formErrors.email}
                                disabled={userDialog.mode === 'view'}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                value={userForm.fullName}
                                onChange={(e) => handleFormChange('fullName', e.target.value)}
                                error={!!formErrors.fullName}
                                helperText={formErrors.fullName}
                                disabled={userDialog.mode === 'view'}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!formErrors.role}>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    value={userForm.role}
                                    onChange={(e) => handleFormChange('role', e.target.value)}
                                    label="Role"
                                    disabled={userDialog.mode === 'view'}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <SecurityIcon />
                                        </InputAdornment>
                                    }
                                >
                                    {roleOptions.filter(option => option.value !== 'all').map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formErrors.role && (
                                    <Typography variant="caption" color="error">
                                        {formErrors.role}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!formErrors.organization}>
                                <InputLabel>Organization</InputLabel>
                                <Select
                                    value={userForm.organization}
                                    onChange={(e) => handleFormChange('organization', e.target.value)}
                                    label="Organization"
                                    disabled={userDialog.mode === 'view'}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <BusinessIcon />
                                        </InputAdornment>
                                    }
                                >
                                    {organizationOptions.filter(option => option.value !== 'all').map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formErrors.organization && (
                                    <Typography variant="caption" color="error">
                                        {formErrors.organization}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={userForm.isActive}
                                        onChange={(e) => handleFormChange('isActive', e.target.checked)}
                                        disabled={userDialog.mode === 'view'}
                                    />
                                }
                                label="Active"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={userForm.isMfaEnabled}
                                        onChange={(e) => handleFormChange('isMfaEnabled', e.target.checked)}
                                        disabled={userDialog.mode === 'view'}
                                    />
                                }
                                label="MFA Enabled"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseUserDialog} color="secondary">
                        Cancel
                    </Button>
                    {userDialog.mode !== 'view' && (
                        <Button onClick={handleSaveUser} color="primary" variant="contained">
                            {userDialog.mode === 'create' ? 'Create' : 'Update'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Grid>
    )
}

export default UserManagement