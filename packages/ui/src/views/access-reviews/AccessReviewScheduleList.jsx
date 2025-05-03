import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
    Grid,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
    useTheme
} from '@mui/material'
import { IconPlus, IconEdit, IconTrash, IconPlayerPlay, IconCalendarEvent } from '@tabler/icons-react'
import MainCard from 'ui-component/cards/MainCard'
import { gridSpacing } from 'store/constant'
import ConfirmDialog from 'ui-component/ConfirmDialog'
import { formatDistance } from 'date-fns'
import { useSelector } from 'react-redux'
import axios from 'utils/axios'
import { toast } from 'react-toastify'
import Loader from 'ui-component/loading/Loader'

const AccessReviewScheduleList = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const customization = useSelector((state) => state.customization)

    const [schedules, setSchedules] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [scheduleToDelete, setScheduleToDelete] = useState(null)
    const [runDialogOpen, setRunDialogOpen] = useState(false)
    const [runningSchedules, setRunningSchedules] = useState(false)

    const fetchSchedules = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/api/access-reviews/schedules')
            setSchedules(response.data.data)
        } catch (error) {
            console.error('Error fetching access review schedules:', error)
            toast.error('Failed to fetch access review schedules')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSchedules()
    }, [])

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const handleCreateSchedule = () => {
        navigate('/access-reviews/schedules/create')
    }

    const handleEditSchedule = (id) => {
        navigate(`/access-reviews/schedules/edit/${id}`)
    }

    const handleDeleteClick = (schedule) => {
        setScheduleToDelete(schedule)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`/api/access-reviews/schedules/${scheduleToDelete.id}`)
            toast.success('Schedule deleted successfully')
            fetchSchedules()
        } catch (error) {
            console.error('Error deleting schedule:', error)
            toast.error('Failed to delete schedule')
        } finally {
            setDeleteDialogOpen(false)
            setScheduleToDelete(null)
        }
    }

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false)
        setScheduleToDelete(null)
    }

    const handleRunSchedulesClick = () => {
        setRunDialogOpen(true)
    }

    const handleRunSchedulesConfirm = async () => {
        try {
            setRunningSchedules(true)
            const response = await axios.post('/api/access-reviews/schedules/run')
            const reviewsCreated = response.data.data.reviewsCreated
            
            toast.success(`Successfully created ${reviewsCreated} access ${reviewsCreated === 1 ? 'review' : 'reviews'}`)
            fetchSchedules()
        } catch (error) {
            console.error('Error running scheduled reviews:', error)
            toast.error('Failed to run scheduled reviews')
        } finally {
            setRunningSchedules(false)
            setRunDialogOpen(false)
        }
    }

    const handleRunSchedulesCancel = () => {
        setRunDialogOpen(false)
    }

    const handleBack = () => {
        navigate('/access-reviews')
    }

    const getStatusChipColor = (status) => {
        switch (status) {
            case 'active':
                return {
                    bgcolor: theme.palette.success.light,
                    color: theme.palette.success.dark
                }
            case 'paused':
                return {
                    bgcolor: theme.palette.warning.light,
                    color: theme.palette.warning.dark
                }
            case 'disabled':
                return {
                    bgcolor: theme.palette.error.light,
                    color: theme.palette.error.dark
                }
            default:
                return {
                    bgcolor: theme.palette.grey[100],
                    color: theme.palette.grey[800]
                }
        }
    }

    const formatStatusLabel = (status) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    }

    const formatFrequencyLabel = (frequency) => {
        switch (frequency) {
            case 'daily':
                return 'Daily'
            case 'weekly':
                return 'Weekly'
            case 'monthly':
                return 'Monthly'
            case 'quarterly':
                return 'Quarterly'
            case 'semi_annually':
                return 'Semi-Annually'
            case 'annually':
                return 'Annually'
            default:
                return frequency
        }
    }

    if (loading) {
        return <Loader />
    }

    return (
        <MainCard 
            title="Access Review Schedules" 
            secondary={
                <Button variant="outlined" color="secondary" onClick={handleBack} startIcon={<IconCalendarEvent />}>
                    Back to Reviews
                </Button>
            }
        >
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<IconPlus />}
                            onClick={handleCreateSchedule}
                        >
                            Create Schedule
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<IconPlayerPlay />}
                            onClick={handleRunSchedulesClick}
                        >
                            Run Due Schedules
                        </Button>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Frequency</TableCell>
                                            <TableCell>Scope</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Last Run</TableCell>
                                            <TableCell>Next Run</TableCell>
                                            <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {schedules.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center">
                                                    <Typography variant="body1">No schedules found</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            schedules
                                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                .map((schedule) => (
                                                    <TableRow key={schedule.id}>
                                                        <TableCell>
                                                            <Typography variant="subtitle1">{schedule.name}</Typography>
                                                        </TableCell>
                                                        <TableCell>{formatFrequencyLabel(schedule.frequency)}</TableCell>
                                                        <TableCell>{formatStatusLabel(schedule.scope)}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={formatStatusLabel(schedule.status)}
                                                                sx={getStatusChipColor(schedule.status)}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            {schedule.lastRunAt
                                                                ? formatDistance(new Date(schedule.lastRunAt), new Date(), {
                                                                      addSuffix: true
                                                                  })
                                                                : 'Never'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {schedule.nextRunAt
                                                                ? new Date(schedule.nextRunAt).toLocaleDateString()
                                                                : 'N/A'}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <IconButton
                                                                color="secondary"
                                                                onClick={() => handleEditSchedule(schedule.id)}
                                                                size="small"
                                                                title="Edit"
                                                            >
                                                                <IconEdit stroke={1.5} size="1.3rem" />
                                                            </IconButton>
                                                            <IconButton
                                                                color="error"
                                                                onClick={() => handleDeleteClick(schedule)}
                                                                size="small"
                                                                title="Delete"
                                                            >
                                                                <IconTrash stroke={1.5} size="1.3rem" />
                                                            </IconButton>
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
                                count={schedules.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" gutterBottom>
                                About Access Review Schedules
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Access review schedules allow you to automate the creation of access reviews on a regular basis.
                                This helps ensure that user access is regularly reviewed and complies with security policies.
                            </Typography>
                            <Typography variant="body1" paragraph>
                                <strong>Frequency:</strong> How often the access review will be created.
                            </Typography>
                            <Typography variant="body1" paragraph>
                                <strong>Scope:</strong> The scope of the access review (organization, workspace, or resource).
                            </Typography>
                            <Typography variant="body1">
                                <strong>Status:</strong> Active schedules will automatically create reviews when due. Paused schedules
                                will not create reviews but will maintain their next run date. Disabled schedules are inactive.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <ConfirmDialog
                open={deleteDialogOpen}
                title="Delete Schedule"
                content={`Are you sure you want to delete the schedule "${scheduleToDelete?.name}"? This action cannot be undone.`}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />

            <Dialog open={runDialogOpen} onClose={handleRunSchedulesCancel}>
                <DialogTitle>Run Scheduled Access Reviews</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        This will run all due scheduled access reviews. New access reviews will be created based on active schedules
                        that are due to run.
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Do you want to continue?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleRunSchedulesCancel} disabled={runningSchedules}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRunSchedulesConfirm}
                        variant="contained"
                        color="primary"
                        disabled={runningSchedules}
                    >
                        {runningSchedules ? 'Running...' : 'Run Schedules'}
                    </Button>
                </DialogActions>
            </Dialog>
        </MainCard>
    )
}

export default AccessReviewScheduleList