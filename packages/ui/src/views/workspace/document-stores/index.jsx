import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '@/contexts/AuthContext'

// material-ui
import {
    Box,
    Paper,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import DocumentStoreCard from '@/ui-component/cards/DocumentStoreCard'
import { StyledButton } from '@/ui-component/button/StyledButton'
import AddDocStoreDialog from '@/views/docstore/AddDocStoreDialog'
import ErrorBoundary from '@/ErrorBoundary'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import DocumentStoreStatus from '@/views/docstore/DocumentStoreStatus'

// API
import useApi from '@/hooks/useApi'
import workspaceDocumentsApi from '@/api/workspace/documentstore'

// icons
import { IconPlus, IconLayoutGrid, IconList } from '@tabler/icons-react'
import doc_store_empty from '@/assets/images/doc_store_empty.svg'

// const
import { baseURL, gridSpacing } from '@/store/constant'

// ==============================|| WORKSPACE DOCUMENT STORES ||============================== //

const WorkspaceDocumentStores = () => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const { workspaceId } = useParams()
    const { currentWorkspace } = useAuth()
    
    const navigate = useNavigate()
    const getAllDocumentStores = useApi(() => workspaceDocumentsApi.getAllDocumentStores(workspaceId))

    const [documentStores, setDocumentStores] = useState([])
    const [openAddDialog, setOpenAddDialog] = useState(false)
    const [viewType, setViewType] = useState('grid')
    const [search, setSearch] = useState('')

    // Get all available document stores on load
    useEffect(() => {
        getAllDocumentStores.request()
    }, [workspaceId])

    // Set document stores in state when API call is complete
    useEffect(() => {
        if (getAllDocumentStores.data) {
            setDocumentStores(getAllDocumentStores.data)
        }
    }, [getAllDocumentStores.data])

    const onSearchChange = (event) => {
        setSearch(event.target.value)
    }

    const handleViewTypeChange = (event, nextView) => {
        if (nextView !== null) {
            setViewType(nextView)
        }
    }

    const onDocumentStoreClick = (id) => {
        navigate(`/workspaces/${workspaceId}/document-stores/${id}`)
    }

    const handleAddDocStoreSuccess = () => {
        setOpenAddDialog(false)
        getAllDocumentStores.request()
    }

    return (
        <MainCard>
            <ErrorBoundary>
                <Box>
                    <ViewHeader
                        title={`${currentWorkspace?.name || 'Workspace'} Document Stores`}
                        onSearchChange={onSearchChange}
                        search={true}
                        searchPlaceholder="Search Document Store"
                    />

                    <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 3, mt: 1, ml: 1 }}>
                        <StyledButton variant="contained" startIcon={<IconPlus />} onClick={() => setOpenAddDialog(true)}>
                            Add Document Store
                        </StyledButton>
                        <ToggleButtonGroup size="small" value={viewType} exclusive onChange={handleViewTypeChange}>
                            <ToggleButton value="grid">
                                <IconLayoutGrid />
                            </ToggleButton>
                            <ToggleButton value="list">
                                <IconList />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>

                    <Box>
                        {getAllDocumentStores.loading ? (
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
                                {documentStores.length === 0 ? (
                                    <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection="column">
                                        <Box sx={{ p: 2, height: 'auto' }}>
                                            <img
                                                style={{ objectFit: 'cover', height: '30vh', width: 'auto' }}
                                                src={doc_store_empty}
                                                alt="Document stores empty"
                                            />
                                        </Box>
                                        <Typography variant="h5">No Document Stores Created</Typography>
                                    </Stack>
                                ) : (
                                    <>
                                        {/* Grid view */}
                                        {viewType === 'grid' && (
                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gap: 2,
                                                    gridTemplateColumns: {
                                                        xs: 'repeat(1, 1fr)',
                                                        sm: 'repeat(2, 1fr)',
                                                        md: 'repeat(3, 1fr)',
                                                        lg: 'repeat(4, 1fr)'
                                                    }
                                                }}
                                            >
                                                {documentStores
                                                    .filter((doc) => doc.name.toLowerCase().includes(search.toLowerCase()))
                                                    .map((doc) => (
                                                        <DocumentStoreCard
                                                            key={doc.id}
                                                            docStore={doc}
                                                            onClick={() => onDocumentStoreClick(doc.id)}
                                                        />
                                                    ))}
                                            </Box>
                                        )}

                                        {/* List view */}
                                        {viewType === 'list' && (
                                            <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 340px)' }}>
                                                <Table sx={{ minWidth: 650 }} aria-label="document store list">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Name</TableCell>
                                                            <TableCell>Description</TableCell>
                                                            <TableCell>Status</TableCell>
                                                            <TableCell>Created</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {documentStores
                                                            .filter((doc) => doc.name.toLowerCase().includes(search.toLowerCase()))
                                                            .map((doc) => (
                                                                <TableRow
                                                                    hover
                                                                    key={doc.id}
                                                                    sx={{
                                                                        '&:last-child td, &:last-child th': { border: 0 },
                                                                        cursor: 'pointer'
                                                                    }}
                                                                    onClick={() => onDocumentStoreClick(doc.id)}
                                                                >
                                                                    <TableCell component="th" scope="row">
                                                                        {doc.name}
                                                                    </TableCell>
                                                                    <TableCell>{doc.description}</TableCell>
                                                                    <TableCell>
                                                                        <DocumentStoreStatus status={doc.status} />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {new Date(doc.createdAt).toLocaleDateString()}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </Box>

                    <AddDocStoreDialog
                        open={openAddDialog}
                        onCancel={() => setOpenAddDialog(false)}
                        onSuccess={handleAddDocStoreSuccess}
                        workspaceId={workspaceId}
                    />
                </Box>
            </ErrorBoundary>
        </MainCard>
    )
}

export default WorkspaceDocumentStores
