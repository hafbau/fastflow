import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useTheme } from '@mui/material/styles'
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Typography,
    Box,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField
} from '@mui/material'
import {
    MoreVert as MoreVertIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material'
import api from '../../../api'

/**
 * Recent Alerts Table Component
 * Displays a table of recent alerts
 */
const RecentAlertsTable = ({ data }) => {
    const theme = useTheme()
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [menuAnchorEl, setMenuAnchorEl] = useState(null)
    const [selectedAlert, setSelectedAlert] = useState(null)
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [resolveDialogOpen, setResolveDialogOpen] = useState(false)
    const [resolution, setResolution] = useState('')

    // Handle page change
    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    // Handle rows per page change
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    // Get severity icon and color
    const getSeverityInfo = (severity) => {
        switch (severity.toLowerCase()) {
            case 'critical':
                return { icon: <ErrorIcon fontSize="small" />, color: theme.palette.error.main }
            case 'high':
                return { icon: <WarningIcon fontSize="small" />, color: theme.palette.warning.main }
            case 'medium':
                return { icon: <WarningIcon fontSize="small" />, color: theme.palette.warning.light }
            case 'low':
                return { icon: <InfoIcon fontSize="small" />, color: theme.palette.info.main }
            case 'info':
                return { icon: <InfoIcon fontSize="small" />, color: theme.palette.info.light }
            default:
                return { icon: <InfoIcon fontSize="small" />, color: theme.palette.grey[500] }
        }
    }

    // Get status icon and color
    const getStatusInfo = (status) => {
        switch (status.toLowerCase()) {
            case 'open':
                return { icon: <ErrorIcon fontSize="small" />, color: theme.palette.error.light }
            case 'acknowledged':
                return { icon: <VisibilityIcon fontSize="small" />, color: theme.palette.info.main }
            case 'resolved':
                return { icon: <CheckCircleIcon fontSize="small" />, color: theme.palette.success.main }
            case 'dismissed':
                return { icon: <CancelIcon fontSize="small" />, color: theme.palette.grey[500] }
            default:
                return { icon: <ErrorIcon fontSize="small" />, color: theme.palette.error.light }
        }
    }

    // Handle menu open
    const handleMenuOpen = (event, alert) => {
        setMenuAnchorEl(event.currentTarget)
        setSelectedAlert(alert)
    }

    // Handle menu close
    const handleMenuClose = () => {
        setMenuAnchorEl(null)
    }

    // Handle view details
    const handleViewDetails = () => {
        setDetailsDialogOpen(true)
        handleMenuClose()
    }

    // Handle acknowledge alert
    const handleAcknowledge = () => {
        if (selectedAlert) {
            api.put(`/analytics/alerts/${selectedAlert.id}`, {
                status: 'acknowledged'
            })
                .then(() => {
                    // Update the alert status in the data
                    selectedAlert.status = 'acknowledged'
                })
                .catch((error) => {
                    console.error('Error acknowledging alert:', error)
                })
        }
        handleMenuClose()
    }

    // Handle resolve dialog open
    const handleResolveDialogOpen = () => {
        setResolveDialogOpen(true)
        handleMenuClose()
    }

    // Handle resolve alert
    const handleResolve = () => {
        if (selectedAlert) {
            api.put(`/analytics/alerts/${selectedAlert.id}`, {
                status: 'resolved',
                resolution
            })
                .then(() => {
                    // Update the alert status in the data
                    selectedAlert.status = 'resolved'
                    selectedAlert.resolution = resolution
                    setResolveDialogOpen(false)
                    setResolution('')
                })
                .catch((error) => {
                    console.error('Error resolving alert:', error)
                })
        }
    }

    // Handle dismiss alert
    const handleDismiss = () => {
        if (selectedAlert) {
            api.put(`/analytics/alerts/${selectedAlert.id}`, {
                status: 'dismissed'
            })
                .then(() => {
                    // Update the alert status in the data
                    selectedAlert.status = 'dismissed'
                })
                .catch((error) => {
                    console.error('Error dismissing alert:', error)
                })
        }
        handleMenuClose()
    }

    return (
        <Box>
            {data.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <Typography variant="body1">No alerts found</Typography>
                </Box>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 440 }}>
                        <Table stickyHeader aria-label="recent alerts table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Alert</TableCell>
                                    <TableCell align="center">Severity</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell>Detected At</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((alert, index) => {
                                        const severityInfo = getSeverityInfo(alert.severity)
                                        const statusInfo = getStatusInfo(alert.status)
                                        
                                        return (
                                            <TableRow hover key={index}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {alert.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary" noWrap sx={{ maxWidth: 300 }}>
                                                            {alert.description}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        icon={severityInfo.icon}
                                                        label={alert.severity}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: severityInfo.color,
                                                            color: '#fff'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        icon={statusInfo.icon}
                                                        label={alert.status}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: statusInfo.color,
                                                            color: '#fff'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {formatDate(alert.detectedAt)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(event) => handleMenuOpen(event, alert)}
                                                    >
                                                        <MoreVertIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={data.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            )}

            {/* Alert actions menu */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleViewDetails}>View Details</MenuItem>
                {selectedAlert && selectedAlert.status === 'open' && (
                    <MenuItem onClick={handleAcknowledge}>Acknowledge</MenuItem>
                )}
                {selectedAlert && (selectedAlert.status === 'open' || selectedAlert.status === 'acknowledged') && (
                    <MenuItem onClick={handleResolveDialogOpen}>Resolve</MenuItem>
                )}
                {selectedAlert && selectedAlert.status === 'open' && (
                    <MenuItem onClick={handleDismiss}>Dismiss</MenuItem>
                )}
            </Menu>

            {/* Alert details dialog */}
            <Dialog
                open={detailsDialogOpen}
                onClose={() => setDetailsDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Alert Details</DialogTitle>
                <DialogContent>
                    {selectedAlert && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h6">{selectedAlert.name}</Typography>
                            <Typography variant="body1" paragraph>{selectedAlert.description}</Typography>
                            
                            <Typography variant="subtitle2">Alert Information</Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                                <Typography variant="body2"><strong>Type:</strong> {selectedAlert.alertType}</Typography>
                                <Typography variant="body2"><strong>Severity:</strong> {selectedAlert.severity}</Typography>
                                <Typography variant="body2"><strong>Status:</strong> {selectedAlert.status}</Typography>
                                <Typography variant="body2"><strong>Detected At:</strong> {formatDate(selectedAlert.detectedAt)}</Typography>
                            </Box>
                            
                            {selectedAlert.userId && (
                                <>
                                    <Typography variant="subtitle2">User Information</Typography>
                                    <Typography variant="body2"><strong>User ID:</strong> {selectedAlert.userId}</Typography>
                                </>
                            )}
                            
                            {selectedAlert.resourceId && (
                                <>
                                    <Typography variant="subtitle2" sx={{ mt: 2 }}>Resource Information</Typography>
                                    <Typography variant="body2"><strong>Resource Type:</strong> {selectedAlert.resourceType}</Typography>
                                    <Typography variant="body2"><strong>Resource ID:</strong> {selectedAlert.resourceId}</Typography>
                                </>
                            )}
                            
                            {selectedAlert.context && (
                                <>
                                    <Typography variant="subtitle2" sx={{ mt: 2 }}>Additional Context</Typography>
                                    <Box component="pre" sx={{ 
                                        backgroundColor: theme.palette.grey[100], 
                                        p: 2, 
                                        borderRadius: 1,
                                        overflow: 'auto',
                                        maxHeight: '200px'
                                    }}>
                                        {JSON.stringify(selectedAlert.context, null, 2)}
                                    </Box>
                                </>
                            )}
                            
                            {selectedAlert.resolution && (
                                <>
                                    <Typography variant="subtitle2" sx={{ mt: 2 }}>Resolution</Typography>
                                    <Typography variant="body2">{selectedAlert.resolution}</Typography>
                                </>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Resolve alert dialog */}
            <Dialog
                open={resolveDialogOpen}
                onClose={() => setResolveDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Resolve Alert</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" paragraph>
                        Please provide a resolution for this alert.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="resolution"
                        label="Resolution"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleResolve} variant="contained" color="primary">
                        Resolve
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

RecentAlertsTable.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            description: PropTypes.string,
            alertType: PropTypes.string.isRequired,
            severity: PropTypes.string.isRequired,
            status: PropTypes.string.isRequired,
            detectedAt: PropTypes.string.isRequired,
            userId: PropTypes.string,
            resourceId: PropTypes.string,
            resourceType: PropTypes.string,
            context: PropTypes.object,
            resolution: PropTypes.string
        })
    ).isRequired
}

export default RecentAlertsTable