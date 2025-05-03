import React, { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material'
import {
    Refresh as RefreshIcon,
    Search as SearchIcon,
    FilterList as FilterListIcon,
    Download as DownloadIcon,
    Person as PersonIcon,
    Business as BusinessIcon,
    Workspaces as WorkspacesIcon,
    Security as SecurityIcon,
    Settings as SettingsIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    CheckCircle as CheckCircleIcon,
    Login as LoginIcon,
    Logout as LogoutIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Add as AddIcon
} from '@mui/icons-material'
import useApi from '@/hooks/useApi'
import { gridSpacing } from 'store/constant'

const AuditLogsPage = () => {
    const theme = useTheme()
    const api = useApi()

    // State for audit logs
    const [auditLogs, setAuditLogs] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [total, setTotal] = useState(0)

    // State for filters
    const [filters, setFilters] = useState({
        search: '',
        action: 'all',
        user: '',
        startDate: null,
        endDate: null
    })

    // Options for filters
    const actionOptions = [
        { value: 'all', label: 'All Actions' },
        { value: 'login', label: 'Login' },
        { value: 'logout', label: 'Logout' },
        { value: 'login_failed', label: 'Failed Login' },
        { value: 'user_create', label: 'User Created' },
        { value: 'user_update', label: 'User Updated' },
        { value: 'user_delete', label: 'User Deleted' },
        { value: 'organization_create', label: 'Organization Created' },
        { value: 'organization_update', label: 'Organization Updated' },
        { value: 'organization_delete', label: 'Organization Deleted' },
        { value: 'workspace_create', label: 'Workspace Created' },
        { value: 'workspace_update', label: 'Workspace Updated' },
        { value: 'workspace_delete', label: 'Workspace Deleted' },
        { value: 'role_create', label: 'Role Created' },
        { value: 'role_update', label: 'Role Updated' },
        { value: 'role_delete', label: 'Role Deleted' },
        { value: 'permission_update', label: 'Permission Updated' }
    ]

    // Fetch audit logs
    const fetchAuditLogs = async () => {
        setLoading(true)
        try {
            // In a real implementation, this would be an API call with filters and pagination
            // For now, we'll simulate the data
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Sample data
            const sampleAuditLogs = [
                {
                    id: '1',
                    action: 'login',
                    user: 'admin@example.com',
                    details: 'Successful login',
                    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                    ipAddress: '192.168.1.1',
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                {
                    id: '2',
                    action: 'user_create',
                    user: 'admin@example.com',
                    details: 'Created user john.doe@example.com',
                    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                    ipAddress: '192.168.1.1',
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                {
                    id: '3',
                    action: 'role_update',
                    user: 'admin@example.com',
                    details: 'Updated role permissions for "Organization Admin"',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    ipAddress: '192.168.1.1',
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                {
                    id: '4',
                    action: 'organization_create',
                    user: 'admin@example.com',
                    details: 'Created organization "Stark Industries"',
                    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                    ipAddress: '192.168.1.1',
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                {
                    id: '5',
                    action: 'login_failed',
                    user: 'unknown',
                    details: 'Failed login attempt for user alice@example.com',
                    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                    ipAddress: '203.0.113.42',
                    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
                },
                {
                    id: '6',
                    action: 'workspace_create',
                    user: 'john.doe@example.com',
                    details: 'Created workspace "Marketing"',
                    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    ipAddress: '192.168.1.5',
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                {
                    id: '7',
                    action: 'user_update',
                    user: 'admin@example.com',
                    details: 'Updated user profile for bob.johnson@example.com',
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    ipAddress: '192.168.1.1',
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                {
                    id: '8',
                    action: 'logout',
                    user: 'jane.smith@example.com',
                    details: 'User logged out',
                    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    ipAddress: '192.168.1.10',
                    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1'
                },
                {
                    id: '9',
                    action: 'permission_update',
                    user: 'admin@example.com',
                    details: 'Updated permissions for role "Viewer"',
                    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                    ipAddress: '192.168.1.1',
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                {
                    id: '10',
                    action: 'organization_update',
                    user: 'admin@example.com',
                    details: 'Updated organization details for "Acme Corp"',
                    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    ipAddress: '192.168.1.1',
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            ]
            
            // Apply filters
            let filteredLogs = [...sampleAuditLogs]
            
            if (filters.search) {
                const searchLower = filters.search.toLowerCase()
                filteredLogs = filteredLogs.filter(
                    log => 
                        log.user.toLowerCase().includes(searchLower) ||
                        log.details.toLowerCase().includes(searchLower) ||
                        log.ipAddress.toLowerCase().includes(searchLower)
                )
            }
            
            if (filters.action !== 'all') {
                filteredLogs = filteredLogs.filter(log => log.action === filters.action)
            }
            
            if (filters.user) {
                filteredLogs = filteredLogs.filter(log => log.user.toLowerCase().includes(filters.user.toLowerCase()))
            }
            
            if (filters.startDate) {
                filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= filters.startDate)
            }
            
            if (filters.endDate) {
                // Add one day to include the end date fully
                const endDate = new Date(filters.endDate)
                endDate.setDate(endDate.getDate() + 1)
                filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endDate)
            }
            
            setTotal(filteredLogs.length)
            
            // Apply pagination
            const paginatedLogs = filteredLogs.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
            )
            
            setAuditLogs(paginatedLogs)
        } catch (error) {
            console.error('Error fetching audit logs:', error)
        } finally {
            setLoading(false)
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
            case 'login_failed':
                return <ErrorIcon fontSize="small" />
            case 'user_create':
                return <AddIcon fontSize="small" />
            case 'user_update':
                return <EditIcon fontSize="small" />
            case 'user_delete':
                return <DeleteIcon fontSize="small" />
            case 'organization_create':
                return <AddIcon fontSize="small" />
            case 'organization_update':
                return <EditIcon fontSize="small" />
            case 'organization_delete':
                return <DeleteIcon fontSize="small" />
            case 'workspace_create':
                return <AddIcon fontSize="small" />
            case 'workspace_update':
                return <EditIcon fontSize="small" />
            case 'workspace_delete':
                return <DeleteIcon fontSize="small" />
            case 'role_create':
                return <AddIcon fontSize="small" />
            case 'role_update':
                return <EditIcon fontSize="small" />
            case 'role_delete':
                return <DeleteIcon fontSize="small" />
            case 'permission_update':
                return <EditIcon fontSize="small" />
            default:
                return <InfoIcon fontSize="small" />
        }
    }

    // Get color for action
    const getActionColor = (action) => {
        if (action.includes('create')) return 'success'
        if (action.includes('update')) return 'primary'
        if (action.includes('delete')) return 'error'
        if (action === 'login') return 'success'
        if (action === 'logout') return 'default'
        if (action === 'login_failed') return 'error'
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
            action: 'all',
            user: '',
            startDate: null,
            endDate: null
        })
        setPage(0)
    }

    // Handle export logs
    const handleExportLogs = () => {
        // In a real implementation, this would generate a CSV or Excel file
        // For now, we'll just show a console message
        console.log('Exporting logs...')
        alert('Logs exported successfully')
    }

    // Fetch audit logs on component mount and when filters or pagination changes
    useEffect(() => {
        fetchAuditLogs()
    }, [page, rowsPerPage, filters])

    return (
        <Grid container spacing={gridSpacing}>
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
                                    placeholder="Search by user, details, IP..."
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
                                    <InputLabel>Action</InputLabel>
                                    <Select
                                        value={filters.action}
                                        onChange={(e) => handleFilterChange('action', e.target.value)}
                                        label="Action"
                                    >
                                        {actionOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <TextField
                                    fullWidth
                                    label="User"
                                    value={filters.user}
                                    onChange={(e) => handleFilterChange('user', e.target.value)}
                                    variant="outlined"
                                    size="small"
                                    placeholder="Filter by user"
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <TextField
                                    fullWidth
                                    label="Start Date"
                                    value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value ? new Date(e.target.value) : null)}
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <TextField
                                    fullWidth
                                    label="End Date"
                                    value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value ? new Date(e.target.value) : null)}
                                    variant="outlined"
                                    size="small"
                                />
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
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h4">Audit Logs</Typography>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<RefreshIcon />}
                                    onClick={fetchAuditLogs}
                                >
                                    Refresh
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<DownloadIcon />}
                                    onClick={handleExportLogs}
                                >
                                    Export
                                </Button>
                            </Stack>
                        </Stack>
                        <TableContainer sx={{ maxHeight: '600px', overflow: 'auto' }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Action</TableCell>
                                        <TableCell>User</TableCell>
                                        <TableCell>Details</TableCell>
                                        <TableCell>IP Address</TableCell>
                                        <TableCell>Time</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading && auditLogs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                Loading...
                                            </TableCell>
                                        </TableRow>
                                    ) : auditLogs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                No audit logs found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        auditLogs.map((log) => (
                                            <TableRow key={log.id} hover>
                                                <TableCell>
                                                    <Chip
                                                        icon={getActionIcon(log.action)}
                                                        label={log.action.charAt(0).toUpperCase() + log.action.slice(1).replace('_', ' ')}
                                                        color={getActionColor(log.action)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>{log.user}</TableCell>
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
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50, 100]}
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
        </Grid>
    )
}

export default AuditLogsPage