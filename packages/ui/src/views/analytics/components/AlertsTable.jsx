import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import WarningIcon from '@mui/icons-material/Warning'
import ErrorIcon from '@mui/icons-material/Error'
import InfoIcon from '@mui/icons-material/Info'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import axios from 'axios'
import { API_URL } from 'config'

const AlertsTable = ({ data, title = 'Recent Alerts' }) => {
    const theme = useTheme()
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [anchorEl, setAnchorEl] = useState(null)
    const [selectedAlert, setSelectedAlert] = useState(null)
    const [openDialog, setOpenDialog] = useState(false)
    const [resolution, setResolution] = useState('')
    const [actionType, setActionType] = useState('')

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const handleMenuClick = (event, alert) => {
        setAnchorEl(event.currentTarget)
        setSelectedAlert(alert)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
    }

    const handleActionClick = (action) => {
        setActionType(action)
        
        if (action === 'resolve') {
            setOpenDialog(true)
        } else {
            updateAlertStatus(action)
        }
        
        handleMenuClose()
    }

    const handleDialogClose = () => {
        setOpenDialog(false)
        setResolution('')
    }

    const handleResolve = () => {
        updateAlertStatus('resolve', resolution)
        handleDialogClose()
    }

    const updateAlertStatus = async (action, resolutionText = '') => {
        if (!selectedAlert) return

        try {
            let status
            switch (action) {
                case 'acknowledge':
                    status = 'acknowledged'
                    break
                case 'resolve':
                    status = 'resolved'
                    break
                case 'dismiss':
                    status = 'dismissed'
                    break
                default:
                    status = 'open'
            }

            await axios.put(`${API_URL}/analytics/alerts/${selectedAlert.id}`, {
                status,
                resolution: resolutionText
            })

            // In a real app, you would update the alert in the data array
            // or refetch the data. For this example, we'll just log it.
            console.log(`Alert ${selectedAlert.id} status updated to ${status}`)
        } catch (error) {
            console.error('Error updating alert status:', error)
        }
    }

    const getSeverityIcon = (severity) => {
        switch (severity.toLowerCase()) {
            case 'critical':
                return <ErrorIcon sx={{ color: theme.palette.error.main }} />
            case 'high':
                return <WarningIcon sx={{ color: theme.palette.error.main }} />
            case 'medium':
                return <WarningIcon sx={{ color: theme.palette.warning.main }} />
            case 'low':
                return <InfoIcon sx={{ color: theme.palette.info.main }} />
            default:
                return <InfoIcon sx={{ color: theme.palette.info.main }} />
        }
    }

    const getSeverityColor = (severity) => {
        switch (severity.toLowerCase()) {
            case 'critical':
                return theme.palette.error.main
            case 'high':
                return theme.palette.error.main
            case 'medium':
                return theme.palette.warning.main
            case 'low':
                return theme.palette.info.main
            default:
                return theme.palette.info.main
        }
    }

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'open':
                return theme.palette.error.main
            case 'acknowledged':
                return theme.palette.warning.main
            case 'resolved':
                return theme.palette.success.main
            case 'dismissed':
                return theme.palette.text.secondary
            default:
                return theme.palette.error.main
        }
    }

    const getAlertTypeLabel = (type) => {
        switch (type) {
            case 'suspicious_activity':
                return 'Suspicious Activity'
            case 'permission_abuse':
                return 'Permission Abuse'
            case 'compliance_issue':
                return 'Compliance Issue'
            case 'unusual_access':
                return 'Unusual Access'
            case 'system_issue':
                return 'System Issue'
            default:
                return type.replace(/_/g, ' ')
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h4" gutterBottom>
                    {title}
                </Typography>

                {data.length > 0 ? (
                    <>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Severity</TableCell>
                                        <TableCell>Alert</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Detected</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((alert) => (
                                            <TableRow key={alert.id}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        {getSeverityIcon(alert.severity)}
                                                        <Typography variant="body2" sx={{ ml: 1 }}>
                                                            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {alert.name}
                                                    </Typography>
                                                    {alert.description && (
                                                        <Typography variant="caption" color="textSecondary">
                                                            {alert.description}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={getAlertTypeLabel(alert.alertType)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: getStatusColor(alert.status),
                                                            color: '#fff'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(alert.detectedAt)}
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(event) => handleMenuClick(event, alert)}
                                                        disabled={alert.status === 'resolved' || alert.status === 'dismissed'}
                                                    >
                                                        <MoreVertIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
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
                    </>
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <CheckCircleIcon sx={{ fontSize: 48, color: theme.palette.success.main, mb: 2 }} />
                            <Typography variant="h6">No alerts found</Typography>
                            <Typography variant="body2" color="textSecondary">
                                There are no alerts in the selected time period.
                            </Typography>
                        </Box>
                    </Box>
                )}

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => handleActionClick('acknowledge')}>Acknowledge</MenuItem>
                    <MenuItem onClick={() => handleActionClick('resolve')}>Resolve</MenuItem>
                    <MenuItem onClick={() => handleActionClick('dismiss')}>Dismiss</MenuItem>
                </Menu>

                <Dialog open={openDialog} onClose={handleDialogClose}>
                    <DialogTitle>Resolve Alert</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Please provide resolution details for this alert.
                        </DialogContentText>
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
                        <Button onClick={handleDialogClose}>Cancel</Button>
                        <Button onClick={handleResolve} variant="contained" color="primary">
                            Resolve
                        </Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    )
}

AlertsTable.propTypes = {
    data: PropTypes.array.isRequired,
    title: PropTypes.string
}

export default AlertsTable