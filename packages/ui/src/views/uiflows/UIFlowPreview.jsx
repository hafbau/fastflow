import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Paper, CircularProgress, Typography, Alert, IconButton, Toolbar, AppBar } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IconArrowLeft, IconRefresh, IconDeviceFloppy, IconExternalLink } from '@tabler/icons-react'

// Project imports
import { baseURL } from '@/store/constant'
import MainCard from '@/ui-component/cards/MainCard'
import { StyledButton } from '@/ui-component/button/StyledButton'
import ErrorBoundary from '@/ErrorBoundary'
import logger from '@/utils/logger'
import { createSSEConnection, sendInteractionEvent } from '@/utils/SSEUtils'

// Component states
const PREVIEW_STATUS = {
  CONNECTING: 'connecting',
  READY: 'ready',
  RUNNING: 'running',
  ERROR: 'error',
  DISCONNECTED: 'disconnected'
}

const UIFlowPreview = () => {
  const { uiFlowId } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()
  
  // State
  const [status, setStatus] = useState(PREVIEW_STATUS.CONNECTING)
  const [error, setError] = useState(null)
  const [uiFlowData, setUIFlowData] = useState(null)
  const [currentScreen, setCurrentScreen] = useState(null)
  const [components, setComponents] = useState({})
  const [flowProgress, setFlowProgress] = useState(null)
  
  // Refs
  const sseConnectionRef = useRef(null)
  
  // Connect to the SSE endpoint
  const connectToEventSource = useCallback(() => {
    if (!uiFlowId) return
    
    // Clean up existing connection
    if (sseConnectionRef.current) {
      sseConnectionRef.current.close()
      sseConnectionRef.current = null
    }
    
    // Set status to connecting
    setStatus(PREVIEW_STATUS.CONNECTING)
    
    const url = `${baseURL}/api/v1/uiflows/${uiFlowId}/preview`
    
    // Setup event handlers
    const eventHandlers = {
      'preview-ready': (event) => {
        try {
          const data = JSON.parse(event.data)
          setStatus(PREVIEW_STATUS.READY)
          setError(null)
          logger.debug('Preview ready event received:', data)
        } catch (e) {
          logger.error('Error parsing preview-ready event:', e)
        }
      },
      'preview-init': (event) => {
        try {
          const data = JSON.parse(event.data)
          setUIFlowData(data.uiFlow)
          
          // Set the initial screen if available
          if (data.uiFlow.screens && data.uiFlow.screens.length > 0) {
            setCurrentScreen(data.uiFlow.screens[0].path)
          }
          
          logger.debug('Preview init event received:', data)
        } catch (e) {
          logger.error('Error parsing preview-init event:', e)
        }
      },
      'preview-component-update': (event) => {
        try {
          const data = JSON.parse(event.data)
          setComponents((prev) => ({
            ...prev,
            [data.componentId]: {
              ...(prev[data.componentId] || {}),
              ...data.properties
            }
          }))
          
          logger.debug('Component update event received:', data)
        } catch (e) {
          logger.error('Error parsing preview-component-update event:', e)
        }
      },
      'preview-batch-update': (event) => {
        try {
          const data = JSON.parse(event.data)
          setComponents((prev) => {
            const newComponents = { ...prev }
            data.updates.forEach(update => {
              newComponents[update.componentId] = {
                ...(newComponents[update.componentId] || {}),
                ...update.properties
              }
            })
            return newComponents
          })
          
          logger.debug('Batch update event received:', data)
        } catch (e) {
          logger.error('Error parsing preview-batch-update event:', e)
        }
      },
      'preview-progress': (event) => {
        try {
          const data = JSON.parse(event.data)
          setFlowProgress({
            step: data.step,
            totalSteps: data.totalSteps
          })
          
          if (data.status === 'running') {
            setStatus(PREVIEW_STATUS.RUNNING)
          } else if (data.status === 'complete') {
            setStatus(PREVIEW_STATUS.READY)
          } else if (data.status === 'error') {
            setStatus(PREVIEW_STATUS.ERROR)
          }
          
          logger.debug('Flow progress event received:', data)
        } catch (e) {
          logger.error('Error parsing preview-progress event:', e)
        }
      },
      'preview-error': (event) => {
        try {
          const data = JSON.parse(event.data)
          setStatus(PREVIEW_STATUS.ERROR)
          setError(data.error)
          
          logger.debug('Error event received:', data)
        } catch (e) {
          logger.error('Error parsing preview-error event:', e)
        }
      },
      'preview-navigation': (event) => {
        try {
          const data = JSON.parse(event.data)
          setCurrentScreen(data.screenPath)
          
          logger.debug('Navigation event received:', data)
        } catch (e) {
          logger.error('Error parsing preview-navigation event:', e)
        }
      },
      'preview-screen-load': (event) => {
        try {
          const data = JSON.parse(event.data)
          setCurrentScreen(data.screenPath)
          
          // Reset components and add the new ones
          const newComponents = {}
          data.components.forEach(comp => {
            newComponents[comp.id] = {
              type: comp.type,
              ...comp.properties
            }
          })
          setComponents(newComponents)
          
          logger.debug('Screen load event received:', data)
        } catch (e) {
          logger.error('Error parsing preview-screen-load event:', e)
        }
      },
      'preview-interaction-result': (event) => {
        try {
          const data = JSON.parse(event.data)
          logger.debug('Interaction result received:', data)
          // Handle interaction results if needed
        } catch (e) {
          logger.error('Error parsing preview-interaction-result event:', e)
        }
      }
    }
    
    // Create SSE connection
    sseConnectionRef.current = createSSEConnection(url, {
      onOpen: () => {
        logger.debug('Preview EventSource connection opened')
        setStatus(PREVIEW_STATUS.CONNECTING) // Will be updated to 'ready' when the preview-ready event is received
      },
      onClose: () => {
        logger.debug('Preview EventSource connection closed')
        setStatus(PREVIEW_STATUS.DISCONNECTED)
      },
      onError: (err) => {
        logger.error('Preview EventSource error:', err)
        setStatus(PREVIEW_STATUS.ERROR)
        setError('Connection to preview server lost. Attempting to reconnect...')
      },
      onMessage: (event) => {
        try {
          const data = JSON.parse(event.data)
          logger.debug('Generic message received:', data)
        } catch (e) {
          logger.error('Error parsing SSE event:', e)
        }
      },
      eventHandlers,
      autoReconnect: true,
      maxReconnectAttempts: 10,
      initialReconnectDelay: 1000,
      maxReconnectDelay: 30000
    })
    
  }, [uiFlowId])
  
  // Effect to connect to EventSource when component mounts
  useEffect(() => {
    connectToEventSource()
    
    // Clean up when component unmounts
    return () => {
      if (sseConnectionRef.current) {
        sseConnectionRef.current.close()
        sseConnectionRef.current = null
      }
    }
  }, [uiFlowId, connectToEventSource])
  
  // Handle back button click
  const handleBack = () => {
    navigate('/uiflows')
  }
  
  // Handle refresh button click
  const handleRefresh = () => {
    connectToEventSource()
  }
  
  // Handle component interaction
  const handleInteraction = async (componentId, eventType, data) => {
    if (!uiFlowId) return
    
    try {
      const result = await sendInteractionEvent(baseURL, uiFlowId, componentId, eventType, data)
      logger.debug('Interaction sent successfully:', result)
    } catch (error) {
      logger.error('Error sending interaction:', error)
      setError('Failed to send interaction to server')
    }
  }
  
  // Render loading state
  if (status === PREVIEW_STATUS.CONNECTING) {
    return (
      <MainCard>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh">
          <CircularProgress />
          <Typography variant="h4" sx={{ mt: 2 }}>
            Connecting to preview server...
          </Typography>
        </Box>
      </MainCard>
    )
  }
  
  // Render error state
  if (status === PREVIEW_STATUS.ERROR && error) {
    return (
      <MainCard>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh">
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <StyledButton variant="contained" onClick={handleRefresh} startIcon={<IconRefresh />}>
            Reconnect
          </StyledButton>
        </Box>
      </MainCard>
    )
  }
  
  // Main render
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="static"
        color="default"
        elevation={1}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack} sx={{ mr: 2 }}>
            <IconArrowLeft />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {uiFlowData?.name || 'UI Flow Preview'}
          </Typography>
          {status === PREVIEW_STATUS.RUNNING && flowProgress && (
            <Box display="flex" alignItems="center" sx={{ mr: 2 }}>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              <Typography variant="body2">
                Processing: {flowProgress.step}/{flowProgress.totalSteps}
              </Typography>
            </Box>
          )}
          <IconButton color="inherit" onClick={handleRefresh} title="Refresh">
            <IconRefresh />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Box flex={1} overflow="auto" p={2}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h4" gutterBottom>
            Preview Content
          </Typography>
          
          {currentScreen && (
            <Typography variant="subtitle1" gutterBottom>
              Current Screen: {currentScreen}
            </Typography>
          )}
          
          {/* This is where we would render the actual preview components */}
          {/* For this template, we'll just show the component data */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Component Data:</Typography>
            <pre style={{ 
              backgroundColor: theme.palette.background.default, 
              padding: '16px',
              borderRadius: '4px',
              overflowX: 'auto'
            }}>
              {JSON.stringify(components, null, 2)}
            </pre>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

export default UIFlowPreview 