import { INodeData } from 'fastflow-components'
import { UIEventManager, UIEventType, UIEvent, UIEventPayload } from '../../events/UIEventManager'
import logger from '../../utils/logger'
import { SSEStreamer } from '../../utils/SSEStreamer'
import { QueueManager } from '../../queue/QueueManager'
import { UIComponentQueueService } from './UIComponentQueueService'
import { UIComponentJobType } from './UIComponentQueueService'
import { CachePool } from '../../CachePool'

/**
 * Service for handling UI component events
 * This service integrates UIEventManager with the existing server infrastructure
 */
export class UIComponentEventService {
    private static instance: UIComponentEventService
    private eventManager: UIEventManager
    private sseStreamer: SSEStreamer
    private queueService: UIComponentQueueService
    private cachePool: CachePool

    private constructor() {
        // Get instances of required services
        this.eventManager = UIEventManager.getInstance()
        this.sseStreamer = new SSEStreamer()
        this.queueService = UIComponentQueueService.getInstance()
        this.cachePool = CachePool.getInstance()
        
        // Setup event listeners
        this.setupEventListeners()
    }

    /**
     * Get the singleton instance of UIComponentEventService
     */
    public static getInstance(): UIComponentEventService {
        if (!UIComponentEventService.instance) {
            UIComponentEventService.instance = new UIComponentEventService()
        }
        return UIComponentEventService.instance
    }

    /**
     * Setup event listeners for integration with other systems
     */
    private setupEventListeners(): void {
        // Register with UIEventManager for events we're interested in
        // For example, to log component update events
        this.eventManager.registerObserver(UIEventType.COMPONENT_UPDATE, {
            update: (event: UIEvent) => {
                logger.debug('Component update event received:', event)
                
                // Cache component state if applicable
                this.cacheComponentState(event)
            }
        })
        
        // For integrating component interaction events with agents
        this.eventManager.registerObserver(UIEventType.COMPONENT_INTERACTION, {
            update: (event: UIEvent) => {
                logger.debug('Component interaction event received:', event)
                // Forward to appropriate agent flows or other processing
                this.handleComponentInteraction(event)
            }
        })
        
        // For handling flow progress events
        this.eventManager.registerObserver(UIEventType.FLOW_PROGRESS, {
            update: (event: UIEvent) => {
                logger.debug('Flow progress event received:', event)
                // Update UI to show progress of agent execution
                this.handleFlowProgress(event)
            }
        })
        
        // For handling flow completion events
        this.eventManager.registerObserver(UIEventType.FLOW_COMPLETE, {
            update: (event: UIEvent) => {
                logger.debug('Flow complete event received:', event)
                // Update UI components with results
                this.handleFlowComplete(event)
            }
        })
        
        // For handling flow error events
        this.eventManager.registerObserver(UIEventType.FLOW_ERROR, {
            update: (event: UIEvent) => {
                logger.error('Flow error event received:', event)
                // Show error in UI
                this.handleFlowError(event)
            }
        })
        
        // For handling navigation events
        this.eventManager.registerObserver(UIEventType.NAVIGATION, {
            update: (event: UIEvent) => {
                logger.debug('Navigation event received:', event)
                // Handle navigation between screens/views
                this.handleNavigation(event)
            }
        })
    }

    /**
     * Process a component event
     * @param uiNode Component node data
     * @param eventType Type of event
     * @param payload Event payload data
     */
    public async processComponentEvent(
        uiNode: INodeData,
        eventType: UIEventType,
        payload: Partial<UIEventPayload>
    ): Promise<void> {
        await this.eventManager.handleComponentEvent(uiNode, eventType, payload)
    }

    /**
     * Handle component batch updates
     * @param uiFlowId ID of the UI flow
     * @param updates Array of component updates
     */
    public async processBatchUpdates(
        uiFlowId: string,
        updates: Array<{componentId: string, properties: Record<string, any>}>
    ): Promise<void> {
        await this.eventManager.handleBatchUpdates(uiFlowId, updates)
    }

    /**
     * Handle component interaction events, particularly for agent integration
     * @param event Component interaction event
     */
    private async handleComponentInteraction(event: UIEvent): Promise<void> {
        const { uiFlowId, componentId, action, target } = event.payload
        
        try {
            // Check if this is an agent interaction event
            if (action === 'agent-request' && target) {
                await this.queueAgentRequest(event.payload)
            }
            
            // Handle general UI navigation if specified
            if (action === 'navigate' && target) {
                this.sseStreamer.streamCustomEvent(uiFlowId, 'ui-navigation', {
                    uiFlowId,
                    fromComponentId: componentId,
                    targetScreen: target,
                    timestamp: Date.now()
                })
            }
            
            // Handle component state changes
            if (action === 'state-change' && event.payload.properties) {
                await this.queueService.queueJob({
                    type: UIComponentJobType.STATE_UPDATE,
                    uiFlowId,
                    componentId,
                    data: event.payload.properties,
                    timestamp: Date.now()
                })
            }
            
            // Handle form submissions
            if (action === 'form-submit' && event.payload.formData) {
                await this.processFormSubmission(uiFlowId, componentId, event.payload.formData)
            }
        } catch (error) {
            logger.error('Error handling component interaction:', error)
            
            // Send error back to client
            this.sseStreamer.streamCustomEvent(uiFlowId, 'ui-error', {
                uiFlowId,
                componentId,
                error: 'Failed to process interaction: ' + (error instanceof Error ? error.message : String(error)),
                timestamp: Date.now()
            })
        }
    }
    
    /**
     * Queue an agent request for processing
     * @param payload The payload containing agent request details
     */
    private async queueAgentRequest(payload: UIEventPayload): Promise<void> {
        const { uiFlowId, componentId, target: agentFlowId, properties } = payload
        
        try {
            logger.debug(`Queueing agent request from component ${componentId} to agent flow ${agentFlowId}`)
            
            // Notify client that request is being processed
            this.sseStreamer.streamCustomEvent(uiFlowId, 'ui-agent-request-status', {
                uiFlowId,
                componentId,
                agentFlowId,
                status: 'queued',
                timestamp: Date.now()
            })
            
            // Queue the job for processing
            await this.queueService.queueJob({
                type: UIComponentJobType.AGENT_INTEGRATION,
                uiFlowId,
                componentId,
                data: {
                    agentFlowId,
                    inputs: properties || {},
                    requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
                },
                timestamp: Date.now()
            })
            
            logger.debug(`Agent request from component ${componentId} queued successfully`)
        } catch (error) {
            logger.error(`Error queueing agent request: ${error instanceof Error ? error.message : String(error)}`)
            
            // Notify client of error
            this.sseStreamer.streamCustomEvent(uiFlowId, 'ui-agent-request-status', {
                uiFlowId,
                componentId,
                agentFlowId,
                status: 'error',
                error: `Failed to queue agent request: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: Date.now()
            })
        }
    }

    /**
     * Process form submission
     * @param uiFlowId ID of the UI flow
     * @param componentId ID of the component
     * @param formData Form data to process
     */
    private async processFormSubmission(
        uiFlowId: string,
        componentId: string,
        formData: Record<string, any>
    ): Promise<void> {
        try {
            logger.debug(`Processing form submission from component ${componentId}`)
            
            // Validate form data
            // This is a placeholder for actual validation logic
            const isValid = true
            const validationErrors: Record<string, string> = {}
            
            if (!isValid) {
                this.sseStreamer.streamCustomEvent(uiFlowId, 'ui-form-validation', {
                    uiFlowId,
                    componentId,
                    status: 'error',
                    errors: validationErrors,
                    timestamp: Date.now()
                })
                return
            }
            
            // Process form data
            // This could involve saving to database, triggering an agent flow, etc.
            // For this implementation, we'll just acknowledge the submission
            this.sseStreamer.streamCustomEvent(uiFlowId, 'ui-form-submission', {
                uiFlowId,
                componentId,
                status: 'received',
                timestamp: Date.now()
            })
            
            // If form submission should trigger an agent, queue that
            if (formData.targetAgentId) {
                await this.queueAgentRequest({
                    uiFlowId,
                    componentId,
                    target: formData.targetAgentId,
                    properties: formData,
                    timestamp: Date.now()
                })
            }
        } catch (error) {
            logger.error(`Error processing form submission: ${error instanceof Error ? error.message : String(error)}`)
            
            this.sseStreamer.streamCustomEvent(uiFlowId, 'ui-form-submission', {
                uiFlowId,
                componentId,
                status: 'error',
                error: `Failed to process form: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: Date.now()
            })
        }
    }
    
    /**
     * Handle flow progress events
     * @param event Flow progress event
     */
    private handleFlowProgress(event: UIEvent): void {
        const { uiFlowId, agentFlowId, progress, step, totalSteps } = event.payload
        
        // Forward the progress to clients via SSE
        this.sseStreamer.streamCustomEvent(uiFlowId, 'ui-flow-progress', {
            uiFlowId,
            agentFlowId,
            progress: progress || (step && totalSteps ? (step / totalSteps) * 100 : 0),
            step,
            totalSteps,
            status: 'running',
            timestamp: Date.now()
        })
    }
    
    /**
     * Handle flow completion events
     * @param event Flow completion event
     */
    private handleFlowComplete(event: UIEvent): void {
        const { uiFlowId, agentFlowId, componentId, results } = event.payload
        
        // Update clients via SSE
        this.sseStreamer.streamCustomEvent(uiFlowId, 'ui-flow-complete', {
            uiFlowId,
            agentFlowId,
            componentId,
            results,
            status: 'complete',
            timestamp: Date.now()
        })
        
        // If there are components to update with the results, process those
        if (event.payload.updates && Array.isArray(event.payload.updates)) {
            this.processBatchUpdates(uiFlowId, event.payload.updates)
        }
    }
    
    /**
     * Handle flow error events
     * @param event Flow error event
     */
    private handleFlowError(event: UIEvent): void {
        const { uiFlowId, agentFlowId, componentId, error } = event.payload
        
        // Update clients via SSE
        this.sseStreamer.streamCustomEvent(uiFlowId, 'ui-flow-error', {
            uiFlowId,
            agentFlowId,
            componentId,
            error,
            status: 'error',
            timestamp: Date.now()
        })
    }
    
    /**
     * Handle navigation events
     * @param event Navigation event
     */
    private handleNavigation(event: UIEvent): void {
        const { uiFlowId, target: screenId, componentId } = event.payload
        
        // Forward navigation to clients
        this.sseStreamer.streamCustomEvent(uiFlowId, 'ui-navigation', {
            uiFlowId,
            fromComponentId: componentId,
            targetScreen: screenId,
            timestamp: Date.now()
        })
    }
    
    /**
     * Cache component state for persistence and optimization
     * @param event Component update event
     */
    private cacheComponentState(event: UIEvent): void {
        const { uiFlowId, componentId, properties } = event.payload
        
        if (!properties) return
        
        try {
            // Generate cache key
            const cacheKey = `ui_component:${uiFlowId}:${componentId}`
            
            // Store in cache
            this.cachePool.setCacheData(cacheKey, properties)
            
            logger.debug(`Cached state for component ${componentId} in flow ${uiFlowId}`)
        } catch (error) {
            logger.error(`Error caching component state: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    /**
     * Process agent response and send updates to UI components
     * @param uiFlowId ID of the UI flow
     * @param componentId ID of the component that initiated the request
     * @param response Agent response data
     */
    public async processAgentResponse(
        uiFlowId: string,
        componentId: string,
        response: any
    ): Promise<void> {
        try {
            // Create response event
            const responsePayload: UIEventPayload = {
                uiFlowId,
                componentId,
                response,
                timestamp: Date.now(),
                status: 'complete'
            }
            
            // Send response via SSE
            this.sseStreamer.streamCustomEvent(uiFlowId, 'ui-agent-response', responsePayload)
            
            logger.debug(`Processed agent response for UI component ${componentId}`)
        } catch (error) {
            logger.error('Error processing agent response:', error)
            
            // Send error back to client
            this.sseStreamer.streamCustomEvent(uiFlowId, 'ui-error', {
                uiFlowId,
                componentId,
                error: 'Failed to process agent response: ' + (error instanceof Error ? error.message : String(error)),
                timestamp: Date.now()
            })
        }
    }
    
    /**
     * Get cached component state
     * @param uiFlowId ID of the UI flow
     * @param componentId ID of the component
     */
    public async getComponentState(
        uiFlowId: string,
        componentId: string
    ): Promise<Record<string, any> | null> {
        try {
            // Generate cache key
            const cacheKey = `ui_component:${uiFlowId}:${componentId}`
            
            // Retrieve from cache
            const state = await this.cachePool.getCacheData(cacheKey)
            return state || null
        } catch (error) {
            logger.error(`Error retrieving component state: ${error instanceof Error ? error.message : String(error)}`)
            return null
        }
    }
    
    /**
     * Emit a custom event to UI component clients
     * @param uiFlowId ID of the UI flow
     * @param eventName Custom event name
     * @param payload Event data
     */
    public emitCustomEvent(
        uiFlowId: string,
        eventName: string,
        payload: Record<string, any>
    ): void {
        try {
            this.sseStreamer.streamCustomEvent(uiFlowId, `ui-custom-${eventName}`, {
                ...payload,
                uiFlowId,
                timestamp: Date.now()
            })
            
            logger.debug(`Emitted custom event '${eventName}' for UI flow ${uiFlowId}`)
        } catch (error) {
            logger.error(`Error emitting custom event: ${error instanceof Error ? error.message : String(error)}`)
        }
    }
} 