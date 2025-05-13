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
    useTheme
} from '@mui/material'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import { StyledButton } from '@/ui-component/button/StyledButton'
import CredentialListDialog from '@/views/credentials/CredentialListDialog'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import AddEditCredentialDialog from '@/views/credentials/AddEditCredentialDialog'

// API
import workspaceCredentialsApi from '@/api/workspace/credentials'
import { useAuth } from '@/contexts/AuthContext'

// Hooks
import useApi from '@/hooks/useApi'
import useConfirm from '@/hooks/useConfirm'

// utils
import useNotifier from '@/utils/useNotifier'

// Icons
import { IconTrash, IconEdit, IconX, IconPlus } from '@tabler/icons-react'
import CredentialEmptySVG from '@/assets/images/credential_empty.svg'

// const
import { baseURL } from '@/store/constant'
import { SET_COMPONENT_CREDENTIALS } from '@/store/actions'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import ErrorBoundary from '@/ErrorBoundary'

// ==============================|| WORKSPACE CREDENTIALS ||============================== //

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

const WorkspaceCredentials = () => {
    const { workspaceId } = useParams()
    const { currentWorkspace } = useAuth()
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const [credentials, setCredentials] = useState([])
    const [credentialId, setCredentialId] = useState('')
    const [credential, setCredential] = useState({})
    const [showCredentialListDialog, setShowCredentialListDialog] = useState(false)
    const [showSpecificCredentialDialog, setShowSpecificCredentialDialog] = useState(false)
    const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)
    const [dialogProps, setDialogProps] = useState({})
    const [search, setSearch] = useState('')

    const dispatch = useDispatch()

    // Force a rerender
    const [, forceRerender] = useState()

    // Get credentials
    const getAllCredentialsApi = useApi(() => workspaceCredentialsApi.getAllCredentials(workspaceId))
    const getAllComponentsCredentialsApi = useApi(() => workspaceCredentialsApi.getAllComponentsCredentials(workspaceId))
    const getCredentialApi = useApi((id) => workspaceCredentialsApi.getSpecificCredential(workspaceId, id))
    const deleteCredentialApi = useApi((id) => workspaceCredentialsApi.deleteCredential(workspaceId, id))

    useNotifier()

    const { confirm } = useConfirm()

    const onSearchChange = (event) => {
        setSearch(event.target.value)
    }

    const getAllCredentials = () => {
        getAllCredentialsApi.request()
    }

    const getAllComponentsCredentials = () => {
        getAllComponentsCredentialsApi.request()
    }

    const onCredentialDelete = (credentialId) => {
        setCredentialId(credentialId)
        setShowDeleteConfirmDialog(true)
    }

    const deleteCredential = () => {
        deleteCredentialApi.request(credentialId)
    }

    const handleDeleteClose = () => {
        setShowDeleteConfirmDialog(false)
        setCredentialId('')
    }

    const getSpecificCredential = async (credentialName) => {
        try {
            const res = await workspaceCredentialsApi.getSpecificComponentCredential(workspaceId, credentialName)
            setCredential(res.data)
            setShowCredentialListDialog(false)
            setShowSpecificCredentialDialog(true)
        } catch (error) {
            const errorData = error.response.data || `${error.response.status}: ${error.response.statusText}`
            enqueueSnackbarAction({
                message: `Error getting credential: ${errorData}`,
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
    }

    function filterCredentials(cred) {
        return cred.name.toLowerCase().indexOf(search.toLowerCase()) > -1
    }

    const onAddNewCredential = () => {
        setDialogProps({
            title: 'Add New Credential',
            workspaceId: workspaceId,
            type: 'ADD'
        })
        setShowCredentialListDialog(true)
    }

    const onEditCredential = (credential) => {
        setDialogProps({
            title: 'Edit Credential',
            workspaceId: workspaceId,
            credentialId: credential.id,
            data: credential,
            type: 'EDIT'
        })
        setShowSpecificCredentialDialog(true)
    }

    // Get all available credentials on load
    useEffect(() => {
        getAllCredentials()
        getAllComponentsCredentials()
    }, [workspaceId])

    // Set credentials in state when API call is complete
    useEffect(() => {
        setCredentials(getAllCredentialsApi.data)
    }, [getAllCredentialsApi.data])

    // Set component credentials in redux state
    useEffect(() => {
        if (getAllComponentsCredentialsApi.data) {
            dispatch({
                type: SET_COMPONENT_CREDENTIALS,
                componentCredentials: getAllComponentsCredentialsApi.data
            })
        }
    }, [getAllComponentsCredentialsApi.data])

    // When delete is complete, refresh credentials
    useEffect(() => {
        if (deleteCredentialApi.data) {
            handleDeleteClose()
            enqueueSnackbarAction({
                message: 'Credential deleted',
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
            getAllCredentials()
        }
    }, [deleteCredentialApi.data])

    // Handle credentials API error
    useEffect(() => {
        if (deleteCredentialApi.error) {
            handleDeleteClose()
            enqueueSnackbarAction({
                message: `Error deleting credential: ${deleteCredentialApi.error.response.data}`,
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
    }, [deleteCredentialApi.error])

    return (
        <Box>
            <MainCard>
                <ErrorBoundary>
                    <Box>
                        <ViewHeader 
                            onSearchChange={onSearchChange} 
                            search={true} 
                            searchPlaceholder='Search Credential'
                            title={`${currentWorkspace?.name || 'Workspace'} Credentials`}
                        />
                        <Stack direction='row' spacing={2} justifyContent='left' alignItems='center' sx={{ mb: 3, mt: 1, ml: 1 }}>
                            <StyledButton variant='contained' onClick={onAddNewCredential} startIcon={<IconPlus />}>
                                Add Credential
                            </StyledButton>
                        </Stack>

                        <Box sx={{ position: 'relative' }}>
                            {getAllCredentialsApi.loading ? (
                                <Box sx={{ mt: 2 }}>
                                    <Stack direction='row' spacing={2} alignItems='stretch'>
                                        <Skeleton animation='wave' width='100%' height={50} sx={{ mb: 1, mt: 1 }} />
                                    </Stack>
                                    <Stack direction='row' spacing={2} alignItems='stretch'>
                                        <Skeleton animation='wave' width='100%' height={50} sx={{ mb: 1, mt: 1 }} />
                                    </Stack>
                                    <Stack direction='row' spacing={2} alignItems='stretch'>
                                        <Skeleton animation='wave' width='100%' height={50} sx={{ mb: 1, mt: 1 }} />
                                    </Stack>
                                </Box>
                            ) : (
                                <>
                                    {!credentials || credentials.length === 0 ? (
                                        <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                                            <Box sx={{ p: 2, height: 'auto', marginTop: 2 }}>
                                                <img style={{ objectFit: 'cover', height: '30vh', width: 'auto' }} src={CredentialEmptySVG} alt='No credentials yet' />
                                            </Box>
                                            <div>No Credentials Yet</div>
                                        </Stack>
                                    ) : (
                                        <TableContainer component={Paper} sx={{ width: '100%', mb: 2, mt: 3 }}>
                                            <Table sx={{ minWidth: 350 }} aria-label='Credentials table'>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Name</TableCell>
                                                        <TableCell>Created At</TableCell>
                                                        <TableCell>Actions</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {credentials
                                                        .filter(filterCredentials)
                                                        .map((cred) => (
                                                            <StyledTableRow key={cred.id}>
                                                                <TableCell component='th' scope='row'>
                                                                    {cred.name}
                                                                </TableCell>
                                                                <TableCell>{moment(cred.createdAt).format('YYYY/MM/DD kk:mm')}</TableCell>
                                                                <TableCell>
                                                                    <Stack direction='row' spacing={2}>
                                                                        <IconButton
                                                                            size='small'
                                                                            aria-label='edit'
                                                                            color='primary'
                                                                            onClick={() => onEditCredential(cred)}
                                                                        >
                                                                            <IconEdit />
                                                                        </IconButton>
                                                                        <IconButton
                                                                            size='small'
                                                                            aria-label='delete'
                                                                            color='error'
                                                                            onClick={() => onCredentialDelete(cred.id)}
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

            <CredentialListDialog
                show={showCredentialListDialog}
                dialogProps={dialogProps}
                onCancel={() => setShowCredentialListDialog(false)}
                onCredentialSelected={(credName) => getSpecificCredential(credName)}
            ></CredentialListDialog>

            <AddEditCredentialDialog
                show={showSpecificCredentialDialog}
                dialogProps={dialogProps}
                credential={credential}
                onCancel={() => setShowSpecificCredentialDialog(false)}
                onConfirm={() => {
                    setShowSpecificCredentialDialog(false)
                    getAllCredentials()
                    forceRerender({})
                }}
            ></AddEditCredentialDialog>

            <ConfirmDialog
                open={showDeleteConfirmDialog}
                title='Delete Credential'
                contentText='Are you sure you want to delete credential?'
                onCancel={handleDeleteClose}
                onConfirm={deleteCredential}
                confirmButtonText='Delete'
            />
        </Box>
    )
}

export default WorkspaceCredentials
