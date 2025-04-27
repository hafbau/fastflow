import { INodeData, ICommonObject } from '../../src/Interface'
import { UINodeBase, UIEvent, UINodeProperty } from '../../src/UIInterface'

/**
 * Enhanced UINodeBase class with integrated event functionality
 * Extends the base UINodeBase to provide improved event handling
 */
export abstract class EventEnabledUINode extends UINodeBase {
    // Store event listeners
    protected eventListeners: Map<string, ((data: any) => void)[]> = new Map()
    protected isQueueEnabled: boolean = false
    protected queueOptions: ICommonObject = {
        priority: 1,
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        }
    }
    protected eventProcessorUrl?: string
    
    constructor(nodeData: INodeData) {
        super(nodeData)
        // Initialize queueing if specified in node data
        if (nodeData.inputs?.queueEnabled === true) {
            this.enableQueue()
        }
        
        // Set queue options if provided
        if (nodeData.inputs?.queueOptions) {
            this.queueOptions = {
                ...this.queueOptions,
                ...nodeData.inputs.queueOptions
            }
        }
        
        // Set event processor URL if provided
        this.eventProcessorUrl = nodeData.inputs?.eventProcessorUrl as string
    }

    /**
     * Subscribe to a specific event type
     * @param eventType Type of event to listen for
     * @param callback Function to call when event occurs
     */
    public subscribe(eventType: string, callback: (data: any) => void): void {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, [])
        }
        this.eventListeners.get(eventType)?.push(callback)
        this.logger.debug(`${this.label} subscribed to ${eventType} event`)
    }

    /**
     * Unsubscribe from a specific event type
     * @param eventType Type of event to stop listening for
     * @param callback Function to remove (if not provided, removes all listeners)
     */
    public unsubscribe(eventType: string, callback?: (data: any) => void): void {
        if (!callback) {
            // Remove all listeners for this event type
            this.eventListeners.delete(eventType)
            this.logger.debug(`${this.label} unsubscribed from all ${eventType} events`)
        } else if (this.eventListeners.has(eventType)) {
            // Remove specific listener
            const listeners = this.eventListeners.get(eventType) || []
            this.eventListeners.set(
                eventType,
                listeners.filter(listener => listener !== callback)
            )
            this.logger.debug(`${this.label} unsubscribed from ${eventType} event`)
        }
    }

    /**
     * Publish an event to all subscribers
     * @param eventType Type of event to publish
     * @param data Data to pass to subscribers
     */
    protected publish(eventType: string, data: any): void {
        const listeners = this.eventListeners.get(eventType) || []
        for (const listener of listeners) {
            try {
                listener(data)
            } catch (error) {
                this.logger.error(`Error in event listener for ${eventType}:`, error)
            }
        }
    }

    /**
     * Get queue configuration options
     * Allows components to specify how their events should be queued
     */
    public getQueueOptions(): { priority: number, attempts: number } {
        return {
            priority: this.queueOptions.priority,
            attempts: this.queueOptions.attempts
        }
    }
    
    /**
     * Generate a unique cache key for this component
     * Used for caching component state and results
     */
    public getCacheKey(): string {
        return `ui-component:${this.id}:${this.label}:${Date.now()}`
    }

    /**
     * Enhanced event handler that publishes events to subscribers
     * @param event The UI event to handle
     */
    async handleEvent(event: UIEvent): Promise<void> {
        // Publish event to subscribers
        this.publish(event.type, event.payload)
        
        // Augment payload with component information
        const enhancedPayload = {
            ...event.payload,
            componentId: this.id,
            componentType: this.type,
            timestamp: Date.now()
        }
        
        // Create enhanced event object
        const enhancedEvent: UIEvent = {
            type: event.type,
            payload: enhancedPayload
        }
        
        // Call any specialized event handling logic
        await this.onEvent(enhancedEvent)
        
        // If queuing is enabled, send event to queue
        if (this.isQueueEnabled) {
            await this.queueEvent(enhancedEvent)
        }
    }
    
    /**
     * Enable queuing for this component
     */
    public enableQueue(): void {
        this.isQueueEnabled = true
        this.logger.debug(`Queue enabled for component ${this.id}`)
    }
    
    /**
     * Disable queuing for this component
     */
    public disableQueue(): void {
        this.isQueueEnabled = false
        this.logger.debug(`Queue disabled for component ${this.id}`)
    }
    
    /**
     * Send event to queue for async processing
     * This method should be called by the framework, not directly by component implementations
     * @param event Event to queue
     */
    protected async queueEvent(event: UIEvent): Promise<void> {
        try {
            if (!this.eventProcessorUrl) {
                this.logger.error(`Cannot queue event: No event processor URL configured for component ${this.id}`)
                return
            }
            
            // Send event to server-side queue via API
            const response = await fetch(this.eventProcessorUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    eventType: event.type,
                    payload: {
                        ...event.payload,
                        queueOptions: this.queueOptions
                    }
                })
            })
            
            if (!response.ok) {
                throw new Error(`Failed to queue event: ${response.statusText}`)
            }
            
            this.logger.debug(`${this.label} queued event ${event.type}`)
        } catch (error) {
            this.logger.error(`Error queuing event for ${this.label}:`, error)
            // Even if queuing fails, still publish locally
            this.publish('queue-error', { error, originalEvent: event })
        }
    }
    
    /**
     * Process the response from an agent or async operation
     * This method is called when the component receives a response from 
     * an async operation like an agent interaction
     * @param response The response data
     */
    public async processResponse(response: any): Promise<void> {
        try {
            // Create response event
            const responseEvent: UIEvent = {
                type: 'response',
                payload: {
                    componentId: this.id,
                    data: response,
                    timestamp: Date.now()
                }
            }
            
            // Publish the response event
            this.publish('response', responseEvent.payload)
            
            // Call specialized response handling
            await this.onResponse(response)
        } catch (error) {
            this.logger.error(`Error processing response for ${this.label}:`, error)
            this.publish('error', { error, componentId: this.id })
        }
    }
    
    /**
     * Optional method to handle specific event types
     * Should be overridden by child classes
     * @param event The UI event to handle
     */
    protected async onEvent(event: UIEvent): Promise<void> {
        // Default implementation does nothing
        // Child classes should override this
    }
    
    /**
     * Optional method to handle responses from async operations
     * Should be overridden by child classes that need to process responses
     * @param response The response data
     */
    protected async onResponse(response: any): Promise<void> {
        // Default implementation does nothing
        // Child classes should override this
    }
    
    /**
     * Update component properties and trigger event
     * @param properties Properties to update
     */
    public async updateProperties(properties: ICommonObject): Promise<void> {
        // Update internal properties
        for (const [key, value] of Object.entries(properties)) {
            const propIndex = this.properties.findIndex(p => p.name === key)
            if (propIndex >= 0) {
                this.properties[propIndex].value = value
            } else {
                this.addProperty({
                    name: key,
                    type: typeof value as string,
                    value
                })
            }
        }
        
        // Create update event
        const updateEvent: UIEvent = {
            type: 'property-update',
            payload: {
                componentId: this.id,
                properties
            }
        }
        
        // Handle the event
        await this.handleEvent(updateEvent)
    }
} 