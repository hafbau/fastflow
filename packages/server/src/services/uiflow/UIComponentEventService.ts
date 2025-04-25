import { INodeData } from 'fastflow-components'
import { UIEventManager, UIEventType, UIEvent, UIEventPayload } from '../../events/UIEventManager'
import logger from '../../utils/logger'
import { SSEStreamer } from '../../utils/SSEStreamer'
import { QueueManager } from '../../queue/QueueManager'

/**
 * Service for handling UI component events
 * This service integrates UIEventManager with the existing server infrastructure
 */
export class UIComponentEventService {
    private static instance: UIComponentEventService
    private eventManager: UIEventManager
    private sseStreamer: SSEStreamer

    private constructor() {
        // Get instances of required services
        this.eventManager = UIEventManager.getInstance()
        this.sseStreamer = new SSEStreamer()
        
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
     * Queue an agent request for processing by the appropriate queue
     * @param payload Event payload containing request details
     */
    private async queueAgentRequest(payload: UIEventPayload): Promise<void> {
        const { uiFlowId, componentId, target, data } = payload
        
        try {
            // Get prediction queue from QueueManager
            const queueManager = QueueManager.getInstance()
            const predictionQueue = queueManager.getQueue('prediction')
            
            // Add job to queue
            await predictionQueue.addJob({
                chatflow: target, // Target is the chatflow ID
                componentId,
                uiFlowId,
                input: data?.input || {},
                overrideConfig: data?.config || {},
                chatId: `ui-${uiFlowId}-${componentId}-${Date.now()}`,
                isUiRequest: true
            })
            
            logger.debug(`Queued agent request for UI component ${componentId} targeting ${target}`)
        } catch (error) {
            logger.error('Failed to queue agent request:', error)
            throw error
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
} 