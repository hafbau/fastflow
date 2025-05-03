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
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material'
import {
    Search as SearchIcon,
    Refresh as RefreshIcon,
    FileDownload as FileDownloadIcon,
    Info as InfoIcon,
    Close as CloseIcon
} from '@mui/icons-material'
import MainCard from 'ui-component/cards/MainCard'
import { gridSpacing } from 'store/constant'
import useApi from '@/hooks/useApi'
import { formatDistance } from 'date-fns'
import { useNotifier } from 'utils/useNotifier'

const AuditLogsPage = () => {
    const theme = useTheme()
    const { notifyError } = useNotifier()
    const api = useApi()

    // State for filters
    const [filters, setFilters] = useState({
        userId: '',
        action: '',
        resourceType: '',
        resourceId: '',
        startDate: null,
        endDate: null
    })

    // State for pagination
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [total, setTotal] = useState(0)

    // State for audit logs
    const [auditLogs, setAuditLogs] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedLog, setSelectedLog] = useState(null)

    // Action types for filtering
    const actionTypes = [
        { value: 'user_login', label: 'User Login' },
        { value: 'user_logout', label: 'User Logout' },
        { value: 'user_register', label: 'User Registration' },
        { value: 'password_reset_request', label: 'Password Reset Request' },
        { value: 'password_update', label: 'Password Update' },
        { value: 'user_create', label: 'User Creation' },
        { value: 'user_update', label: 'User Update' },
        { value: 'user_delete', label: 'User Deletion' },
        { value: 'api_access', label: 'API Access' }
    ]

    // Resource types for filtering
    const resourceTypes = [
        { value: 'auth', label: 'Authentication' },
        { value: 'user', label: 'User' },
        { value: 'chatflow', label: 'Chatflow' },
        { value: 'credential', label: 'Credential' },
        { value: 'tool', label: 'Tool' },
        { value: 'assistant', label: 'Assistant' },
        { value: 'variable', label: 'Variable' },
        { value: 'organization', label: 'Organization' },
        { value: 'workspace', label: 'Workspace' }
    ]

    // Fetch audit logs
    const fetchAuditLogs = async () => {
        try {
            setLoading(true)
            
            // Build query parameters
            const params = new URLSearchParams()
            
            if (filters.userId) params.append('userId', filters.userId)
            if (filters.action) params.append('action', filters.action)
            if (filters.resourceType) params.append('resourceType', filters.resourceType)
            if (filters.resourceId) params.append('resourceId', filters.resourceId)
            if (filters.startDate) params.append('startDate', filters.startDate.toISOString())
            if (filters.endDate) params.append('endDate', filters.endDate.toISOString())
            
            params.append('limit', rowsPerPage.toString())
            params.append('offset', (page * rowsPerPage).toString())
            
            // Fetch audit logs
            const response = await api.get(`/api/v1/audit-logs?${params.toString()}`)
            
            setAuditLogs(response.data.logs)
            setTotal(response.data.total)
        } catch (error) {
            console.error('Error fetching audit logs:', error)
            notifyError('Failed to fetch audit logs')
        } finally {
            setLoading(false)
        }
    }

    // Export audit logs as CSV
    const exportAuditLogs = async () => {
        try {
            // Build query parameters
            const params = new URLSearchParams()
            
            if (filters.userId) params.append('userId', filters.userId)
            if (filters.action) params.append('action', filters.action)
            if (filters.resourceType) params.append('resourceType', filters.resourceType)
            if (filters.resourceId) params.append('resourceId', filters.resourceId)
            if (filters.startDate) params.append('startDate', filters.startDate.toISOString())
            if (filters.endDate) params.append('endDate', filters.endDate.toISOString())
            
            // Create a link to download the CSV
            const link = document.createElement('a')
            link.href = `${api.defaults.baseURL}/api/v1/audit-logs/export?${params.toString()}`
            link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error('Error exporting audit logs:', error)
            notifyError('Failed to export audit logs')
        }
    }

    // Handle filter changes
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

    // Handle refresh
    const handleRefresh = () => {
        fetchAuditLogs()
    }

    // Handle reset filters
    const handleResetFilters = () => {
        setFilters({
            userId: '',
            action: '',
            resourceType: '',
            resourceId: '',
            startDate: null,
            endDate: null
        })
        setPage(0)
    }

    // Handle view details
    const handleViewDetails = (log) => {
        setSelectedLog(log)
    }

    // Format timestamp
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp)
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
    }

    // Format relative time
    const formatRelativeTime = (timestamp) => {
        return formatDistance(new Date(timestamp), new Date(), { addSuffix: true })
    }

    // Get action label
    const getActionLabel = (action) => {
        const actionType = actionTypes.find(type => type.value === action)
        return actionType ? actionType.label : action
    }

    // Get resource type label
    const getResourceTypeLabel = (resourceType) => {
        const type = resourceTypes.find(type => type.value === resourceType)
        return type ? type.label : resourceType
    }

    // Get action color
    const getActionColor = (action) => {
        if (action.includes('login') || action.includes('register')) return 'success'
        if (action.includes('logout')) return 'warning'
        if (action.includes('delete')) return 'error'
        if (action.includes('update')) return 'info'
        if (action.includes('create')) return 'primary'
        return 'default'
    }

    // Fetch audit logs on mount and when filters or pagination changes
    useEffect(() => {
        fetchAuditLogs()
    }, [page, rowsPerPage])

    return (
        <MainCard title="Audit Logs">
            <Grid container spacing={gridSpacing}>
                {/* Filters */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6} md={3} lg={2}>
                                    <TextField
                                        fullWidth
                                        label="User ID"
                                        value={filters.userId}
                                        onChange={(e) => handleFilterChange('userId', e.target.value)}
                                        variant="outlined"
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3} lg={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Action</InputLabel>
                                        <Select
                                            value={filters.action}
                                            onChange={(e) => handleFilterChange('action', e.target.value)}
                                            label="Action"
                                        >
                                            <MenuItem value="">All</MenuItem>
                                            {actionTypes.map((type) => (
                                                <MenuItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3} lg={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Resource Type</InputLabel>
                                        <Select
                                            value={filters.resourceType}
                                            onChange={(e) => handleFilterChange('resourceType', e.target.value)}
                                            label="Resource Type"
                                        >
                                            <MenuItem value="">All</MenuItem>
                                            {resourceTypes.map((type) => (
                                                <MenuItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3} lg={2}>
                                    <TextField
                                        fullWidth
                                        label="Resource ID"
                                        value={filters.resourceId}
                                        onChange={(e) => handleFilterChange('resourceId', e.target.value)}
                                        variant="outlined"
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3} lg={2}>
                                    <TextField
                                        fullWidth
                                        label="Start Date"
                                        value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value ? new Date(e.target.value) : null)}
                                        type="date"
                                        variant="outlined"
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3} lg={2}>
                                    <TextField
                                        fullWidth
                                        label="End Date"
                                        value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                                        onChange={(e) => handleFilterChange('endDate', e.target.value ? new Date(e.target.value) : null)}
                                        type="date"
                                        variant="outlined"
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3} lg={2}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<SearchIcon />}
                                        onClick={fetchAuditLogs}
                                        fullWidth
                                    >
                                        Search
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3} lg={2}>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={handleResetFilters}
                                        fullWidth
                                    >
                                        Reset Filters
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3} lg={2}>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<RefreshIcon />}
                                        onClick={handleRefresh}
                                        fullWidth
                                    >
                                        Refresh
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3} lg={2}>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<FileDownloadIcon />}
                                        onClick={exportAuditLogs}
                                        fullWidth
                                    >
                                        Export CSV
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Audit Logs Table */}
                <Grid item xs={12}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="audit logs table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Timestamp</TableCell>
                                    <TableCell>User ID</TableCell>
                                    <TableCell>Action</TableCell>
                                    <TableCell>Resource Type</TableCell>
                                    <TableCell>Resource ID</TableCell>
                                    <TableCell>IP Address</TableCell>
                                    <TableCell>Details</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : auditLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            No audit logs found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    auditLogs.map((log) => (
                                        <TableRow key={log.id} hover>
                                            <TableCell>
                                                <Tooltip title={formatTimestamp(log.timestamp)}>
                                                    <span>{formatRelativeTime(log.timestamp)}</span>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>{log.userId || '-'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getActionLabel(log.action)}
                                                    color={getActionColor(log.action)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{getResourceTypeLabel(log.resourceType)}</TableCell>
                                            <TableCell>{log.resourceId || '-'}</TableCell>
                                            <TableCell>{log.ipAddress || '-'}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleViewDetails(log)}
                                                    size="small"
                                                >
                                                    <InfoIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            component="div"
                            count={total}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </TableContainer>
                </Grid>

                {/* Details Dialog */}
                {selectedLog && (
                    <Dialog open={Boolean(selectedLog)} onClose={() => setSelectedLog(null)} maxWidth="md" fullWidth>
                        <DialogTitle>
                            Audit Log Details
                            <IconButton
                                aria-label="close"
                                onClick={() => setSelectedLog(null)}
                                sx={{ position: 'absolute', right: 8, top: 8 }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2">ID</Typography>
                                    <Typography variant="body2">{selectedLog.id}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2">Timestamp</Typography>
                                    <Typography variant="body2">{formatTimestamp(selectedLog.timestamp)}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2">User ID</Typography>
                                    <Typography variant="body2">{selectedLog.userId || '-'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2">IP Address</Typography>
                                    <Typography variant="body2">{selectedLog.ipAddress || '-'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2">Action</Typography>
                                    <Chip
                                        label={getActionLabel(selectedLog.action)}
                                        color={getActionColor(selectedLog.action)}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2">Resource Type</Typography>
                                    <Typography variant="body2">{getResourceTypeLabel(selectedLog.resourceType)}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2">Resource ID</Typography>
                                    <Typography variant="body2">{selectedLog.resourceId || '-'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2">Metadata</Typography>
                                    {selectedLog.metadata ? (
                                        <Box
                                            sx={{
                                                p: 1,
                                                mt: 1,
                                                backgroundColor: theme.palette.background.default,
                                                borderRadius: 1,
                                                maxHeight: '300px',
                                                overflow: 'auto'
                                            }}
                                        >
                                            <pre>{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                                        </Box>
                                    ) : (
                                        <Typography variant="body2">-</Typography>
                                    )}
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setSelectedLog(null)}>Close</Button>
                        </DialogActions>
                    </Dialog>
                )}
            </Grid>
        </MainCard>
    )
}

export default AuditLogsPage