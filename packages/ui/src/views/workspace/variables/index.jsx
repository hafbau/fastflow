import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'
import moment from 'moment'

// material-ui
import { styled } from '@mui/material/styles'
import { tableCellClasses } from '@mui/material/TableCell'
import {
    Button,
    Box,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    useTheme
} from '@mui/material'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import { StyledButton } from '@/ui-component/button/StyledButton'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import AddEditVariableDialog from '@/views/variables/AddEditVariableDialog'
import HowToUseVariablesDialog from '@/views/variables/HowToUseVariablesDialog'

// API
import workspaceVariablesApi from '@/api/workspace/variables'
import { useAuth } from '@/contexts/AuthContext'

// Hooks
import useApi from '@/hooks/useApi'
import useConfirm from '@/hooks/useConfirm'

// utils
import useNotifier from '@/utils/useNotifier'

// Icons
import { IconTrash, IconEdit, IconX, IconPlus, IconVariable } from '@tabler/icons-react'
import VariablesEmptySVG from '@/assets/images/variables_empty.svg'

// Layout
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import ErrorBoundary from '@/ErrorBoundary'

// ==============================|| WORKSPACE VARIABLES ||============================== //

// Styled component for table
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14
    }
}))

// Styled component for table row
const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0
    }
}))

const WorkspaceVariables = () => {
    const { workspaceId } = useParams()
    const { currentWorkspace } = useAuth()
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const [variables, setVariables] = useState([])
    const [variableId, setVariableId] = useState('')
    const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)
    const [showVariableDialog, setShowVariableDialog] = useState(false)
    const [showHowToUseDialog, setShowHowToUseDialog] = useState(false)
    const [dialogProps, setDialogProps] = useState({})
    const [search, setSearch] = useState('')

    const dispatch = useDispatch()

    // Get variables
    const getAllVariablesApi = useApi(() => workspaceVariablesApi.getAllVariables(workspaceId))
    const deleteVariableApi = useApi((id) => workspaceVariablesApi.deleteVariable(workspaceId, id))

    useNotifier()

    const { confirm } = useConfirm()

    const onSearchChange = (event) => {
        setSearch(event.target.value)
    }

    const getAllVariables = () => {
        getAllVariablesApi.request()
    }

    const onVariableDelete = (variableId) => {
        setVariableId(variableId)
        setShowDeleteConfirmDialog(true)
    }

    const deleteVariable = () => {
        deleteVariableApi.request(variableId)
    }

    const handleDeleteClose = () => {
        setShowDeleteConfirmDialog(false)
        setVariableId('')
    }

    function filterVariables(variable) {
        return variable.key.toLowerCase().indexOf(search.toLowerCase()) > -1
    }

    const onAddNewVariable = () => {
        setDialogProps({
            title: 'Add New Variable',
            type: 'ADD',
            workspaceId: workspaceId
        })
        setShowVariableDialog(true)
    }

    const onEditVariable = (variable) => {
        setDialogProps({
            title: 'Edit Variable',
            type: 'EDIT',
            data: variable,
            workspaceId: workspaceId
        })
        setShowVariableDialog(true)
    }

    const onShowHowToUse = () => {
        setShowHowToUseDialog(true)
    }

    // Get all available variables on load
    useEffect(() => {
        getAllVariables()
    }, [workspaceId])

    // Set variables in state when API call is complete
    useEffect(() => {
        setVariables(getAllVariablesApi.data)
    }, [getAllVariablesApi.data])

    // When delete is complete, refresh variables
    useEffect(() => {
        if (deleteVariableApi.data) {
            handleDeleteClose()
            enqueueSnackbarAction({
                message: 'Variable deleted',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'success',
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbarAction(key)}>
                            <IconX />
                        </Button>
                    )
                }
            })
            getAllVariables()
        }
    }, [deleteVariableApi.data])

    // Handle variables API error
    useEffect(() => {
        if (deleteVariableApi.error) {
            handleDeleteClose()
            enqueueSnackbarAction({
                message: `Error deleting variable: ${deleteVariableApi.error.response.data}`,
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error',
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbarAction(key)}>
                            <IconX />
                        </Button>
                    )
                }
            })
        }
    }, [deleteVariableApi.error])

    return (
        <Box>
            <MainCard>
                <ErrorBoundary>
                    <Box>
                        <ViewHeader
                            onSearchChange={onSearchChange}
                            search={true}
                            searchPlaceholder="Search Variable"
                            title={`${currentWorkspace?.name || 'Workspace'} Variables`}
                        />
                        <Stack direction="row" spacing={2} justifyContent="left" alignItems="center" sx={{ mb: 3, mt: 1, ml: 1 }}>
                            <StyledButton variant="contained" onClick={onAddNewVariable} startIcon={<IconPlus />}>
                                Add Variable
                            </StyledButton>
                            <StyledButton variant="outlined" onClick={onShowHowToUse} startIcon={<IconVariable />}>
                                How to use
                            </StyledButton>
                        </Stack>

                        <Box sx={{ position: 'relative' }}>
                            {getAllVariablesApi.loading ? (
                                <Box sx={{ mt: 2 }}>
                                    <Stack direction="row" spacing={2} alignItems="stretch">
                                        <Skeleton animation="wave" width="100%" height={50} sx={{ mb: 1, mt: 1 }} />
                                    </Stack>
                                    <Stack direction="row" spacing={2} alignItems="stretch">
                                        <Skeleton animation="wave" width="100%" height={50} sx={{ mb: 1, mt: 1 }} />
                                    </Stack>
                                    <Stack direction="row" spacing={2} alignItems="stretch">
                                        <Skeleton animation="wave" width="100%" height={50} sx={{ mb: 1, mt: 1 }} />
                                    </Stack>
                                </Box>
                            ) : (
                                <>
                                    {!variables || variables.length === 0 ? (
                                        <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection="column">
                                            <Box sx={{ p: 2, height: 'auto', marginTop: 2 }}>
                                                <img
                                                    style={{ objectFit: 'cover', height: '30vh', width: 'auto' }}
                                                    src={VariablesEmptySVG}
                                                    alt="No variables yet"
                                                />
                                            </Box>
                                            <div>No Variables Yet</div>
                                        </Stack>
                                    ) : (
                                        <TableContainer component={Paper} sx={{ width: '100%', mb: 2, mt: 3 }}>
                                            <Table sx={{ minWidth: 350 }} aria-label="Variables table">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Name</TableCell>
                                                        <TableCell>Type</TableCell>
                                                        <TableCell>Value</TableCell>
                                                        <TableCell>Created At</TableCell>
                                                        <TableCell>Actions</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {variables
                                                        .filter(filterVariables)
                                                        .map((variable) => (
                                                            <StyledTableRow key={variable.id}>
                                                                <TableCell component="th" scope="row">
                                                                    {variable.key}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={
                                                                            variable.type.charAt(0).toUpperCase() + variable.type.slice(1)
                                                                        }
                                                                        size="small"
                                                                        sx={{
                                                                            bgcolor:
                                                                                variable.type === 'string'
                                                                                    ? '#6e9bf7'
                                                                                    : variable.type === 'number'
                                                                                    ? '#f7cf6e'
                                                                                    : variable.type === 'boolean'
                                                                                    ? '#f76e6e'
                                                                                    : variable.type === 'secret'
                                                                                    ? '#6ef7a0'
                                                                                    : variable.type === 'json'
                                                                                    ? '#f76ec2'
                                                                                    : theme.palette.primary.main,
                                                                            color: '#ffffff'
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    {variable.type === 'secret'
                                                                        ? '••••••••'
                                                                        : variable.type === 'boolean'
                                                                        ? variable.value.toString()
                                                                        : variable.type === 'json'
                                                                        ? JSON.stringify(variable.value).substring(0, 50) +
                                                                          (JSON.stringify(variable.value).length > 50 ? '...' : '')
                                                                        : String(variable.value).substring(0, 50) +
                                                                          (String(variable.value).length > 50 ? '...' : '')}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {moment(variable.createdAt).format('YYYY/MM/DD kk:mm')}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Stack direction="row" spacing={2}>
                                                                        <IconButton
                                                                            size="small"
                                                                            aria-label="edit"
                                                                            color="primary"
                                                                            onClick={() => onEditVariable(variable)}
                                                                        >
                                                                            <IconEdit />
                                                                        </IconButton>
                                                                        <IconButton
                                                                            size="small"
                                                                            aria-label="delete"
                                                                            color="error"
                                                                            onClick={() => onVariableDelete(variable.id)}
                                                                        >
                                                                            <IconTrash />
                                                                        </IconButton>
                                                                    </Stack>
                                                                </TableCell>
                                                            </StyledTableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                </>
                            )}
                        </Box>
                    </Box>
                </ErrorBoundary>
            </MainCard>

            <AddEditVariableDialog
                show={showVariableDialog}
                dialogProps={dialogProps}
                onCancel={() => setShowVariableDialog(false)}
                onConfirm={() => {
                    setShowVariableDialog(false)
                    getAllVariables()
                }}
            ></AddEditVariableDialog>

            <HowToUseVariablesDialog show={showHowToUseDialog} onCancel={() => setShowHowToUseDialog(false)}></HowToUseVariablesDialog>

            <ConfirmDialog
                open={showDeleteConfirmDialog}
                title="Delete Variable"
                contentText="Are you sure you want to delete variable?"
                onCancel={handleDeleteClose}
                onConfirm={deleteVariable}
                confirmButtonText="Delete"
            />
        </Box>
    )
}

export default WorkspaceVariables
