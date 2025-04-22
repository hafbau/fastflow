import { useState, useEffect } from 'react'

// material-ui
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Chip,
    Grid,
    IconButton,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import { gridSpacing } from '@/store/constant'
import { StyledButton } from '@/ui-component/button/StyledButton'
import { IconChevronDown, IconDeviceFloppy, IconPlus, IconTrash, IconX } from '@tabler/icons-react'

const ScreenPropertiesPanel = ({ screen, onScreenUpdate }) => {
    const theme = useTheme()
    
    // Local state for screen properties
    const [screenProps, setScreenProps] = useState({
        path: screen?.path || '/',
        title: screen?.title || 'Screen',
        description: screen?.description || '',
        queryParameters: screen?.queryParameters || {},
        pathParameters: screen?.pathParameters || {}
    })
    
    // States for parameter inputs
    const [newQueryParam, setNewQueryParam] = useState({ name: '', description: '', required: false })
    const [newPathParam, setNewPathParam] = useState({ name: '', description: '' })
    
    // Update local state when screen prop changes
    useEffect(() => {
        if (screen) {
            setScreenProps({
                path: screen.path || '/',
                title: screen.title || 'Screen',
                description: screen.description || '',
                queryParameters: screen.queryParameters || {},
                pathParameters: screen.pathParameters || {}
            })
        }
    }, [screen])
    
    // Handle basic field changes
    const handleChange = (e) => {
        const { name, value } = e.target
        setScreenProps({
            ...screenProps,
            [name]: value
        })
    }
    
    // Save changes
    const handleSave = () => {
        if (onScreenUpdate) {
            onScreenUpdate({
                ...screen,
                ...screenProps
            })
        }
    }
    
    // Handle adding a new query parameter
    const handleAddQueryParam = () => {
        if (!newQueryParam.name.trim()) return
        
        const updatedParams = {
            ...screenProps.queryParameters,
            [newQueryParam.name]: {
                description: newQueryParam.description,
                required: newQueryParam.required
            }
        }
        
        setScreenProps({
            ...screenProps,
            queryParameters: updatedParams
        })
        
        setNewQueryParam({ name: '', description: '', required: false })
    }
    
    // Handle removing a query parameter
    const handleRemoveQueryParam = (paramName) => {
        const updatedParams = { ...screenProps.queryParameters }
        delete updatedParams[paramName]
        
        setScreenProps({
            ...screenProps,
            queryParameters: updatedParams
        })
    }
    
    // Handle adding a new path parameter
    const handleAddPathParam = () => {
        if (!newPathParam.name.trim()) return
        
        const updatedParams = {
            ...screenProps.pathParameters,
            [newPathParam.name]: {
                description: newPathParam.description
            }
        }
        
        setScreenProps({
            ...screenProps,
            pathParameters: updatedParams
        })
        
        setNewPathParam({ name: '', description: '' })
    }
    
    // Handle removing a path parameter
    const handleRemovePathParam = (paramName) => {
        const updatedParams = { ...screenProps.pathParameters }
        delete updatedParams[paramName]
        
        setScreenProps({
            ...screenProps,
            pathParameters: updatedParams
        })
    }
    
    return (
        <Paper sx={{ p: 3 }}>
            <Stack direction="column" spacing={gridSpacing}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4">Screen Properties</Typography>
                    <StyledButton
                        variant="contained"
                        startIcon={<IconDeviceFloppy />}
                        onClick={handleSave}
                    >
                        Save Changes
                    </StyledButton>
                </Stack>
                
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Path"
                            name="path"
                            value={screenProps.path}
                            onChange={handleChange}
                            placeholder="/path"
                            helperText="Path for this screen (e.g., /details or /users/:id)"
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Title"
                            name="title"
                            value={screenProps.title}
                            onChange={handleChange}
                            placeholder="Screen Title"
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={screenProps.description}
                            onChange={handleChange}
                            multiline
                            rows={2}
                            placeholder="Describe the purpose of this screen"
                        />
                    </Grid>
                </Grid>
                
                {/* Query Parameters Section */}
                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<IconChevronDown />}>
                        <Typography variant="h5">Query Parameters</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack spacing={2}>
                            {/* Existing query parameters */}
                            {Object.entries(screenProps.queryParameters).length > 0 ? (
                                <Stack spacing={1}>
                                    {Object.entries(screenProps.queryParameters).map(([name, details]) => (
                                        <Paper
                                            key={name}
                                            variant="outlined"
                                            sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        >
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="body1" fontWeight="bold">{name}</Typography>
                                                {details.required && <Chip label="Required" size="small" color="primary" />}
                                                {details.description && (
                                                    <Typography variant="body2" color="textSecondary">
                                                        {details.description}
                                                    </Typography>
                                                )}
                                            </Stack>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleRemoveQueryParam(name)}
                                                size="small"
                                            >
                                                <IconTrash />
                                            </IconButton>
                                        </Paper>
                                    ))}
                                </Stack>
                            ) : (
                                <Typography variant="body2" color="textSecondary">
                                    No query parameters defined.
                                </Typography>
                            )}
                            
                            {/* Add new query parameter */}
                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                <TextField
                                    label="Parameter Name"
                                    value={newQueryParam.name}
                                    onChange={(e) => setNewQueryParam({ ...newQueryParam, name: e.target.value })}
                                    placeholder="name"
                                    size="small"
                                />
                                <TextField
                                    label="Description"
                                    value={newQueryParam.description}
                                    onChange={(e) => setNewQueryParam({ ...newQueryParam, description: e.target.value })}
                                    placeholder="What this parameter does"
                                    size="small"
                                    fullWidth
                                />
                                <StyledButton
                                    variant="contained"
                                    startIcon={<IconPlus />}
                                    onClick={handleAddQueryParam}
                                    disabled={!newQueryParam.name.trim()}
                                    size="small"
                                >
                                    Add
                                </StyledButton>
                            </Stack>
                        </Stack>
                    </AccordionDetails>
                </Accordion>
                
                {/* Path Parameters Section */}
                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<IconChevronDown />}>
                        <Typography variant="h5">Path Parameters</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack spacing={2}>
                            {/* Existing path parameters */}
                            {Object.entries(screenProps.pathParameters).length > 0 ? (
                                <Stack spacing={1}>
                                    {Object.entries(screenProps.pathParameters).map(([name, details]) => (
                                        <Paper
                                            key={name}
                                            variant="outlined"
                                            sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        >
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="body1" fontWeight="bold">{name}</Typography>
                                                {details.description && (
                                                    <Typography variant="body2" color="textSecondary">
                                                        {details.description}
                                                    </Typography>
                                                )}
                                            </Stack>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleRemovePathParam(name)}
                                                size="small"
                                            >
                                                <IconTrash />
                                            </IconButton>
                                        </Paper>
                                    ))}
                                </Stack>
                            ) : (
                                <Typography variant="body2" color="textSecondary">
                                    No path parameters defined.
                                </Typography>
                            )}
                            
                            {/* Add new path parameter */}
                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                <TextField
                                    label="Parameter Name"
                                    value={newPathParam.name}
                                    onChange={(e) => setNewPathParam({ ...newPathParam, name: e.target.value })}
                                    placeholder="id"
                                    size="small"
                                />
                                <TextField
                                    label="Description"
                                    value={newPathParam.description}
                                    onChange={(e) => setNewPathParam({ ...newPathParam, description: e.target.value })}
                                    placeholder="What this parameter identifies"
                                    size="small"
                                    fullWidth
                                />
                                <StyledButton
                                    variant="contained"
                                    startIcon={<IconPlus />}
                                    onClick={handleAddPathParam}
                                    disabled={!newPathParam.name.trim()}
                                    size="small"
                                >
                                    Add
                                </StyledButton>
                            </Stack>
                        </Stack>
                    </AccordionDetails>
                </Accordion>
            </Stack>
        </Paper>
    )
}

export default ScreenPropertiesPanel 