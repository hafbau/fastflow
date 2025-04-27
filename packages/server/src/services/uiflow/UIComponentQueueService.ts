import { Queue, Worker, QueueEvents } from 'bullmq'
import { INodeData } from 'fastflow-components'
import { QueueManager } from '../../queue/QueueManager'
import logger from '../../utils/logger'
import { UIEventManager, UIEventType, UIEvent } from '../../events/UIEventManager'
import { UIComponentEventService } from './UIComponentEventService'

/**
 * Queue job types for UI component operations
 */
export enum UIComponentJobType {
    EVENT_PROCESSING = 'event-processing',
    AGENT_INTEGRATION = 'agent-integration',
    STATE_UPDATE = 'state-update',
    BATCH_OPERATION = 'batch-operation'
}

/**
 * Interface for UI component queue job data
 */
export interface UIComponentQueueJob {
    type: UIComponentJobType
    uiFlowId: string
    componentId: string
    event?: UIEvent
    data?: any
    timestamp: number
}

/**
 * Service for handling UI component queued operations
 * Integrates with QueueManager for async processing of UI component events
 */
export class UIComponentQueueService {
    private static instance: UIComponentQueueService
    private queue: Queue
    private worker: Worker
    private queueEvents: QueueEvents
    private eventManager: UIEventManager
    private componentEventService: UIComponentEventService
    private readonly QUEUE_NAME = 'ui-component-queue'

    private constructor() {
        // Get instances of required services
        this.eventManager = UIEventManager.getInstance()
        this.componentEventService = UIComponentEventService.getInstance()
        
        // Set up queue
        this.setupQueue()
        
        // Set up worker
        this.setupWorker()
        
        // Set up queue events
        this.setupQueueEvents()
    }

    /**
     * Get the singleton instance of UIComponentQueueService
     */
    public static getInstance(): UIComponentQueueService {
        if (!UIComponentQueueService.instance) {
            UIComponentQueueService.instance = new UIComponentQueueService()
        }
        return UIComponentQueueService.instance
    }

    /**
     * Set up the queue for UI component operations
     */
    private setupQueue(): void {
        const queueManager = QueueManager.getInstance()
        const connection = queueManager.getConnection()
        
        this.queue = new Queue(this.QUEUE_NAME, {
            connection,
            defaultJobOptions: {
                removeOnComplete: true,
                removeOnFail: 5,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000
                }
            }
        })
        
        logger.info(`UI Component Queue ${this.QUEUE_NAME} initialized`)
    }

    /**
     * Set up the worker for processing queue jobs
     */
    private setupWorker(): void {
        const queueManager = QueueManager.getInstance()
        const connection = queueManager.getConnection()
        
        this.worker = new Worker(this.QUEUE_NAME, async (job) => {
            const jobData: UIComponentQueueJob = job.data
            
            try {
                logger.debug(`Processing UI component job ${job.id} of type ${jobData.type}`)
                
                switch (jobData.type) {
                    case UIComponentJobType.EVENT_PROCESSING:
                        await this.processEventJob(jobData)
                        break
                    case UIComponentJobType.AGENT_INTEGRATION:
                        await this.processAgentIntegrationJob(jobData)
                        break
                    case UIComponentJobType.STATE_UPDATE:
                        await this.processStateUpdateJob(jobData)
                        break
                    case UIComponentJobType.BATCH_OPERATION:
                        await this.processBatchOperationJob(jobData)
                        break
                    default:
                        logger.warn(`Unknown job type: ${jobData.type}`)
                }
                
                return { processed: true, jobType: jobData.type }
            } catch (error) {
                logger.error(`Error processing UI component job ${job.id}:`, error)
                throw error
            }
        }, { connection })
        
        // Set up error handler
        this.worker.on('failed', (job, error) => {
            logger.error(`UI component job ${job?.id} failed:`, error)
        })
        
        logger.info(`UI Component Worker for queue ${this.QUEUE_NAME} initialized`)
    }

    /**
     * Set up queue events for monitoring
     */
    private setupQueueEvents(): void {
        const queueManager = QueueManager.getInstance()
        const connection = queueManager.getConnection()
        
        this.queueEvents = new QueueEvents(this.QUEUE_NAME, { connection })
        
        this.queueEvents.on('completed', ({ jobId }) => {
            logger.debug(`UI component job ${jobId} completed successfully`)
        })
        
        this.queueEvents.on('failed', ({ jobId, failedReason }) => {
            logger.error(`UI component job ${jobId} failed: ${failedReason}`)
        })
        
        logger.info(`UI Component Queue Events for ${this.QUEUE_NAME} initialized`)
    }

    /**
     * Add a job to the queue
     * @param jobData The job data
     * @param options Job options
     */
    public async addJob(
        jobData: UIComponentQueueJob,
        options: { priority?: number; delay?: number } = {}
    ): Promise<string> {
        try {
            const job = await this.queue.add(`${jobData.type}-${Date.now()}`, jobData, {
                priority: options.priority,
                delay: options.delay,
                jobId: `ui-${jobData.componentId}-${Date.now()}`
            })
            
            logger.debug(`Added UI component job ${job.id} to queue`)
            return job.id
        } catch (error) {
            logger.error('Error adding job to UI component queue:', error)
            throw error
        }
    }

    /**
     * Queue an event for processing
     * @param componentData Component node data
     * @param event The event to queue
     */
    public async queueEvent(
        componentData: INodeData,
        event: UIEvent
    ): Promise<string> {
        // Use type assertion to guarantee uiFlowId is a string
        const uiFlowId: string = (event.payload.uiFlowId as string) || '';
        const componentId = componentData.id;
        
        // Queue job for processing
        return this.addJob({
            type: UIComponentJobType.EVENT_PROCESSING,
            uiFlowId,
            componentId,
            event,
            timestamp: Date.now()
        }, {
            priority: componentData.inputs?.queuePriority as number || 1
        })
    }

    /**
     * Queue an agent integration job
     * @param uiFlowId ID of the UI flow
     * @param componentId ID of the component
     * @param agentParams Agent integration parameters
     */
    public async queueAgentIntegration(
        uiFlowId: string,
        componentId: string,
        agentParams: any
    ): Promise<string> {
        return this.addJob({
            type: UIComponentJobType.AGENT_INTEGRATION,
            uiFlowId,
            componentId,
            data: agentParams,
            timestamp: Date.now()
        })
    }

    /**
     * Process an event job
     * @param jobData The job data
     */
    private async processEventJob(jobData: UIComponentQueueJob): Promise<void> {
        if (!jobData.event) {
            throw new Error('Event is required for event processing job')
        }
        
        // Process via event manager
        await this.eventManager.processEvent(jobData.event)
    }

    /**
     * Process an agent integration job
     * @param jobData The job data
     */
    private async processAgentIntegrationJob(jobData: UIComponentQueueJob): Promise<void> {
        // Forward to agent integration system via UIComponentEventService
        await this.componentEventService.processComponentEvent(
            { 
                id: jobData.componentId, 
                name: '', 
                type: '', 
                label: '', 
                icon: '', 
                version: 1, 
                baseClasses: ['UINode'], 
                category: 'UI',
                inputs: {}
            },
            UIEventType.COMPONENT_INTERACTION,
            {
                uiFlowId: jobData.uiFlowId,
                componentId: jobData.componentId,
                action: 'agent-request',
                target: jobData.data?.agentId,
                data: jobData.data?.params,
                timestamp: jobData.timestamp
            }
        )
    }

    /**
     * Process a state update job
     * @param jobData The job data
     */
    private async processStateUpdateJob(jobData: UIComponentQueueJob): Promise<void> {
        // Process state update via component event service
        await this.componentEventService.processBatchUpdates(
            jobData.uiFlowId,
            [{
                componentId: jobData.componentId,
                properties: jobData.data?.properties || {}
            }]
        )
    }

    /**
     * Process a batch operation job
     * @param jobData The job data
     */
    private async processBatchOperationJob(jobData: UIComponentQueueJob): Promise<void> {
        // Handle batch operations
        const operations = jobData.data?.operations || []
        
        for (const operation of operations) {
            switch (operation.type) {
                case 'component-update':
                    await this.componentEventService.processBatchUpdates(
                        jobData.uiFlowId,
                        operation.updates
                    )
                    break
                case 'agent-request':
                    await this.processAgentIntegrationJob({
                        type: UIComponentJobType.AGENT_INTEGRATION,
                        uiFlowId: jobData.uiFlowId,
                        componentId: operation.componentId,
                        data: operation.params,
                        timestamp: jobData.timestamp
                    })
                    break
                default:
                    logger.warn(`Unknown batch operation type: ${operation.type}`)
            }
        }
    }

    /**
     * Get job counts for the UI component queue
     */
    public async getJobCounts(): Promise<Record<string, number>> {
        return this.queue.getJobCounts()
    }

    /**
     * Pause the queue
     */
    public async pause(): Promise<void> {
        await this.queue.pause()
    }

    /**
     * Resume the queue
     */
    public async resume(): Promise<void> {
        await this.queue.resume()
    }
} 