import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Tab,
    Tabs,
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
    useTheme
} from '@mui/material'
import {
    IconArrowBack,
    IconCheck,
    IconX,
    IconAlertTriangle,
    IconEdit,
    IconUserOff,
    IconLock,
    IconEye,
    IconFilter
} from '@tabler/icons'
import MainCard from 'ui-component/cards/MainCard'
import { gridSpacing } from 'store/constant'
import { useSelector } from 'react-redux'
import axios from 'utils/axios'
import { toast } from 'react-toastify'
import Loader from 'ui-component/loading/Loader'
import ConfirmDialog from 'ui-component/ConfirmDialog'
import ReviewActionDialog from './ReviewActionDialog'

// Tab panel component
function TabPanel(props) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`review-tabpanel-${index}`}
            aria-labelledby={`review-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
        </div>
    )
}

const AccessReviewDetail = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const { id } = useParams()
    const customization = useSelector((state) => state.customization)

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [accessReview, setAccessReview] = useState(null)
    const [reviewItems, setReviewItems] = useState([])
    const [filteredItems, setFilteredItems] = useState([])
    const [tabValue, setTabValue] = useState(0)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [filters, setFilters] = useState({
        status: '',
        type: '',
        isRisky: ''
    })
    const [actionDialogOpen, setActionDialogOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [actionType, setActionType] = useState(null)
    const [completeDialogOpen, setCompleteDialogOpen] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                // Fetch the access review
                const reviewResponse = await axios.get(`/api/access-reviews/${id}`)
                setAccessReview(reviewResponse.data.data)

                // Fetch review items
                const itemsResponse = await axios.get(`/api/access-reviews/${id}/items`)
                setReviewItems(itemsResponse.data.data)
                setFilteredItems(itemsResponse.data.data)
            } catch (error) {
                console.error('Error fetching access review data:', error)
                toast.error('Failed to load access review data')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    useEffect(() => {
        applyFilters()
    }, [filters, reviewItems])

    const applyFilters = () => {
        let filtered = [...reviewItems]

        if (filters.status) {
            filtered = filtered.filter(item => item.status === filters.status)
        }

        if (filters.type) {
            filtered = filtered.filter(item => item.type === filters.type)
        }

        if (filters.isRisky !== '') {
            const isRisky = filters.isRisky === 'true'
            filtered = filtered.filter(item => item.isRisky === isRisky)
        }

        setFilteredItems(filtered)
        setPage(0) // Reset to first page when filters change
    }

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters({
            ...filters,
            [name]: value
        })
    }

    const handleResetFilters = () => {
        setFilters({
            status: '',
            type: '',
            isRisky: ''
        })
    }

    const handleBack = () => {
        navigate('/access-reviews')
    }

    const handleEdit = () => {
        navigate(`/access-reviews/edit/${id}`)
    }

    const handleActionClick = (item, action) => {
        setSelectedItem(item)
        setActionType(action)
        setActionDialogOpen(true)
    }

    const handleActionDialogClose = () => {
        setActionDialogOpen(false)
        setSelectedItem(null)
        setActionType(null)
    }

    const handleActionSubmit = async (actionData) => {
        try {
            setSubmitting(true)
            await axios.post('/api/access-reviews/actions', actionData)
            toast.success('Action submitted successfully')

            // Refresh the review items
            const itemsResponse = await axios.get(`/api/access-reviews/${id}/items`)
            setReviewItems(itemsResponse.data.data)

            // Refresh the review to get updated status
            const reviewResponse = await axios.get(`/api/access-reviews/${id}`)
            setAccessReview(reviewResponse.data.data)
        } catch (error) {
            console.error('Error submitting action:', error)
            toast.error(error.response?.data?.message || 'Failed to submit action')
        } finally {
            setSubmitting(false)
            setActionDialogOpen(false)
            setSelectedItem(null)
            setActionType(null)
        }
    }

    const handleCompleteReview = () => {
        setCompleteDialogOpen(true)
    }

    const handleCompleteConfirm = async () => {
        try {
            setSubmitting(true)
            await axios.put(`/api/access-reviews/${id}`, { status: 'completed' })
            toast.success('Access review completed successfully')

            // Refresh the review to get updated status
            const reviewResponse = await axios.get(`/api/access-reviews/${id}`)
            setAccessReview(reviewResponse.data.data)
        } catch (error) {
            console.error('Error completing review:', error)
            toast.error(error.response?.data?.message || 'Failed to complete review')
        } finally {
            setSubmitting(false)
            setCompleteDialogOpen(false)
        }
    }

    const handleCompleteCancel = () => {
        setCompleteDialogOpen(false)
    }

    const getStatusChipColor = (status) => {
        switch (status) {
            case 'pending':
                return {
                    bgcolor: theme.palette.warning.light,
                    color: theme.palette.warning.dark
                }
            case 'approved':
                return {
                    bgcolor: theme.palette.success.light,
                    color: theme.palette.success.dark
                }
            case 'rejected':
                return {
                    bgcolor: theme.palette.error.light,
                    color: theme.palette.error.dark
                }
            case 'needs_investigation':
                return {
                    bgcolor: theme.palette.info.light,
                    color: theme.palette.info.dark
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

    const getReviewProgress = () => {
        if (!reviewItems.length) return 0
        const completedItems = reviewItems.filter(item => item.status !== 'pending')
        return Math.round((completedItems.length / reviewItems.length) * 100)
    }

    const canCompleteReview = () => {
        if (!reviewItems.length) return false
        return !reviewItems.some(item => item.status === 'pending')
    }

    const isReviewCompleted = () => {
        return accessReview?.status === 'completed'
    }

    if (loading) {
        return <Loader />
    }

    if (!accessReview) {
        return (
            <MainCard title="Access Review Not Found">
                <Typography variant="body1">The requested access review could not be found.</Typography>
                <Box mt={2}>
                    <Button variant="contained" color="primary" onClick={handleBack}>
                        Back to Access Reviews
                    </Button>
                </Box>
            </MainCard>
        )
    }

    return (
        <MainCard
            title={
                <Box display="flex" alignItems="center">
                    <Typography variant="h3" component="span">
                        {accessReview.name}
                    </Typography>
                    <Chip
                        label={formatStatusLabel(accessReview.status)}
                        sx={{
                            ...getStatusChipColor(accessReview.status),
                            ml: 2
                        }}
                    />
                </Box>
            }
            secondary={
                <Box>
                    {!isReviewCompleted() && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleEdit}
                            startIcon={<IconEdit />}
                            sx={{ mr: 1 }}
                        >
                            Edit
                        </Button>
                    )}
                    <Button variant="outlined" color="secondary" onClick={handleBack} startIcon={<IconArrowBack />}>
                        Back
                    </Button>
                </Box>
            }
        >
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" gutterBottom>
                                Review Details
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle1" color="textSecondary">
                                        Type
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body1">{formatStatusLabel(accessReview.type)}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle1" color="textSecondary">
                                        Scope
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body1">{formatStatusLabel(accessReview.scope)}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle1" color="textSecondary">
                                        Created
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body1">
                                        {new Date(accessReview.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle1" color="textSecondary">
                                        Due Date
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body1">
                                        {accessReview.dueDate
                                            ? new Date(accessReview.dueDate).toLocaleDateString()
                                            : 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle1" color="textSecondary">
                                        Progress
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body1">{getReviewProgress()}% Complete</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" color="textSecondary">
                                        Description
                                    </Typography>
                                    <Typography variant="body1" sx={{ mt: 1 }}>
                                        {accessReview.description || 'No description provided.'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" gutterBottom>
                                Review Summary
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            bgcolor: theme.palette.primary.light,
                                            color: theme.palette.primary.dark
                                        }}
                                    >
                                        <Typography variant="h5">{reviewItems.length}</Typography>
                                        <Typography variant="subtitle2">Total Items</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            bgcolor: theme.palette.warning.light,
                                            color: theme.palette.warning.dark
                                        }}
                                    >
                                        <Typography variant="h5">
                                            {reviewItems.filter(item => item.status === 'pending').length}
                                        </Typography>
                                        <Typography variant="subtitle2">Pending</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            bgcolor: theme.palette.success.light,
                                            color: theme.palette.success.dark
                                        }}
                                    >
                                        <Typography variant="h5">
                                            {reviewItems.filter(item => item.status === 'approved').length}
                                        </Typography>
                                        <Typography variant="subtitle2">Approved</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            bgcolor: theme.palette.error.light,
                                            color: theme.palette.error.dark
                                        }}
                                    >
                                        <Typography variant="h5">
                                            {reviewItems.filter(item => item.status === 'rejected').length}
                                        </Typography>
                                        <Typography variant="subtitle2">Rejected</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12}>
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            bgcolor: theme.palette.warning.light,
                                            color: theme.palette.warning.dark,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <Box display="flex" alignItems="center">
                                            <IconAlertTriangle size={24} style={{ marginRight: '8px' }} />
                                            <Typography variant="subtitle1">
                                                {reviewItems.filter(item => item.isRisky).length} Risky Items Identified
                                            </Typography>
                                        </Box>
                                        {!isReviewCompleted() && canCompleteReview() && (
                                            <Button
                                                variant="contained"
                                                color="success"
                                                onClick={handleCompleteReview}
                                                startIcon={<IconCheck />}
                                            >
                                                Complete Review
                                            </Button>
                                        )}
                                    </Paper>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2 }}>
                            <Tabs value={tabValue} onChange={handleTabChange} aria-label="review tabs">
                                <Tab label="All Items" id="review-tab-0" aria-controls="review-tabpanel-0" />
                                <Tab label="Pending" id="review-tab-1" aria-controls="review-tabpanel-1" />
                                <Tab label="Risky Items" id="review-tab-2" aria-controls="review-tabpanel-2" />
                            </Tabs>
                        </Box>
                        <CardContent>
                            <Box mb={2} display="flex" alignItems="center" flexWrap="wrap">
                                <Typography variant="subtitle1" sx={{ mr: 2 }}>
                                    Filters:
                                </Typography>
                                <FormControl sx={{ minWidth: 120, mr: 2, mb: { xs: 2, md: 0 } }} size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        name="status"
                                        value={filters.status}
                                        onChange={handleFilterChange}
                                        label="Status"
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="pending">Pending</MenuItem>
                                        <MenuItem value="approved">Approved</MenuItem>
                                        <MenuItem value="rejected">Rejected</MenuItem>
                                        <MenuItem value="needs_investigation">Needs Investigation</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl sx={{ minWidth: 120, mr: 2, mb: { xs: 2, md: 0 } }} size="small">
                                    <InputLabel>Type</InputLabel>
                                    <Select name="type" value={filters.type} onChange={handleFilterChange} label="Type">
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="user_role">User Role</MenuItem>
                                        <MenuItem value="resource_permission">Resource Permission</MenuItem>
                                        <MenuItem value="dormant_account">Dormant Account</MenuItem>
                                        <MenuItem value="excessive_permission">Excessive Permission</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl sx={{ minWidth: 120, mr: 2, mb: { xs: 2, md: 0 } }} size="small">
                                    <InputLabel>Risk</InputLabel>
                                    <Select
                                        name="isRisky"
                                        value={filters.isRisky}
                                        onChange={handleFilterChange}
                                        label="Risk"
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="true">Risky</MenuItem>
                                        <MenuItem value="false">Not Risky</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleResetFilters}
                                    startIcon={<IconFilter />}
                                >
                                    Reset
                                </Button>
                            </Box>

                            <TabPanel value={tabValue} index={0}>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>User</TableCell>
                                                <TableCell>Type</TableCell>
                                                <TableCell>Details</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Risk</TableCell>
                                                <TableCell align="center">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredItems.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center">
                                                        <Typography variant="body1">No review items found</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredItems
                                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                    .map((item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell>{item.userId}</TableCell>
                                                            <TableCell>{formatStatusLabel(item.type)}</TableCell>
                                                            <TableCell>
                                                                {item.type === 'user_role' && (
                                                                    <Typography variant="body2">
                                                                        Role: {item.metadata?.roleName || item.roleId}
                                                                    </Typography>
                                                                )}
                                                                {item.type === 'resource_permission' && (
                                                                    <Typography variant="body2">
                                                                        {item.resourceType}: {item.permission}
                                                                    </Typography>
                                                                )}
                                                                {item.type === 'dormant_account' && (
                                                                    <Typography variant="body2">
                                                                        Last login:{' '}
                                                                        {item.metadata?.lastLogin
                                                                            ? new Date(
                                                                                  item.metadata.lastLogin
                                                                              ).toLocaleDateString()
                                                                            : 'Never'}
                                                                    </Typography>
                                                                )}
                                                                {item.type === 'excessive_permission' && (
                                                                    <Typography variant="body2">
                                                                        {item.metadata?.roleCount} roles assigned
                                                                    </Typography>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={formatStatusLabel(item.status)}
                                                                    sx={getStatusChipColor(item.status)}
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                {item.isRisky && (
                                                                    <Tooltip title={item.riskReason || 'Risky item'}>
                                                                        <Chip
                                                                            label="Risky"
                                                                            size="small"
                                                                            color="error"
                                                                            icon={<IconAlertTriangle size={16} />}
                                                                        />
                                                                    </Tooltip>
                                                                )}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {!isReviewCompleted() && item.status === 'pending' && (
                                                                    <>
                                                                        <Tooltip title="Approve">
                                                                            <IconButton
                                                                                color="success"
                                                                                size="small"
                                                                                onClick={() =>
                                                                                    handleActionClick(item, 'approve')
                                                                                }
                                                                            >
                                                                                <IconCheck stroke={1.5} size="1.3rem" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Tooltip title="Reject">
                                                                            <IconButton
                                                                                color="error"
                                                                                size="small"
                                                                                onClick={() =>
                                                                                    handleActionClick(item, 'reject')
                                                                                }
                                                                            >
                                                                                <IconX stroke={1.5} size="1.3rem" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Tooltip title="Revoke Access">
                                                                            <IconButton
                                                                                color="warning"
                                                                                size="small"
                                                                                onClick={() =>
                                                                                    handleActionClick(
                                                                                        item,
                                                                                        'revoke_access'
                                                                                    )
                                                                                }
                                                                            >
                                                                                <IconLock stroke={1.5} size="1.3rem" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        {item.type === 'dormant_account' && (
                                                                            <Tooltip title="Deactivate User">
                                                                                <IconButton
                                                                                    color="secondary"
                                                                                    size="small"
                                                                                    onClick={() =>
                                                                                        handleActionClick(
                                                                                            item,
                                                                                            'deactivate_user'
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <IconUserOff
                                                                                        stroke={1.5}
                                                                                        size="1.3rem"
                                                                                    />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        )}
                                                                    </>
                                                                )}
                                                                <Tooltip title="View Details">
                                                                    <IconButton
                                                                        color="primary"
                                                                        size="small"
                                                                        onClick={() => {
                                                                            // View details functionality
                                                                        }}
                                                                    >
                                                                        <IconEye stroke={1.5} size="1.3rem" />
                                                                    </IconButton>
                                                                </Tooltip>
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
                                    count={filteredItems.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />
                            </TabPanel>

                            <TabPanel value={tabValue} index={1}>
                                {/* Pending items tab - uses the same table but with pre-filtered data */}
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>User</TableCell>
                                                <TableCell>Type</TableCell>
                                                <TableCell>Details</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Risk</TableCell>
                                                <TableCell align="center">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredItems.filter(item => item.status === 'pending').length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center">
                                                        <Typography variant="body1">No pending items found</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredItems
                                                    .filter(item => item.status === 'pending')
                                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                    .map((item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell>{item.userId}</TableCell>
                                                            <TableCell>{formatStatusLabel(item.type)}</TableCell>
                                                            <TableCell>
                                                                {item.type === 'user_role' && (
                                                                    <Typography variant="body2">
                                                                        Role: {item.metadata?.roleName || item.roleId}
                                                                    </Typography>
                                                                )}
                                                                {item.type === 'resource_permission' && (
                                                                    <Typography variant="body2">
                                                                        {item.resourceType}: {item.permission}
                                                                    </Typography>
                                                                )}
                                                                {item.type === 'dormant_account' && (
                                                                    <Typography variant="body2">
                                                                        Last login:{' '}
                                                                        {item.metadata?.lastLogin
                                                                            ? new Date(
                                                                                  item.metadata.lastLogin
                                                                              ).toLocaleDateString()
                                                                            : 'Never'}
                                                                    </Typography>
                                                                )}
                                                                {item.type === 'excessive_permission' && (
                                                                    <Typography variant="body2">
                                                                        {item.metadata?.roleCount} roles assigned
                                                                    </Typography>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={formatStatusLabel(item.status)}
                                                                    sx={getStatusChipColor(item.status)}
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                {item.isRisky && (
                                                                    <Tooltip title={item.riskReason || 'Risky item'}>
                                                                        <Chip
                                                                            label="Risky"
                                                                            size="small"
                                                                            color="error"
                                                                            icon={<IconAlertTriangle size={16} />}
                                                                        />
                                                                    </Tooltip>
                                                                )}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {!isReviewCompleted() && (
                                                                    <>
                                                                        <Tooltip title="Approve">
                                                                            <IconButton
                                                                                color="success"
                                                                                size="small"
                                                                                onClick={() =>
                                                                                    handleActionClick(item, 'approve')
                                                                                }
                                                                            >
                                                                                <IconCheck stroke={1.5} size="1.3rem" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Tooltip title="Reject">
                                                                            <IconButton
                                                                                color="error"
                                                                                size="small"
                                                                                onClick={() =>
                                                                                    handleActionClick(item, 'reject')
                                                                                }
                                                                            >
                                                                                <IconX stroke={1.5} size="1.3rem" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </>
                                                                )}
                                                                <Tooltip title="View Details">
                                                                    <IconButton
                                                                        color="primary"
                                                                        size="small"
                                                                        onClick={() => {
                                                                            // View details functionality
                                                                        }}
                                                                    >
                                                                        <IconEye stroke={1.5} size="1.3rem" />
                                                                    </IconButton>
                                                                </Tooltip>
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
                                    count={filteredItems.filter(item => item.status === 'pending').length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />
                            </TabPanel>

                            <TabPanel value={tabValue} index={2}>
                                {/* Risky items tab */}
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>User</TableCell>
                                                <TableCell>Type</TableCell>
                                                <TableCell>Details</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Risk Reason</TableCell>
                                                <TableCell align="center">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredItems.filter(item => item.isRisky).length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center">
                                                        <Typography variant="body1">No risky items found</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredItems
                                                    .filter(item => item.isRisky)
                                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                    .map((item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell>{item.userId}</TableCell>
                                                            <TableCell>{formatStatusLabel(item.type)}</TableCell>
                                                            <TableCell>
                                                                {item.type === 'user_role' && (
                                                                    <Typography variant="body2">
                                                                        Role: {item.metadata?.roleName || item.roleId}
                                                                    </Typography>
                                                                )}
                                                                {item.type === 'resource_permission' && (
                                                                    <Typography variant="body2">
                                                                        {item.resourceType}: {item.permission}
                                                                    </Typography>
                                                                )}
                                                                {item.type === 'dormant_account' && (
                                                                    <Typography variant="body2">
                                                                        Last login:{' '}
                                                                        {item.metadata?.lastLogin
                                                                            ? new Date(
                                                                                  item.metadata.lastLogin
                                                                              ).toLocaleDateString()
                                                                            : 'Never'}
                                                                    </Typography>
                                                                )}
                                                                {item.type === 'excessive_permission' && (
                                                                    <Typography variant="body2">
                                                                        {item.metadata?.roleCount} roles assigned
                                                                    </Typography>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={formatStatusLabel(item.status)}
                                                                    sx={getStatusChipColor(item.status)}
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2" color="error">
                                                                    {item.riskReason || 'High risk item'}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {!isReviewCompleted() && item.status === 'pending' && (
                                                                    <>
                                                                        <Tooltip title="Approve">
                                                                            <IconButton
                                                                                color="success"
                                                                                size="small"
                                                                                onClick={() =>
                                                                                    handleActionClick(item, 'approve')
                                                                                }
                                                                            >
                                                                                <IconCheck stroke={1.5} size="1.3rem" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Tooltip title="Reject">
                                                                            <IconButton
                                                                                color="error"
                                                                                size="small"
                                                                                onClick={() =>
                                                                                    handleActionClick(item, 'reject')
                                                                                }
                                                                            >
                                                                                <IconX stroke={1.5} size="1.3rem" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </>
                                                                )}
                                                                <Tooltip title="View Details">
                                                                    <IconButton
                                                                        color="primary"
                                                                        size="small"
                                                                        onClick={() => {
                                                                            // View details functionality
                                                                        }}
                                                                    >
                                                                        <IconEye stroke={1.5} size="1.3rem" />
                                                                    </IconButton>
                                                                </Tooltip>
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
                                    count={filteredItems.filter(item => item.isRisky).length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />
                            </TabPanel>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Action Dialog */}
            {selectedItem && (
                <ReviewActionDialog
                    open={actionDialogOpen}
                    onClose={handleActionDialogClose}
                    item={selectedItem}
                    actionType={actionType}
                    onSubmit={handleActionSubmit}
                    submitting={submitting}
                />
            )}

            {/* Complete Review Confirmation Dialog */}
            <ConfirmDialog
                open={completeDialogOpen}
                title="Complete Access Review"
                content="Are you sure you want to complete this access review? This will mark the review as completed and no further changes will be allowed."
                onConfirm={handleCompleteConfirm}
                onCancel={handleCompleteCancel}
                confirmButtonText="Complete Review"
                confirmButtonProps={{ color: 'success' }}
            />
        </MainCard>
    )
}

export default AccessReviewDetail