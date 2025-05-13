import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'

// material-ui
import { Box, Stack, Button, ButtonGroup, Skeleton, ToggleButtonGroup, ToggleButton } from '@mui/material'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import ItemCard from '@/ui-component/cards/ItemCard'
import { gridSpacing } from '@/store/constant'
import ToolEmptySVG from '@/assets/images/tools_empty.svg'
import { StyledButton } from '@/ui-component/button/StyledButton'
import ToolDialog from '@/views/tools/ToolDialog' // Reuse the existing ToolDialog component
import { ToolsTable } from '@/ui-component/table/ToolsListTable'

// API
import workspaceToolsApi from '@/api/workspace/tools'
import { useAuth } from '@/contexts/AuthContext'

// Hooks
import useApi from '@/hooks/useApi'

// icons
import { IconPlus, IconFileUpload, IconLayoutGrid, IconList } from '@tabler/icons-react'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import ErrorBoundary from '@/ErrorBoundary'
import { useTheme } from '@mui/material/styles'

// ==============================|| WORKSPACE TOOLS ||============================== //

const WorkspaceTools = () => {
    const theme = useTheme()
    const { workspaceId } = useParams()
    const { currentWorkspace } = useAuth()
    
    // Use workspace-scoped API method
    const getAllToolsApi = useApi(() => workspaceToolsApi.getAllTools(workspaceId))

    const [isLoading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showDialog, setShowDialog] = useState(false)
    const [dialogProps, setDialogProps] = useState({})
    const [view, setView] = useState(localStorage.getItem('toolsDisplayStyle') || 'card')
    const [search, setSearch] = useState('')

    const inputRef = useRef(null)

    const handleChange = (event, nextView) => {
        if (nextView === null) return
        localStorage.setItem('toolsDisplayStyle', nextView)
        setView(nextView)
    }

    const onUploadFile = (file) => {
        try {
            const dialogProp = {
                title: 'Add New Tool',
                type: 'IMPORT',
                workspaceId: workspaceId, // Add workspaceId for workspace context
                cancelButtonName: 'Cancel',
                confirmButtonName: 'Add',
                data: file
            }
            setDialogProps(dialogProp)
            setShowDialog(true)
        } catch (e) {
            console.error(e)
        }
    }

    const onNewTool = () => {
        const dialogProp = {
            title: 'Add New Tool',
            type: 'NEW',
            workspaceId: workspaceId, // Add workspaceId for workspace context
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Add'
        }
        setDialogProps(dialogProp)
        setShowDialog(true)
    }

    const onConfigureTool = (selectedTool) => {
        const dialogProp = {
            title: 'Configure Tool',
            type: 'EDIT',
            workspaceId: workspaceId, // Add workspaceId for workspace context
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Update',
            data: selectedTool
        }
        setDialogProps(dialogProp)
        setShowDialog(true)
    }

    const onDuplicateTool = (selectedTool) => {
        const dialogProp = {
            title: 'Duplicate Tool',
            type: 'DUPLICATE',
            workspaceId: workspaceId, // Add workspaceId for workspace context
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Duplicate',
            data: selectedTool
        }
        setDialogProps(dialogProp)
        setShowDialog(true)
    }

    const onSearchChange = (event) => {
        setSearch(event.target.value)
    }

    const handleImportFromFile = () => {
        if (!inputRef.current) return
        inputRef.current.click()
    }

    const reloadTools = () => {
        getAllToolsApi.request()
    }

    function filterTools(data) {
        return data.name.toLowerCase().indexOf(search.toLowerCase()) > -1
    }

    useEffect(() => {
        // Fetch tools data for this workspace
        getAllToolsApi.request()
    }, [workspaceId])

    useEffect(() => {
        if (getAllToolsApi.data) {
            setLoading(false)
        }
    }, [getAllToolsApi.data])

    return (
        <Box>
            <input
                type='file'
                id='file'
                ref={inputRef}
                style={{ display: 'none' }}
                onChange={(e) => {
                    const file = e.target.files[0]
                    onUploadFile(file)
                    e.target.value = null
                }}
                accept='.json'
            />
            <MainCard>
                {(getAllToolsApi.error || error) && (
                    <Box sx={{ p: 2 }}>
                        <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                            <Box sx={{ p: 2, height: 'auto' }}>
                                <img
                                    style={{ objectFit: 'cover', height: '25vh', width: 'auto' }}
                                    src={ToolEmptySVG}
                                    alt='ToolEmptySVG'
                                />
                            </Box>
                            <div>
                                {getAllToolsApi.error?.response
                                    ? `Error: ${JSON.stringify(getAllToolsApi.error?.response?.data)}`
                                    : error?.response
                                    ? `Error: ${JSON.stringify(error?.response?.data)}`
                                    : 'Unknown error'}
                            </div>
                        </Stack>
                    </Box>
                )}
                {!(getAllToolsApi.error || error) && (
                    <Box>
                        <Stack direction='row' alignItems='center'>
                            <ViewHeader 
                                onSearchChange={onSearchChange} 
                                search={true} 
                                searchPlaceholder='Search Tool'
                                title={`${currentWorkspace?.name || 'Workspace'} Tools`}
                            >
                                <ToggleButtonGroup
                                    sx={{ borderRadius: 2, height: '100%' }}
                                    value={view}
                                    color='primary'
                                    exclusive
                                    onChange={handleChange}
                                >
                                    <ToggleButton
                                        sx={{
                                            borderColor: theme.palette.grey[900] + 25,
                                            borderRadius: 2,
                                            color: theme?.customization?.isDarkMode ? 'white' : 'inherit'
                                        }}
                                        variant='contained'
                                        value='card'
                                        title='Card View'
                                    >
                                        <IconLayoutGrid />
                                    </ToggleButton>
                                    <ToggleButton
                                        sx={{
                                            borderColor: theme.palette.grey[900] + 25,
                                            borderRadius: 2,
                                            color: theme?.customization?.isDarkMode ? 'white' : 'inherit'
                                        }}
                                        variant='contained'
                                        value='list'
                                        title='List View'
                                    >
                                        <IconList />
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </ViewHeader>
                        </Stack>
                        <Stack spacing={2} direction='row' mt={1} mb={2} ml={1}>
                            <ButtonGroup variant='outlined' aria-label='outlined primary button group'>
                                <StyledButton onClick={onNewTool} startIcon={<IconPlus size='1.15rem' />}>
                                    New
                                </StyledButton>
                                <StyledButton onClick={handleImportFromFile} startIcon={<IconFileUpload size='1.15rem' />}>
                                    Import
                                </StyledButton>
                            </ButtonGroup>
                        </Stack>
                        <ErrorBoundary>
                            {!view || view === 'card' ? (
                                <Box>
                                    {isLoading ? (
                                        <Box display='grid' gridTemplateColumns='repeat(3, 1fr)' gap={gridSpacing} sx={{ mt: 2, ml: 1 }}>
                                            <Skeleton variant='rounded' height={160} />
                                            <Skeleton variant='rounded' height={160} />
                                            <Skeleton variant='rounded' height={160} />
                                        </Box>
                                    ) : (
                                        <Box display='grid' gridTemplateColumns='repeat(3, 1fr)' gap={gridSpacing} sx={{ mt: 2, ml: 1, pr: 1 }}>
                                            {getAllToolsApi.data
                                                ?.filter(filterTools)
                                                .map((data) => (
                                                    <ItemCard key={data.id} data={data} onClick={() => onConfigureTool(data)} />
                                                ))}
                                        </Box>
                                    )}
                                </Box>
                            ) : (
                                <ToolsTable
                                    data={getAllToolsApi.data}
                                    onDelete={reloadTools}
                                    onConfigure={onConfigureTool}
                                    onDuplicate={onDuplicateTool}
                                    filterFunction={filterTools}
                                    isLoading={isLoading}
                                    workspaceId={workspaceId} // Add workspaceId for API calls
                                />
                            )}
                            {!isLoading && (!getAllToolsApi.data || getAllToolsApi.data.length === 0) && (
                                <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                                    <Box sx={{ p: 2, height: 'auto' }}>
                                        <img
                                            style={{ objectFit: 'cover', height: '25vh', width: 'auto' }}
                                            src={ToolEmptySVG}
                                            alt='ToolEmptySVG'
                                        />
                                    </Box>
                                    <div>No Tools Yet</div>
                                </Stack>
                            )}
                        </ErrorBoundary>
                    </Box>
                )}
            </MainCard>
            <ToolDialog
                show={showDialog}
                dialogProps={dialogProps}
                onCancel={() => setShowDialog(false)}
                onConfirm={() => {
                    setShowDialog(false)
                    reloadTools()
                }}
            ></ToolDialog>
        </Box>
    )
}

export default WorkspaceTools
