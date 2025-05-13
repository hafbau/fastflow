import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'
import moment from 'moment/moment'

// material-ui
import {
    Button,
    Box,
    Chip,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Popover,
    Collapse,
    Typography
} from '@mui/material'
import TableCell, { tableCellClasses } from '@mui/material/TableCell'
import { useTheme, styled } from '@mui/material/styles'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import { StyledButton } from '@/ui-component/button/StyledButton'
import APIKeyDialog from '@/views/apikey/APIKeyDialog'  // Reuse from original component
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import ErrorBoundary from '@/ErrorBoundary'

// API
import apiKeyApi from '@/api/workspace/apikey'

// Hooks
import useApi from '@/hooks/useApi'
import useConfirm from '@/hooks/useConfirm'

// utils
import useNotifier from '@/utils/useNotifier'

// Icons
import {
    IconTrash,
    IconEdit,
    IconCopy,
    IconEye,
    IconEyeOff,
    IconKey,
    IconDotsVertical,
    IconChevronDown,
    IconChevronUp,
    IconPlus,
    IconDownload,
    IconUpload
} from '@tabler/icons-react'

// const
import { baseURL } from '@/store/constant'

// table styles
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14
    }
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover
    },
    '&:last-child td, &:last-child th': {
        border: 0
    }
}))

// ==============================|| WORKSPACE API KEYS ||============================== //

const WorkspaceAPIKeys = () => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const { workspaceId } = useParams()
    const { currentWorkspace } = useAuth()
    
    const dispatch = useDispatch()
    const [confirm, setConfirm] = useConfirm()

    const [openCreateDialog, setOpenCreateDialog] = useState(false)
    const [dialogProps, setDialogProps] = useState({})
    const [search, setSearch] = useState('')
    const [anchorEl, setAnchorEl] = useState(null)
    const [selectedAPI, setSelectedAPI] = useState(null)
    const [expandedRow, setExpandedRow] = useState(null)
    const [apiKeys, setApiKeys] = useState([])
    const [selectedAPIKeyId, setSelectedAPIKeyId] = useState('')
    const [showAPIKeyValue, setShowAPIKeyValue] = useState({})

    // Custom hook to display snackbars
    useNotifier()

    // API hooks
    const getAllAPIKeys = useApi(() => apiKeyApi.getAllAPIKeys(workspaceId))
    const deleteAPI = useApi((apiKeyId) => apiKeyApi.deleteAPI(workspaceId, apiKeyId))

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const onSearchChange = (event) => {
        setSearch(event.target.value)
    }

    const getAPIKeys = () => {
        getAllAPIKeys.request()
    }

    useEffect(() => {
        getAPIKeys()
    }, [workspaceId])

    useEffect(() => {
        if (!getAllAPIKeys.loading && getAllAPIKeys.data) {
            setApiKeys(getAllAPIKeys.data)
        }
    }, [getAllAPIKeys.data, getAllAPIKeys.loading])

    // Handle menu open and close
    const handleMenuOpen = (event, api) => {
        setAnchorEl(event.currentTarget)
        setSelectedAPI(api)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
        setSelectedAPI(null)
    }

    // Toggle API key visibility
    const toggleShowAPIKey = (apiKeyId) => {
        setShowAPIKeyValue((prev) => ({
            ...prev,
            [apiKeyId]: !prev[apiKeyId]
        }))
    }

    // Copy API key to clipboard
    const copyAPIKey = (apiKey) => {
        navigator.clipboard.writeText(apiKey)
        enqueueSnackbar({
            message: 'API Key copied to clipboard',
            options: {
                key: new Date().getTime() + Math.random(),
                variant: 'success',
                action: (key) => (
                    <Button variant="text" onClick={() => closeSnackbar(key)}>
                        Dismiss
                    </Button>
                )
            }
        })
    }

    // Toggle row expand/collapse for mobile view
    const toggleRowExpand = (id) => {
        if (expandedRow === id) {
            setExpandedRow(null)
        } else {
            setExpandedRow(id)
        }
    }

    // Dialog open handlers
    const handleCreateDialogOpen = () => {
        setDialogProps({
            type: 'CREATE'
        })
        setOpenCreateDialog(true)
    }

    const handleEditAPI = () => {
        setDialogProps({
            type: 'EDIT',
            apiKey: selectedAPI
        })
        setOpenCreateDialog(true)
        handleMenuClose()
    }

    // Handle delete confirmation
    const handleDeleteAPI = () => {
        setSelectedAPIKeyId(selectedAPI.id)
        setConfirm({
            open: true,
            title: 'Delete API Key',
            description: 'Are you sure you want to delete this API key? This action cannot be undone.',
            confirmButtonName: 'Delete',
            cancelButtonName: 'Cancel'
        })
        handleMenuClose()
    }

    // Actual delete after confirmation
    const onConfirmDeleteAPI = () => {
        deleteAPI.request(selectedAPIKeyId)

        enqueueSnackbar({
            message: 'API Key deleted successfully!',
            options: {
                key: new Date().getTime() + Math.random(),
                variant: 'success',
                action: (key) => (
                    <Button variant="text" onClick={() => closeSnackbar(key)}>
                        Dismiss
                    </Button>
                )
            }
        })

        // Refresh the API key list
        getAPIKeys()
    }

    // Handle dialog close and success
    const handleCreateDialogClose = () => {
        setOpenCreateDialog(false)
    }

    const handleCreateDialogSuccess = () => {
        setOpenCreateDialog(false)
        getAPIKeys()
    }

    return (
        <MainCard>
            <ErrorBoundary>
                <Box>
                    <ViewHeader
                        title={`${currentWorkspace?.name || 'Workspace'} API Keys`}
                        onSearchChange={onSearchChange}
                        search={true}
                        searchPlaceholder="Search API Key"
                    />

                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, mt: 1, ml: 1 }}>
                        <StyledButton
                            variant="contained"
                            onClick={handleCreateDialogOpen}
                            startIcon={<IconPlus />}
                        >
                            Create API Key
                        </StyledButton>
                    </Stack>

                    {getAllAPIKeys.loading ? (
                        <Box sx={{ mt: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="stretch">
                                <Skeleton animation="wave" width="100%" height={100} sx={{ mb: 1, mt: 1 }} />
                            </Stack>
                            <Stack direction="row" spacing={2} alignItems="stretch">
                                <Skeleton animation="wave" width="100%" height={100} sx={{ mb: 1, mt: 1 }} />
                            </Stack>
                            <Stack direction="row" spacing={2} alignItems="stretch">
                                <Skeleton animation="wave" width="100%" height={100} sx={{ mb: 1, mt: 1 }} />
                            </Stack>
                        </Box>
                    ) : (
                        <>
                            {apiKeys && apiKeys.length > 0 ? (
                                <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 340px)', overflow: 'auto' }}>
                                    <Table aria-label="API Key table" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>API Key</TableCell>
                                                <TableCell>Created At</TableCell>
                                                <TableCell>Last Used</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {apiKeys
                                                .filter(
                                                    (apiKey) =>
                                                        apiKey.keyName.toLowerCase().includes(search.toLowerCase()) ||
                                                        apiKey.id.toLowerCase().includes(search.toLowerCase())
                                                )
                                                .map((apiKey) => (
                                                    <StyledTableRow key={apiKey.id}>
                                                        <TableCell>{apiKey.keyName}</TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Typography
                                                                    sx={{
                                                                        fontFamily: 'monospace',
                                                                        fontSize: '0.85rem',
                                                                        maxWidth: '250px',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                >
                                                                    {showAPIKeyValue[apiKey.id] ? apiKey.apiKey : '••••••••••••••••••••••••••••••••'}
                                                                </Typography>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => toggleShowAPIKey(apiKey.id)}
                                                                    edge="end"
                                                                    aria-label="toggle key visibility"
                                                                >
                                                                    {showAPIKeyValue[apiKey.id] ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => copyAPIKey(apiKey.apiKey)}
                                                                    edge="end"
                                                                    aria-label="copy key"
                                                                >
                                                                    <IconCopy size={16} />
                                                                </IconButton>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell>{moment(apiKey.createdAt).format('YYYY-MM-DD HH:mm')}</TableCell>
                                                        <TableCell>
                                                            {apiKey.lastUsed ? moment(apiKey.lastUsed).format('YYYY-MM-DD HH:mm') : 'Never used'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <IconButton
                                                                aria-label="API key actions"
                                                                aria-controls="api-key-actions-menu"
                                                                aria-haspopup="true"
                                                                onClick={(event) => handleMenuOpen(event, apiKey)}
                                                            >
                                                                <IconDotsVertical />
                                                            </IconButton>
                                                        </TableCell>
                                                    </StyledTableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Stack spacing={1} justifyContent="center" alignItems="center" sx={{ py: 3 }}>
                                    <IconKey size={48} color={theme.palette.primary.main} />
                                    <Typography variant="h5">No API Keys Found</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Create an API key to access the API programmatically
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<IconPlus />}
                                        onClick={handleCreateDialogOpen}
                                        sx={{ mt: 2 }}
                                    >
                                        Create API Key
                                    </Button>
                                </Stack>
                            )}
                        </>
                    )}

                    {/* API Key Actions Menu */}
                    <Popover
                        id="api-key-actions-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right'
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right'
                        }}
                    >
                        <Stack spacing={1} sx={{ p: 1 }}>
                            <Button startIcon={<IconEdit />} onClick={handleEditAPI} fullWidth>
                                Edit
                            </Button>
                            <Button startIcon={<IconTrash />} onClick={handleDeleteAPI} color="error" fullWidth>
                                Delete
                            </Button>
                        </Stack>
                    </Popover>

                    {/* Create/Edit API Key Dialog */}
                    <APIKeyDialog
                        open={openCreateDialog}
                        onClose={handleCreateDialogClose}
                        onSuccess={handleCreateDialogSuccess}
                        dialogProps={dialogProps}
                        workspaceId={workspaceId}
                    />

                    {/* Confirm dialog for deletion */}
                    <ConfirmDialog
                        open={confirm.open}
                        title={confirm.title}
                        description={confirm.description}
                        onConfirm={onConfirmDeleteAPI}
                        onCancel={() => setConfirm({ ...confirm, open: false })}
                        confirmButtonName={confirm.confirmButtonName}
                        cancelButtonName={confirm.cancelButtonName}
                    />
                </Box>
            </ErrorBoundary>
        </MainCard>
    )
}

export default WorkspaceAPIKeys
