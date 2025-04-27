import { Queue, Worker } from 'bullmq'
import { INodeData } from 'fastflow-components'
import { QueueManager } from '../queue/QueueManager'
import { SSEStreamer } from '../utils/SSEStreamer'
import logger from '../utils/logger'

/**
 * UI Event types supported by the system
 */
export enum UIEventType {
    COMPONENT_UPDATE = 'component-update',
    COMPONENT_INTERACTION = 'component-interaction',
    FLOW_PROGRESS = 'flow-progress',
    FLOW_COMPLETE = 'flow-complete',
    FLOW_ERROR = 'flow-error',
    NAVIGATION = 'navigation'
}

/**
 * UI Event payload interface
 */
export interface UIEventPayload {
    uiFlowId: string
    componentId?: string
    properties?: Record<string, any>
    status?: 'pending' | 'running' | 'complete' | 'error'
    message?: string
    error?: string
    timestamp: number
    [key: string]: any
}

/**
 * UI Event interface
 */
export interface UIEvent {
    type: UIEventType
    payload: UIEventPayload
}

/**
 * UI Event observer interface
 */
export interface UIEventObserver {
    update(event: UIEvent): void
}

/**
 * UI Event options for queue processing
 */
export interface UIEventQueueOptions {
    priority?: number
    delay?: number
    removeOnComplete?: boolean
    removeOnFail?: boolean
}

/**
 * UIEventManager class that implements the Observer pattern
 * and integrates with QueueManager for async operations
 */
export class UIEventManager {
    private static instance: UIEventManager
    private observers: Map<string, UIEventObserver[]> = new Map()
    private sseStreamer: SSEStreamer
    private queue: Queue
    private worker: Worker

    private constructor() {
        this.sseStreamer = new SSEStreamer()
        
        // Initialize queue using BullMQ
        const queueManager = QueueManager.getInstance()
        const connection = queueManager.getConnection()
        
        // Create dedicated UI event queue
        this.queue = new Queue('ui-events-queue', {
            connection,
            defaultJobOptions: {
                removeOnComplete: true,
                removeOnFail: 5
            }
        })
        
        // Set up worker to process queue jobs
        this.setupQueueWorker()
    }

    /**
     * Get the singleton instance of UIEventManager
     */
    public static getInstance(): UIEventManager {
        if (!UIEventManager.instance) {
            UIEventManager.instance = new UIEventManager()
        }
        return UIEventManager.instance
    }

    /**
     * Set up the queue worker to process UI events
     */
    private setupQueueWorker(): void {
        const connection = QueueManager.getInstance().getConnection()
        
        // Create worker for processing queue jobs
        this.worker = new Worker('ui-events-queue', async (job) => {
            try {
                const event: UIEvent = job.data
                logger.debug(`Processing UI event from queue: ${event.type}`)
                
                // Notify all observers
                this.notifyObservers(event)
                
                // Stream event to clients via SSE
                this.streamEventToClients(event)
                
                return { processed: true, eventType: event.type }
            } catch (error) {
                logger.error('Error processing UI event from queue:', error)
                throw error
            }
        }, { connection })
    }

    /**
     * Register an observer for UI events
     * @param eventType The event type to observe
     * @param observer The observer to register
     */
    public registerObserver(eventType: UIEventType, observer: UIEventObserver): void {
        if (!this.observers.has(eventType)) {
            this.observers.set(eventType, [])
        }
        this.observers.get(eventType)?.push(observer)
    }

    /**
     * Unregister an observer from UI events
     * @param eventType The event type to stop observing
     * @param observer The observer to unregister
     */
    public unregisterObserver(eventType: UIEventType, observer: UIEventObserver): void {
        if (this.observers.has(eventType)) {
            const currentObservers = this.observers.get(eventType) || []
            this.observers.set(
                eventType,
                currentObservers.filter((obs) => obs !== observer)
            )
        }
    }

    /**
     * Notify all observers about an event
     * @param event The event to notify about
     */
    private notifyObservers(event: UIEvent): void {
        const observers = this.observers.get(event.type) || []
        for (const observer of observers) {
            try {
                observer.update(event)
            } catch (error) {
                logger.error(`Error notifying observer about ${event.type} event:`, error)
            }
        }
    }

    /**
     * Stream event to clients via SSE
     * @param event The event to stream
     */
    private streamEventToClients(event: UIEvent): void {
        const { uiFlowId } = event.payload
        
        // Use SSE to stream the event to connected clients
        try {
            // Use custom event type for SSE stream
            const sseEventType = `ui-${event.type}`
            
            // Enhance payload with timestamp if not already present
            const enhancedPayload = {
                ...event.payload,
                timestamp: event.payload.timestamp || Date.now()
            }
            
            // Add metadata for tracking
            const metadata = {
                id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                type: event.type,
                timestamp: Date.now()
            }
            
            // Stream the event with metadata
            this.sseStreamer.streamCustomEvent(
                uiFlowId, 
                sseEventType, 
                enhancedPayload
            )
            
            logger.debug(`Streamed ${event.type} event to clients for UI Flow ${uiFlowId}`)
        } catch (error) {
            logger.error(`Error streaming ${event.type} event to clients:`, error)
        }
    }

    /**
     * Process a UI event - add to queue for async processing
     * @param event The event to process
     * @param options Queue options
     */
    public async processEvent(event: UIEvent, options: UIEventQueueOptions = {}): Promise<void> {
        try {
            // Add event to queue for async processing
            await this.queue.add(`ui-event-${event.type}`, event, {
                priority: options.priority,
                delay: options.delay,
                removeOnComplete: options.removeOnComplete ?? true,
                removeOnFail: options.removeOnFail ?? 5
            })
            
            logger.debug(`Added ${event.type} event to queue for async processing`)
        } catch (error) {
            logger.error(`Error adding ${event.type} event to queue:`, error)
            
            // Fallback to direct processing if queue fails
            this.notifyObservers(event)
            this.streamEventToClients(event)
        }
    }

    /**
     * Handle component event directly from a UI node
     * @param uiNode The UI node triggering the event
     * @param eventType The type of event
     * @param payload Additional event data
     */
    public async handleComponentEvent(
        uiNode: INodeData,
        eventType: UIEventType,
        payload: Partial<UIEventPayload>
    ): Promise<void> {
        // Create event with standard payload structure
        const event: UIEvent = {
            type: eventType,
            payload: {
                uiFlowId: payload.uiFlowId || '',
                componentId: uiNode.id,
                timestamp: Date.now(),
                ...payload
            }
        }
        
        // Process the event
        await this.processEvent(event)
    }
    
    /**
     * Handle batch component updates efficiently
     * @param uiFlowId The UI flow ID
     * @param updates Array of component updates
     */
    public async handleBatchUpdates(
        uiFlowId: string,
        updates: Array<{componentId: string, properties: Record<string, any>}>
    ): Promise<void> {
        // Create batch update event
        const event: UIEvent = {
            type: UIEventType.COMPONENT_UPDATE,
            payload: {
                uiFlowId,
                timestamp: Date.now(),
                isBatch: true,
                updates
            }
        }
        
        // Process the batch event
        await this.processEvent(event)
    }
} 