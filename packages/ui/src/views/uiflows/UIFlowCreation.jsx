import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// material-ui
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    Breadcrumbs,
    Chip,
    Tabs,
    Tab,
    Alert,
    Snackbar,
    Paper,
    IconButton
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import { gridSpacing } from '@/store/constant'
import ScreenEditor from './ScreenEditor'
import uiflowsApi from '@/api/uiflows'
import { StyledButton } from '@/ui-component/button/StyledButton'
import { 
    IconArrowLeft, 
    IconDeviceFloppy, 
    IconPlus, 
    IconDeviceDesktop,
    IconLayoutGrid,
    IconInfoCircle,
    IconEye,
    IconX,
    IconDeviceMobile,
    IconDeviceTablet
} from '@tabler/icons-react'
import { Link } from 'react-router-dom'

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
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info'
    })
    const [tabValue, setTabValue] = useState(0)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [previewDeviceType, setPreviewDeviceType] = useState('desktop')
    
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
    }
    
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
        
        // Check if path already exists
        if (uiFlow.screens.some(screen => screen.path === newScreen.path)) {
            setErrors({ ...errors, path: 'Path already exists in this UI flow' })
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
        
        // Show success notification
        setNotification({
            open: true,
            message: `Screen "${newScreen.title}" added successfully`,
            severity: 'success'
        })
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
            const response = await uiflowsApi.createUIFlow(uiFlow)
            
            // Show success notification
            setNotification({
                open: true,
                message: 'UI Flow saved successfully',
                severity: 'success'
            })
            
            // Navigate to UI flow list after a brief delay
            setTimeout(() => {
                navigate('/uiflows')
            }, 1500)
        } catch (error) {
            console.error('Error creating UI flow:', error)
            
            const errorMessage = error.response?.data?.message || 
                                 error.response?.statusText || 
                                 error.message || 
                                 'An unknown error occurred'
            
            // Show error notification with more details
            setNotification({
                open: true,
                message: `Error saving UI Flow: ${errorMessage}`,
                severity: 'error'
            })
            
            // If it's an auth error, you might want to redirect to login
            if (error.response?.status === 401) {
                setNotification({
                    open: true,
                    message: 'Authentication required. Please log in again.',
                    severity: 'error'
                })
                
                // Optionally redirect to login page
                setTimeout(() => navigate('/login'), 2000)
            }
        }
    }
    
    const handleNotificationClose = () => {
        setNotification({
            ...notification,
            open: false
        })
    }
    
    const togglePreview = () => {
        setIsPreviewOpen(!isPreviewOpen)
    }
    
    const renderPreviewContent = () => {
        const currentScreenData = uiFlow.screens.find(s => s.id === currentScreen)
        if (!currentScreenData) return null
        
        // This is a simplified preview - in a real app, you would render actual components
        return (
            <Box sx={{ 
                padding: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Typography variant="h5" component="h1" gutterBottom>
                    {currentScreenData.title}
                </Typography>
                
                {currentScreenData.description && (
                    <Typography variant="body2" color="textSecondary" paragraph>
                        {currentScreenData.description}
                    </Typography>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                {currentScreenData.components.length > 0 ? (
                    <Box sx={{ flexGrow: 1 }}>
                        {currentScreenData.components.map((component, index) => (
                            <Box 
                                key={component.id || index}
                                sx={{ 
                                    border: '1px dashed',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    p: 2,
                                    mb: 2,
                                    backgroundColor: 'background.paper'
                                }}
                            >
                                <Typography variant="subtitle1">
                                    {component.type}
                                </Typography>
                                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                    ID: {component.id}
                                </Typography>
                                {Object.keys(component.properties || {}).length > 0 && (
                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="caption" fontWeight="bold">
                                            Properties:
                                        </Typography>
                                        <pre style={{ 
                                            margin: '4px 0',
                                            fontSize: '11px',
                                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                            padding: '4px',
                                            borderRadius: '4px',
                                            overflow: 'auto',
                                            maxHeight: '100px'
                                        }}>
                                            {JSON.stringify(component.properties, null, 2)}
                                        </pre>
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Box sx={{ 
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        borderRadius: 1,
                        p: 3
                    }}>
                        <Typography variant="body1" color="textSecondary" align="center">
                            No components added to this screen yet.
                            <br />
                            Drag and drop components from the component list to build your UI.
                        </Typography>
                    </Box>
                )}
            </Box>
        )
    }
    
    const renderPreviewDeviceFrame = () => {
        let width, height, border, borderRadius
        
        switch(previewDeviceType) {
            case 'mobile':
                width = 375
                height = 667
                border = '16px'
                borderRadius = '36px'
                break
            case 'tablet':
                width = 768
                height = 1024
                border = '20px'
                borderRadius = '16px'
                break
            case 'desktop':
            default:
                width = '100%'
                height = 'calc(100vh - 300px)'
                border = '0px'
                borderRadius = '0px'
                break
        }
        
        return (
            <Box
                sx={{
                    width: previewDeviceType === 'desktop' ? '100%' : 'auto',
                    margin: '0 auto',
                    mt: 2
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        width,
                        height,
                        margin: '0 auto',
                        border: `${border} solid ${theme.palette.mode === 'dark' ? '#444' : '#ddd'}`,
                        borderRadius,
                        overflow: 'hidden',
                        backgroundColor: theme.palette.background.default
                    }}
                >
                    {renderPreviewContent()}
                </Paper>
            </Box>
        )
    }
    
    return (
        <>
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={handleNotificationClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity={notification.severity} onClose={handleNotificationClose} variant="filled">
                    {notification.message}
                </Alert>
            </Snackbar>
            
            <MainCard contentSX={{ p: 2 }}>
                <Stack direction="column" spacing={3}>
                    {/* Header with breadcrumbs */}
                    <Stack 
                        direction="row" 
                        justifyContent="space-between" 
                        alignItems="center"
                        sx={{ mb: 1 }}
                    >
                        <Box>
                            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                                <Link to="/uiflows" style={{ textDecoration: 'none', color: theme.palette.primary.main }}>
                                    UIs
                                </Link>
                                <Typography color="text.primary">Create New UI</Typography>
                            </Breadcrumbs>
                            <Typography variant="h3">
                                {uiFlow.name.trim() ? uiFlow.name : 'New UI Flow'}
                            </Typography>
                        </Box>
                        
                        <Stack direction="row" spacing={2}>
                            <StyledButton
                                variant="outlined"
                                startIcon={<IconEye />}
                                onClick={togglePreview}
                                color="secondary"
                            >
                                Preview
                            </StyledButton>
                            <StyledButton
                                variant="outlined"
                                startIcon={<IconArrowLeft />}
                                onClick={handleCancel}
                                color="secondary"
                            >
                                Cancel
                            </StyledButton>
                            <StyledButton
                                variant="contained"
                                startIcon={<IconDeviceFloppy />}
                                onClick={handleSave}
                            >
                                Save UI Flow
                            </StyledButton>
                        </Stack>
                    </Stack>
                    
                    <Divider />
                    
                    <Tabs 
                        value={tabValue} 
                        onChange={handleTabChange} 
                        aria-label="ui flow creation tabs"
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab label="Basic Information" icon={<IconInfoCircle size={18} />} iconPosition="start" />
                        <Tab label="Screen Design" icon={<IconDeviceDesktop size={18} />} iconPosition="start" />
                    </Tabs>
                    
                    {/* Basic Information Tab */}
                    {tabValue === 0 && (
                        <MainCard>
                            <Grid container spacing={gridSpacing}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="UI Flow Name"
                                        name="name"
                                        value={uiFlow.name}
                                        onChange={handleUIFlowChange}
                                        error={Boolean(errors.name)}
                                        helperText={errors.name}
                                        placeholder="Enter a descriptive name"
                                        required
                                    />
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        name="description"
                                        value={uiFlow.description}
                                        onChange={handleUIFlowChange}
                                        multiline
                                        rows={3}
                                        placeholder="Describe the purpose of this UI flow"
                                    />
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Screens
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                        A UI flow consists of one or more screens. Each screen has a unique path and can contain multiple components.
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {uiFlow.screens.map((screen) => (
                                            <Chip
                                                key={screen.id}
                                                label={`${screen.title} (${screen.path})`}
                                                onClick={() => { 
                                                    setCurrentScreen(screen.id)
                                                    setTabValue(1)
                                                }}
                                                color={currentScreen === screen.id ? "primary" : "default"}
                                                variant={currentScreen === screen.id ? "filled" : "outlined"}
                                                sx={{ borderRadius: 1 }}
                                            />
                                        ))}
                                        
                                        <Chip
                                            icon={<IconPlus size={18} />}
                                            label="Add Screen"
                                            onClick={handleAddScreenClick}
                                            variant="outlined"
                                            color="primary"
                                            sx={{ borderRadius: 1 }}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </MainCard>
                    )}
                    
                    {/* Screen Design Tab */}
                    {tabValue === 1 && (
                        <>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <FormControl sx={{ minWidth: 200 }}>
                                    <InputLabel>Select Screen</InputLabel>
                                    <Select
                                        value={currentScreen}
                                        label="Select Screen"
                                        onChange={(e) => handleScreenChange(e.target.value)}
                                        size="small"
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
                                    size="small"
                                >
                                    Add Screen
                                </StyledButton>
                            </Box>
                            
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
                        </>
                    )}
                    
                    {/* Add Screen Dialog */}
                    <Dialog 
                        open={isAddingScreen} 
                        onClose={() => setIsAddingScreen(false)}
                        PaperProps={{
                            sx: {
                                borderRadius: 2,
                                maxWidth: '500px'
                            }
                        }}
                    >
                        <DialogTitle>Add New Screen</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2} sx={{ mt: 1, minWidth: '400px' }}>
                                <TextField
                                    fullWidth
                                    label="Path"
                                    name="path"
                                    value={newScreen.path}
                                    onChange={handleNewScreenChange}
                                    error={Boolean(errors.path)}
                                    helperText={errors.path || "Example: /details or /users/:id"}
                                    placeholder="/path"
                                    required
                                />
                                
                                <TextField
                                    fullWidth
                                    label="Title"
                                    name="title"
                                    value={newScreen.title}
                                    onChange={handleNewScreenChange}
                                    error={Boolean(errors.title)}
                                    helperText={errors.title}
                                    required
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
                        <DialogActions sx={{ px: 3, py: 2 }}>
                            <Button onClick={() => setIsAddingScreen(false)} color="secondary">Cancel</Button>
                            <StyledButton onClick={handleAddScreenConfirm} variant="contained">Add Screen</StyledButton>
                        </DialogActions>
                    </Dialog>
                    
                    {/* Preview Dialog */}
                    <Dialog
                        open={isPreviewOpen}
                        onClose={togglePreview}
                        fullWidth
                        maxWidth="lg"
                        PaperProps={{
                            sx: {
                                borderRadius: 2,
                                height: 'calc(100% - 64px)'
                            }
                        }}
                    >
                        <DialogTitle>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="h4">
                                    Preview: {uiFlow.screens.find(s => s.id === currentScreen)?.title || 'Screen'}
                                </Typography>
                                <IconButton onClick={togglePreview} size="small">
                                    <IconX />
                                </IconButton>
                            </Stack>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
                                <StyledButton
                                    variant={previewDeviceType === 'desktop' ? 'contained' : 'outlined'}
                                    onClick={() => setPreviewDeviceType('desktop')}
                                    size="small"
                                    startIcon={<IconDeviceDesktop size={18} />}
                                >
                                    Desktop
                                </StyledButton>
                                <StyledButton
                                    variant={previewDeviceType === 'tablet' ? 'contained' : 'outlined'}
                                    onClick={() => setPreviewDeviceType('tablet')}
                                    size="small"
                                    startIcon={<IconDeviceTablet size={18} />}
                                >
                                    Tablet
                                </StyledButton>
                                <StyledButton
                                    variant={previewDeviceType === 'mobile' ? 'contained' : 'outlined'}
                                    onClick={() => setPreviewDeviceType('mobile')}
                                    size="small"
                                    startIcon={<IconDeviceMobile size={18} />}
                                >
                                    Mobile
                                </StyledButton>
                            </Stack>
                            
                            {renderPreviewDeviceFrame()}
                        </DialogContent>
                        <DialogActions sx={{ px: 3, py: 2 }}>
                            <Stack 
                                direction="row" 
                                spacing={2} 
                                sx={{ width: '100%' }}
                                justifyContent="space-between"
                            >
                                <Box>
                                    <FormControl sx={{ minWidth: 200 }}>
                                        <InputLabel size="small">Screen</InputLabel>
                                        <Select
                                            value={currentScreen}
                                            label="Screen"
                                            onChange={(e) => handleScreenChange(e.target.value)}
                                            size="small"
                                        >
                                            {uiFlow.screens.map((screen) => (
                                                <MenuItem key={screen.id} value={screen.id}>
                                                    {screen.title} ({screen.path})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Button onClick={togglePreview} variant="outlined" color="secondary">
                                    Close Preview
                                </Button>
                            </Stack>
                        </DialogActions>
                    </Dialog>
                </Stack>
            </MainCard>
        </>
    )
}

export default UIFlowCreation 