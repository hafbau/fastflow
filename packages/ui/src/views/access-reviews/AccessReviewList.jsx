import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
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
import { IconPlus, IconEdit, IconTrash, IconEye, IconCalendar } from '@tabler/icons-react'
import MainCard from 'ui-component/cards/MainCard'
import { gridSpacing } from 'store/constant'
import ConfirmDialog from 'ui-component/ConfirmDialog'
import { formatDistance } from 'date-fns'
import { useSelector } from 'react-redux'
import axios from 'utils/axios'
import { toast } from 'react-toastify'

const AccessReviewList = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const customization = useSelector((state) => state.customization)

    const [accessReviews, setAccessReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [reviewToDelete, setReviewToDelete] = useState(null)

    const fetchAccessReviews = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/api/access-reviews')
            setAccessReviews(response.data.data)
        } catch (error) {
            console.error('Error fetching access reviews:', error)
            toast.error('Failed to fetch access reviews')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAccessReviews()
    }, [])

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const handleCreateReview = () => {
        navigate('/access-reviews/create')
    }

    const handleEditReview = (id) => {
        navigate(`/access-reviews/edit/${id}`)
    }

    const handleViewReview = (id) => {
        navigate(`/access-reviews/view/${id}`)
    }

    const handleDeleteClick = (review) => {
        setReviewToDelete(review)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`/api/access-reviews/${reviewToDelete.id}`)
            toast.success('Access review deleted successfully')
            fetchAccessReviews()
        } catch (error) {
            console.error('Error deleting access review:', error)
            toast.error('Failed to delete access review')
        } finally {
            setDeleteDialogOpen(false)
            setReviewToDelete(null)
        }
    }

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false)
        setReviewToDelete(null)
    }

    const getStatusChipColor = (status) => {
        switch (status) {
            case 'pending':
                return {
                    bgcolor: theme.palette.warning.light,
                    color: theme.palette.warning.dark
                }
            case 'in_progress':
                return {
                    bgcolor: theme.palette.primary.light,
                    color: theme.palette.primary.dark
                }
            case 'completed':
                return {
                    bgcolor: theme.palette.success.light,
                    color: theme.palette.success.dark
                }
            case 'cancelled':
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

    return (
        <MainCard title="Access Reviews">
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end" mb={2}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<IconPlus />}
                            onClick={handleCreateReview}
                        >
                            Create Review
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
                                            <TableCell>Status</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Scope</TableCell>
                                            <TableCell>Created</TableCell>
                                            <TableCell>Due Date</TableCell>
                                            <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center">
                                                    <Typography variant="body1">Loading...</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : accessReviews.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center">
                                                    <Typography variant="body1">No access reviews found</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            accessReviews
                                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                .map((review) => (
                                                    <TableRow key={review.id}>
                                                        <TableCell>
                                                            <Typography variant="subtitle1">{review.name}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={formatStatusLabel(review.status)}
                                                                sx={getStatusChipColor(review.status)}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell>{formatStatusLabel(review.type)}</TableCell>
                                                        <TableCell>{formatStatusLabel(review.scope)}</TableCell>
                                                        <TableCell>
                                                            {review.createdAt
                                                                ? formatDistance(new Date(review.createdAt), new Date(), {
                                                                      addSuffix: true
                                                                  })
                                                                : 'N/A'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {review.dueDate
                                                                ? new Date(review.dueDate).toLocaleDateString()
                                                                : 'N/A'}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <IconButton
                                                                color="primary"
                                                                onClick={() => handleViewReview(review.id)}
                                                                size="small"
                                                                title="View"
                                                            >
                                                                <IconEye stroke={1.5} size="1.3rem" />
                                                            </IconButton>
                                                            <IconButton
                                                                color="secondary"
                                                                onClick={() => handleEditReview(review.id)}
                                                                size="small"
                                                                title="Edit"
                                                                disabled={review.status === 'completed'}
                                                            >
                                                                <IconEdit stroke={1.5} size="1.3rem" />
                                                            </IconButton>
                                                            <IconButton
                                                                color="error"
                                                                onClick={() => handleDeleteClick(review)}
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
                                count={accessReviews.length}
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
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h4">Scheduled Reviews</Typography>
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<IconCalendar />}
                            onClick={() => navigate('/access-reviews/schedules')}
                        >
                            Manage Schedules
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            <ConfirmDialog
                open={deleteDialogOpen}
                title="Delete Access Review"
                content={`Are you sure you want to delete the access review "${reviewToDelete?.name}"? This action cannot be undone.`}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </MainCard>
    )
}

export default AccessReviewList