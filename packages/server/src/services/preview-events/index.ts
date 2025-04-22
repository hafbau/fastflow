import { SSEStreamer } from '../../utils/SSEStreamer'
import logger from '../../utils/logger'

/**
 * Service for managing UI preview events
 */
export class PreviewEventService {
    private sseStreamer: SSEStreamer
    
    constructor(sseStreamer: SSEStreamer) {
        this.sseStreamer = sseStreamer
    }
    
    /**
     * Send a component update event
     */
    async sendComponentUpdate(previewId: string, componentId: string, properties: Record<string, any>): Promise<void> {
        try {
            const event = {
                version: '1.0',
                timestamp: Date.now(),
                previewId,
                type: 'component-update',
                componentId,
                properties,
                state: 'complete'
            }
            
            await this.sseStreamer.streamCustomEvent(
                previewId,
                'preview-component-update',
                event
            )
            
            logger.debug(`Sent component update for preview ${previewId}, component ${componentId}`)
        } catch (error) {
            logger.error(`Error sending component update: ${error}`)
        }
    }
    
    /**
     * Send a flow progress event
     */
    async sendFlowProgress(previewId: string, step: number, totalSteps: number, status: 'running' | 'complete' | 'error', currentNodeId?: string): Promise<void> {
        try {
            const event = {
                version: '1.0',
                timestamp: Date.now(),
                previewId,
                type: 'flow-progress',
                step,
                totalSteps,
                status,
                currentNodeId
            }
            
            await this.sseStreamer.streamCustomEvent(
                previewId,
                'preview-progress',
                event
            )
            
            logger.debug(`Sent flow progress for preview ${previewId}: ${step}/${totalSteps} - ${status}`)
        } catch (error) {
            logger.error(`Error sending flow progress: ${error}`)
        }
    }
    
    /**
     * Send an error event
     */
    async sendErrorEvent(previewId: string, error: string, componentId?: string): Promise<void> {
        try {
            const event = {
                version: '1.0',
                timestamp: Date.now(),
                previewId,
                type: 'error',
                error,
                componentId
            }
            
            await this.sseStreamer.streamCustomEvent(
                previewId,
                'preview-error',
                event
            )
            
            logger.debug(`Sent error event for preview ${previewId}: ${error}`)
        } catch (err) {
            logger.error(`Error sending error event: ${err}`)
        }
    }
    
    /**
     * Send a batch update for multiple components
     */
    async sendBatchUpdate(previewId: string, updates: Array<{ componentId: string, properties: Record<string, any> }>): Promise<void> {
        try {
            const event = {
                version: '1.0',
                timestamp: Date.now(),
                previewId,
                type: 'batch-update',
                updates
            }
            
            await this.sseStreamer.streamCustomEvent(
                previewId,
                'preview-batch-update',
                event
            )
            
            logger.debug(`Sent batch update for preview ${previewId} with ${updates.length} components`)
        } catch (error) {
            logger.error(`Error sending batch update: ${error}`)
        }
    }
    
    /**
     * Send a preview ready event
     */
    async sendPreviewReady(previewId: string): Promise<void> {
        try {
            const event = {
                version: '1.0',
                timestamp: Date.now(),
                previewId,
                type: 'ready'
            }
            
            await this.sseStreamer.streamCustomEvent(
                previewId,
                'preview-ready',
                event
            )
            
            logger.debug(`Sent preview ready event for ${previewId}`)
        } catch (error) {
            logger.error(`Error sending preview ready event: ${error}`)
        }
    }

    /**
     * Send a navigation event to change screens in preview
     */
    async sendNavigationEvent(previewId: string, screenPath: string, params?: Record<string, any>): Promise<void> {
        try {
            const event = {
                version: '1.0',
                timestamp: Date.now(),
                previewId,
                type: 'navigation',
                screenPath,
                params
            }
            
            await this.sseStreamer.streamCustomEvent(
                previewId,
                'preview-navigation',
                event
            )
            
            logger.debug(`Sent navigation event for preview ${previewId} to screen ${screenPath}`)
        } catch (error) {
            logger.error(`Error sending navigation event: ${error}`)
        }
    }
    
    /**
     * Send a screen load event with all component data
     */
    async sendScreenLoadEvent(previewId: string, screenId: string, screenPath: string, components: Array<{ id: string, type: string, properties: Record<string, any> }>): Promise<void> {
        try {
            const event = {
                version: '1.0',
                timestamp: Date.now(),
                previewId,
                type: 'screen-load',
                screenId,
                screenPath,
                components
            }
            
            await this.sseStreamer.streamCustomEvent(
                previewId,
                'preview-screen-load',
                event
            )
            
            logger.debug(`Sent screen load event for preview ${previewId}, screen ${screenId} with ${components.length} components`)
        } catch (error) {
            logger.error(`Error sending screen load event: ${error}`)
        }
    }
    
    /**
     * Send a user interaction event confirmation
     */
    async sendUserInteractionEvent(previewId: string, interactionId: string, componentId: string, eventType: string, result: any): Promise<void> {
        try {
            const event = {
                version: '1.0',
                timestamp: Date.now(),
                previewId,
                type: 'interaction-result',
                interactionId,
                componentId,
                eventType,
                result
            }
            
            await this.sseStreamer.streamCustomEvent(
                previewId,
                'preview-interaction-result',
                event
            )
            
            logger.debug(`Sent interaction result for preview ${previewId}, interaction ${interactionId}`)
        } catch (error) {
            logger.error(`Error sending interaction result: ${error}`)
        }
    }
}

/**
 * Create a new preview event service
 */
export function createPreviewEventService(sseStreamer: SSEStreamer): PreviewEventService {
    return new PreviewEventService(sseStreamer)
}

export default {
    createPreviewEventService
} 