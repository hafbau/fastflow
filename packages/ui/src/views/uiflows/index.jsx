import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// material-ui
import { Box, Skeleton, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import ItemCard from '@/ui-component/cards/ItemCard'
import { gridSpacing } from '@/store/constant'
import WorkflowEmptySVG from '@/assets/images/workflow_empty.svg'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import ErrorBoundary from '@/ErrorBoundary'
import { StyledButton } from '@/ui-component/button/StyledButton'
import uiflowsApi from '@/api/uiflows'

// icons
import { IconPlus, IconLayoutGrid, IconList, IconEye } from '@tabler/icons-react'

// ==============================|| UIFLOWS ||============================== //

const UIFlows = () => {
    const navigate = useNavigate()
    const theme = useTheme()

    const [isLoading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [search, setSearch] = useState('')
    const [view, setView] = useState(localStorage.getItem('uiDisplayStyle') || 'card')
    const [uiFlows, setUIFlows] = useState([])

    // Fetch UI Flows when component mounts
    useEffect(() => {
        const fetchUIFlows = async () => {
            try {
                setLoading(true)
                console.log('Fetching UI flows...')
                const response = await uiflowsApi.getAllUIFlows()
                console.log('UI flows API response:', response)
                
                // Check if the response data is valid
                if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
                    // Handle case where the response is an object but not an array
                    console.error('API returned unexpected data format:', response.data)
                    setError(new Error('Invalid data format received from server'))
                } else if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
                    // Handle case where HTML is returned instead of JSON
                    console.error('API returned HTML instead of JSON data')
                    setError(new Error('Authentication error or invalid endpoint'))
                } else {
                    // Ensure we set an empty array if data is not an array
                    setUIFlows(Array.isArray(response.data) ? response.data : [])
                }
            } catch (err) {
                console.error('Error fetching UI flows:', err)
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        fetchUIFlows()
    }, [])

    // Ensure we're working with an array before filtering
    const filteredUIFlows = Array.isArray(uiFlows) 
        ? uiFlows.filter(
            (flow) => 
                flow?.name?.toLowerCase().includes(search.toLowerCase()) ||
                flow?.description?.toLowerCase().includes(search.toLowerCase())
        ) 
        : []

    const handleChange = (event, nextView) => {
        if (nextView === null) return
        localStorage.setItem('uiDisplayStyle', nextView)
        setView(nextView)
    }

    const onSearchChange = (event) => {
        setSearch(event.target.value)
    }

    const addNew = () => {
        // Navigate to UI creation page
        navigate('/uiflows/create')
    }

    const openPreview = (uiFlowId) => {
        navigate(`/uiflows/preview/${uiFlowId}`)
    }

    const renderUIFlowCards = () => {
        if (filteredUIFlows.length === 0) {
            return (
                <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                    <Box sx={{ p: 2, height: 'auto' }}>
                        <img
                            style={{ objectFit: 'cover', height: '25vh', width: 'auto' }}
                            src={WorkflowEmptySVG}
                            alt='WorkflowEmptySVG'
                        />
                    </Box>
                    <div>{search ? 'No matching UI flows found' : 'No UIs Yet'}</div>
                </Stack>
            )
        }

        return (
            <Box display='grid' gridTemplateColumns='repeat(3, 1fr)' gap={gridSpacing}>
                {filteredUIFlows.map((flow) => (
                    <ItemCard
                        key={flow.id}
                        title={flow.name}
                        description={flow.description || 'No description'}
                        data={flow}
                        actions={[
                            {
                                icon: <IconEye />,
                                name: 'Preview',
                                onClick: () => openPreview(flow.id)
                            }
                        ]}
                    />
                ))}
            </Box>
        )
    }

    const renderUIFlowList = () => {
        if (filteredUIFlows.length === 0) {
            return (
                <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                    <Box sx={{ p: 2, height: 'auto' }}>
                        <img
                            style={{ objectFit: 'cover', height: '25vh', width: 'auto' }}
                            src={WorkflowEmptySVG}
                            alt='WorkflowEmptySVG'
                        />
                    </Box>
                    <div>{search ? 'No matching UI flows found' : 'No UIs Yet'}</div>
                </Stack>
            )
        }

        return (
            <Stack spacing={gridSpacing}>
                {filteredUIFlows.map((flow) => (
                    <ItemCard
                        key={flow.id}
                        title={flow.name}
                        description={flow.description || 'No description'}
                        data={flow}
                        variant='list'
                        actions={[
                            {
                                icon: <IconEye />,
                                name: 'Preview',
                                onClick: () => openPreview(flow.id)
                            }
                        ]}
                    />
                ))}
            </Stack>
        )
    }

    return (
        <MainCard>
            {error ? (
                <ErrorBoundary error={error} />
            ) : (
                <Stack flexDirection='column' sx={{ gap: 3 }}>
                    <ViewHeader onSearchChange={onSearchChange} search={true} searchPlaceholder='Search Name or Category' title='UIs'>
                        <ToggleButtonGroup
                            sx={{ borderRadius: 2, maxHeight: 40 }}
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
                        <StyledButton variant='contained' onClick={addNew} startIcon={<IconPlus />} sx={{ borderRadius: 2, height: 40 }}>
                            Add New
                        </StyledButton>
                    </ViewHeader>
                    
                    {isLoading ? (
                        <Box display='grid' gridTemplateColumns='repeat(3, 1fr)' gap={gridSpacing}>
                            <Skeleton variant='rounded' height={160} />
                            <Skeleton variant='rounded' height={160} />
                            <Skeleton variant='rounded' height={160} />
                        </Box>
                    ) : view === 'card' ? (
                        renderUIFlowCards()
                    ) : (
                        renderUIFlowList()
                    )}
                </Stack>
            )}
        </MainCard>
    )
}

export default UIFlows 