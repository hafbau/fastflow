import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Panel,
    addEdge,
    MarkerType
} from 'reactflow'
import 'reactflow/dist/style.css'

// material-ui
import {
    Box,
    Card,
    CircularProgress,
    Grid,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
    Alert,
    Snackbar
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import { gridSpacing } from '@/store/constant'
import { StyledButton } from '@/ui-component/button/StyledButton'
import DraggableComponentList, { COMPONENT_CATEGORIES } from './DraggableComponentList'
import ScreenPropertiesPanel from './ScreenPropertiesPanel'
import UIComponentNode from './UIComponentNode'
import ComponentPropertiesPanel from './ComponentPropertiesPanel'
import { IconDeviceDesktop, IconDeviceMobile, IconDeviceTablet, IconSettings, IconLayoutGridAdd } from '@tabler/icons-react'
import MainCard from '@/ui-component/cards/MainCard'

// Node types definition
const nodeTypes = {
    uiComponent: UIComponentNode
}

const ScreenEditor = ({ screen, onScreenUpdate }) => {
    const theme = useTheme()
    const reactFlowWrapper = useRef(null)
    
    // Screen properties state
    const [screenProps, setScreenProps] = useState(screen || {})
    
    // Tab state
    const [activeTab, setActiveTab] = useState(0)
    const [viewMode, setViewMode] = useState('desktop')
    
    // Selected node state
    const [selectedNode, setSelectedNode] = useState(null)
    
    // Notification state
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info'
    })
    
    // ReactFlow states
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [reactFlowInstance, setReactFlowInstance] = useState(null)
    
    // Initialize screen nodes from components
    useEffect(() => {
        if (screen?.components) {
            // Convert screen components to ReactFlow nodes
            const flowNodes = screen.components.map((component, index) => ({
                id: component.id || `component-${Date.now()}-${index}`,
                type: 'uiComponent',
                position: component.position || { x: 100 + (index * 150), y: 100 },
                data: {
                    id: component.id || `component-${Date.now()}-${index}`,
                    label: component.type,
                    component: {
                        type: component.type,
                        properties: component.properties || {}
                    }
                },
                draggable: true,
                selectable: true
            }));
            
            setNodes(flowNodes);
        }
    }, [screen?.components, setNodes]);
    
    // Update screen properties when screen changes
    useEffect(() => {
        if (screen) {
            setScreenProps(screen)
        }
    }, [screen])
    
    // Update screen when nodes change
    useEffect(() => {
        if (screen && onScreenUpdate) {
            // Extract components from nodes
            const updatedComponents = nodes.map(node => ({
                id: node.id,
                type: node.data.component.type,
                position: node.position,
                properties: node.data.component.properties || {}
            }));
            
            // Create updated screen
            const updatedScreen = {
                ...screenProps,
                components: updatedComponents
            };
            
            onScreenUpdate(updatedScreen);
        }
    }, [nodes, screenProps, onScreenUpdate, screen]);
    
    // Handle node connections
    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    )
    
    // Handle node click
    const onNodeClick = useCallback((event, node) => {
        setSelectedNode(node);
        if (activeTab !== 2) {
            setActiveTab(2);
        }
    }, [activeTab]);
    
    // Handle background click
    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);
    
    // Handle drop from component list
    const onDrop = useCallback(
        (event) => {
            event.preventDefault();
            
            if (!reactFlowInstance) {
                setNotification({
                    open: true,
                    message: 'Canvas not ready. Please try again.',
                    severity: 'error'
                });
                return;
            }
            
            try {
            // Get component data from drag event
                const componentData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            
                // Get drop position adjusted to the current pan and zoom
                const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
            const position = reactFlowInstance.screenToFlowPosition({
                    x: event.clientX - reactFlowBounds.left,
                    y: event.clientY - reactFlowBounds.top
                });
            
                // Create new node with unique ID
                const newId = `component-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const newNode = {
                    id: newId,
                type: 'uiComponent',
                position,
                data: {
                        id: newId,
                        label: componentData.label || componentData.type,
                    component: {
                        type: componentData.type,
                            properties: componentData.defaultProps || {}
                        }
                    },
                    draggable: true,
                    selectable: true
                };
                
                // Add the new node to the existing nodes
                setNodes((nds) => nds.concat(newNode));
                
                setNotification({
                    open: true,
                    message: `Added ${componentData.label || componentData.type} component`,
                    severity: 'success'
                });
            } catch (error) {
                console.error('Error adding component:', error);
                setNotification({
                    open: true,
                    message: 'Failed to add component. Try again.',
                    severity: 'error'
                });
            }
        },
        [reactFlowInstance, setNodes]
    );
    
    // Handle drag over for drop zone
    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);
    
    // Handle notification close
    const handleNotificationClose = () => {
        setNotification({
            ...notification,
            open: false
        })
    }
    
    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue)
    }
    
    // Handle screen properties update
    const handleScreenPropsChange = (updatedProps) => {
        setScreenProps(updatedProps)
        
        if (onScreenUpdate) {
            onScreenUpdate({
                ...updatedProps,
                components: screen?.components || []
            })
        }
    }
    
    // Handle component update
    const handleComponentUpdate = (updatedComponent) => {
        setNodes(nodes.map(node => 
            node.id === updatedComponent.id ? 
                { ...node, data: { ...node.data, component: updatedComponent.component } } : 
                node
        ));
        
        setNotification({
            open: true,
            message: 'Component properties updated',
            severity: 'success'
        });
    }
    
    // Calculate canvas dimensions based on view mode
    const canvasDimensions = useMemo(() => {
        switch (viewMode) {
            case 'mobile':
                return { width: 375, height: 667 }
            case 'tablet':
                return { width: 768, height: 1024 }
            case 'desktop':
            default:
                return { width: '100%', height: 600 }
        }
    }, [viewMode])
    
    const canvasStyles = useMemo(() => ({
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.palette.mode === 'dark' 
            ? '0px 3px 15px rgba(0, 0, 0, 0.5)' 
            : '0px 3px 15px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
    }), [theme])
    
    return (
        <>
            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={handleNotificationClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity={notification.severity} onClose={handleNotificationClose}>
                    {notification.message}
                </Alert>
            </Snackbar>
        
            <MainCard>
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                        <Tabs 
                            value={activeTab} 
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{ 
                                borderBottom: 1, 
                                borderColor: 'divider',
                                mb: 2,
                                '& .MuiTab-root': {
                                    minWidth: 120
                                }
                            }}
                        >
                    <Tab label="Canvas" />
                    <Tab label="Screen Properties" />
                    <Tab label="Component Properties" disabled={!selectedNode} />
                </Tabs>
            </Grid>
            
            {activeTab === 0 && (
                <>
                    <Grid item xs={12} md={3}>
                        <DraggableComponentList />
                    </Grid>
                    
                    <Grid item xs={12} md={9}>
                                <Stack spacing={2}>
                                    <Stack 
                                        direction="row" 
                                        spacing={2} 
                                        alignItems="center"
                                        justifyContent="space-between"
                                    >
                                        <Stack direction="row" spacing={1}>
                            <StyledButton
                                variant={viewMode === 'desktop' ? 'contained' : 'outlined'}
                                onClick={() => setViewMode('desktop')}
                                                size="small"
                            >
                                                <IconDeviceDesktop size={20} />
                            </StyledButton>
                            <StyledButton
                                variant={viewMode === 'tablet' ? 'contained' : 'outlined'}
                                onClick={() => setViewMode('tablet')}
                                                size="small"
                            >
                                                <IconDeviceTablet size={20} />
                            </StyledButton>
                            <StyledButton
                                variant={viewMode === 'mobile' ? 'contained' : 'outlined'}
                                onClick={() => setViewMode('mobile')}
                                                size="small"
                            >
                                                <IconDeviceMobile size={20} />
                                            </StyledButton>
                                        </Stack>
                                        
                                        <Typography variant="subtitle1" color="primary">
                                            {screen?.title} ({screen?.path})
                                        </Typography>
                                        
                                        <StyledButton
                                            variant="outlined"
                                            startIcon={<IconSettings size={18} />}
                                            onClick={() => setActiveTab(1)}
                                            size="small"
                                        >
                                            Screen Settings
                            </StyledButton>
                        </Stack>
                        
                                    <Box
                            sx={{
                                height: canvasDimensions.height,
                                width: canvasDimensions.width,
                                margin: viewMode !== 'desktop' ? 'auto' : 0,
                                            ...canvasStyles
                            }}
                                        ref={reactFlowWrapper}
                        >
                                        {nodes.length === 0 ? (
                            <div style={{ width: '100%', height: '100%' }}>
                                                <ReactFlow
                                                    nodes={[]}
                                                    edges={[]}
                                                    onInit={setReactFlowInstance}
                                                    onDrop={onDrop}
                                                    onDragOver={onDragOver}
                                                    nodeTypes={nodeTypes}
                                                    fitView
                                                    snapToGrid={true}
                                                    snapGrid={[10, 10]}
                                                    defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                                                >
                                                    <Background 
                                                        color={theme.palette.primary.light} 
                                                        gap={16} 
                                                        size={1} 
                                                        variant={theme.palette.mode === 'dark' ? 'dots' : 'lines'}
                                                    />
                                                    <Controls position="bottom-right" />
                                                    <Stack
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        sx={{ 
                                                            height: '100%', 
                                                            width: '100%',
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            pointerEvents: 'none',
                                                            backgroundColor: theme.palette.mode === 'dark' 
                                                                ? 'rgba(0,0,0,0.1)' 
                                                                : 'rgba(0,0,0,0.03)'
                                                        }}
                                                    >
                                                        <Box sx={{ textAlign: 'center', p: 2 }}>
                                                            <IconLayoutGridAdd 
                                                                size={40} 
                                                                color={theme.palette.primary.main} 
                                                                opacity={0.6}
                                                            />
                                                            <Typography variant="body1" sx={{ mt: 1, opacity: 0.7 }}>
                                                                Drag and drop components here to build your UI
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </ReactFlow>
                                            </div>
                                        ) : (
                                <ReactFlow
                                    nodes={nodes}
                                    edges={edges}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    onConnect={onConnect}
                                    onInit={setReactFlowInstance}
                                    onDrop={onDrop}
                                    onDragOver={onDragOver}
                                    onNodeClick={onNodeClick}
                                    onPaneClick={onPaneClick}
                                    nodeTypes={nodeTypes}
                                                fitView={false}
                                                snapToGrid={true}
                                                snapGrid={[10, 10]}
                                                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                                                deleteKeyCode={['Backspace', 'Delete']}
                                >
                                                <Background 
                                                    color={theme.palette.primary.light} 
                                                    gap={16} 
                                                    size={1} 
                                                    variant={theme.palette.mode === 'dark' ? 'dots' : 'lines'}
                                                />
                                                <Controls 
                                                    position="bottom-right"
                                                    style={{
                                                        bottom: 10,
                                                        right: 10,
                                                        backgroundColor: theme.palette.background.paper,
                                                        borderRadius: theme.shape.borderRadius,
                                                        boxShadow: theme.shadows[2],
                                                        border: `1px solid ${theme.palette.divider}`
                                                    }}
                                                />
                                </ReactFlow>
                                        )}
                                    </Box>
                                </Stack>
                    </Grid>
                </>
            )}
            
            {activeTab === 1 && (
                <Grid item xs={12}>
                    <ScreenPropertiesPanel 
                        screen={screenProps} 
                        onScreenUpdate={handleScreenPropsChange} 
                    />
                </Grid>
            )}
            
            {activeTab === 2 && (
                <Grid item xs={12}>
                    <ComponentPropertiesPanel 
                        component={selectedNode}
                        onComponentUpdate={handleComponentUpdate}
                        componentTypes={COMPONENT_CATEGORIES}
                    />
                </Grid>
            )}
        </Grid>
            </MainCard>
        </>
    )
}

export default ScreenEditor 