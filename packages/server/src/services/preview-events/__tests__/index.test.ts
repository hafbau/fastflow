import { SSEStreamer } from '../../../utils/SSEStreamer'
import { createPreviewEventService, PreviewEventService } from '../index'
import logger from '../../../utils/logger'

// Mock dependencies
jest.mock('../../../utils/SSEStreamer')
jest.mock('../../../utils/logger')

describe('PreviewEventService', () => {
    let mockSSEStreamer: jest.Mocked<SSEStreamer>
    let previewEventService: PreviewEventService

    beforeEach(() => {
        mockSSEStreamer = {
            streamCustomEvent: jest.fn().mockResolvedValue(undefined),
            addClient: jest.fn(),
            removeClient: jest.fn(),
            clients: {}
        } as unknown as jest.Mocked<SSEStreamer>
        
        previewEventService = createPreviewEventService(mockSSEStreamer)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('sendComponentUpdate', () => {
        it('should send a component update event', async () => {
            const previewId = 'preview123'
            const componentId = 'comp456'
            const properties = { text: 'Hello World', visible: true }
            
            await previewEventService.sendComponentUpdate(previewId, componentId, properties)
            
            expect(mockSSEStreamer.streamCustomEvent).toHaveBeenCalledWith(
                previewId,
                'preview-component-update',
                expect.objectContaining({
                    previewId,
                    componentId,
                    properties
                })
            )
        })
        
        it('should handle errors when sending component update', async () => {
            const error = new Error('Stream error')
            mockSSEStreamer.streamCustomEvent.mockImplementation(() => Promise.reject(error))
            
            // This should not throw an error
            await previewEventService.sendComponentUpdate('preview123', 'comp456', {})
        })
    })
    
    describe('sendFlowProgress', () => {
        it('should send a flow progress event', async () => {
            const previewId = 'preview123'
            const step = 2
            const totalSteps = 5
            const status = 'running'
            
            await previewEventService.sendFlowProgress(previewId, step, totalSteps, status)
            
            expect(mockSSEStreamer.streamCustomEvent).toHaveBeenCalledWith(
                previewId,
                'preview-progress',
                expect.objectContaining({
                    previewId,
                    step,
                    totalSteps,
                    status
                })
            )
        })
    })
    
    describe('sendErrorEvent', () => {
        it('should send an error event with component ID', async () => {
            const previewId = 'preview123'
            const componentId = 'comp456'
            const errorMessage = 'Component error'
            
            await previewEventService.sendErrorEvent(previewId, errorMessage, componentId)
            
            expect(mockSSEStreamer.streamCustomEvent).toHaveBeenCalledWith(
                previewId,
                'preview-error',
                expect.objectContaining({
                    previewId,
                    error: errorMessage,
                    componentId
                })
            )
        })
        
        it('should send an error event without component ID', async () => {
            const previewId = 'preview123'
            const errorMessage = 'Flow error'
            
            await previewEventService.sendErrorEvent(previewId, errorMessage)
            
            expect(mockSSEStreamer.streamCustomEvent).toHaveBeenCalledWith(
                previewId,
                'preview-error',
                expect.objectContaining({
                    previewId,
                    error: errorMessage
                })
            )
        })
    })
    
    describe('sendBatchUpdate', () => {
        it('should send a batch update event', async () => {
            const previewId = 'preview123'
            const updates = [
                { componentId: 'comp1', properties: { text: 'Hello' } },
                { componentId: 'comp2', properties: { visible: true } }
            ]
            
            await previewEventService.sendBatchUpdate(previewId, updates)
            
            expect(mockSSEStreamer.streamCustomEvent).toHaveBeenCalledWith(
                previewId,
                'preview-batch-update',
                expect.objectContaining({
                    previewId,
                    updates
                })
            )
        })
    })
    
    describe('sendPreviewReady', () => {
        it('should send a preview ready event', async () => {
            const previewId = 'preview123'
            
            await previewEventService.sendPreviewReady(previewId)
            
            expect(mockSSEStreamer.streamCustomEvent).toHaveBeenCalledWith(
                previewId,
                'preview-ready',
                expect.objectContaining({
                    previewId
                })
            )
        })
    })
}) 