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
    protected queue?: () => Promise<void>

    constructor(nodeData: INodeData) {
        super(nodeData)
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
     * Enhanced event handler that publishes events to subscribers
     * @param event The UI event to handle
     */
    async handleEvent(event: UIEvent): Promise<void> {
        // Publish event to subscribers
        this.publish(event.type, event.payload)
        
        // Call any specialized event handling logic
        await this.onEvent(event)
        
        // If queuing is enabled, send event to queue
        if (this.isQueueEnabled) {
            await this.queueEvent(event)
        }
    }
    
    /**
     * Enable queuing for this component
     */
    public enableQueue(): void {
        this.isQueueEnabled = true
    }
    
    /**
     * Send event to queue for async processing
     * @param event Event to queue
     */
    protected async queueEvent(event: UIEvent): Promise<void> {
        try {
            // Implementation will depend on server-side queue integration
            await this.queue?.()
            this.logger.debug(`${this.label} queued event ${event.type}`)
        } catch (error) {
            this.logger.error(`Error queuing event for ${this.label}:`, error)
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