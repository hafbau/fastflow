import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// material-ui
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import { gridSpacing } from '@/store/constant'
import ScreenEditor from './ScreenEditor'
import axios from '@/utils/axios'
import { StyledButton } from '@/ui-component/button/StyledButton'
import { IconArrowLeft, IconDeviceFloppy, IconPlus } from '@tabler/icons-react'

const UIFlowCreation = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    
    const [uiFlow, setUIFlow] = useState({
        name: '',
        description: '',
        screens: [{
            id: '1',
            path: '/',
            title: 'Home',
            description: 'Main screen of the UI',
            queryParameters: {},
            pathParameters: {},
            components: []
        }]
    })
    
    const [errors, setErrors] = useState({})
    const [currentScreen, setCurrentScreen] = useState('1')
    const [isAddingScreen, setIsAddingScreen] = useState(false)
    const [newScreen, setNewScreen] = useState({
        path: '',
        title: '',
        description: ''
    })
    
    const handleUIFlowChange = (e) => {
        const { name, value } = e.target
        setUIFlow({
            ...uiFlow,
            [name]: value
        })
        
        // Clear error if field is filled
        if (errors[name] && value.trim()) {
            const updatedErrors = { ...errors }
            delete updatedErrors[name]
            setErrors(updatedErrors)
        }
    }
    
    const handleScreenChange = (screenId) => {
        setCurrentScreen(screenId)
    }
    
    const handleAddScreenClick = () => {
        setIsAddingScreen(true)
        setNewScreen({
            path: '',
            title: '',
            description: ''
        })
    }
    
    const handleNewScreenChange = (e) => {
        const { name, value } = e.target
        setNewScreen({
            ...newScreen,
            [name]: value
        })
    }
    
    const handleAddScreenConfirm = () => {
        // Validate screen data
        const screenErrors = {}
        if (!newScreen.path.trim()) screenErrors.path = 'Path is required'
        if (!newScreen.title.trim()) screenErrors.title = 'Title is required'
        
        if (Object.keys(screenErrors).length > 0) {
            setErrors({ ...errors, ...screenErrors })
            return
        }
        
        // Generate a unique ID for the new screen
        const newScreenId = (Math.max(...uiFlow.screens.map(s => parseInt(s.id)), 0) + 1).toString()
        
        // Add the new screen to the UI flow
        const newScreenObj = {
            id: newScreenId,
            path: newScreen.path,
            title: newScreen.title,
            description: newScreen.description,
            queryParameters: {},
            pathParameters: {},
            components: []
        }
        
        setUIFlow({
            ...uiFlow,
            screens: [...uiFlow.screens, newScreenObj]
        })
        
        setIsAddingScreen(false)
        setCurrentScreen(newScreenId)
    }
    
    const handleCancel = () => {
        navigate('/uiflows')
    }
    
    const handleSave = async () => {
        // Validate UI flow data
        const validationErrors = {}
        if (!uiFlow.name.trim()) validationErrors.name = 'Name is required'
        
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }
        
        try {
            // Create UI flow API call
            const response = await axios.post('/api/v1/uiflows', uiFlow)
            
            // Navigate to UI flow list
            navigate('/uiflows')
        } catch (error) {
            console.error('Error creating UI flow:', error)
            // Handle error (could show error notification)
        }
    }
    
    return (
        <MainCard>
            <Stack direction="column" spacing={3}>
                <Stack direction="row" justifyContent="space-between">
                    <Button 
                        variant="text" 
                        startIcon={<IconArrowLeft />}
                        onClick={handleCancel}
                    >
                        Back to UI Flows
                    </Button>
                    <StyledButton
                        variant="contained"
                        startIcon={<IconDeviceFloppy />}
                        onClick={handleSave}
                    >
                        Save UI Flow
                    </StyledButton>
                </Stack>
                
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            label="UI Flow Name"
                            name="name"
                            value={uiFlow.name}
                            onChange={handleUIFlowChange}
                            error={Boolean(errors.name)}
                            helperText={errors.name}
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={uiFlow.description}
                            onChange={handleUIFlowChange}
                            multiline
                            rows={2}
                        />
                    </Grid>
                </Grid>
                
                <Typography variant="h4" gutterBottom>
                    Screens
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Select Screen</InputLabel>
                        <Select
                            value={currentScreen}
                            label="Select Screen"
                            onChange={(e) => handleScreenChange(e.target.value)}
                        >
                            {uiFlow.screens.map((screen) => (
                                <MenuItem key={screen.id} value={screen.id}>
                                    {screen.title} ({screen.path})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <StyledButton
                        variant="outlined"
                        startIcon={<IconPlus />}
                        onClick={handleAddScreenClick}
                    >
                        Add Screen
                    </StyledButton>
                </Box>
                
                {/* Screen Editor Component */}
                <ScreenEditor
                    screen={uiFlow.screens.find(s => s.id === currentScreen)}
                    onScreenUpdate={(updatedScreen) => {
                        setUIFlow({
                            ...uiFlow,
                            screens: uiFlow.screens.map(s => 
                                s.id === currentScreen ? updatedScreen : s
                            )
                        })
                    }}
                />
                
                {/* Add Screen Dialog */}
                <Dialog open={isAddingScreen} onClose={() => setIsAddingScreen(false)}>
                    <DialogTitle>Add New Screen</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField
                                fullWidth
                                label="Path"
                                name="path"
                                value={newScreen.path}
                                onChange={handleNewScreenChange}
                                error={Boolean(errors.path)}
                                helperText={errors.path || "Example: /details or /users/:id"}
                                placeholder="/path"
                            />
                            
                            <TextField
                                fullWidth
                                label="Title"
                                name="title"
                                value={newScreen.title}
                                onChange={handleNewScreenChange}
                                error={Boolean(errors.title)}
                                helperText={errors.title}
                            />
                            
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={newScreen.description}
                                onChange={handleNewScreenChange}
                                multiline
                                rows={2}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsAddingScreen(false)}>Cancel</Button>
                        <Button onClick={handleAddScreenConfirm} variant="contained">Add Screen</Button>
                    </DialogActions>
                </Dialog>
            </Stack>
        </MainCard>
    )
}

export default UIFlowCreation 