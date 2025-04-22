import express from 'express'
import request from 'supertest'
import { uiFlowsRouter } from '../uiflows'
import uiFlowService from '../../../../services/uiflows'
import { InternalFlowiseError } from '../../../../errors/internalFlowiseError'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuidv4 } from 'uuid'

// Mock the uiFlowService
jest.mock('../../../../services/uiflows')
const mockUiFlowService = uiFlowService as jest.Mocked<typeof uiFlowService>

// Mock the getRunningExpressApp
jest.mock('../../../../utils/getRunningExpressApp', () => ({
    getRunningExpressApp: jest.fn().mockReturnValue({
        sseStreamer: {
            addClient: jest.fn(),
            removeClient: jest.fn(),
            streamCustomEvent: jest.fn()
        }
    })
}))

describe('UIFlows Router', () => {
    let app: express.Application

    beforeEach(() => {
        app = express()
        app.use(express.json())
        app.use('/api/v1/ui-flows', uiFlowsRouter)
        
        // Reset all mocks
        jest.clearAllMocks()
    })

    describe('GET /', () => {
        it('should return all UI flows', async () => {
            const mockFlows = [
                { id: '1', name: 'Flow 1', flowData: '{}', chatflowId: uuidv4() },
                { id: '2', name: 'Flow 2', flowData: '{}', chatflowId: uuidv4() }
            ]
            
            mockUiFlowService.getAllUIFlows.mockResolvedValue(mockFlows as any)
            
            const response = await request(app).get('/api/v1/ui-flows')
            
            expect(response.status).toBe(StatusCodes.OK)
            expect(response.body).toEqual(mockFlows)
            expect(mockUiFlowService.getAllUIFlows).toHaveBeenCalled()
        })
        
        it('should handle errors correctly', async () => {
            const errorMessage = 'Internal server error'
            mockUiFlowService.getAllUIFlows.mockRejectedValue(new Error(errorMessage))
            
            const response = await request(app).get('/api/v1/ui-flows')
            
            expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
            expect(response.body.error).toBe(errorMessage)
        })
    })
    
    describe('GET /chatflow/:chatflowId', () => {
        it('should return UI flows by chat flow ID', async () => {
            const chatflowId = uuidv4()
            const mockFlows = [
                { id: '1', name: 'Flow 1', flowData: '{}', chatflowId }
            ]
            
            mockUiFlowService.getUIFlowsByChatFlowId.mockResolvedValue(mockFlows as any)
            
            const response = await request(app).get(`/api/v1/ui-flows/chatflow/${chatflowId}`)
            
            expect(response.status).toBe(StatusCodes.OK)
            expect(response.body).toEqual(mockFlows)
            expect(mockUiFlowService.getUIFlowsByChatFlowId).toHaveBeenCalledWith(chatflowId)
        })
        
        it('should return 400 for invalid chat flow ID format', async () => {
            const response = await request(app).get('/api/v1/ui-flows/chatflow/invalid-id')
            
            expect(response.status).toBe(StatusCodes.BAD_REQUEST)
            expect(response.body.error).toBe('Invalid ChatFlow ID format')
        })
    })
    
    describe('GET /:uiFlowId', () => {
        it('should return a specific UI flow by ID', async () => {
            const uiFlowId = uuidv4()
            const mockFlow = { id: uiFlowId, name: 'Flow 1', flowData: '{}', chatflowId: uuidv4() }
            
            mockUiFlowService.getUIFlowById.mockResolvedValue(mockFlow as any)
            
            const response = await request(app).get(`/api/v1/ui-flows/${uiFlowId}`)
            
            expect(response.status).toBe(StatusCodes.OK)
            expect(response.body).toEqual(mockFlow)
            expect(mockUiFlowService.getUIFlowById).toHaveBeenCalledWith(uiFlowId)
        })
        
        it('should handle not found error', async () => {
            const uiFlowId = uuidv4()
            mockUiFlowService.getUIFlowById.mockRejectedValue(
                new InternalFlowiseError(StatusCodes.NOT_FOUND, `UIFlow ${uiFlowId} not found`)
            )
            
            const response = await request(app).get(`/api/v1/ui-flows/${uiFlowId}`)
            
            expect(response.status).toBe(StatusCodes.NOT_FOUND)
            expect(response.body.error).toBe(`UIFlow ${uiFlowId} not found`)
        })
    })
    
    describe('POST /', () => {
        it('should create a new UI flow', async () => {
            const chatflowId = uuidv4()
            const mockFlow = { 
                name: 'New Flow',
                flowData: '{"nodes":[],"edges":[]}',
                chatflowId
            }
            
            const createdFlow = {
                ...mockFlow,
                id: uuidv4(),
                createdDate: new Date(),
                updatedDate: new Date()
            }
            
            mockUiFlowService.createUIFlow.mockResolvedValue(createdFlow as any)
            
            const response = await request(app)
                .post('/api/v1/ui-flows')
                .send(mockFlow)
            
            expect(response.status).toBe(StatusCodes.CREATED)
            expect(response.body).toMatchObject({
                name: createdFlow.name,
                flowData: createdFlow.flowData,
                chatflowId: createdFlow.chatflowId,
                id: createdFlow.id
            })
            expect(mockUiFlowService.createUIFlow).toHaveBeenCalledWith(mockFlow)
        })
        
        it('should return 400 for missing required fields', async () => {
            const response = await request(app)
                .post('/api/v1/ui-flows')
                .send({ name: 'Incomplete Flow' })
            
            expect(response.status).toBe(StatusCodes.BAD_REQUEST)
            expect(response.body.error).toBe('Missing required fields: name, flowData, chatflowId')
            expect(mockUiFlowService.createUIFlow).not.toHaveBeenCalled()
        })
    })
    
    describe('PATCH /:uiFlowId', () => {
        it('should update an existing UI flow', async () => {
            const uiFlowId = uuidv4()
            const updateData = { name: 'Updated Flow Name' }
            const updatedFlow = {
                id: uiFlowId,
                name: 'Updated Flow Name',
                flowData: '{}',
                chatflowId: uuidv4(),
                updatedDate: new Date()
            }
            
            mockUiFlowService.updateUIFlow.mockResolvedValue(updatedFlow as any)
            
            const response = await request(app)
                .patch(`/api/v1/ui-flows/${uiFlowId}`)
                .send(updateData)
            
            expect(response.status).toBe(StatusCodes.OK)
            expect(response.body).toMatchObject({
                id: updatedFlow.id,
                name: updatedFlow.name,
                flowData: updatedFlow.flowData,
                chatflowId: updatedFlow.chatflowId
            })
            expect(mockUiFlowService.updateUIFlow).toHaveBeenCalledWith(uiFlowId, updateData)
        })
        
        it('should return 400 for invalid UI flow ID', async () => {
            const response = await request(app)
                .patch('/api/v1/ui-flows/invalid-id')
                .send({ name: 'Updated Name' })
            
            expect(response.status).toBe(StatusCodes.BAD_REQUEST)
            expect(response.body.error).toBe('Invalid UI Flow ID format')
            expect(mockUiFlowService.updateUIFlow).not.toHaveBeenCalled()
        })
    })
    
    describe('DELETE /:uiFlowId', () => {
        it('should delete a UI flow', async () => {
            const uiFlowId = uuidv4()
            mockUiFlowService.deleteUIFlow.mockResolvedValue(undefined)
            
            const response = await request(app).delete(`/api/v1/ui-flows/${uiFlowId}`)
            
            expect(response.status).toBe(StatusCodes.NO_CONTENT)
            expect(mockUiFlowService.deleteUIFlow).toHaveBeenCalledWith(uiFlowId)
        })
        
        it('should return 400 for invalid UI flow ID', async () => {
            const response = await request(app).delete('/api/v1/ui-flows/invalid-id')
            
            expect(response.status).toBe(StatusCodes.BAD_REQUEST)
            expect(response.body.error).toBe('Invalid UI Flow ID format')
            expect(mockUiFlowService.deleteUIFlow).not.toHaveBeenCalled()
        })
    })
    
    describe('POST /:uiFlowId/deploy', () => {
        it('should deploy a UI flow', async () => {
            const uiFlowId = uuidv4()
            const deployedFlow = {
                id: uiFlowId,
                name: 'Flow',
                flowData: '{}',
                chatflowId: uuidv4(),
                deployed: true
            }
            
            mockUiFlowService.deployUIFlow.mockResolvedValue(deployedFlow as any)
            
            const response = await request(app).post(`/api/v1/ui-flows/${uiFlowId}/deploy`)
            
            expect(response.status).toBe(StatusCodes.OK)
            expect(response.body).toEqual(deployedFlow)
            expect(mockUiFlowService.deployUIFlow).toHaveBeenCalledWith(uiFlowId)
        })
    })
    
    describe('POST /:uiFlowId/undeploy', () => {
        it('should undeploy a UI flow', async () => {
            const uiFlowId = uuidv4()
            const undeployedFlow = {
                id: uiFlowId,
                name: 'Flow',
                flowData: '{}',
                chatflowId: uuidv4(),
                deployed: false
            }
            
            mockUiFlowService.undeployUIFlow.mockResolvedValue(undeployedFlow as any)
            
            const response = await request(app).post(`/api/v1/ui-flows/${uiFlowId}/undeploy`)
            
            expect(response.status).toBe(StatusCodes.OK)
            expect(response.body).toEqual(undeployedFlow)
            expect(mockUiFlowService.undeployUIFlow).toHaveBeenCalledWith(uiFlowId)
        })
    })
}) 