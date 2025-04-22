import { useCallback, useEffect, useMemo, useState } from 'react'
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
    Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import { gridSpacing } from '@/store/constant'
import { StyledButton } from '@/ui-component/button/StyledButton'
import DraggableComponentList from './DraggableComponentList'
import ScreenPropertiesPanel from './ScreenPropertiesPanel'
import CanvasNode from '../canvas/CanvasNode'
import { IconDeviceDesktop, IconDeviceMobile, IconDeviceTablet, IconSettings } from '@tabler/icons-react'

// Node types definition
const nodeTypes = {
    uiComponent: CanvasNode
}

const ScreenEditor = ({ screen, onScreenUpdate }) => {
    const theme = useTheme()
    
    // Screen properties state
    const [screenProps, setScreenProps] = useState(screen || {})
    
    // Tab state
    const [activeTab, setActiveTab] = useState(0)
    const [viewMode, setViewMode] = useState('desktop')
    
    // ReactFlow states
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [reactFlowInstance, setReactFlowInstance] = useState(null)
    
    // Initialize screen nodes from components
    useEffect(() => {
        if (screen?.components) {
            // Convert screen components to ReactFlow nodes
            const flowNodes = screen.components.map((component, index) => ({
                id: component.id || `component-${index}`,
                type: 'uiComponent',
                position: component.position || { x: 100 + (index * 150), y: 100 },
                data: {
                    label: component.type,
                    component: component
                },
                draggable: true,
                selectable: true
            }))
            
            setNodes(flowNodes)
        }
    }, [screen?.components, setNodes])
    
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
                properties: node.data.component.properties || {},
                style: node.data.component.style || {}
            }))
            
            // Create updated screen
            const updatedScreen = {
                ...screenProps,
                components: updatedComponents
            }
            
            onScreenUpdate(updatedScreen)
        }
    }, [nodes, screenProps, onScreenUpdate, screen])
    
    // Handle node connections
    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    )
    
    // Handle drop from component list
    const onDrop = useCallback(
        (event) => {
            event.preventDefault()
            
            if (!reactFlowInstance) return
            
            // Get component data from drag event
            const componentData = JSON.parse(event.dataTransfer.getData('application/reactflow'))
            
            // Get drop position
            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY
            })
            
            // Create new node
            const newNode = {
                id: `component-${Date.now()}`,
                type: 'uiComponent',
                position,
                data: {
                    label: componentData.type,
                    component: {
                        type: componentData.type,
                        properties: componentData.defaultProps || {},
                        style: {}
                    }
                }
            }
            
            setNodes((nds) => nds.concat(newNode))
        },
        [reactFlowInstance, setNodes]
    )
    
    // Handle drag over for drop zone
    const onDragOver = useCallback((event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])
    
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
    
    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="Canvas" />
                    <Tab label="Properties" />
                </Tabs>
            </Grid>
            
            {activeTab === 0 && (
                <>
                    <Grid item xs={12} md={3}>
                        <DraggableComponentList />
                    </Grid>
                    
                    <Grid item xs={12} md={9}>
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                            <StyledButton
                                variant={viewMode === 'desktop' ? 'contained' : 'outlined'}
                                onClick={() => setViewMode('desktop')}
                            >
                                <IconDeviceDesktop />
                            </StyledButton>
                            <StyledButton
                                variant={viewMode === 'tablet' ? 'contained' : 'outlined'}
                                onClick={() => setViewMode('tablet')}
                            >
                                <IconDeviceTablet />
                            </StyledButton>
                            <StyledButton
                                variant={viewMode === 'mobile' ? 'contained' : 'outlined'}
                                onClick={() => setViewMode('mobile')}
                            >
                                <IconDeviceMobile />
                            </StyledButton>
                        </Stack>
                        
                        <Paper 
                            elevation={3}
                            sx={{
                                height: canvasDimensions.height,
                                width: canvasDimensions.width,
                                margin: viewMode !== 'desktop' ? 'auto' : 0,
                                overflow: 'hidden',
                                border: `1px solid ${theme.palette.grey[300]}`,
                            }}
                        >
                            <div style={{ width: '100%', height: '100%' }}>
                                <ReactFlow
                                    nodes={nodes}
                                    edges={edges}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    onConnect={onConnect}
                                    onInit={setReactFlowInstance}
                                    onDrop={onDrop}
                                    onDragOver={onDragOver}
                                    nodeTypes={nodeTypes}
                                    fitView
                                >
                                    <Background />
                                    <Controls />
                                    <Panel position="top-right">
                                        <StyledButton
                                            variant="outlined"
                                            startIcon={<IconSettings />}
                                            onClick={() => setActiveTab(1)}
                                        >
                                            Screen Settings
                                        </StyledButton>
                                    </Panel>
                                </ReactFlow>
                            </div>
                        </Paper>
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
        </Grid>
    )
}

export default ScreenEditor 